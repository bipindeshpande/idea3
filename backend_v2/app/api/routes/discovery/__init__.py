"""Discovery API routes - Modular structure"""
from fastapi import APIRouter
from .runs import router as runs_router
from .streaming import router as streaming_router
from .enrichment import router as enrichment_router
from .enhancement import router as enhancement_router

# Create main router with prefix
router = APIRouter(prefix="/api", tags=["discovery"])

# Include all sub-routers
router.include_router(runs_router)
router.include_router(streaming_router)
router.include_router(enrichment_router)
router.include_router(enhancement_router)

__all__ = ["router"]

