from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.user import User, UserRole
from app.models.event import Event, EventRegistration, EventStatus
from app.models.subscription import Subscription, SubscriptionStatus, PlanType
from app.models.gift_card import GiftCard
from app.schemas.event import EventCreate, EventUpdate, EventOut
from app.schemas.user import UserOut

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics/overview")
async def get_analytics_overview(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    active_basic = (await db.execute(
        select(func.count(Subscription.id)).where(
            and_(Subscription.status == SubscriptionStatus.active, Subscription.plan_type == PlanType.basic)
        )
    )).scalar()
    active_premium = (await db.execute(
        select(func.count(Subscription.id)).where(
            and_(Subscription.status == SubscriptionStatus.active, Subscription.plan_type == PlanType.premium)
        )
    )).scalar()
    total_events = (await db.execute(select(func.count(Event.id)))).scalar()
    upcoming_events = (await db.execute(
        select(func.count(Event.id)).where(
            and_(Event.status == EventStatus.published, Event.starts_at >= datetime.now(timezone.utc))
        )
    )).scalar()
    total_registrations = (await db.execute(
        select(func.count(EventRegistration.id)).where(EventRegistration.is_cancelled == False)
    )).scalar()

    monthly_revenue = (active_basic * 40000) + (active_premium * 55000)

    new_users_this_month = (await db.execute(
        select(func.count(User.id)).where(
            User.created_at >= datetime.now(timezone.utc) - timedelta(days=30)
        )
    )).scalar()

    return {
        "total_users": total_users,
        "active_subscriptions": {
            "basic": active_basic,
            "premium": active_premium,
            "total": active_basic + active_premium,
        },
        "monthly_revenue_amd": monthly_revenue,
        "events": {
            "total": total_events,
            "upcoming": upcoming_events,
            "total_registrations": total_registrations,
        },
        "new_users_this_month": new_users_this_month,
    }


@router.get("/analytics/subscriptions-over-time")
async def get_subscriptions_over_time(
    days: int = 30,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(
            func.date_trunc("day", Subscription.created_at).label("date"),
            func.count(Subscription.id).label("count"),
            Subscription.plan_type,
        ).where(Subscription.created_at >= start_date)
        .group_by("date", Subscription.plan_type)
        .order_by("date")
    )
    rows = result.fetchall()
    return [{"date": str(r.date), "count": r.count, "plan_type": r.plan_type} for r in rows]


@router.get("/users", response_model=List[UserOut])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(User)
    if search:
        query = query.where(
            (User.email.ilike(f"%{search}%")) | (User.full_name.ilike(f"%{search}%"))
        )
    query = query.order_by(desc(User.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: UUID,
    role: UserRole,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    await db.commit()
    return {"message": "Role updated"}


@router.post("/events", response_model=EventOut, status_code=201)
async def create_event(
    event_in: EventCreate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    event = Event(**event_in.model_dump(), created_by=current_admin.id)
    db.add(event)
    await db.commit()
    await db.refresh(event)

    count_result = await db.execute(
        select(func.count(EventRegistration.id)).where(EventRegistration.event_id == event.id)
    )
    return EventOut(
        **{c.name: getattr(event, c.name) for c in event.__table__.columns},
        registered_count=0,
        spots_left=event.max_capacity,
        is_registered=False,
    )


@router.put("/events/{event_id}", response_model=EventOut)
async def update_event(
    event_id: UUID,
    event_update: EventUpdate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = event_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)

    await db.commit()
    await db.refresh(event)

    count_result = await db.execute(
        select(func.count(EventRegistration.id)).where(
            and_(EventRegistration.event_id == event.id, EventRegistration.is_cancelled == False)
        )
    )
    registered_count = count_result.scalar() or 0

    return EventOut(
        **{c.name: getattr(event, c.name) for c in event.__table__.columns},
        registered_count=registered_count,
        spots_left=max(0, event.max_capacity - registered_count) if event.max_capacity else None,
        is_registered=False,
    )


@router.delete("/events/{event_id}", status_code=204)
async def delete_event(
    event_id: UUID,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.delete(event)
    await db.commit()


@router.get("/events/{event_id}/registrations")
async def get_event_registrations(
    event_id: UUID,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(EventRegistration)
        .options(selectinload(EventRegistration.user))
        .where(
            and_(EventRegistration.event_id == event_id, EventRegistration.is_cancelled == False)
        )
    )
    registrations = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "user": {"id": str(r.user.id), "name": r.user.full_name, "email": r.user.email},
            "registered_at": r.registered_at,
            "attended": r.attended,
        }
        for r in registrations
    ]


@router.put("/events/{event_id}/registrations/{reg_id}/attendance")
async def mark_attendance(
    event_id: UUID,
    reg_id: UUID,
    attended: bool,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EventRegistration).where(EventRegistration.id == reg_id)
    )
    reg = result.scalar_one_or_none()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    reg.attended = attended
    await db.commit()
    return {"message": "Attendance updated"}


@router.get("/gift-cards")
async def list_gift_cards(
    skip: int = 0,
    limit: int = 50,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GiftCard).order_by(desc(GiftCard.created_at)).offset(skip).limit(limit)
    )
    gift_cards = result.scalars().all()
    return gift_cards


@router.post("/gift-cards/generate")
async def generate_gift_cards(
    plan_type: str,
    count: int = 1,
    duration_months: int = 1,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from app.core.config import settings
    price_map = {"basic": settings.BASIC_PLAN_PRICE_AMD, "premium": settings.PREMIUM_PLAN_PRICE_AMD}
    price = price_map.get(plan_type, settings.BASIC_PLAN_PRICE_AMD) * duration_months
    cards = []
    for _ in range(min(count, 100)):
        card = GiftCard(
            plan_type=plan_type,
            duration_months=duration_months,
            purchased_by=current_admin.id,
            price_amd=price,
        )
        db.add(card)
        cards.append(card)
    await db.commit()
    for card in cards:
        await db.refresh(card)
    return [{"code": c.code, "plan_type": c.plan_type, "duration_months": c.duration_months} for c in cards]
