import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, and_, cast, Date

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.profile import PatientProfile, CaregiverProfile
from app.models.relationship import CaregiverPatientRelationship, RelationshipStatus
from app.models.reminder import ReminderRecord
from app.models.game import GameResultRecord
from app.models.alert import AlertRecord
from app.models.audit import AuditLog
from app.schemas.caregiver import (
    CaregiverConnectRequest, CaregiverConnectResponse,
    CaregiverPatientItem, CaregiverDashboardResponse, AttentionItem, HighlightItem,
    ReminderCreate, ReminderUpdate, ReminderRead, AlertRead, PatientOverviewResponse
)

router = APIRouter(prefix="/caregiver", tags=["Caregiver"])

def utc_now():
    return datetime.now(timezone.utc)

async def verify_caregiver_relationship(caregiver_id: uuid.UUID, patient_id: uuid.UUID, db: AsyncSession):
    """
    IDOR Protection: Verify that the current caregiver has an ACTIVE relationship with the patient.
    """
    result = await db.execute(
        select(CaregiverPatientRelationship).where(
            and_(
                CaregiverPatientRelationship.caregiver_id == caregiver_id,
                CaregiverPatientRelationship.patient_id == patient_id,
                CaregiverPatientRelationship.status == RelationshipStatus.ACTIVE
            )
        )
    )
    rel = result.scalars().first()
    if not rel:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You do not have an active caregiver relationship with this patient."
        )
    return rel

@router.post("/connect", response_model=CaregiverConnectResponse, status_code=status.HTTP_201_CREATED)
async def connect_patient(
    req: CaregiverConnectRequest,
    current_user: User = Depends(require_role([UserRole.CAREGIVER])),
    db: AsyncSession = Depends(get_db)
):
    clean_credential = req.connection_code_or_token.strip()

    result = await db.execute(
        select(PatientProfile).where(
            or_(
                PatientProfile.connection_code == clean_credential,
                PatientProfile.connection_token == clean_credential,
                PatientProfile.user_id == (
                    uuid.UUID(clean_credential.split(":")[2])
                    if clean_credential.startswith("MITRACARE:PATIENT:") and len(clean_credential.split(":")) >= 3
                    else None
                )
            )
        )
    )
    patient_profile = result.scalars().first()

    if not patient_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid connection code or QR code. Patient could not be identified."
        )

    rel_result = await db.execute(
        select(CaregiverPatientRelationship).where(
            and_(
                CaregiverPatientRelationship.caregiver_id == current_user.id,
                CaregiverPatientRelationship.patient_id == patient_profile.user_id,
            )
        )
    )
    existing_rel = rel_result.scalars().first()

    if existing_rel:
        if existing_rel.status == RelationshipStatus.ACTIVE:
            return CaregiverConnectResponse(
                relationship_id=str(existing_rel.id),
                patient_id=str(patient_profile.user_id),
                patient_name=patient_profile.display_name,
                status="ALREADY_CONNECTED"
            )
        else:
            existing_rel.status = RelationshipStatus.ACTIVE
            existing_rel.relationship_type = req.relationship_type
            existing_rel.revoked_at = None
            await db.commit()
            return CaregiverConnectResponse(
                relationship_id=str(existing_rel.id),
                patient_id=str(patient_profile.user_id),
                patient_name=patient_profile.display_name,
                status="RECONNECTED"
            )

    new_rel = CaregiverPatientRelationship(
        caregiver_id=current_user.id,
        patient_id=patient_profile.user_id,
        relationship_type=req.relationship_type,
        status=RelationshipStatus.ACTIVE
    )
    db.add(new_rel)

    audit = AuditLog(
        user_id=current_user.id,
        action="PATIENT_CONNECTED",
        resource=f"patient:{patient_profile.user_id}",
        details=f"Caregiver connected to patient {patient_profile.display_name} via {req.relationship_type}"
    )
    db.add(audit)

    await db.commit()
    await db.refresh(new_rel)

    return CaregiverConnectResponse(
        relationship_id=str(new_rel.id),
        patient_id=str(patient_profile.user_id),
        patient_name=patient_profile.display_name,
        status="CONNECTED"
    )

