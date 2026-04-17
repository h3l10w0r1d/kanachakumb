from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.subscription import PlanType, SubscriptionStatus


class SubscriptionBase(BaseModel):
    plan_type: PlanType
    price_amd: int


class SubscriptionCreate(BaseModel):
    plan_type: PlanType


class SubscriptionOut(SubscriptionBase):
    id: UUID
    user_id: UUID
    status: SubscriptionStatus
    started_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    telegram_chat_invited: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SubscriptionUpdate(BaseModel):
    plan_type: Optional[PlanType] = None


class GiftCardRedeemRequest(BaseModel):
    code: str
