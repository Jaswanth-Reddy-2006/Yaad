import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class GameResultRecord(Base):
    __tablename__ = "game_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(100), nullable=False, index=True, unique=True)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    game_id = Column(String(50), nullable=False) # 'PAIR' | 'TRIPLET' | 'REMEMBER'
    difficulty = Column(String(20), nullable=False) # 'EASY' | 'MEDIUM' | 'HARD'
    score = Column(Integer, nullable=False, default=0)
    accuracy = Column(Float, nullable=False, default=100.0)
    duration_seconds = Column(Integer, nullable=False, default=0)
    attempts = Column(Integer, nullable=False, default=0)
    mistakes = Column(Integer, nullable=False, default=0)
    hints_used = Column(Integer, nullable=False, default=0)
    started_at = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    status = Column(String(20), nullable=False, default="COMPLETED")
