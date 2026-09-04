from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.profile import PatientProfile
from app.models.user import User, UserRole
from app.schemas.user import PatientProfileRead

from typing import Dict, Any
from datetime import datetime, timezone, timedelta
from app.models.game import GameResultRecord

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/me", response_model=PatientProfileRead)
async def get_my_patient_profile(
    current_user: User = Depends(require_role([UserRole.PATIENT])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PatientProfile).where(PatientProfile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")

    qr_payload = f"MITRACARE:PATIENT:{profile.user_id}:{profile.connection_token}"

    return PatientProfileRead(
        user_id=str(profile.user_id),
        display_name=profile.display_name,
        age=profile.age,
        preferred_language=profile.preferred_language,
        connection_code=profile.connection_code,
        connection_token=profile.connection_token,
        qr_payload=qr_payload,
    )

@router.get("/me/adaptation")
async def get_patient_adaptation(
    current_user: User = Depends(require_role([UserRole.PATIENT])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(GameResultRecord)
        .where(GameResultRecord.patient_id == current_user.id)
        .order_by(GameResultRecord.completed_at.desc())
        .limit(5)
    )
    recent_games = result.scalars().all()

    if not recent_games:
        return {
            "recommended_difficulty": "EASY",
            "reason": "Initial activity session baseline",
            "recent_avg_accuracy": 100.0,
            "sample_count": 0,
        }

    avg_acc = sum(g.accuracy for g in recent_games) / len(recent_games)
    
    if avg_acc >= 85.0:
        recommended = "HARD" if recent_games[0].difficulty == "MEDIUM" else "MEDIUM"
        reason = "High accuracy (>85%) achieved in recent sessions"
    elif avg_acc < 60.0:
        recommended = "EASY"
        reason = "Pacing adjustment recommended based on recent accuracy (<60%)"
    else:
        recommended = recent_games[0].difficulty
        reason = "Optimal baseline challenge level maintained"

    return {
        "recommended_difficulty": recommended,
        "reason": reason,
        "recent_avg_accuracy": round(avg_acc, 1),
        "sample_count": len(recent_games),
    }

@router.get("/me/baseline-deviation")
async def get_patient_baseline_deviation(
    current_user: User = Depends(require_role([UserRole.PATIENT])),
    db: AsyncSession = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    d7 = now - timedelta(days=7)
    d14 = now - timedelta(days=14)

    # Current 7-day window
    res7 = await db.execute(
        select(GameResultRecord).where(
            GameResultRecord.patient_id == current_user.id,
            GameResultRecord.completed_at >= d7
        )
    )
    games_7d = res7.scalars().all()

    # Prior 7-day window
    res14 = await db.execute(
        select(GameResultRecord).where(
            GameResultRecord.patient_id == current_user.id,
            GameResultRecord.completed_at >= d14,
            GameResultRecord.completed_at < d7
        )
    )
    games_prior_7d = res14.scalars().all()

    avg_duration_7d = sum(g.duration_seconds for g in games_7d) / max(len(games_7d), 1) if games_7d else 0
    avg_duration_prior = sum(g.duration_seconds for g in games_prior_7d) / max(len(games_prior_7d), 1) if games_prior_7d else 0

    duration_delta = 0.0
    if avg_duration_prior > 0:
        duration_delta = round(((avg_duration_7d - avg_duration_prior) / avg_duration_prior) * 100, 1)

    return {
        "recent_7d_activity_count": len(games_7d),
        "prior_7d_activity_count": len(games_prior_7d),
        "avg_duration_seconds_7d": round(avg_duration_7d, 1),
        "duration_baseline_change_pct": duration_delta,
        "observation": f"Completion duration changed by {duration_delta:+}% vs prior 7-day period",
        "diagnostic_claim": False, # Non-diagnostic rule enforced
    }
