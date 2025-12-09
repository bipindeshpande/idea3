"""Admin API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from app.models.user import User
from app.services.admin_metrics_service import AdminMetricsService
from app.services.observability_service import ObservabilityService

router = APIRouter()


@router.get("/metrics", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get admin metrics
    
    Returns comprehensive system metrics including:
    - Total, completed, and failed runs
    - Average runtime
    - Cache hit ratio
    - Runs in last 24h and 7d
    - Runs grouped by interest area
    - Estimated LLM costs
    
    Requires admin role.
    """
    try:
        admin_metrics_service = AdminMetricsService(db)
        metrics = admin_metrics_service.get_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch metrics: {str(e)}"
        )


@router.get("/observability", response_class=HTMLResponse, status_code=status.HTTP_200_OK)
async def observability_dashboard(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    view: str = "html"
):
    """
    Lightweight observability dashboard.
    Use ?view=json to get raw metrics.
    """
    try:
        service = ObservabilityService(db)
        metrics = service.get_metrics()
        if view == "json":
            return metrics
        html = service.render_html(metrics)
        return HTMLResponse(content=html, status_code=200)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch observability metrics: {str(e)}"
        )

