from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class AuthorizedPatientItem(BaseModel):
    patient_id: str
    name: str
    age: Optional[int] = None
    activity_status: str
    activities_completed_count: int
    average_accuracy: float
    last_active: str

class DoctorDashboardResponse(BaseModel):
    doctor_name: str
    authorized_patients_count: int
    total_activities_this_month: int
    average_patient_accuracy: float
    attention_indicators_count: int
    recent_patient_activities: List[Dict[str, Any]]

class DoctorPatientAnalysisResponse(BaseModel):
    patient_id: str
    display_name: str
    age: Optional[int] = None
    activity_summary: Dict[str, Any]
    accuracy_trend: List[Dict[str, Any]]
    domain_breakdown: List[Dict[str, Any]]
    reminder_adherence: Dict[str, Any]

class DoctorReportRead(BaseModel):
    report_id: str
    patient_id: str
    patient_name: str
    generated_at: str
    period: str
    activities_completed: int
    average_accuracy: float
    reminder_adherence_rate: float
    summary_observations: str
