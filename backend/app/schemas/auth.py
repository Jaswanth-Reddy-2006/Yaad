from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole, ClientType, PlatformType

class RegisterRequest(BaseModel):
    display_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.PATIENT
    preferred_language: str = "en"
    client_type: ClientType = ClientType.MOBILE
    platform: PlatformType = PlatformType.ANDROID

class LoginRequest(BaseModel):
    identifier: str # Email or Phone
    password: str
    client_type: ClientType = ClientType.MOBILE
    platform: PlatformType = PlatformType.ANDROID
    device_id: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    public_id: str
    role: UserRole
    display_name: str

class PasswordResetRequest(BaseModel):
    identifier: str

class PasswordResetConfirmRequest(BaseModel):
    reset_token: str
    new_password: str
