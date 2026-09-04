import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class PersonalMemoryRecord(Base):
    __tablename__ = "personal_memories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False, default="FAMILY") # 'FAMILY' | 'PERSON' | 'PLACE' | 'OBJECT' | 'EVENT'
    asset_url = Column(String(500), nullable=True)
    caption = Column(String(500), nullable=True)
    relation_note = Column(String(300), nullable=True)
    importance_level = Column(String(20), nullable=False, default="NORMAL") # 'HIGH' | 'MEDIUM' | 'NORMAL'
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    __table_args__ = (
        Index("idx_memory_patient_category", "patient_id", "category"),
    )

class RoutineFactRecord(Base):
    __tablename__ = "routine_facts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    fact_key = Column(String(100), nullable=False)
    fact_value = Column(String(500), nullable=False)
    category = Column(String(50), nullable=False, default="PREFERENCE") # 'PREFERENCE' | 'ROUTINE' | 'FAMILY' | 'SAFETY'
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

PersonalMemory = PersonalMemoryRecord
RoutineFact = RoutineFactRecord
