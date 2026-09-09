from typing import List, Any, Dict, Optional
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
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

class CloudPushItem(BaseModel):
    id: Optional[str] = None
    patient_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    category: str = "MEDICINE"
    scheduled_time: str
    status: Optional[str] = "UPCOMING"
    voice_note_url: Optional[str] = None
    voice_note_duration_sec: Optional[int] = None
    gentle_alarm_tone: Optional[str] = "CHIME"
    repeat: Optional[str] = "DAILY"

class CloudPushRequest(BaseModel):
    patient_id: str
    reminders: List[CloudPushItem]

@router.post("/cloud/push")
async def cloud_push_sync(
    req: CloudPushRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Long-distance internet cloud sync: Push reminders, alarms, and voice notes
    to the centralized Neon PostgreSQL database.
    """
    patient_uuid = uuid.UUID(req.patient_id)
    saved_count = 0

    for item in req.reminders:
        # Check if reminder exists by ID or title+time
        rem = None
        if item.id:
            try:
                rem_id = uuid.UUID(item.id)
                res = await db.execute(
                    select(Reminder).where(
                        and_(
                            Reminder.id == rem_id,
                            Reminder.patient_id == patient_uuid
                        )
                    )
                )
                rem = res.scalars().first()
            except ValueError:
                rem = None

        if not rem:
            # Check by title and scheduled_time for idempotency
            res = await db.execute(
                select(Reminder).where(
                    and_(
                        Reminder.patient_id == patient_uuid,
                        Reminder.title == item.title,
                        Reminder.scheduled_time == item.scheduled_time
                    )
                )
            )
            rem = res.scalars().first()

        if rem:
            # Update existing
            if item.status:
                rem.status = item.status
                if item.status == "COMPLETED" and not rem.completed_at:
                    rem.completed_at = datetime.now(timezone.utc)
            if item.voice_note_url:
                rem.voice_note_url = item.voice_note_url
            if item.voice_note_duration_sec:
                rem.voice_note_duration_sec = item.voice_note_duration_sec
            if item.gentle_alarm_tone:
                rem.gentle_alarm_tone = item.gentle_alarm_tone
            rem.updated_at = datetime.now(timezone.utc)
        else:
            # Insert new
            rem = Reminder(
                patient_id=patient_uuid,
                created_by=current_user.id,
                title=item.title,
                description=item.description,
                category=item.category,
                scheduled_time=item.scheduled_time,
                repeat_rule=item.repeat or "DAILY",
                status=item.status or "UPCOMING",
                voice_note_url=item.voice_note_url,
                voice_note_duration_sec=item.voice_note_duration_sec,
                gentle_alarm_tone=item.gentle_alarm_tone or "CHIME",
            )
            db.add(rem)
        saved_count += 1

    await db.commit()
    return {
        "success": True,
        "synced_count": saved_count,
        "patient_id": req.patient_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/cloud/pull")
async def cloud_pull_sync(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Long-distance internet cloud sync: Pull latest reminders, voice notes,
    and care schedules from the Neon PostgreSQL database.
    """
    patient_uuid = uuid.UUID(patient_id)
    res = await db.execute(
        select(Reminder)
        .where(Reminder.patient_id == patient_uuid)
        .order_by(Reminder.created_at.desc())
    )
    reminders = res.scalars().all()

    items = [
        {
            "id": str(r.id),
            "patient_id": str(r.patient_id),
            "title": r.title,
            "description": r.description or "",
            "category": r.category,
            "scheduled_time": r.scheduled_time,
            "status": r.status,
            "repeat": r.repeat_rule,
            "voice_note_url": r.voice_note_url,
            "voice_note_duration_sec": r.voice_note_duration_sec,
            "gentle_alarm_tone": r.gentle_alarm_tone or "CHIME",
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
            "created_at": r.created_at.isoformat(),
        }
        for r in reminders
    ]

    return {
        "success": True,
        "patient_id": patient_id,
        "count": len(items),
        "reminders": items,
        "pulled_at": datetime.now(timezone.utc).isoformat()
    }

