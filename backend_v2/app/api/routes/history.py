"""History API routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.services.history_service import HistoryService

router = APIRouter()


@router.get("", response_model=List[Dict[str, Any]], status_code=status.HTTP_200_OK)
async def get_history(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get the latest discovery runs
    
    Returns a list of the most recent discovery runs with summary information:
    - run_id
    - status
    - created_at
    - input_summary (interest_area + goal_type)
    """
    history_service = HistoryService(db)
    
    try:
        results = history_service.get_recent(limit=limit)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch history: {str(e)}"
        )


@router.get("/{run_id}", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_history_by_run_id(
    run_id: str,
    db: Session = Depends(get_db)
):
    """
    Get full details of a discovery run by run_id
    
    Returns complete information:
    - input_payload
    - result
    - status
    - created_at
    """
    history_service = HistoryService(db)
    
    try:
        result = history_service.get_by_run_id(run_id=run_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch discovery result: {str(e)}"
        )

