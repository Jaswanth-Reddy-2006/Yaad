import uuid
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.api.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.profile import PatientProfile, CaregiverProfile, DoctorProfile
from app.models.relationship import CaregiverPatientRelationship, RelationshipStatus
from app.models.game import GameResultRecord
from app.models.reminder import ReminderRecord
from app.models.alert import AlertRecord
from app.models.audit import AuditLog
from app.core.security import get_password_hash
from app.schemas.admin import (
    AdminDashboardResponse, AdminUserItem, AdminConnectionAuditItem,
    AdminAuditLogItem, SystemHealthResponse, AdminCreateUserRequest, AdminCreateUserResponse
)

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.post("/users/create", response_model=AdminCreateUserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_account(
    req: AdminCreateUserRequest,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    Admin Account Creation Endpoint:
    Allows an authenticated Admin to provision Admin, Doctor, or Caregiver accounts.
    Hashes password securely using passlib bcrypt and records an audit log entry.
    """
    # Check if email/phone exists
    if req.email:
        existing = await db.execute(select(User).where(User.email == req.email))
        if existing.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists."
            )

    try:
        target_role = UserRole(req.role.upper())
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{req.role}'. Allowed: ADMIN, DOCTOR, HEALTHCARE_WORKER, CAREGIVER."
        )

    # Hash password securely
    password_hash = get_password_hash(req.password)

    new_user = User(
        email=req.email,
        phone=req.phone,
        password_hash=password_hash,
        role=target_role,
        is_active=True,
        is_verified=True,
    )
    db.add(new_user)
    await db.flush()

    # Create profile entry
    if target_role == UserRole.DOCTOR or target_role == UserRole.HEALTHCARE_WORKER:
        doc_prof = DoctorProfile(
            user_id=new_user.id,
            full_name=req.full_name,
            specialization="General Neurology",
            hospital_affinity=req.organization or "MitraCare Health Network"
        )
        db.add(doc_prof)
    elif target_role == UserRole.CAREGIVER or target_role == UserRole.ADMIN:
        cg_prof = CaregiverProfile(
            user_id=new_user.id,
            full_name=req.full_name,
            relationship_type="ADMINISTRATOR" if target_role == UserRole.ADMIN else "Family Member"
        )
        db.add(cg_prof)

    # Record Audit Log Entry
    audit = AuditLog(
        user_id=current_user.id,
        action="USER_ACCOUNT_CREATED",
        resource=f"user:{new_user.id}",
        details=f"Admin {current_user.email or current_user.public_id} created {target_role.value} account for {req.full_name} ({req.email})"
    )
    db.add(audit)

    await db.commit()

    return AdminCreateUserResponse(
        user_id=str(new_user.id),
        public_id=new_user.public_id,
        email=new_user.email,
        role=new_user.role.value,
        full_name=req.full_name,
        status="ACTIVE"
    )

@router.get("/dashboard", response_model=AdminDashboardResponse)
async def get_admin_dashboard(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    patients_cnt = (await db.execute(select(func.count(PatientProfile.user_id)))).scalar() or 0
    caregivers_cnt = (await db.execute(select(func.count(CaregiverProfile.user_id)))).scalar() or 0
    doctors_cnt = (await db.execute(select(func.count(DoctorProfile.user_id)))).scalar() or 0
    connections_cnt = (await db.execute(select(func.count(CaregiverPatientRelationship.id)).where(CaregiverPatientRelationship.status == RelationshipStatus.ACTIVE))).scalar() or 0
    sessions_cnt = (await db.execute(select(func.count(GameResultRecord.id)))).scalar() or 0
    alerts_cnt = (await db.execute(select(func.count(AlertRecord.id)).where(AlertRecord.is_resolved == False))).scalar() or 0

    return AdminDashboardResponse(
        total_patients=patients_cnt,
        total_caregivers=caregivers_cnt,
        total_doctors=doctors_cnt,
        active_connections=connections_cnt,
        total_game_sessions=sessions_cnt,
        average_reminder_completion_rate=83.5,
        unread_alerts_count=alerts_cnt,
        recent_user_growth=[
            {"month": "May", "users": 120},
            {"month": "Jun", "users": 185},
            {"month": "Jul", "users": 240},
            {"month": "Aug", "users": 310},
        ],
        activity_usage_trends=[
            {"game": "Match Pair", "sessions": 1420},
            {"game": "Match Triplet", "sessions": 980},
            {"game": "Remember Pictures", "sessions": 760},
        ]
    )

@router.get("/users", response_model=List[AdminUserItem])
async def list_platform_users(
    role_filter: str = None,
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    query = select(User)
    if role_filter:
        query = query.where(User.role == role_filter.upper())

    res = await db.execute(query.order_by(User.created_at.desc()).limit(100))
    users = res.scalars().all()

    user_list = []
    for u in users:
        display = u.email or u.phone or u.public_id
        user_list.append(
            AdminUserItem(
                user_id=str(u.id),
                public_id=u.public_id,
                role=u.role.value,
                email=u.email,
                phone=u.phone,
                display_name=display,
                is_active=u.is_active,
                created_at=u.created_at.strftime("%Y-%m-%d %H:%M"),
                last_login_at=u.last_login_at.strftime("%Y-%m-%d %H:%M") if u.last_login_at else None
            )
        )

    return user_list

@router.get("/connections", response_model=List[AdminConnectionAuditItem])
async def list_connection_audits(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(CaregiverPatientRelationship, CaregiverProfile, PatientProfile)
        .join(CaregiverProfile, CaregiverProfile.user_id == CaregiverPatientRelationship.caregiver_id)
        .join(PatientProfile, PatientProfile.user_id == CaregiverPatientRelationship.patient_id)
        .order_by(CaregiverPatientRelationship.created_at.desc())
        .limit(50)
    )
    rows = res.all()

    return [
        AdminConnectionAuditItem(
            relationship_id=str(rel.id),
            caregiver_name=cg.full_name,
            patient_name=p.display_name,
            status=rel.status.value,
            created_at=rel.created_at.strftime("%Y-%m-%d %H:%M")
        )
        for rel, cg, p in rows
    ]

@router.get("/audit", response_model=List[AdminAuditLogItem])
async def get_system_audit_logs(
    current_user: User = Depends(require_role([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100)
    )
    logs = res.scalars().all()

    return [
        AdminAuditLogItem(
            id=str(l.id),
            user_id=str(l.user_id) if l.user_id else None,
            action=l.action,
            resource=l.resource,
            details=l.details,
            timestamp=l.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        )
        for l in logs
    ]

@router.get("/system", response_model=SystemHealthResponse)
async def get_system_health(
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    return SystemHealthResponse(
        api_status="HEALTHY",
        database_status="CONNECTED",
        active_sessions_count=42,
        uptime_seconds=864000
    )
