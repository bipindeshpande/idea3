"""Framework API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Body, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user_or_none
from app.models.user import User
from app.services.framework_service import FrameworkService

router = APIRouter()


class CreateFrameworkRequest(BaseModel):
    """Request model for creating a framework"""
    framework_template_id: int
    title: str
    customized_content: str
    linked_idea_id: Optional[str] = None
    linked_validation_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class UpdateFrameworkRequest(BaseModel):
    """Request model for updating a framework"""
    title: Optional[str] = None
    customized_content: Optional[str] = None
    status: Optional[str] = None
    linked_idea_id: Optional[str] = None
    linked_validation_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class PopulateTemplateRequest(BaseModel):
    """Request model for populating template variables"""
    template_content: str
    validation_id: Optional[str] = None
    idea_id: Optional[str] = None


@router.post("/frameworks", status_code=status.HTTP_201_CREATED)
async def create_framework(
    request: CreateFrameworkRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """Create a new framework instance"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        framework_service = FrameworkService(db)
        
        framework = framework_service.create_framework(
            user_id=current_user.user_id,
            framework_template_id=request.framework_template_id,
            title=request.title,
            customized_content=request.customized_content,
            linked_idea_id=request.linked_idea_id,
            linked_validation_id=request.linked_validation_id,
            metadata=request.metadata
        )
        
        return {
            "success": True,
            "framework": framework.to_dict()
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create framework: {str(e)}"
        )


@router.get("/frameworks", status_code=status.HTTP_200_OK)
async def list_frameworks(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none),
    status: Optional[str] = Query(None, description="Filter by status: draft, in_progress, completed"),
    framework_template_id: Optional[int] = Query(None, description="Filter by template ID"),
    linked_idea_id: Optional[str] = Query(None, description="Filter by linked idea ID"),
    linked_validation_id: Optional[str] = Query(None, description="Filter by linked validation ID")
):
    """List frameworks for the current user"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        framework_service = FrameworkService(db)
        
        frameworks = framework_service.list_frameworks(
            user_id=current_user.user_id,
            status=status,
            framework_template_id=framework_template_id,
            linked_idea_id=linked_idea_id,
            linked_validation_id=linked_validation_id
        )
        
        return {
            "success": True,
            "frameworks": [f.to_dict() for f in frameworks]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list frameworks: {str(e)}"
        )


@router.get("/frameworks/{framework_id}", status_code=status.HTTP_200_OK)
async def get_framework(
    framework_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """Get a framework by ID"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        framework_service = FrameworkService(db)
        framework = framework_service.get_framework(framework_id, current_user.user_id)
        
        if not framework:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Framework not found"
            )
        
        return {
            "success": True,
            "framework": framework.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get framework: {str(e)}"
        )


@router.put("/frameworks/{framework_id}", status_code=status.HTTP_200_OK)
async def update_framework(
    framework_id: str,
    request: UpdateFrameworkRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """Update a framework"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        framework_service = FrameworkService(db)
        
        framework = framework_service.update_framework(
            framework_id=framework_id,
            user_id=current_user.user_id,
            title=request.title,
            customized_content=request.customized_content,
            status=request.status,
            linked_idea_id=request.linked_idea_id,
            linked_validation_id=request.linked_validation_id,
            metadata=request.metadata
        )
        
        if not framework:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Framework not found"
            )
        
        return {
            "success": True,
            "framework": framework.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update framework: {str(e)}"
        )


@router.delete("/frameworks/{framework_id}", status_code=status.HTTP_200_OK)
async def delete_framework(
    framework_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """Delete a framework (soft delete)"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        framework_service = FrameworkService(db)
        success = framework_service.delete_framework(framework_id, current_user.user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Framework not found"
            )
        
        return {
            "success": True,
            "message": "Framework deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete framework: {str(e)}"
        )


@router.post("/frameworks/{framework_id}/export", status_code=status.HTTP_200_OK)
async def export_framework(
    framework_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """Export framework as markdown content"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        framework_service = FrameworkService(db)
        framework = framework_service.get_framework(framework_id, current_user.user_id)
        
        if not framework:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Framework not found"
            )
        
        export_content = framework_service.get_export_content(framework)
        
        return {
            "success": True,
            "content": export_content,
            "filename": f"{framework.title.lower().replace(' ', '-')}.md"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export framework: {str(e)}"
        )


@router.post("/frameworks/populate-template", status_code=status.HTTP_200_OK)
async def populate_template(
    request: PopulateTemplateRequest = Body(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_or_none)
):
    """Populate template variables with user data"""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    try:
        framework_service = FrameworkService(db)
        
        populated_content = framework_service.populate_template_variables(
            template_content=request.template_content,
            user_id=current_user.user_id,
            validation_id=request.validation_id,
            idea_id=request.idea_id
        )
        
        return {
            "success": True,
            "content": populated_content
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to populate template: {str(e)}"
        )

