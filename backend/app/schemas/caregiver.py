from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class CaregiverConnectRequest(BaseModel):
    connection_code_or_token: str = Field(..., description="6-character code or cryptographic QR payload token")
    patient_name: Optional[str] = Field(None, description="Optional custom label for patient")
    relationship_type: str = Field("Family Member", description="Family Member, Nurse, Primary Caregiver")
    notes: Optional[str] = None

class CaregiverConnectResponse(BaseModel):
    relationship_id: str
    patient_id: str
    patient_name: str
    status: str

class CaregiverPatientItem(BaseModel):
    patient_id: str
    name: str
    activity_status: str
    status: str
    activities_done: str
    mood: str
    last_active: str
    avatar_bg: str = "#FEF3C7"

class AttentionItem(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    severity: str # INFO | WARNING | CRITICAL
    title: str
    message: str
    why_it_matters: Optional[str] = None
    suggested_action: Optional[str] = None
    timestamp: str

class HighlightItem(BaseModel):
    id: str
    title: str
    patient_name: str
    timestamp: str
    type: str # COMPLETED | ALERT | INFO

class CaregiverDashboardResponse(BaseModel):
    caregiver_name: str
    today_overview: Dict[str, Any]
    attention_required: List[AttentionItem]
    highlights: List[HighlightItem]

class ReminderCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "MEDICINE" # MEDICINE | HYDRATION | ACTIVITY | APPOINTMENT | ROUTINE
    scheduled_time: str # e.g. "9:00 AM" or ISO string
    repeat: Optional[str] = "DAILY" # ONCE | DAILY | WEEKLY | CUSTOM
    priority: Optional[str] = "NORMAL"

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    scheduled_time: Optional[str] = None
    status: Optional[str] = None # UPCOMING | DUE | COMPLETED | MISSED | SKIPPED

class ReminderRead(BaseModel):
    id: str
    patient_id: str
    title: str
    description: Optional[str] = None
    category: str
    scheduled_time: str
    status: str
    created_at: str

    class Config:
        from_attributes = True

class AlertRead(BaseModel):
    id: str
    patient_id: str
    alert_type: str
    severity: str
    title: str
    message: str
    why_it_matters: Optional[str] = None
    suggested_action: Optional[str] = None
    occurrence_count: int
    is_resolved: bool
    created_at: str

    class Config:
        from_attributes = True

class PatientOverviewResponse(BaseModel):
    patient_id: str
    display_name: str
    age: Optional[int] = None
    connection_status: str
    today_status: Dict[str, Any]
    performance_trend: List[Dict[str, Any]]
    recent_activity: List[Dict[str, Any]]
