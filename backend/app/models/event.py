from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class EventStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    cancelled = "cancelled"
    completed = "completed"


class PlanRequirement(str, enum.Enum):
    basic = "basic"
    premium = "premium"
    all = "all"


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    registered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    is_cancelled = Column(Boolean, default=False, nullable=False)
    attended = Column(Boolean, default=False, nullable=False)

    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="event_registrations")


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(500), nullable=True)
    image_url = Column(Text, nullable=True)
    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=True)
    max_capacity = Column(Integer, nullable=True)
    plan_requirement = Column(SAEnum(PlanRequirement), default=PlanRequirement.basic, nullable=False)
    status = Column(SAEnum(EventStatus), default=EventStatus.draft, nullable=False)
    is_recurring = Column(Boolean, default=False, nullable=False)
    recurrence_interval_days = Column(Integer, nullable=True)
    telegram_link = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    registrations = relationship("EventRegistration", back_populates="event")
    creator = relationship("User", foreign_keys=[created_by])
