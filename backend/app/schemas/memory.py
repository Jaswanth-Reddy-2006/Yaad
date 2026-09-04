from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class PersonalMemoryCreate(BaseModel):
    title: str
    category: str = "FAMILY" # 'FAMILY' | 'PERSON' | 'PLACE' | 'OBJECT' | 'EVENT'
    asset_url: Optional[str] = None
    caption: Optional[str] = None
    relation_note: Optional[str] = None
    importance_level: Optional[str] = "NORMAL"

class PersonalMemoryRead(BaseModel):
    id: str
    patient_id: str
    title: str
    category: str
    asset_url: Optional[str] = None
    caption: Optional[str] = None
    relation_note: Optional[str] = None
    importance_level: str
    created_at: str

    class Config:
        from_attributes = True

class RoutineFactCreate(BaseModel):
    fact_key: str
    fact_value: str
    category: Optional[str] = "PREFERENCE"

class RoutineFactRead(BaseModel):
    id: str
    patient_id: str
    fact_key: str
    fact_value: str
    category: str
    created_at: str

    class Config:
        from_attributes = True