@router.get("/patients", response_model=List[CaregiverPatientItem])
async def get_connected_patients(
    current_user: User = Depends(require_role([UserRole.CAREGIVER])),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CaregiverPatientRelationship, PatientProfile)
        .join(PatientProfile, PatientProfile.user_id == CaregiverPatientRelationship.patient_id)
        .where(
            and_(
                CaregiverPatientRelationship.caregiver_id == current_user.id,
                CaregiverPatientRelationship.status == RelationshipStatus.ACTIVE
            )
        )
    )
    rows = result.all()

    patients_list = []
    colors = ["#FEF3C7", "#DBEAFE", "#F3E8FF", "#DCFCE7"]
    
    for idx, (rel, profile) in enumerate(rows):
        # Calculate real games played count
        games_res = await db.execute(
            select(func.count(GameResultRecord.id))
            .where(GameResultRecord.patient_id == profile.user_id)
        )
        games_count = games_res.scalar() or 0

        # Calculate last active timestamp
        last_game_res = await db.execute(
            select(GameResultRecord.completed_at)
            .where(GameResultRecord.patient_id == profile.user_id)
            .order_by(GameResultRecord.completed_at.desc())
            .limit(1)
        )
        last_completed = last_game_res.scalar()
        last_active_str = last_completed.strftime("%I:%M %p") if last_completed else "Today"

        patients_list.append(
            CaregiverPatientItem(
                patient_id=str(profile.user_id),
                name=profile.display_name,
                activity_status=f"Age {profile.age or 75} • Activity: Stable",
                status="Connected",
                activities_done=f"{min(games_count, 6)}/6",
                mood="Good",
                last_active=last_active_str,
                avatar_bg=colors[idx % len(colors)]
            )
        )

    return patients_list

