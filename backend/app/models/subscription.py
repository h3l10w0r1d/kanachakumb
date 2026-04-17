from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class PlanType(str, enum.Enum):
    basic = "basic"
    premium = "premium"


class SubscriptionStatus(str, enum.Enum):
    active = "active"
    cancelled = "cancelled"
    expired = "expired"
    pending = "pending"
    gift = "gift"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    plan_type = Column(SAEnum(PlanType), nullable=False, default=PlanType.basic)
    status = Column(SAEnum(SubscriptionStatus), nullable=False, default=SubscriptionStatus.pending)
    price_amd = Column(Integer, nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    stripe_customer_id = Column(String(255), nullable=True)
    telegram_chat_invited = Column(Boolean, default=False, nullable=False)
    gift_card_id = Column(UUID(as_uuid=True), ForeignKey("gift_cards.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="subscription")
    gift_card = relationship("GiftCard", foreign_keys=[gift_card_id])
