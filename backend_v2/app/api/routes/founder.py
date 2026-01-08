"""Founder API routes"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Path, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.founder_psychology import FounderPsychology
from app.services.founder_service import FounderService

router = APIRouter()


class PsychologyData(BaseModel):
    """Founder psychology data model"""
    motivation: Optional[str] = None
    motivation_other: Optional[str] = None
    fear: Optional[str] = None
    fear_other: Optional[str] = None
    decision_style: Optional[str] = None
    energy_pattern: Optional[str] = None
    consistency_pattern: Optional[str] = None
    risk_approach: Optional[str] = None
    success_definition: Optional[str] = None
    success_other: Optional[str] = None
    archetype: Optional[str] = None


class ProfileData(BaseModel):
    """Founder profile data model"""
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    primary_skills: Optional[List[str]] = None
    industries_of_interest: Optional[List[str]] = None
    looking_for: Optional[str] = None
    commitment_level: Optional[str] = None
    experience_summary: Optional[str] = None
    linkedin_url: Optional[str] = None
    website_url: Optional[str] = None
    is_public: Optional[bool] = True


class IdeaListingData(BaseModel):
    """Idea listing data model"""
    title: str
    brief_description: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = "idea"
    skills_needed: Optional[List[str]] = None
    source_type: Optional[str] = None
    source_id: Optional[str] = None
    validation_score: Optional[float] = None
    is_active: Optional[bool] = True


class UpdateListingData(BaseModel):
    """Update listing data model"""
    title: Optional[str] = None
    brief_description: Optional[str] = None
    industry: Optional[str] = None
    stage: Optional[str] = None
    skills_needed: Optional[List[str]] = None
    is_active: Optional[bool] = None


class ConnectRequest(BaseModel):
    """Connection request model"""
    recipient_profile_id: Optional[str] = None
    idea_listing_id: Optional[str] = None


class RespondConnectionRequest(BaseModel):
    """Respond to connection request model"""
    action: str  # "accept" or "reject"


@router.get("/psychology", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_founder_psychology(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get founder psychology data for the current user
    
    Returns psychology data from the database, or empty structure if not found.
    """
    # Try to get existing psychology data
    psychology = db.query(FounderPsychology).filter(
        FounderPsychology.user_id == current_user.user_id
    ).first()
    
    if psychology:
        # Return the saved data
        return {
            "success": True,
            "data": {
                "motivation": psychology.motivation or "",
                "motivation_other": psychology.motivation_other or "",
                "fear": psychology.fear or "",
                "fear_other": psychology.fear_other or "",
                "decision_style": psychology.decision_style or "",
                "energy_pattern": psychology.energy_pattern or "",
                "consistency_pattern": psychology.consistency_pattern or "",
                "risk_approach": psychology.risk_approach or "",
                "success_definition": psychology.success_definition or "",
                "success_other": psychology.success_other or "",
                "archetype": psychology.archetype or ""
            }
        }
    else:
        # Return empty structure if no data exists
        return {
            "success": True,
            "data": {
                "motivation": "",
                "motivation_other": "",
                "fear": "",
                "fear_other": "",
                "decision_style": "",
                "energy_pattern": "",
                "consistency_pattern": "",
                "risk_approach": "",
                "success_definition": "",
                "success_other": "",
                "archetype": ""
            }
        }


