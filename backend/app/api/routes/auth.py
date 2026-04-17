from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timezone
import httpx

from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token, decode_token
)
from app.core.config import settings
from app.models.user import User, AuthProvider, UserRole
from app.schemas.user import (
    UserCreate, UserOut, TokenResponse,
    GoogleAuthRequest, AppleAuthRequest, RefreshTokenRequest
)

router = APIRouter(prefix="/auth", tags=["auth"])


async def get_or_create_oauth_user(
    db: AsyncSession, email: str, full_name: str,
    provider: AuthProvider, provider_id: str, avatar_url: str = None
) -> User:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=email,
            full_name=full_name,
            auth_provider=provider,
            provider_id=provider_id,
            avatar_url=avatar_url,
            is_verified=True,
        )
        db.add(user)
    else:
        user.last_login = datetime.now(timezone.utc)
        if not user.avatar_url and avatar_url:
            user.avatar_url = avatar_url

    await db.commit()
    await db.refresh(user)
    return user


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    if not user_in.password:
        raise HTTPException(status_code=400, detail="Password required for email registration")

    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        phone=user_in.phone,
        hashed_password=get_password_hash(user_in.password),
        auth_provider=AuthProvider.email,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    user.refresh_token = refresh_token
    await db.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


@router.post("/login", response_model=TokenResponse)
async def login(email: str, password: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    user.last_login = datetime.now(timezone.utc)
    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    user.refresh_token = refresh_token
    await db.commit()
    await db.refresh(user)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


@router.post("/google", response_model=TokenResponse)
async def google_auth(request: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={request.credential}"
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google token")
        data = resp.json()

    if data.get("aud") != settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=400, detail="Token audience mismatch")

    user = await get_or_create_oauth_user(
        db=db,
        email=data["email"],
        full_name=data.get("name", data["email"]),
        provider=AuthProvider.google,
        provider_id=data["sub"],
        avatar_url=data.get("picture"),
    )

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    user.refresh_token = refresh_token
    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


@router.post("/apple", response_model=TokenResponse)
async def apple_auth(request: AppleAuthRequest, db: AsyncSession = Depends(get_db)):
    import jwt as pyjwt
    import json

    try:
        async with httpx.AsyncClient() as client:
            keys_resp = await client.get("https://appleid.apple.com/auth/keys")
            keys = keys_resp.json()

        from jose import jwt as jose_jwt
        header = pyjwt.get_unverified_header(request.id_token)
        key = next((k for k in keys["keys"] if k["kid"] == header["kid"]), None)
        if not key:
            raise HTTPException(status_code=400, detail="Invalid Apple token key")

        from jose.utils import base64url_decode
        import struct, base64
        payload = jose_jwt.decode(
            request.id_token,
            key,
            algorithms=["RS256"],
            audience=settings.APPLE_CLIENT_ID or "com.example.app",
            options={"verify_aud": bool(settings.APPLE_CLIENT_ID)},
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid Apple token: {str(e)}")

    email = payload.get("email", "")
    if not email:
        raise HTTPException(status_code=400, detail="No email in Apple token")

    full_name = request.full_name or email.split("@")[0]

    user = await get_or_create_oauth_user(
        db=db,
        email=email,
        full_name=full_name,
        provider=AuthProvider.apple,
        provider_id=payload["sub"],
    )

    access_token = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    user.refresh_token = refresh_token
    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(user)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    from uuid import UUID
    result = await db.execute(select(User).where(User.id == UUID(payload["sub"])))
    user = result.scalar_one_or_none()

    if not user or user.refresh_token != request.refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token revoked or invalid")

    access_token = create_access_token(str(user.id))
    new_refresh = create_refresh_token(str(user.id))
    user.refresh_token = new_refresh
    await db.commit()
    await db.refresh(user)

    return TokenResponse(access_token=access_token, refresh_token=new_refresh, user=user)


@router.post("/logout")
async def logout(db: AsyncSession = Depends(get_db), credentials=None):
    return {"message": "Logged out successfully"}
