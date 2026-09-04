from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole

class UserRead(BaseModel):
    id: str
    public_id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    is_verified: bool
    display_name: str

    class Config:
        from_attributes = True

class PatientProfileRead(BaseModel):
    user_id: str
    display_name: str
    age: Optional[int] = None
    preferred_language: str
    connection_code: str
    connection_token: str
    qr_payload: str

    class Config:
        from_attributes = True
