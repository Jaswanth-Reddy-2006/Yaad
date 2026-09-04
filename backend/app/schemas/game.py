from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class GameResultCreate(BaseModel):
    session_id: str = Field(..., min_length=5, max_length=100)
    game_id: str = Field(..., min_length=2, max_length=50) # 'PAIR' | 'TRIPLET' | 'REMEMBER'
    difficulty: str = Field('EASY', min_length=2, max_length=20) # 'EASY' | 'MEDIUM' | 'HARD'
    score: int = Field(..., ge=0, le=10000)
    accuracy: float = Field(..., ge=0.0, le=100.0)
    duration_seconds: int = Field(..., ge=0, le=86400)
    attempts: int = Field(..., ge=0, le=1000)
    mistakes: int = Field(0, ge=0, le=1000)
    hints_used: int = Field(0, ge=0, le=100)
    started_at: datetime
    completed_at: datetime
    status: str = Field('COMPLETED', max_length=20)

class GameResultRead(GameResultCreate):
    id: str
    patient_id: str

    class Config:
        from_attributes = True
