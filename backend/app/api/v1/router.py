from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.patients import router as patients_router
from app.api.v1.sync import router as sync_router
from app.api.v1.caregiver import router as caregiver_router
from app.api.v1.doctor import router as doctor_router
from app.api.v1.admin import router as admin_router
from app.api.v1.memory import router as memory_router
from app.api.v1.translate import router as translate_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(patients_router)
api_v1_router.include_router(sync_router)
api_v1_router.include_router(caregiver_router)
api_v1_router.include_router(doctor_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(memory_router)
api_v1_router.include_router(translate_router)
