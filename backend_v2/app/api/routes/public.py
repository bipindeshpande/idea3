"""Public API routes (no authentication required)"""
from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()


@router.get("/usage-stats", status_code=200)
async def get_usage_stats() -> Dict[str, Any]:
    """
    Get public usage statistics
    
    Returns mock statistics for the landing page.
    In production, this would query the database for real stats.
    """
    return {
        "success": True,
        "stats": {
            "total_users": 0,
            "validations_this_month": 0,
            "total_validations": 0,
            "average_score": 0,
        }
    }

