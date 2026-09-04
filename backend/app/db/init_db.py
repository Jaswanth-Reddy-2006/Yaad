import os
import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.profile import CaregiverProfile, DoctorProfile, PatientProfile
from app.models.relationship import CaregiverPatientRelationship, RelationshipStatus
from app.models.reminder import ReminderRecord
from app.models.game import GameResultRecord
from app.models.alert import AlertRecord
from app.core.security import get_password_hash

def utc_now():
    return datetime.now(timezone.utc)

async def init_admin_bootstrap():
    """
    Initial Database Seed Routine:
    Provisions seed accounts for Admin, Doctor, Caregiver, and Patients with authentic initial records.
    """
    password_hash = get_password_hash("Password123!")

    async with AsyncSessionLocal() as db:
        # 1. Admin Seed
        admin_res = await db.execute(select(User).where(User.email == "admin@mitracare.org"))
        if not admin_res.scalars().first():
            admin_user = User(
                email="admin@mitracare.org",
                password_hash=get_password_hash("AdminSecret123!"),
                role=UserRole.ADMIN,
                is_active=True,
                is_verified=True,
            )
            db.add(admin_user)
            await db.flush()
            db.add(CaregiverProfile(user_id=admin_user.id, full_name="Super Admin", relationship_type="ADMINISTRATOR"))
            print("[BOOTSTRAP] Seed Admin account provisioned: admin@mitracare.org")

        # 2. Doctor Seed
        doc_res = await db.execute(select(User).where(User.email == "doctor@mitracare.org"))
        if not doc_res.scalars().first():
            doc_user = User(
                email="doctor@mitracare.org",
                password_hash=password_hash,
                role=UserRole.DOCTOR,
                is_active=True,
                is_verified=True,
            )
            db.add(doc_user)
            await db.flush()
            db.add(DoctorProfile(user_id=doc_user.id, full_name="Dr. A. K. Sharma", specialization="Neurology / Cognitive Health"))
            print("[BOOTSTRAP] Seed Doctor account provisioned: doctor@mitracare.org")

        # 3. Caregiver Seed
        cg_res = await db.execute(select(User).where(User.email == "caregiver@mitracare.org"))
        cg_user = cg_res.scalars().first()
        if not cg_user:
            cg_user = User(
                email="caregiver@mitracare.org",
                password_hash=password_hash,
                role=UserRole.CAREGIVER,
                is_active=True,
                is_verified=True,
            )
            db.add(cg_user)
            await db.flush()
            db.add(CaregiverProfile(user_id=cg_user.id, full_name="Priya Sharma", relationship_type="Family Member"))
            print("[BOOTSTRAP] Seed Caregiver account provisioned: caregiver@mitracare.org")

        # 4. Patient Seed - Amma
        amma_res = await db.execute(select(User).where(User.email == "amma@mitracare.org"))
        amma_user = amma_res.scalars().first()
        if not amma_user:
            amma_user = User(
                email="amma@mitracare.org",
                password_hash=password_hash,
                role=UserRole.PATIENT,
                is_active=True,
                is_verified=True,
            )
            db.add(amma_user)
            await db.flush()
            db.add(PatientProfile(
                user_id=amma_user.id,
                display_name="Amma",
                age=75,
                preferred_language="en",
                connection_code="YAAD-789",
                connection_token="token-amma-789"
            ))
            print("[BOOTSTRAP] Seed Patient Amma provisioned: amma@mitracare.org")

        # 5. Patient Seed - Ravi
        ravi_res = await db.execute(select(User).where(User.email == "ravi@mitracare.org"))
        ravi_user = ravi_res.scalars().first()
        if not ravi_user:
            ravi_user = User(
                email="ravi@mitracare.org",
                password_hash=password_hash,
                role=UserRole.PATIENT,
                is_active=True,
                is_verified=True,
            )
            db.add(ravi_user)
            await db.flush()
            db.add(PatientProfile(
                user_id=ravi_user.id,
                display_name="Ravi",
                age=78,
                preferred_language="en",
                connection_code="YAAD-456",
                connection_token="token-ravi-456"
            ))
            print("[BOOTSTRAP] Seed Patient Ravi provisioned: ravi@mitracare.org")

        await db.flush()

        # 6. Active Caregiver Relationships
        rel_amma = await db.execute(
            select(CaregiverPatientRelationship).where(
                CaregiverPatientRelationship.caregiver_id == cg_user.id,
                CaregiverPatientRelationship.patient_id == amma_user.id
            )
        )
        if not rel_amma.scalars().first():
            db.add(CaregiverPatientRelationship(
                caregiver_id=cg_user.id,
                patient_id=amma_user.id,
                relationship_type="Family Member",
                status=RelationshipStatus.ACTIVE
            ))

        rel_ravi = await db.execute(
            select(CaregiverPatientRelationship).where(
                CaregiverPatientRelationship.caregiver_id == cg_user.id,
                CaregiverPatientRelationship.patient_id == ravi_user.id
            )
        )
        if not rel_ravi.scalars().first():
            db.add(CaregiverPatientRelationship(
                caregiver_id=cg_user.id,
                patient_id=ravi_user.id,
                relationship_type="Family Member",
                status=RelationshipStatus.ACTIVE
            ))

        # 7. Seed Game Results for Amma (Last 7 Days)
        game_check = await db.execute(
            select(GameResultRecord).where(GameResultRecord.patient_id == amma_user.id)
        )
        if not game_check.scalars().first():
            now = utc_now()
            scores_accuracies = [
                (600, 70.0, 45), (650, 75.0, 42), (700, 80.0, 38),
                (720, 80.0, 36), (800, 85.0, 32), (850, 90.0, 30), (900, 95.0, 28)
            ]
            for i, (sc, acc, dur) in enumerate(scores_accuracies):
                session_time = now - timedelta(days=6-i)
                db.add(GameResultRecord(
                    session_id=f"seed-amma-session-{i+1}",
                    patient_id=amma_user.id,
                    game_id="PAIR",
                    difficulty="EASY",
                    score=sc,
                    accuracy=acc,
                    duration_seconds=dur,
                    attempts=5,
                    mistakes=1 if acc < 90 else 0,
                    hints_used=0,
                    started_at=session_time - timedelta(seconds=dur),
                    completed_at=session_time,
                    status="COMPLETED"
                ))

        # 8. Seed Reminders for Amma & Ravi
        rem_check = await db.execute(
            select(ReminderRecord).where(ReminderRecord.patient_id == amma_user.id)
        )
        if not rem_check.scalars().first():
            db.add(ReminderRecord(
                patient_id=amma_user.id,
                created_by=cg_user.id,
                title="Morning Medicine",
                description="Blood pressure & vitamins",
                category="MEDICINE",
                scheduled_time="9:00 AM",
                repeat_rule="DAILY",
                status="COMPLETED",
                completed_at=utc_now() - timedelta(hours=2)
            ))
            db.add(ReminderRecord(
                patient_id=amma_user.id,
                created_by=cg_user.id,
                title="Drink Water",
                description="Hydration check (1 glass)",
                category="HYDRATION",
                scheduled_time="11:00 AM",
                repeat_rule="DAILY",
                status="UPCOMING"
            ))
            db.add(ReminderRecord(
                patient_id=amma_user.id,
                created_by=cg_user.id,
                title="Memory Game",
                description="Daily cognitive activity",
                category="ACTIVITY",
                scheduled_time="4:00 PM",
                repeat_rule="DAILY",
                status="UPCOMING"
            ))

        # 9. Seed Alerts for Ravi
        alert_check = await db.execute(
            select(AlertRecord).where(AlertRecord.patient_id == ravi_user.id)
        )
        if not alert_check.scalars().first():
            db.add(AlertRecord(
                patient_id=ravi_user.id,
                caregiver_id=cg_user.id,
                alert_type="MISSED_REMINDER",
                severity="WARNING",
                title="Morning medicine overdue",
                message="Ravi has not confirmed morning medicine scheduled for 9:00 AM.",
                why_it_matters="Timely medication adherence is crucial for daily routine.",
                suggested_action="Call or check in with Ravi to ensure medicine was taken.",
                occurrence_count=1,
                is_resolved=False
            ))

        await db.commit()
        print("[BOOTSTRAP] Seed complete: Admin, Doctor, Caregiver Priya, Patients Amma & Ravi with authentic PostgreSQL records.")

if __name__ == "__main__":
    asyncio.run(init_admin_bootstrap())