@router.post("/psychology", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def save_founder_psychology(
    data: PsychologyData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Save founder psychology data for the current user
    
    Accepts psychology data and saves it to the database.
    """
    try:
        # Check if profile already exists
        existing = db.query(FounderPsychology).filter(
            FounderPsychology.user_id == current_user.user_id
        ).first()
        
        if existing:
            # Update existing profile
            existing.motivation = data.motivation
            existing.motivation_other = data.motivation_other
            existing.fear = data.fear
            existing.fear_other = data.fear_other
            existing.decision_style = data.decision_style
            existing.energy_pattern = data.energy_pattern
            existing.consistency_pattern = data.consistency_pattern
            existing.risk_approach = data.risk_approach
            existing.success_definition = data.success_definition
            existing.success_other = data.success_other
            existing.archetype = data.archetype
            db.commit()
            db.refresh(existing)
        else:
            # Create new profile
            psychology = FounderPsychology(
                user_id=current_user.user_id,
                motivation=data.motivation,
                motivation_other=data.motivation_other,
                fear=data.fear,
                fear_other=data.fear_other,
                decision_style=data.decision_style,
                energy_pattern=data.energy_pattern,
                consistency_pattern=data.consistency_pattern,
                risk_approach=data.risk_approach,
                success_definition=data.success_definition,
                success_other=data.success_other,
                archetype=data.archetype
            )
            db.add(psychology)
            db.commit()
            db.refresh(psychology)
        
        return {
            "success": True,
            "message": "Founder psychology saved successfully",
            "data": data.model_dump(exclude_none=True)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save founder psychology: {str(e)}"
        )


# ==================== Founder Profile Endpoints ====================

@router.get("/profile", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_founder_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get founder profile for the current user"""
    try:
        service = FounderService(db)
        profile = service.get_profile(current_user.user_id, include_private=True)
        
        if not profile:
            return {
                "success": True,
                "profile": None
            }
        
        return {
            "success": True,
            "profile": profile.to_dict(anonymize=False)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile: {str(e)}"
        )


@router.post("/profile", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def save_founder_profile(
    data: ProfileData = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Create or update founder profile"""
    try:
        service = FounderService(db)
        profile = service.update_profile(
            current_user.user_id,
            data.model_dump(exclude_none=True)
        )
        
        return {
            "success": True,
            "message": "Profile saved successfully",
            "profile": profile.to_dict(anonymize=False)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save profile: {str(e)}"
        )


# ==================== Idea Listings Endpoints ====================

@router.get("/ideas", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_user_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get all idea listings for the current user"""
    try:
        service = FounderService(db)
        listings = service.get_user_listings(current_user.user_id)
        
        return {
            "success": True,
            "listings": [listing.to_dict() for listing in listings]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get listings: {str(e)}"
        )


@router.post("/ideas", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_listing(
    data: IdeaListingData = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Create a new idea listing"""
    try:
        service = FounderService(db)
        listing = service.create_listing(
            current_user.user_id,
            data.model_dump(exclude_none=True)
        )
        
        return {
            "success": True,
            "message": "Listing created successfully",
            "listing": listing.to_dict()
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create listing: {str(e)}"
        )


@router.get("/ideas/browse", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def browse_listings(
    industry: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    skills_needed: Optional[str] = Query(None),
    commitment_level: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Browse idea listings with filters"""
    try:
        service = FounderService(db)
        filters = {}
        if industry:
            filters["industry"] = industry
        if stage:
            filters["stage"] = stage
        if skills_needed:
            filters["skills_needed"] = skills_needed
        if commitment_level:
            filters["commitment_level"] = commitment_level
        if location:
            filters["location"] = location
        
        result = service.browse_listings(filters, page, per_page)
        
        return {
            "success": True,
            "listings": result["listings"],
            "total": result["total"],
            "page": result["page"],
            "per_page": result["per_page"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to browse listings: {str(e)}"
        )


@router.get("/ideas/{listing_id}", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_listing(
    listing_id: str = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get a single idea listing by ID"""
    try:
        service = FounderService(db)
        listing = service.get_listing(listing_id, current_user.user_id)
        
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found"
            )
        
        return {
            "success": True,
            "listing": listing.to_dict(include_founder=True)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get listing: {str(e)}"
        )


@router.put("/ideas/{listing_id}", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def update_listing(
    listing_id: str = Path(...),
    data: UpdateListingData = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Update an existing listing"""
    try:
        service = FounderService(db)
        listing = service.update_listing(
            listing_id,
            current_user.user_id,
            data.model_dump(exclude_none=True)
        )
        
        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Listing not found or not owned by user"
            )
        
        return {
            "success": True,
            "message": "Listing updated successfully",
            "listing": listing.to_dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update listing: {str(e)}"
        )


# ==================== People Browse Endpoint ====================

@router.get("/people/browse", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def browse_profiles(
    skills: Optional[str] = Query(None),
    industries: Optional[str] = Query(None),
    commitment_level: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Browse founder profiles with filters"""
    try:
        service = FounderService(db)
        filters = {}
        if skills:
            filters["skills"] = skills
        if industries:
            filters["industries"] = industries
        if commitment_level:
            filters["commitment_level"] = commitment_level
        if location:
            filters["location"] = location
        
        result = service.browse_profiles(filters, page, per_page)
        
        return {
            "success": True,
            "profiles": result["profiles"],
            "total": result["total"],
            "page": result["page"],
            "per_page": result["per_page"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to browse profiles: {str(e)}"
        )


# ==================== Connection Endpoints ====================

@router.post("/connect", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_connection(
    request: ConnectRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Create a connection request"""
    try:
        service = FounderService(db)
        connection = service.create_connection(
            current_user.user_id,
            recipient_profile_id=request.recipient_profile_id,
            idea_listing_id=request.idea_listing_id
        )
        
        return {
            "success": True,
            "message": "Connection request sent",
            "connection": connection.to_dict()
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create connection: {str(e)}"
        )


@router.get("/connections", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_connections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get all connections for the current user"""
    try:
        service = FounderService(db)
        connections = service.get_user_connections(current_user.user_id)
        
        return {
            "success": True,
            **connections
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get connections: {str(e)}"
        )


@router.put("/connections/{connection_id}/respond", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def respond_to_connection(
    connection_id: str = Path(...),
    request: RespondConnectionRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Respond to a connection request (accept/reject)"""
    try:
        service = FounderService(db)
        connection = service.respond_to_connection(
            connection_id,
            current_user.user_id,
            request.action
        )
        
        if not connection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Connection not found or already responded"
            )
        
        return {
            "success": True,
            "message": f"Connection {request.action}ed",
            "connection": connection.to_dict()
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to respond to connection: {str(e)}"
        )


@router.delete("/connections/{connection_id}", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def delete_connection(
    connection_id: str = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Delete/withdraw a connection request"""
    try:
        service = FounderService(db)
        success = service.delete_connection(connection_id, current_user.user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Connection not found or not owned by user"
            )
        
        return {
            "success": True,
            "message": "Connection deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete connection: {str(e)}"
        )


@router.get("/connections/{connection_id}/detail", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_connection_detail(
    connection_id: str = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get connection details"""
    try:
        service = FounderService(db)
        connection = service.get_connection_detail(connection_id, current_user.user_id)
        
        if not connection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Connection not found"
            )
        
        return {
            "success": True,
            "connection": connection.to_dict(include_details=True)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get connection detail: {str(e)}"
        )

