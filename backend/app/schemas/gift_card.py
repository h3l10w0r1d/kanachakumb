from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.gift_card import GiftCardStatus
from app.models.subscription import PlanType


class GiftCardCreate(BaseModel):
    plan_type: PlanType
    duration_months: int = Field(default=1, ge=1, le=12)
    recipient_email: Optional[EmailStr] = None
    recipient_name: Optional[str] = None
    message: Optional[str] = None


class GiftCardOut(BaseModel):
    id: UUID
    code: str
    plan_type: str
    duration_months: int
    status: GiftCardStatus
    recipient_email: Optional[str] = None
    recipient_name: Optional[str] = None
    message: Optional[str] = None
    price_amd: int
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class GiftCardRedeemRequest(BaseModel):
    code: str


class GiftCardCheckResponse(BaseModel):
    valid: bool
    plan_type: Optional[str] = None
    duration_months: Optional[int] = None
    message: Optional[str] = None
