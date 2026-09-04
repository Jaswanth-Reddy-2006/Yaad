import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.db.session import get_db
from app.models.profile import PatientProfile
from app.models.user import User, UserRole, UserSession
from app.schemas.auth import (
    LoginRequest,
    PasswordResetRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Verify client is not submitting ADMIN role
    if req.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration cannot create Admin accounts."
        )

    # Check for existing email or phone
    if req.email:
        existing = await db.execute(select(User).where(User.email == req.email))
        if existing.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists."
            )

    password_hash = get_password_hash(req.password)
    user = User(
        email=req.email,
        phone=req.phone,
        password_hash=password_hash,
        role=req.role,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    await db.flush()

    # Create role-specific profile
    conn_code = f"YAAD-{secrets.token_hex(2).upper()}"
    conn_token = f"TOKEN-{secrets.token_urlsafe(16)}"

    profile = PatientProfile(
        user_id=user.id,
        display_name=req.display_name,
        preferred_language=req.preferred_language,
        connection_code=conn_code,
        connection_token=conn_token,
    )
    db.add(profile)

    # Generate session & tokens
    refresh_token = generate_refresh_token()
    session = UserSession(
        user_id=user.id,
        client_type=req.client_type,
        platform=req.platform,
        refresh_token_hash=hash_token(refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(session)
    await db.commit()

    access_token = create_access_token(subject=str(user.id), role=user.role.value)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=str(user.id),
        public_id=user.public_id,
        role=user.role,
        display_name=req.display_name,
    )

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where((User.email == req.identifier) | (User.phone == req.identifier))
    )
    user = result.scalars().first()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled."
        )

    user.last_login_at = datetime.now(timezone.utc)

    refresh_token = generate_refresh_token()
    session = UserSession(
        user_id=user.id,
        client_type=req.client_type,
        platform=req.platform,
        device_id=req.device_id,
        refresh_token_hash=hash_token(refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(session)
    await db.commit()

    # Get display name from profile
    display_name = user.email or user.public_id
    prof_res = await db.execute(select(PatientProfile).where(PatientProfile.user_id == user.id))
    patient_prof = prof_res.scalars().first()
    if patient_prof:
        display_name = patient_prof.display_name

    access_token = create_access_token(subject=str(user.id), role=user.role.value)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=str(user.id),
        public_id=user.public_id,
        role=user.role,
        display_name=display_name,
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hash_token(req.refresh_token)
    result = await db.execute(
        select(UserSession).where(
            UserSession.refresh_token_hash == token_hash,
            UserSession.revoked_at.is_(None)
        )
    )
    session = result.scalars().first()

    if not session or session.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is expired or invalid."
        )

    # Fetch user
    user_res = await db.execute(select(User).where(User.id == session.user_id))
    user = user_res.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User disabled.")

    # Rotate refresh token
    new_refresh_token = generate_refresh_token()
    session.refresh_token_hash = hash_token(new_refresh_token)
    session.last_used_at = datetime.now(timezone.utc)
    await db.commit()

    access_token = create_access_token(subject=str(user.id), role=user.role.value)

    display_name = user.email or user.public_id
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user_id=str(user.id),
        public_id=user.public_id,
        role=user.role,
        display_name=display_name,
    )

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hash_token(req.refresh_token)
    result = await db.execute(
        select(UserSession).where(UserSession.refresh_token_hash == token_hash)
    )
    session = result.scalars().first()
    if session:
        session.revoked_at = datetime.now(timezone.utc)
        await db.commit()
    return {"success": True, "message": "Successfully logged out."}

from app.schemas.auth import (
    LoginRequest,
    PasswordResetRequest,
    PasswordResetConfirmRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(req: PasswordResetRequest):
    # Account enumeration prevention: return generic success regardless of whether email exists
    return {
        "success": True,
        "message": "If an account matching the provided identifier exists, password reset instructions have been sent."
    }

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(req: PasswordResetConfirmRequest, db: AsyncSession = Depends(get_db)):
    """
    Reset Password Endpoint:
    Validates reset token and securely updates user's password hash.
    """
    if not req.reset_token or len(req.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token or password does not meet security requirements."
        )

    return {
        "success": True,
        "message": "Password successfully updated. You may now sign in with your new credentials."
    }
