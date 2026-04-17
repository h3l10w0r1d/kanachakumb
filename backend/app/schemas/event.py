from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.event import EventStatus, PlanRequirement


class EventBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    starts_at: datetime
    ends_at: Optional[datetime] = None
    max_capacity: Optional[int] = Field(None, gt=0)
    plan_requirement: PlanRequirement = PlanRequirement.basic
    is_recurring: bool = False
    recurrence_interval_days: Optional[int] = None
    telegram_link: Optional[str] = None


class EventCreate(EventBase):
    status: EventStatus = EventStatus.draft


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    max_capacity: Optional[int] = None
    plan_requirement: Optional[PlanRequirement] = None
    status: Optional[EventStatus] = None
    is_recurring: Optional[bool] = None
    recurrence_interval_days: Optional[int] = None
    telegram_link: Optional[str] = None


class EventOut(EventBase):
    id: UUID
    status: EventStatus
    created_at: datetime
    registered_count: int = 0
    spots_left: Optional[int] = None
    is_registered: bool = False

    class Config:
        from_attributes = True


class EventRegistrationOut(BaseModel):
    id: UUID
    event_id: UUID
    user_id: UUID
    registered_at: datetime
    is_cancelled: bool

    class Config:
        from_attributes = True
