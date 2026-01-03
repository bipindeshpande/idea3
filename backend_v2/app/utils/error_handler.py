"""Centralized error handling utilities"""
import logging
import traceback
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from app.core.logger import request_id_var

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base application error with structured error info"""
    def __init__(
        self,
        message: str,
        error_type: str = "APPLICATION_ERROR",
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_type = error_type
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(AppError):
    """Validation-specific error"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_type="VALIDATION_ERROR",
            status_code=status.HTTP_400_BAD_REQUEST,
            details=details
        )


class NotFoundError(AppError):
    """Resource not found error"""
    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            message=f"{resource_type} not found: {resource_id}",
            error_type="NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource_type": resource_type, "resource_id": resource_id}
        )


class AuthorizationError(AppError):
    """Authorization error"""
    def __init__(self, message: str = "Unauthorized access"):
        super().__init__(
            message=message,
            error_type="AUTHORIZATION_ERROR",
            status_code=status.HTTP_403_FORBIDDEN
        )


def handle_exception(
    error: Exception,
    context: Optional[Dict[str, Any]] = None,
    log_error: bool = True
) -> HTTPException:
    """
    Convert application errors to HTTP exceptions with proper logging
    
    Args:
        error: Exception to handle
        context: Additional context for logging
        log_error: Whether to log the error
        
    Returns:
        HTTPException with appropriate status and detail
    """
    request_id = request_id_var.get()
    context = context or {}
    
    # Handle our custom AppError
    if isinstance(error, AppError):
        if log_error:
            logger.error(
                f"[{error.error_type}] {error.message}",
                extra={
                    "error_type": error.error_type,
                    "status_code": error.status_code,
                    "details": error.details,
                    "request_id": request_id,
                    **context
                }
            )
        
        return HTTPException(
            status_code=error.status_code,
            detail={
                "error": {
                    "type": error.error_type,
                    "message": error.message,
                    "details": error.details
                },
                "request_id": request_id
            }
        )
    
    # Handle HTTPException (re-raise as-is)
    if isinstance(error, HTTPException):
        if log_error:
            logger.warning(
                f"HTTPException: {error.detail}",
                extra={
                    "status_code": error.status_code,
                    "request_id": request_id,
                    **context
                }
            )
        return error
    
    # Handle unexpected errors
    error_traceback = traceback.format_exc()
    if log_error:
        logger.error(
            f"Unexpected error: {str(error)}",
            extra={
                "error_type": type(error).__name__,
                "traceback": error_traceback,
                "request_id": request_id,
                **context
            },
            exc_info=True
        )
    
    # Don't expose internal error details in production
    error_message = str(error)
    if len(error_traceback) > 0:
        # In development, include more details
        from app.core.config import settings
        if settings.DEBUG:
            error_message = f"{error_message}\n\n{error_traceback}"
    
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail={
            "error": {
                "type": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
                "details": {"original_error": error_message} if log_error else {}
            },
            "request_id": request_id
        }
    )


def safe_execute(
    func,
    error_message: str = "Operation failed",
    context: Optional[Dict[str, Any]] = None,
    default_return: Any = None
):
    """
    Safely execute a function with error handling
    
    Args:
        func: Function to execute
        error_message: Error message if execution fails
        context: Additional context for logging
        default_return: Value to return on error (if None, raises exception)
        
    Returns:
        Function result or default_return
        
    Raises:
        AppError: If execution fails and default_return is None
    """
    try:
        return func()
    except AppError:
        raise
    except Exception as e:
        if default_return is not None:
            logger.warning(
                f"{error_message}: {str(e)}",
                extra=context or {}
            )
            return default_return
        raise AppError(
            message=error_message,
            details={"original_error": str(e)}
        )

