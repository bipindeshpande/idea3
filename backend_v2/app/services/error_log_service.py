"""Service for logging errors to database"""
import traceback
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.services.base_service import BaseService
from app.models.error_log import ErrorLog
from app.core.logger import request_id_var, run_id_var


class ErrorLogService(BaseService):
    """Service for saving errors to PostgreSQL"""
    
    def log_error(
        self,
        error: Exception,
        error_type: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        endpoint: Optional[str] = None,
        method: Optional[str] = None,
        severity: str = "error",
        user_id: Optional[str] = None,
        run_id: Optional[str] = None
    ) -> ErrorLog:
        """Log an error to the database"""
        
        # Get request_id from context if available
        request_id = request_id_var.get()
        if not run_id:
            run_id = run_id_var.get()
        
        error_type = error_type or type(error).__name__
        error_message = str(error)
        error_traceback = traceback.format_exc()
        
        error_log = ErrorLog(
            request_id=request_id,
            run_id=run_id,
            user_id=user_id,
            error_type=error_type,
            error_message=error_message,
            error_traceback=error_traceback,
            context=context or {},
            endpoint=endpoint,
            method=method,
            severity=severity
        )
        
        self.db.add(error_log)
        self.db.commit()
        self.db.refresh(error_log)
        
        return error_log

