from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum
import secrets


class GiftCardStatus(str, enum.Enum):
    unused = "unused"
    redeemed = "redeemed"
    expired = "expired"


class GiftCard(Base):
    __tablename__ = "gift_cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(20), unique=True, nullable=False, index=True, default=lambda: secrets.token_urlsafe(12).upper()[:16])
    plan_type = Column(String(50), nullable=False)
    duration_months = Column(Integer, nullable=False, default=1)
    status = Column(SAEnum(GiftCardStatus), default=GiftCardStatus.unused, nullable=False)
    recipient_email = Column(String(255), nullable=True)
    recipient_name = Column(String(255), nullable=True)
    message = Column(Text, nullable=True)
    purchased_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    redeemed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    redeemed_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    price_amd = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    purchaser = relationship("User", foreign_keys=[purchased_by])
    redeemer = relationship("User", foreign_keys=[redeemed_by])
