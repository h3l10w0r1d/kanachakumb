from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone

from app.core.database import get_db
from app.api.deps import get_current_user, get_optional_user
from app.models.event import Event, EventRegistration, EventStatus, PlanRequirement
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionStatus, PlanType
from app.schemas.event import EventOut, EventCreate, EventUpdate, EventRegistrationOut

router = APIRouter(prefix="/events", tags=["events"])


def can_access_event(event: Event, subscription: Subscription | None) -> bool:
    if event.plan_requirement == PlanRequirement.all:
        return True
    if not subscription or subscription.status != SubscriptionStatus.active:
        return False
    if event.plan_requirement == PlanRequirement.premium:
        return subscription.plan_type == PlanType.premium
    return True


@router.get("", response_model=List[EventOut])
async def list_events(
    skip: int = 0,
    limit: int = 20,
    upcoming: bool = True,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Event).where(Event.status == EventStatus.published)
    if upcoming:
        query = query.where(Event.starts_at >= datetime.now(timezone.utc))
    query = query.order_by(Event.starts_at.asc()).offset(skip).limit(limit)

    result = await db.execute(query)
    events = result.scalars().all()

    subscription = None
    registered_ids = set()
    if current_user:
        sub_result = await db.execute(
            select(Subscription).where(Subscription.user_id == current_user.id)
        )
        subscription = sub_result.scalar_one_or_none()

        reg_result = await db.execute(
            select(EventRegistration.event_id).where(
                and_(
                    EventRegistration.user_id == current_user.id,
                    EventRegistration.is_cancelled == False
                )
            )
        )
        registered_ids = {str(r[0]) for r in reg_result.fetchall()}

    event_outs = []
    for event in events:
        count_result = await db.execute(
            select(func.count(EventRegistration.id)).where(
                and_(
                    EventRegistration.event_id == event.id,
                    EventRegistration.is_cancelled == False
                )
            )
        )
        registered_count = count_result.scalar() or 0
        spots_left = None
        if event.max_capacity:
            spots_left = max(0, event.max_capacity - registered_count)

        event_out = EventOut(
            id=event.id,
            title=event.title,
            description=event.description,
            location=event.location,
            image_url=event.image_url,
            starts_at=event.starts_at,
            ends_at=event.ends_at,
            max_capacity=event.max_capacity,
            plan_requirement=event.plan_requirement,
            status=event.status,
            is_recurring=event.is_recurring,
            recurrence_interval_days=event.recurrence_interval_days,
            telegram_link=event.telegram_link,
            created_at=event.created_at,
            registered_count=registered_count,
            spots_left=spots_left,
            is_registered=str(event.id) in registered_ids,
        )
        event_outs.append(event_out)

    return event_outs


@router.get("/{event_id}", response_model=EventOut)
async def get_event(
    event_id: UUID,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    count_result = await db.execute(
        select(func.count(EventRegistration.id)).where(
            and_(EventRegistration.event_id == event.id, EventRegistration.is_cancelled == False)
        )
    )
    registered_count = count_result.scalar() or 0
    spots_left = max(0, event.max_capacity - registered_count) if event.max_capacity else None

    is_registered = False
    if current_user:
        reg_result = await db.execute(
            select(EventRegistration).where(
                and_(
                    EventRegistration.event_id == event_id,
                    EventRegistration.user_id == current_user.id,
                    EventRegistration.is_cancelled == False,
                )
            )
        )
        is_registered = reg_result.scalar_one_or_none() is not None

    return EventOut(
        **{c.name: getattr(event, c.name) for c in event.__table__.columns},
        registered_count=registered_count,
        spots_left=spots_left,
        is_registered=is_registered,
    )


@router.post("/{event_id}/register", response_model=EventRegistrationOut)
async def register_for_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event or event.status != EventStatus.published:
        raise HTTPException(status_code=404, detail="Event not found")

    sub_result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = sub_result.scalar_one_or_none()

    if not can_access_event(event, subscription):
        raise HTTPException(status_code=403, detail="Your subscription plan does not include this event")

    existing = await db.execute(
        select(EventRegistration).where(
            and_(
                EventRegistration.event_id == event_id,
                EventRegistration.user_id == current_user.id,
                EventRegistration.is_cancelled == False,
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already registered for this event")

    if event.max_capacity:
        count_result = await db.execute(
            select(func.count(EventRegistration.id)).where(
                and_(EventRegistration.event_id == event.id, EventRegistration.is_cancelled == False)
            )
        )
        if (count_result.scalar() or 0) >= event.max_capacity:
            raise HTTPException(status_code=400, detail="Event is fully booked")

    registration = EventRegistration(event_id=event_id, user_id=current_user.id)
    db.add(registration)
    await db.commit()
    await db.refresh(registration)
    return registration


@router.delete("/{event_id}/register", status_code=204)
async def cancel_registration(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EventRegistration).where(
            and_(
                EventRegistration.event_id == event_id,
                EventRegistration.user_id == current_user.id,
                EventRegistration.is_cancelled == False,
            )
        )
    )
    registration = result.scalar_one_or_none()
    if not registration:
        raise HTTPException(status_code=404, detail="Registration not found")

    registration.is_cancelled = True
    registration.cancelled_at = datetime.now(timezone.utc)
    await db.commit()
