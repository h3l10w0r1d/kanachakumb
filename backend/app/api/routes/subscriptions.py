from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from uuid import UUID

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.models.subscription import Subscription, PlanType, SubscriptionStatus
from app.models.gift_card import GiftCard, GiftCardStatus
from app.schemas.subscription import SubscriptionOut, SubscriptionCreate, SubscriptionUpdate, GiftCardRedeemRequest

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])

PLAN_PRICES = {
    PlanType.basic: settings.BASIC_PLAN_PRICE_AMD,
    PlanType.premium: settings.PREMIUM_PLAN_PRICE_AMD,
}


@router.get("/my", response_model=Optional[SubscriptionOut])
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    return result.scalar_one_or_none()


@router.post("/subscribe", response_model=SubscriptionOut)
async def subscribe(
    sub_create: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    existing = result.scalar_one_or_none()

    price = PLAN_PRICES[sub_create.plan_type]
    now = datetime.now(timezone.utc)

    if existing:
        existing.plan_type = sub_create.plan_type
        existing.price_amd = price
        existing.status = SubscriptionStatus.active
        existing.started_at = now
        existing.expires_at = now + timedelta(days=30)
        existing.cancelled_at = None
        if sub_create.plan_type == PlanType.basic:
            existing.telegram_chat_invited = False
        await db.commit()
        await db.refresh(existing)
        return existing

    subscription = Subscription(
        user_id=current_user.id,
        plan_type=sub_create.plan_type,
        price_amd=price,
        status=SubscriptionStatus.active,
        started_at=now,
        expires_at=now + timedelta(days=30),
    )
    db.add(subscription)
    await db.commit()
    await db.refresh(subscription)
    return subscription


@router.put("/upgrade", response_model=SubscriptionOut)
async def upgrade_subscription(
    update: SubscriptionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = result.scalar_one_or_none()
    if not subscription or subscription.status != SubscriptionStatus.active:
        raise HTTPException(status_code=400, detail="No active subscription to upgrade")

    if update.plan_type:
        subscription.plan_type = update.plan_type
        subscription.price_amd = PLAN_PRICES[update.plan_type]

    await db.commit()
    await db.refresh(subscription)
    return subscription


@router.post("/cancel", response_model=SubscriptionOut)
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = result.scalar_one_or_none()
    if not subscription:
        raise HTTPException(status_code=404, detail="No subscription found")

    subscription.status = SubscriptionStatus.cancelled
    subscription.cancelled_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(subscription)
    return subscription


@router.post("/redeem-gift-card", response_model=SubscriptionOut)
async def redeem_gift_card(
    request: GiftCardRedeemRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GiftCard).where(GiftCard.code == request.code.upper().strip())
    )
    gift_card = result.scalar_one_or_none()

    if not gift_card:
        raise HTTPException(status_code=404, detail="Gift card not found")
    if gift_card.status != GiftCardStatus.unused:
        raise HTTPException(status_code=400, detail="Gift card has already been used")
    if gift_card.expires_at and gift_card.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Gift card has expired")

    now = datetime.now(timezone.utc)
    plan_type = PlanType(gift_card.plan_type)
    price = PLAN_PRICES[plan_type]

    sub_result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    existing_sub = sub_result.scalar_one_or_none()

    if existing_sub:
        start = existing_sub.expires_at if existing_sub.expires_at and existing_sub.expires_at > now else now
        existing_sub.plan_type = plan_type
        existing_sub.price_amd = price
        existing_sub.status = SubscriptionStatus.active
        existing_sub.started_at = now
        existing_sub.expires_at = start + timedelta(days=30 * gift_card.duration_months)
        existing_sub.gift_card_id = gift_card.id
        subscription = existing_sub
    else:
        subscription = Subscription(
            user_id=current_user.id,
            plan_type=plan_type,
            price_amd=price,
            status=SubscriptionStatus.active,
            started_at=now,
            expires_at=now + timedelta(days=30 * gift_card.duration_months),
            gift_card_id=gift_card.id,
        )
        db.add(subscription)

    gift_card.status = GiftCardStatus.redeemed
    gift_card.redeemed_by = current_user.id
    gift_card.redeemed_at = now

    await db.commit()
    if not existing_sub:
        await db.refresh(subscription)
    return subscription
