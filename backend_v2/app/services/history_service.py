"""History Service for fetching discovery results"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.services.base_service import BaseService
from app.models.discovery_result import DiscoveryResult
from fastapi import HTTPException, status


class HistoryService(BaseService):
    """Service for retrieving discovery history"""
    
    def get_recent(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get recent discovery results ordered by created_at DESC
        
        Args:
            limit: Maximum number of results to return (default: 50)
        
        Returns:
            List of discovery results with summary information
        """
        results = (
            self.db.query(DiscoveryResult)
            .order_by(desc(DiscoveryResult.created_at))
            .limit(limit)
            .all()
        )
        
        return [
            {
                "run_id": result.run_id,
                "status": result.status,
                "created_at": result.created_at.isoformat() if result.created_at else None,
                "input_summary": {
                    "interest_area": result.input_payload.get("interest_area") if result.input_payload else None,
                    "goal_type": result.input_payload.get("goal_type") if result.input_payload else None,
                }
            }
            for result in results
        ]
    
    def get_by_run_id(self, run_id: str) -> Dict[str, Any]:
        """
        Get a single discovery result by run_id
        
        Args:
            run_id: UUID string of the run
        
        Returns:
            Full discovery result details with status-specific fields
        
        Raises:
            HTTPException: 404 if result not found
        """
        result = (
            self.db.query(DiscoveryResult)
            .filter(DiscoveryResult.run_id == run_id)
            .first()
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Discovery result for run_id {run_id} not found"
            )
        
        # Build response based on status
        response = {
            "run_id": result.run_id,
            "status": result.status,
            "created_at": result.created_at.isoformat() if result.created_at else None,
        }
        
        if result.status == "pending" or result.status == "processing":
            # Return minimal info for pending/processing jobs
            return response
        
        elif result.status == "completed":
            # Return full result for completed jobs
            response["input_payload"] = result.input_payload
            response["result"] = result.result
            return response
        
        elif result.status == "failed":
            # Return error message for failed jobs
            response["input_payload"] = result.input_payload
            response["error"] = result.error_message
            return response
        
        # Fallback (shouldn't happen)
        return response

