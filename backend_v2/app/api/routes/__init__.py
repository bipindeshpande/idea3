"""API route handlers"""
from fastapi import APIRouter
from .history import router as history_router
from .runs import router as runs_router
from .auth import router as auth_router
from .admin import router as admin_router
from .user import router as user_router
from .subscription import router as subscription_router
from .public import router as public_router
from .founder import router as founder_router

router = APIRouter()

# Include all route modules
router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(history_router, prefix="/history", tags=["history"])
router.include_router(runs_router, prefix="/runs", tags=["runs"])
router.include_router(admin_router, prefix="/admin", tags=["admin"])
router.include_router(user_router, prefix="/user", tags=["user"])
router.include_router(subscription_router, prefix="/subscription", tags=["subscription"])
router.include_router(public_router, prefix="/public", tags=["public"])
router.include_router(founder_router, prefix="/founder", tags=["founder"])

