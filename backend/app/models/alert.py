import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class AlertRecord(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    caregiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    alert_type = Column(String(50), nullable=False, index=True) # MISSED_REMINDER | REPEATED_MISSED_REMINDER | LOW_ACTIVITY | ACTIVITY_TREND_CHANGE | PATIENT_SOS | SYSTEM_ALERT
    severity = Column(String(20), nullable=False, default="INFO") # INFO | WARNING | CRITICAL
    title = Column(String(200), nullable=False)
    message = Column(String(500), nullable=False)
    why_it_matters = Column(String(500), nullable=True)
    suggested_action = Column(String(500), nullable=True)
    occurrence_count = Column(Integer, nullable=False, default=1)
    is_resolved = Column(Boolean, nullable=False, default=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)
