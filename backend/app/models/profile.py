import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    display_name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    preferred_language = Column(String(10), nullable=False, default="en")
    timezone = Column(String(50), nullable=False, default="Asia/Kolkata")
    connection_code = Column(String(10), unique=True, nullable=False, index=True)
    connection_token = Column(String(255), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="patient_profile")

class CaregiverProfile(Base):
    __tablename__ = "caregiver_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    full_name = Column(String(100), nullable=False)
    contact_phone = Column(String(30), nullable=True)
    relationship_type = Column(String(50), nullable=True) # e.g. 'FAMILY', 'PROFESSIONAL'
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="caregiver_profile")

class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    full_name = Column(String(100), nullable=False)
    specialization = Column(String(100), nullable=True)
    license_number = Column(String(50), nullable=True)
    hospital_affinity = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="doctor_profile")
