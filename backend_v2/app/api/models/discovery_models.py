"""Discovery API request/response models"""
from typing import Dict, Any, Optional
from pydantic import BaseModel


class RunRequest(BaseModel):
    """Request model for discovery run - Universal Intake Schema"""
    # Discovery Mode (AI-first vs Standard)
    discovery_mode: Optional[str] = "standard"  # "standard" (static-first) or "ai_first" (LLM-first with static fallback)
    
    # Startup Category (FIRST FIELD)
    startup_category: Optional[str] = None  # "tech", "non_tech", or "both"
    
    # Screen 1 - About You
    time_commitment: Optional[str] = None
    budget_range: Optional[str] = None
    risk_tolerance: Optional[str] = None
    preferred_work_style: Optional[str] = None
    startup_style: Optional[str] = None
    skills: Optional[Dict[str, Any]] = None  # {technical: [], creative: [], etc., other: ""}
    customer_interaction: Optional[str] = None
    location_context: Optional[str] = None
    business_region: Optional[str] = None
    
    # Screen 2 - Interests & Goals
    industry_interest: Optional[str] = None
    sub_interest_area: Optional[str] = None
    business_type: Optional[str] = None
    earnings_timeline: Optional[str] = None
    founder_ambition: Optional[str] = None
    experience_summary: Optional[str] = None


class RunResponse(BaseModel):
    """Response model for discovery run"""
    success: bool
    run_id: str
    status: str
    outputs: Dict[str, Any] = None
    cached: bool = False

