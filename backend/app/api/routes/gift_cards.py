from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone, timedelta
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.config import settings
from app.api.deps import get_current_user
from app.models.user import User
from app.models.gift_card import GiftCard, GiftCardStatus
from app.models.subscription import PlanType
from app.schemas.gift_card import GiftCardCreate, GiftCardOut, GiftCardCheckResponse

router = APIRouter(prefix="/gift-cards", tags=["gift-cards"])

PLAN_PRICES = {
    PlanType.basic: settings.BASIC_PLAN_PRICE_AMD,
    PlanType.premium: settings.PREMIUM_PLAN_PRICE_AMD,
}


@router.post("", response_model=GiftCardOut, status_code=201)
async def create_gift_card(
    gift_card_in: GiftCardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    price = PLAN_PRICES[gift_card_in.plan_type] * gift_card_in.duration_months
    expires_at = datetime.now(timezone.utc) + timedelta(days=365)

    gift_card = GiftCard(
        plan_type=gift_card_in.plan_type.value,
        duration_months=gift_card_in.duration_months,
        recipient_email=gift_card_in.recipient_email,
        recipient_name=gift_card_in.recipient_name,
        message=gift_card_in.message,
        purchased_by=current_user.id,
        price_amd=price,
        expires_at=expires_at,
    )
    db.add(gift_card)
    await db.commit()
    await db.refresh(gift_card)
    return gift_card


@router.get("/my-purchases", response_model=List[GiftCardOut])
async def get_my_gift_cards(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GiftCard).where(GiftCard.purchased_by == current_user.id)
        .order_by(GiftCard.created_at.desc())
    )
    return result.scalars().all()


@router.get("/check/{code}", response_model=GiftCardCheckResponse)
async def check_gift_card(code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(GiftCard).where(GiftCard.code == code.upper().strip())
    )
    gift_card = result.scalar_one_or_none()

    if not gift_card:
        return GiftCardCheckResponse(valid=False, message="Gift card not found")
    if gift_card.status != GiftCardStatus.unused:
        return GiftCardCheckResponse(valid=False, message="Gift card already used")
    if gift_card.expires_at and gift_card.expires_at < datetime.now(timezone.utc):
        return GiftCardCheckResponse(valid=False, message="Gift card expired")

    return GiftCardCheckResponse(
        valid=True,
        plan_type=gift_card.plan_type,
        duration_months=gift_card.duration_months,
    )
