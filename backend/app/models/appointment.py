import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class AppointmentRecord(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    doctor_name = Column(String(100), nullable=True)
    location = Column(String(200), nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(30), nullable=False, default="UPCOMING") # 'UPCOMING' | 'COMPLETED' | 'CANCELLED'
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    __table_args__ = (
        Index("idx_appt_patient_sched", "patient_id", "scheduled_at"),
    )
