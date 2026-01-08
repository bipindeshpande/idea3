"""Run history API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, Dict, Any
import json
import re
from app.core.database import get_db
from app.core.dependencies import get_current_user_or_none
from app.models.user import User
from app.models.run import Run
from app.models.validation import Validation
from app.services.run_history_service import RunHistoryService

router = APIRouter()


@router.get("", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_runs(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page"),
    status_filter: Optional[str] = Query(None, description="Filter by status (pending, processing, completed, failed)"),
    sort_by: str = Query("created_at", description="Field to sort by (created_at, completed_at, status)"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order (asc, desc)"),
    include_all: bool = Query(False, description="Include all runs regardless of user (for debugging)"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Get paginated list of runs
    
    Query Parameters:
    - page: Page number (default: 1)
    - page_size: Items per page (default: 20, max: 100)
    - status: Filter by status (optional)
    - sort_by: Field to sort by (default: created_at)
    - sort_order: Sort order - asc or desc (default: desc)
    - include_all: If true, show all runs regardless of user_id (for debugging)
    
    Returns:
    - runs: List of run objects
    - pagination: Pagination metadata
    """
    try:
        # For debugging: if include_all=True, don't filter by user_id
        user_id = None if include_all else (current_user.user_id if current_user else None)
        
        run_history_service = RunHistoryService(db)
        result = run_history_service.get_runs(
            page=page,
            page_size=page_size,
            status_filter=status_filter,
            sort_by=sort_by,
            sort_order=sort_order,
            user_id=user_id
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch runs: {str(e)}"
        )