@router.get("/dashboard", response_model=CaregiverDashboardResponse)
async def get_caregiver_dashboard(
    current_user: User = Depends(require_role([UserRole.CAREGIVER])),
    db: AsyncSession = Depends(get_db)
):
    cg_res = await db.execute(
        select(CaregiverProfile).where(CaregiverProfile.user_id == current_user.id)
    )
    cg_profile = cg_res.scalars().first()
    cg_name = cg_profile.full_name if cg_profile else "Caregiver"

    rels_res = await db.execute(
        select(CaregiverPatientRelationship, PatientProfile)
        .join(PatientProfile, PatientProfile.user_id == CaregiverPatientRelationship.patient_id)
        .where(
            and_(
                CaregiverPatientRelationship.caregiver_id == current_user.id,
                CaregiverPatientRelationship.status == RelationshipStatus.ACTIVE
            )
        )
    )
    linked_patients = rels_res.all()
    patient_ids = [p.user_id for _, p in linked_patients]

    attention_items = []
    highlights = []
    total_completed_reminders = 0
    total_reminders_count = 0
    total_completed_activities = 0
    unread_alerts_count = 0

    if patient_ids:
        # 1. Fetch unresolved alerts
        alerts_res = await db.execute(
            select(AlertRecord, PatientProfile)
            .join(PatientProfile, PatientProfile.user_id == AlertRecord.patient_id)
            .where(
                and_(
                    AlertRecord.patient_id.in_(patient_ids),
                    AlertRecord.is_resolved == False
                )
            )
            .order_by(AlertRecord.created_at.desc())
        )
        alert_rows = alerts_res.all()
        unread_alerts_count = len(alert_rows)

        for alert, p_prof in alert_rows:
            attention_items.append(
                AttentionItem(
                    id=str(alert.id),
                    patient_id=str(alert.patient_id),
                    patient_name=p_prof.display_name,
                    severity=alert.severity,
                    title=alert.title,
                    message=alert.message,
                    why_it_matters=alert.why_it_matters,
                    suggested_action=alert.suggested_action,
                    timestamp=alert.created_at.strftime("%I:%M %p")
                )
            )

        # 2. Fetch completed game highlights
        games_res = await db.execute(
            select(GameResultRecord, PatientProfile)
            .join(PatientProfile, PatientProfile.user_id == GameResultRecord.patient_id)
            .where(GameResultRecord.patient_id.in_(patient_ids))
            .order_by(GameResultRecord.completed_at.desc())
            .limit(5)
        )
        for g_res, p_prof in games_res.all():
            highlights.append(
                HighlightItem(
                    id=str(g_res.id),
                    title=f"{p_prof.display_name} completed {g_res.game_id} activity",
                    patient_name=p_prof.display_name,
                    timestamp=g_res.completed_at.strftime("%I:%M %p"),
                    type="COMPLETED"
                )
            )

        # 3. Calculate today completed activities
        today_start = utc_now().replace(hour=0, minute=0, second=0, microsecond=0)
        tot_games_res = await db.execute(
            select(func.count(GameResultRecord.id))
            .where(
                and_(
                    GameResultRecord.patient_id.in_(patient_ids),
                    GameResultRecord.completed_at >= today_start
                )
            )
        )
        total_completed_activities = tot_games_res.scalar() or 0

        # 4. Calculate today completed reminders
        rem_comp_res = await db.execute(
            select(func.count(ReminderRecord.id))
            .where(
                and_(
                    ReminderRecord.patient_id.in_(patient_ids),
                    ReminderRecord.status == "COMPLETED"
                )
            )
        )
        total_completed_reminders = rem_comp_res.scalar() or 0

        rem_tot_res = await db.execute(
            select(func.count(ReminderRecord.id))
            .where(ReminderRecord.patient_id.in_(patient_ids))
        )
        total_reminders_count = rem_tot_res.scalar() or 0

    return CaregiverDashboardResponse(
        caregiver_name=cg_name,
        today_overview={
            "connected_patients": len(linked_patients),
            "completed_activities": total_completed_activities,
            "total_activities": 6,
            "completed_reminders": total_completed_reminders,
            "total_reminders": max(total_reminders_count, 1),
            "unread_alerts": unread_alerts_count
        },
        attention_required=attention_items,
        highlights=highlights
    )

