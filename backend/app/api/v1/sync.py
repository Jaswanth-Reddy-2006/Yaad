from typing import List, Any, Dict
from datetime import datetime
import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.game import GameResultRecord
from app.models.reminder import Reminder
from app.schemas.game import GameResultCreate

router = APIRouter(prefix="/sync", tags=["Offline Sync"])

class SyncItem(BaseModel):
    event_id: str
    type: str # 'GAME_RESULT' | 'REMINDER_COMPLETE'
    payload: Dict[str, Any]

class SyncRequest(BaseModel):
    items: List[SyncItem]

class SyncResponse(BaseModel):
    processed_event_ids: List[str]
    failed_event_ids: List[str]

@router.post("", response_model=SyncResponse, status_code=status.HTTP_200_OK)
async def process_offline_sync(
    req: SyncRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    processed = []
    failed = []

    for item in req.items:
        try:
            if item.type == 'GAME_RESULT':
                # Validate payload with Pydantic schema
                validated_data = GameResultCreate(**item.payload)
                
                # Check for existing session_id idempotently
                existing = await db.execute(
                    select(GameResultRecord).where(GameResultRecord.session_id == validated_data.session_id)
                )
                if not existing.scalars().first():
                    record = GameResultRecord(
                        id=uuid.uuid4(),
                        session_id=validated_data.session_id,
                        patient_id=current_user.id,
                        game_id=validated_data.game_id,
                        difficulty=validated_data.difficulty,
                        score=validated_data.score,
                        accuracy=validated_data.accuracy,
                        duration_seconds=validated_data.duration_seconds,
                        attempts=validated_data.attempts,
                        mistakes=validated_data.mistakes,
                        hints_used=validated_data.hints_used,
                        started_at=validated_data.started_at,
                        completed_at=validated_data.completed_at,
                        status=validated_data.status,
                    )
                    db.add(record)
                    await db.commit()

            elif item.type == 'REMINDER_COMPLETE':
                reminder_id = item.payload.get('reminder_id')
                if reminder_id:
                    result = await db.execute(
                        select(Reminder).where(Reminder.id == uuid.UUID(reminder_id))
                    )
                    reminder = result.scalars().first()
                    if reminder:
                        reminder.is_completed = True
                        await db.commit()

            processed.append(item.event_id)
        except IntegrityError:
            await db.rollback()
            # Already processed idempotently
            processed.append(item.event_id)
        except Exception:
            await db.rollback()
            failed.append(item.event_id)

    return SyncResponse(processed_event_ids=processed, failed_event_ids=failed)