@router.get("/stats", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_runs_stats(
    include_all: bool = Query(False, description="Include all runs regardless of user (for debugging)"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Get statistics about runs (discoveries vs validations) and insights
    
    Query Parameters:
    - include_all: If true, show stats for all runs regardless of user_id (for debugging)
    
    Returns:
        - success: Boolean
        - discoveries: Count of discovery runs
        - validations: Count of validation runs
        - other: Count of other runs
        - match_percent: Average match percentage from validations (0-100)
        - risk_alerts: Count of HIGH severity risks across all runs
    """
    try:
        # For debugging: if include_all=True, don't filter by user_id
        user_id = None if include_all else (current_user.user_id if current_user else None)
        
        run_history_service = RunHistoryService(db)
        
        # Get all runs for the user using the service (normalized format)
        all_runs_result = run_history_service.get_runs(
            page=1,
            page_size=1000,  # Get a large number to count all
            user_id=user_id
        )
        
        runs = all_runs_result.get("runs", [])
        
        # Count by run_type (from normalized runs)
        discoveries = sum(1 for run in runs if run.get("run_type") == "discovery")
        validations = sum(1 for run in runs if run.get("run_type") == "validation")
        other = len(runs) - discoveries - validations
        
        # Calculate match_percent from validation overall_scores
        match_percent = 0.0
        if user_id:
            try:
                completed_validations = db.query(Validation).filter(
                    and_(
                        Validation.user_id == user_id,
                        Validation.deleted_at.is_(None),
                        Validation.status == "completed"
                    )
                ).all()
                
                scores = []
                for validation in completed_validations:
                    try:
                        validation_result = validation.validation_result
                        # Handle both dict and JSON string formats
                        if isinstance(validation_result, str):
                            validation_result = json.loads(validation_result)
                        
                        overall_score = validation_result.get("overall_score")
                        if overall_score is not None:
                            try:
                                score = float(overall_score)
                                if score > 0:  # Only include valid scores
                                    scores.append(score)
                            except (ValueError, TypeError):
                                continue
                    except (json.JSONDecodeError, KeyError, AttributeError):
                        # Skip invalid validation records
                        continue
                
                # Calculate average and convert to percentage (0-10 scale -> 0-100%)
                if scores:
                    average_score = sum(scores) / len(scores)
                    match_percent = round((average_score / 10.0) * 100, 1)
            except Exception as e:
                # If calculation fails, default to 0
                match_percent = 0.0
        
        # Calculate risk_alerts by counting HIGH severity risks from runs
        risk_alerts = 0
        if user_id:
            try:
                completed_runs = db.query(Run).filter(
                    and_(
                        Run.user_id == user_id,
                        Run.deleted_at.is_(None),
                        Run.status == "completed"
                    )
                ).all()
                
                for run in completed_runs:
                    try:
                        key_risks_text = ""
                        
                        # First, try to get key_risks from reports JSONB
                        reports = run.reports
                        if reports and isinstance(reports, dict):
                            # Check top-level key_risks
                            if "key_risks" in reports:
                                key_risks_text = reports.get("key_risks", "")
                                if isinstance(key_risks_text, dict):
                                    key_risks_text = str(key_risks_text)
                            
                            # Also check if reports has idea sections with key_risks
                            if not key_risks_text:
                                for key, value in reports.items():
                                    if isinstance(value, list):
                                        # Check each idea in the list
                                        for item in value:
                                            if isinstance(item, dict) and "key_risks" in item:
                                                item_risks = item.get("key_risks", "")
                                                if item_risks:
                                                    key_risks_text += "\n" + str(item_risks)
                                    elif isinstance(value, dict) and "key_risks" in value:
                                        item_risks = value.get("key_risks", "")
                                        if item_risks:
                                            key_risks_text += "\n" + str(item_risks)
                        
                        # If not found in reports, try parsing from personalized_recommendations markdown
                        if not key_risks_text and run.personalized_recommendations:
                            recs_text = run.personalized_recommendations
                            # Look for "### key risks" or "### Key Risks & Mitigations" section
                            key_risks_match = re.search(
                                r'###\s+key\s+risks[^\n]*\n(.*?)(?=###|\Z)',
                                recs_text,
                                re.IGNORECASE | re.DOTALL
                            )
                            if key_risks_match:
                                key_risks_text = key_risks_match.group(1).strip()
                        
                        if not key_risks_text:
                            continue
                        
                        # Parse risks and count HIGH severity ones
                        # Similar logic to frontend parseRiskRows
                        risk_text = str(key_risks_text).lower()
                        
                        # Check for markdown table format
                        table_rows = re.findall(r'\|.*?\|', key_risks_text)
                        if table_rows and len(table_rows) >= 2:
                            # Skip header and separator rows
                            data_rows = table_rows[2:]
                            for row in data_rows:
                                cells = [cell.strip() for cell in row.split("|") if cell.strip()]
                                if len(cells) >= 2:
                                    # Check for HIGH severity keywords in the risk text
                                    # Combine first two cells (risk category and description)
                                    risk_cell_text = " ".join(cells[:2]).lower()
                                    # Check if this risk has HIGH severity
                                    if re.search(r'\b(severe|critical|extreme|high)\b', risk_cell_text):
                                        # Make sure it's not part of "medium" or "low"
                                        if not re.search(r'\b(medium|moderate|low|minor)\b', risk_cell_text):
                                            risk_alerts += 1
                        else:
                            # Check for list format or plain text with severity indicators
                            # Split by lines and check each risk item
                            lines = key_risks_text.split('\n')
                            for line in lines:
                                line_lower = line.lower().strip()
                                if not line_lower or line_lower.startswith('#'):
                                    continue
                                
                                # Check for HIGH severity keywords
                                if re.search(r'\b(severe|critical|extreme|high)\b', line_lower):
                                    # Make sure it's not part of "medium" or "low"
                                    if not re.search(r'\b(medium|moderate|low|minor)\b', line_lower):
                                        risk_alerts += 1
                            
                    except Exception as e:
                        # Skip runs with invalid/malformed data
                        continue
            except Exception as e:
                # If calculation fails, default to 0
                risk_alerts = 0
        
        return {
            "success": True,
            "discoveries": discoveries,
            "validations": validations,
            "other": other,
            "total": len(runs),
            "match_percent": match_percent,
            "risk_alerts": risk_alerts
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch run statistics: {str(e)}"
        )


@router.get("/{run_id}", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_run(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Get full details for a specific run
    
    Path Parameters:
    - run_id: UUID of the run
    
    Returns:
    - Full run details including inputs, reports, and metadata
    """
    try:
        user_id = current_user.user_id if current_user else None
        run_history_service = RunHistoryService(db)
        result = run_history_service.get_run_by_id(run_id=run_id, user_id=user_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch run: {str(e)}"
        )


@router.post("/assign-null-runs", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def assign_null_runs_to_user(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Assign all runs with user_id = NULL to the current authenticated user
    
    This is useful for migrating old runs that were created before authentication
    was required.
    
    Returns:
        - success: Boolean
        - assigned_count: Number of runs assigned
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        from app.models.run import Run
        
        # Count runs with NULL user_id
        null_runs_count = db.query(Run).filter(
            Run.user_id.is_(None),
            Run.deleted_at.is_(None)
        ).count()
        
        # Update runs with NULL user_id to current user
        updated = db.query(Run).filter(
            Run.user_id.is_(None),
            Run.deleted_at.is_(None)
        ).update(
            {Run.user_id: current_user.user_id},
            synchronize_session=False
        )
        
        db.commit()
        
        return {
            "success": True,
            "assigned_count": updated,
            "message": f"Assigned {updated} runs to user {current_user.user_id}"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign runs: {str(e)}"
        )


@router.delete("/{run_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_run(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """
    Soft delete a run by setting deleted_at timestamp
    
    Path Parameters:
    - run_id: UUID of the run to delete
    
    Returns:
    - 204 No Content on success
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        user_id = current_user.user_id if current_user else None
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to delete runs"
            )
        
        logger.info(f"[API] delete_run called: run_id={run_id}, user_id={user_id}")
        
        run_history_service = RunHistoryService(db)
        run_history_service.soft_delete_run(run_id=run_id, user_id=user_id)
        
        logger.info(f"[API] Successfully deleted run: run_id={run_id}")
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[API] Error deleting run {run_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete run: {str(e)}"
        )
