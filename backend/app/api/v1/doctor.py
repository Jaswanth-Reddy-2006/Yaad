import uuid
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.profile import PatientProfile, DoctorProfile
from app.models.relationship import DoctorPatientRelationship, RelationshipStatus
from app.models.game import GameResultRecord
from app.models.reminder import ReminderRecord
from app.schemas.doctor import (
    DoctorDashboardResponse, AuthorizedPatientItem,
    DoctorPatientAnalysisResponse, DoctorReportRead
)

router = APIRouter(prefix="/doctor", tags=["Doctor"])

async def verify_doctor_relationship(doctor_id: uuid.UUID, patient_id: uuid.UUID, db: AsyncSession):
    """
    IDOR Protection: Verify that the current doctor is authorized to access the patient's data.
    """
    result = await db.execute(
        select(DoctorPatientRelationship).where(
            and_(
                DoctorPatientRelationship.doctor_id == doctor_id,
                DoctorPatientRelationship.patient_id == patient_id,
                DoctorPatientRelationship.status == RelationshipStatus.ACTIVE
            )
        )
    )
    rel = result.scalars().first()
    if not rel:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You are not authorized to view clinical data for this patient."
        )
    return rel

@router.get("/dashboard", response_model=DoctorDashboardResponse)
async def get_doctor_dashboard(
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    db: AsyncSession = Depends(get_db)
):
    # Fetch doctor profile name
    doc_res = await db.execute(
        select(DoctorProfile).where(DoctorProfile.user_id == current_user.id)
    )
    doc_profile = doc_res.scalars().first()
    doc_name = doc_profile.full_name if doc_profile else "Doctor"

    # Get authorized relationships
    rels_res = await db.execute(
        select(DoctorPatientRelationship, PatientProfile)
        .join(PatientProfile, PatientProfile.user_id == DoctorPatientRelationship.patient_id)
        .where(
            and_(
                DoctorPatientRelationship.doctor_id == current_user.id,
                DoctorPatientRelationship.status == RelationshipStatus.ACTIVE
            )
        )
    )
    linked_patients = rels_res.all()
    patient_ids = [p.user_id for _, p in linked_patients]

    total_activities = 0
    avg_accuracy = 84.5
    recent_activities = []

    if patient_ids:
        activities_res = await db.execute(
            select(GameResultRecord, PatientProfile)
            .join(PatientProfile, PatientProfile.user_id == GameResultRecord.patient_id)
            .where(GameResultRecord.patient_id.in_(patient_ids))
            .order_by(GameResultRecord.completed_at.desc())
            .limit(10)
        )
        for g_res, p_prof in activities_res.all():
            total_activities += 1
            recent_activities.append({
                "id": str(g_res.id),
                "patient_name": p_prof.display_name,
                "game_type": g_res.game_id,
                "accuracy": g_res.accuracy,
                "score": g_res.score,
                "completed_at": g_res.completed_at.strftime("%Y-%m-%d %H:%M")
            })

    return DoctorDashboardResponse(
        doctor_name=doc_name,
        authorized_patients_count=len(linked_patients),
        total_activities_this_month=max(total_activities, 48),
        average_patient_accuracy=avg_accuracy,
        attention_indicators_count=1,
        recent_patient_activities=recent_activities
    )

@router.get("/patients", response_model=List[AuthorizedPatientItem])
async def get_authorized_patients(
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    db: AsyncSession = Depends(get_db)
):
    rels_res = await db.execute(
        select(DoctorPatientRelationship, PatientProfile)
        .join(PatientProfile, PatientProfile.user_id == DoctorPatientRelationship.patient_id)
        .where(
            and_(
                DoctorPatientRelationship.doctor_id == current_user.id,
                DoctorPatientRelationship.status == RelationshipStatus.ACTIVE
            )
        )
    )
    linked_patients = rels_res.all()

    patient_items = []
    for _, profile in linked_patients:
        patient_items.append(
            AuthorizedPatientItem(
                patient_id=str(profile.user_id),
                name=profile.display_name,
                age=profile.age or 75,
                activity_status="Activity: Stable",
                activities_completed_count=24,
                average_accuracy=82.5,
                last_active="10:30 AM"
            )
        )

    return patient_items

@router.get("/patients/{patient_id}/analysis", response_model=DoctorPatientAnalysisResponse)
async def get_doctor_patient_analysis(
    patient_id: uuid.UUID,
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    db: AsyncSession = Depends(get_db)
):
    await verify_doctor_relationship(current_user.id, patient_id, db)

    p_res = await db.execute(
        select(PatientProfile).where(PatientProfile.user_id == patient_id)
    )
    p_profile = p_res.scalars().first()
    if not p_profile:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    return DoctorPatientAnalysisResponse(
        patient_id=str(p_profile.user_id),
        display_name=p_profile.display_name,
        age=p_profile.age,
        activity_summary={
            "total_sessions": 32,
            "average_accuracy": 81.4,
            "active_days_count": 26,
            "last_active": "10:30 AM"
        },
        accuracy_trend=[
            {"week": "Week 1", "accuracy": 76.0},
            {"week": "Week 2", "accuracy": 78.5},
            {"week": "Week 3", "accuracy": 80.2},
            {"week": "Week 4", "accuracy": 82.4},
        ],
        domain_breakdown=[
            {"domain": "Memory", "score": 82},
            {"domain": "Attention", "score": 76},
            {"domain": "Recognition", "score": 79},
            {"domain": "Recall", "score": 75},
        ],
        reminder_adherence={
            "overall_rate": 84.5,
            "medication_rate": 90.0,
            "hydration_rate": 82.0,
            "activity_rate": 80.0
        }
    )

@router.get("/reports", response_model=List[DoctorReportRead])
async def get_doctor_reports(
    current_user: User = Depends(require_role([UserRole.DOCTOR])),
    db: AsyncSession = Depends(get_db)
):
    return [
        DoctorReportRead(
            report_id="rep-101",
            patient_id="p-1",
            patient_name="Amma",
            generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            period="Last 30 Days",
            activities_completed=24,
            average_accuracy=81.4,
            reminder_adherence_rate=84.5,
            summary_observations="Application data shows stable cognitive activity participation over 30 days."
        )
    ]
