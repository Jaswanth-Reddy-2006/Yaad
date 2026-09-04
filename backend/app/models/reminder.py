import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class ReminderRecord(Base):
    __tablename__ = "reminders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    category = Column(String(50), nullable=False, default="MEDICINE") # 'MEDICINE' | 'HYDRATION' | 'ACTIVITY' | 'APPOINTMENT' | 'ROUTINE'
    scheduled_time = Column(String(50), nullable=False) # '9:00 AM' or ISO format
    repeat_rule = Column(String(30), nullable=False, default="DAILY") # 'ONCE' | 'DAILY' | 'WEEKLY' | 'CUSTOM'
    status = Column(String(30), nullable=False, default="UPCOMING") # 'UPCOMING' | 'DUE' | 'COMPLETED' | 'MISSED' | 'SKIPPED' | 'UNACKNOWLEDGED' | 'ESCALATED'
    is_snoozed = Column(Boolean, nullable=False, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    __table_args__ = (
        Index("idx_reminder_patient_status", "patient_id", "status"),
    )

Reminder = ReminderRecord