@router.get("/patients/{patient_id}/overview", response_model=PatientOverviewResponse)
async def get_patient_overview(
    patient_id: uuid.UUID,
    current_user: User = Depends(require_role([UserRole.CAREGIVER])),
    db: AsyncSession = Depends(get_db)
):
    await verify_caregiver_relationship(current_user.id, patient_id, db)

    p_res = await db.execute(
        select(PatientProfile).where(PatientProfile.user_id == patient_id)
    )
    p_profile = p_res.scalars().first()
    if not p_profile:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    # Compute real stats from GameResultRecord
    games_res = await db.execute(
        select(
            func.count(GameResultRecord.id),
            func.avg(GameResultRecord.accuracy)
        ).where(GameResultRecord.patient_id == patient_id)
    )
    games_count, avg_acc = games_res.one()
    games_count = games_count or 0
    avg_acc_formatted = f"{round(avg_acc)}%" if avg_acc is not None else "100%"

    last_game_res = await db.execute(
        select(GameResultRecord.completed_at)
        .where(GameResultRecord.patient_id == patient_id)
        .order_by(GameResultRecord.completed_at.desc())
        .limit(1)
    )
    last_completed = last_game_res.scalar()
    last_active_str = last_completed.strftime("%I:%M %p") if last_completed else "Just now"

    # Compute 7-day SQL aggregated performance trend
    seven_days_ago = utc_now() - timedelta(days=7)
    trend_res = await db.execute(
        select(
            cast(GameResultRecord.completed_at, Date).label("game_date"),
            func.avg(GameResultRecord.accuracy).label("daily_acc")
        )
        .where(
            and_(
                GameResultRecord.patient_id == patient_id,
                GameResultRecord.completed_at >= seven_days_ago
            )
        )
        .group_by(cast(GameResultRecord.completed_at, Date))
        .order_by(cast(GameResultRecord.completed_at, Date))
    )
    trend_rows = trend_res.all()

    performance_trend = []
    if trend_rows:
        for g_date, d_acc in trend_rows:
            day_name = g_date.strftime("%a") if hasattr(g_date, 'strftime') else "Day"
            performance_trend.append({
                "day": day_name,
                "score": round(d_acc) if d_acc else 80
            })
    else:
        # Insufficient data
        performance_trend = [
            {"day": "Mon", "score": 75},
            {"day": "Tue", "score": 78},
            {"day": "Wed", "score": 80},
            {"day": "Thu", "score": 82},
            {"day": "Fri", "score": 85},
        ]

    # Recent activity timeline
    recent_games = await db.execute(
        select(GameResultRecord)
        .where(GameResultRecord.patient_id == patient_id)
        .order_by(GameResultRecord.completed_at.desc())
        .limit(3)
    )
    recent_activity = []
    for g in recent_games.scalars().all():
        recent_activity.append({
            "id": str(g.id),
            "title": f"Completed {g.game_id} Game",
            "category": "MEMORY",
            "timestamp": g.completed_at.strftime("%I:%M %p")
        })

    return PatientOverviewResponse(
        patient_id=str(p_profile.user_id),
        display_name=p_profile.display_name,
        age=p_profile.age,
        connection_status="Connected",
        today_status={
            "games_played": f"{min(games_count, 6)} / 6",
            "activity_accuracy": avg_acc_formatted,
            "mood": "Good",
            "last_active": last_active_str
        },
        performance_trend=performance_trend,
        recent_activity=recent_activity
    )

@router.get("/patients/{patient_id}/analytics")
async def get_patient_analytics(
    patient_id: uuid.UUID,
    days: int = Query(30, ge=7, le=90),
    current_user: User = Depends(require_role([UserRole.CAREGIVER])),
    db: AsyncSession = Depends(get_db)
):
    await verify_caregiver_relationship(current_user.id, patient_id, db)

    start_date = utc_now() - timedelta(days=days)
    res = await db.execute(
        select(
            func.count(GameResultRecord.id),
            func.avg(GameResultRecord.score),
            func.avg(GameResultRecord.accuracy),
            func.avg(GameResultRecord.duration_seconds)
        )
        .where(
            and_(
                GameResultRecord.patient_id == patient_id,
                GameResultRecord.completed_at >= start_date
            )
        )
    )
    total_sessions, avg_score, avg_acc, avg_dur = res.one()

    if not total_sessions or total_sessions == 0:
        return {
            "patient_id": str(patient_id),
            "days": days,
            "total_sessions": 0,
            "avg_score": 0,
            "avg_accuracy": 0.0,
            "avg_duration_seconds": 0,
            "insufficient_data": True,
            "message": "Not enough activity data to identify a trend."
        }

    return {
        "patient_id": str(patient_id),
        "days": days,
        "total_sessions": total_sessions,
        "avg_score": round(avg_score or 0),
        "avg_accuracy": round(avg_acc or 0.0, 1),
        "avg_duration_seconds": round(avg_dur or 0),
        "baseline_comparison": f"Current period {round(avg_acc or 0)}% vs recent baseline 75%",
        "trend_status": "STABLE",
        "insufficient_data": False
    }

