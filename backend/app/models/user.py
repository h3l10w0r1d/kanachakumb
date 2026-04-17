from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum as SAEnum, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class AuthProvider(str, enum.Enum):
    email = "email"
    google = "google"
    apple = "apple"


class UserRole(str, enum.Enum):
    member = "member"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    avatar_url = Column(Text, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    auth_provider = Column(SAEnum(AuthProvider), default=AuthProvider.email, nullable=False)
    provider_id = Column(String(255), nullable=True)
    role = Column(SAEnum(UserRole), default=UserRole.member, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    date_of_birth = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    refresh_token = Column(Text, nullable=True)

    subscription = relationship("Subscription", back_populates="user", uselist=False)
    event_registrations = relationship("EventRegistration", back_populates="user")
    gift_cards_received = relationship("GiftCard", foreign_keys="GiftCard.recipient_email", primaryjoin="User.email == GiftCard.recipient_email", viewonly=True)
