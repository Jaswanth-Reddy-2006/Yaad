import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

class RelationshipStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    REVOKED = "REVOKED"

def utc_now():
    return datetime.now(timezone.utc)

class CaregiverPatientRelationship(Base):
    __tablename__ = "caregiver_patient_relationships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caregiver_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(50), nullable=False, default="Family Member") # 'PRIMARY', 'FAMILY', 'PROFESSIONAL'
    status = Column(Enum(RelationshipStatus), nullable=False, default=RelationshipStatus.ACTIVE, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_cg_patient_rel", "caregiver_id", "patient_id", "status"),
    )

class DoctorPatientRelationship(Base):
    __tablename__ = "doctor_patient_relationships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(Enum(RelationshipStatus), nullable=False, default=RelationshipStatus.ACTIVE, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_doc_patient_rel", "doctor_id", "patient_id", "status"),
    )
