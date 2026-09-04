from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.memory import PersonalMemory, RoutineFact
from app.schemas.memory import (
    PersonalMemoryCreate,
    PersonalMemoryRead,
    RoutineFactCreate,
    RoutineFactRead,
)

router = APIRouter(prefix="/memories", tags=["Personal Companion Memory"])

@router.get("", response_model=List[PersonalMemoryRead])
async def list_memories(
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    target_id = patient_id if patient_id else str(current_user.id)
    result = await db.execute(
        select(PersonalMemory)
        .where(PersonalMemory.patient_id == uuid.UUID(target_id))
        .order_by(PersonalMemory.created_at.desc())
    )
    memories = result.scalars().all()
    return [
        PersonalMemoryRead(
            id=str(m.id),
            patient_id=str(m.patient_id),
            title=m.title,
            category=m.category,
            asset_url=m.asset_url,
            caption=m.caption,
            relation_note=m.relation_note,
            importance_level=m.importance_level,
            created_at=m.created_at.isoformat() if m.created_at else "",
        )
        for m in memories
    ]

@router.post("", response_model=PersonalMemoryRead, status_code=status.HTTP_201_CREATED)
async def create_memory(
    req: PersonalMemoryCreate,
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    target_id = patient_id if patient_id else str(current_user.id)
    memory = PersonalMemory(
        id=uuid.uuid4(),
        patient_id=uuid.UUID(target_id),
        created_by=current_user.id,
        title=req.title,
        category=req.category,
        asset_url=req.asset_url,
        caption=req.caption,
        relation_note=req.relation_note,
        importance_level=req.importance_level or "NORMAL",
    )
    db.add(memory)
    await db.commit()
    await db.refresh(memory)

    return PersonalMemoryRead(
        id=str(memory.id),
        patient_id=str(memory.patient_id),
        title=memory.title,
        category=memory.category,
        asset_url=memory.asset_url,
        caption=memory.caption,
        relation_note=memory.relation_note,
        importance_level=memory.importance_level,
        created_at=memory.created_at.isoformat() if memory.created_at else "",
    )

@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_memory(
    memory_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PersonalMemory).where(PersonalMemory.id == uuid.UUID(memory_id))
    )
    memory = result.scalars().first()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory asset not found")

    await db.delete(memory)
    await db.commit()

@router.get("/facts", response_model=List[RoutineFactRead])
async def list_routine_facts(
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    target_id = patient_id if patient_id else str(current_user.id)
    result = await db.execute(
        select(RoutineFact)
        .where(RoutineFact.patient_id == uuid.UUID(target_id))
        .order_by(RoutineFact.created_at.desc())
    )
    facts = result.scalars().all()
    return [
        RoutineFactRead(
            id=str(f.id),
            patient_id=str(f.patient_id),
            fact_key=f.fact_key,
            fact_value=f.fact_value,
            category=f.category,
            created_at=f.created_at.isoformat() if f.created_at else "",
        )
        for f in facts
    ]

@router.post("/facts", response_model=RoutineFactRead, status_code=status.HTTP_201_CREATED)
async def create_routine_fact(
    req: RoutineFactCreate,
    patient_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    target_id = patient_id if patient_id else str(current_user.id)
    fact = RoutineFact(
        id=uuid.uuid4(),
        patient_id=uuid.UUID(target_id),
        created_by=current_user.id,
        fact_key=req.fact_key,
        fact_value=req.fact_value,
        category=req.category or "PREFERENCE",
    )
    db.add(fact)
    await db.commit()
    await db.refresh(fact)

    return RoutineFactRead(
        id=str(fact.id),
        patient_id=str(fact.patient_id),
        fact_key=fact.fact_key,
        fact_value=fact.fact_value,
        category=fact.category,
        created_at=fact.created_at.isoformat() if fact.created_at else "",
    )
