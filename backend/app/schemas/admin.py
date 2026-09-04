from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class AdminDashboardResponse(BaseModel):
    total_patients: int
    total_caregivers: int
    total_doctors: int
    active_connections: int
    total_game_sessions: int
    average_reminder_completion_rate: float
    unread_alerts_count: int
    recent_user_growth: List[Dict[str, Any]]
    activity_usage_trends: List[Dict[str, Any]]

class AdminUserItem(BaseModel):
    user_id: str
    public_id: str
    role: str
    email: Optional[str] = None
    phone: Optional[str] = None
    display_name: str
    is_active: bool
    created_at: str
    last_login_at: Optional[str] = None

class AdminConnectionAuditItem(BaseModel):
    relationship_id: str
    caregiver_name: str
    patient_name: str
    status: str
    created_at: str

class AdminAuditLogItem(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    resource: Optional[str] = None
    details: Optional[str] = None
    timestamp: str

class SystemHealthResponse(BaseModel):
    api_status: str
    database_status: str
    active_sessions_count: int
    uptime_seconds: int

class AdminCreateUserRequest(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role: str # ADMIN | DOCTOR | HEALTHCARE_WORKER | CAREGIVER
    password: str
    organization: Optional[str] = None

class AdminCreateUserResponse(BaseModel):
    user_id: str
    public_id: str
    email: Optional[str] = None
    role: str
    full_name: str
    status: str
