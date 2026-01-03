"""Standardized API response models"""
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from datetime import datetime


class StandardResponse(BaseModel):
    """Base response model for all API endpoints"""
    success: bool
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None


class ValidationResponse(BaseModel):
    """Standardized validation response"""
    success: bool
    validation_id: str
    validation: Dict[str, Any]  # Always use 'validation' key
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class DiscoveryResponse(BaseModel):
    """Standardized discovery response"""
    success: bool
    run_id: str
    status: str
    cached: bool = False
    outputs: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Standardized error response"""
    success: bool = False
    error: Dict[str, Any]
    message: str


def create_success_response(
    data: Optional[Dict[str, Any]] = None,
    message: Optional[str] = None
) -> Dict[str, Any]:
    """Create a standardized success response"""
    response = {"success": True}
    if message:
        response["message"] = message
    if data:
        response.update(data)
    return response


def create_error_response(
    error_type: str,
    message: str,
    details: Optional[Dict[str, Any]] = None,
    status_code: int = 500
) -> Dict[str, Any]:
    """Create a standardized error response"""
    error = {
        "type": error_type,
        "message": message
    }
    if details:
        error["details"] = details
    
    return {
        "success": False,
        "error": error,
        "message": message
    }

