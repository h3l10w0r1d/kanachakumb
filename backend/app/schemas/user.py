from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.user import AuthProvider, UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    password: Optional[str] = Field(None, min_length=8)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    date_of_birth: Optional[datetime] = None


class UserOut(UserBase):
    id: UUID
    role: UserRole
    is_active: bool
    is_verified: bool
    auth_provider: AuthProvider
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserWithSubscription(UserOut):
    subscription: Optional["SubscriptionOut"] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class GoogleAuthRequest(BaseModel):
    credential: str


class AppleAuthRequest(BaseModel):
    code: str
    id_token: str
    full_name: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


from app.schemas.subscription import SubscriptionOut
UserWithSubscription.model_rebuild()
