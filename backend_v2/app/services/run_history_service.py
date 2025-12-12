"""Service for managing run history"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from datetime import datetime, timezone
from app.services.base_service import BaseService
from app.models.run import Run
from fastapi import HTTPException, status


class RunHistoryService(BaseService):
    """Service for retrieving and managing run history"""
    
    def get_runs(
        self,
        page: int = 1,
        page_size: int = 20,
        status_filter: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get paginated list of runs
        
        Args:
            page: Page number (1-indexed)
            page_size: Number of items per page
            status_filter: Filter by status (pending, processing, completed, failed)
            sort_by: Field to sort by (created_at, completed_at, status)
            sort_order: Sort order (asc, desc)
            user_id: Optional user ID to filter by
        
        Returns:
            Dictionary with runs list and pagination metadata
        """
        # Validate page and page_size
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 20
        
        # Build query - exclude soft-deleted runs
        query = self.db.query(Run).filter(Run.deleted_at.is_(None))
        
        # Filter by user_id if provided
        if user_id:
            query = query.filter(Run.user_id == user_id)
        
        # Filter by status if provided
        if status_filter:
            query = query.filter(Run.status == status_filter)
        
        # Get total count before pagination
        total_count = query.count()
        
        # Apply sorting
        sort_column = getattr(Run, sort_by, Run.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
        
        # Apply pagination
        offset = (page - 1) * page_size
        runs = query.offset(offset).limit(page_size).all()
        
        # Convert to dictionaries and normalize inputs for backward compatibility
        runs_list = []
        for run in runs:
            run_dict = run.to_dict()
            # Ensure startup_category exists for backward compatibility with old runs
            if run_dict.get("inputs") and isinstance(run_dict["inputs"], dict):
                if "startup_category" not in run_dict["inputs"] or not run_dict["inputs"].get("startup_category"):
                    run_dict["inputs"]["startup_category"] = "both"
            runs_list.append(run_dict)
        
        # Calculate pagination metadata
        total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 0
        
        return {
            "runs": runs_list,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_previous": page > 1
            }
        }
    
    def get_run_by_id(self, run_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Get full details for a single run
        
        Args:
            run_id: UUID string of the run
            user_id: Optional user ID to verify ownership
        
        Returns:
            Full run details as dictionary
        
        Raises:
            HTTPException: 404 if run not found or deleted
        """
        query = self.db.query(Run).filter(
            and_(
                Run.run_id == run_id,
                Run.deleted_at.is_(None)  # Exclude soft-deleted runs
            )
        )
        
        # If user_id provided, verify ownership
        if user_id:
            query = query.filter(Run.user_id == user_id)
        
        run = query.first()
        
        if not run:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Run {run_id} not found"
            )
        
        # Normalize inputs to ensure backward compatibility with old runs
        run_dict = run.to_dict()
        if run_dict.get("inputs"):
            # Ensure startup_category exists for backward compatibility
            inputs = run_dict["inputs"]
            if not isinstance(inputs, dict):
                inputs = {}
            if "startup_category" not in inputs or not inputs.get("startup_category"):
                inputs["startup_category"] = "both"
            run_dict["inputs"] = inputs
        
        return run_dict
    
    def soft_delete_run(self, run_id: str, user_id: Optional[str] = None) -> bool:
        """
        Soft delete a run by setting deleted_at timestamp
        
        Args:
            run_id: UUID string of the run
            user_id: Optional user ID to verify ownership
        
        Returns:
            True if successful
        
        Raises:
            HTTPException: 404 if run not found
        """
        query = self.db.query(Run).filter(
            and_(
                Run.run_id == run_id,
                Run.deleted_at.is_(None)  # Can't delete already deleted runs
            )
        )
        
        # If user_id provided, verify ownership
        if user_id:
            query = query.filter(Run.user_id == user_id)
        
        run = query.first()
        
        if not run:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Run {run_id} not found"
            )
        
        # Soft delete: set deleted_at timestamp and update status
        run.deleted_at = datetime.now(timezone.utc)
        run.status = "deleted"
        
        self.db.commit()
        
        return True