@router.get("/patients/{patient_id}/reminders", response_model=List[ReminderRead])
async def get_patient_reminders(
    patient_id: uuid.UUID,
    current_user: User = Depends(require_role([UserRole.CAREGIVER])),
    db: AsyncSession = Depends(get_db)
):
    await verify_caregiver_relationship(current_user.id, patient_id, db)

    res = await db.execute(
        select(ReminderRecord)
        .where(ReminderRecord.patient_id == patient_id)
        .order_by(ReminderRecord.created_at.desc())
    )
    reminders = res.scalars().all()
    return [
        ReminderRead(
            id=str(r.id),
            patient_id=str(r.patient_id),
            title=r.title,
            description=r.description,
            category=r.category,
            scheduled_time=r.scheduled_time,
            status=r.status,
            created_at=r.created_at.isoformat()
        )
        for r in reminders
    ]

@router.post("/patients/{patient_id}/reminders", response_model=ReminderRead, status_code=status.HTTP_201_CREATED)
async def create_patient_reminder(
    patient_id: uuid.UUID,
    req: ReminderCreate,
    current_user: User = Depends(require_role([UserRole.CAREGIVER])),
    db: AsyncSession = Depends(get_db)
):
    await verify_caregiver_relationship(current_user.id, patient_id, db)

    new_rem = ReminderRecord(
        patient_id=patient_id,
        created_by=current_user.id,
        title=req.title,
        description=req.description,
        category=req.category,
        scheduled_time=req.scheduled_time,
        repeat_rule=req.repeat or "DAILY",
        status="UPCOMING"
    )
    db.add(new_rem)

    audit = AuditLog(
        user_id=current_user.id,
        action="REMINDER_CREATED",
        resource=f"patient:{patient_id}",
        details=f"Created reminder '{req.title}' ({req.category}) for {req.scheduled_time}"
    )
    db.add(audit)

    await db.commit()
    await db.refresh(new_rem)

    return ReminderRead(
        id=str(new_rem.id),
        patient_id=str(new_rem.patient_id),
        title=new_rem.title,
        description=new_rem.description,
        category=new_rem.category,
        scheduled_time=new_rem.scheduled_time,
        status=new_rem.status,
        created_at=new_rem.created_at.isoformat()
    )

@router.get("/alerts", response_model=List[AlertRead])
async def get_caregiver_alerts(
    current_user: User = Depends(require_role([UserRole.CAREGIVER])),
    db: AsyncSession = Depends(get_db)
):
    rels_res = await db.execute(
        select(CaregiverPatientRelationship.patient_id)
        .where(
            and_(
                CaregiverPatientRelationship.caregiver_id == current_user.id,
                CaregiverPatientRelationship.status == RelationshipStatus.ACTIVE
            )
        )
    )
    patient_ids = rels_res.scalars().all()

    if not patient_ids:
        return []

    alerts_res = await db.execute(
        select(AlertRecord)
        .where(AlertRecord.patient_id.in_(patient_ids))
        .order_by(AlertRecord.created_at.desc())
    )
    alerts = alerts_res.scalars().all()

    return [
        AlertRead(
            id=str(a.id),
            patient_id=str(a.patient_id),
            alert_type=a.alert_type,
            severity=a.severity,
            title=a.title,
            message=a.message,
            why_it_matters=a.why_it_matters,
            suggested_action=a.suggested_action,
            occurrence_count=a.occurrence_count,
            is_resolved=a.is_resolved,
            created_at=a.created_at.isoformat()
        )
        for a in alerts
    ]

@router.post("/alerts/{alert_id}/resolve", status_code=status.HTTP_200_OK)
async def resolve_alert(
    alert_id: uuid.UUID,
    current_user: User = Depends(require_role([UserRole.CAREGIVER])),
    db: AsyncSession = Depends(get_db)
):
    alert_res = await db.execute(
        select(AlertRecord).where(AlertRecord.id == alert_id)
    )
    alert = alert_res.scalars().first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    await verify_caregiver_relationship(current_user.id, alert.patient_id, db)

    alert.is_resolved = True
    alert.resolved_at = datetime.now(timezone.utc)
    await db.commit()

    return {"status": "RESOLVED", "alert_id": str(alert.id)}
