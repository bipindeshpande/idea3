"""Admin API routes"""
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Body, Request, Query
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.core.dependencies import get_current_admin_user
from app.core.config import settings
from app.models.user import User
from app.models.run import Run
from app.models.validation import Validation
from app.services.admin_metrics_service import AdminMetricsService
from app.services.observability_service import ObservabilityService
from app.services.auth_service import AuthService
from app.services.admin_config_service import AdminConfigService
from app.services.admin_user_service import AdminUserService
from app.services.admin_report_service import AdminReportService

router = APIRouter()

# Admin password-based authentication
security = HTTPBearer(auto_error=False)


def get_admin_password() -> str:
    """Get admin password from environment or default"""
    return settings.ADMIN_PASSWORD or "admin2024"


def verify_admin_password(password: str) -> bool:
    """Verify admin password"""
    return password == get_admin_password()


async def get_admin_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> bool:
    """
    Simple admin authentication using password in Bearer token
    For admin endpoints that don't require user role check
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    password = credentials.credentials
    if not verify_admin_password(password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return True


# Request/Response Models
class AdminLoginRequest(BaseModel):
    password: str


class SaveValidationQuestionsRequest(BaseModel):
    questions: Dict[str, Any]


class SaveIntakeFieldsRequest(BaseModel):
    screen_id: Optional[str] = None
    screen_title: Optional[str] = None
    description: Optional[str] = None
    fields: List[Dict[str, Any]]


class UpdateSubscriptionRequest(BaseModel):
    subscription_type: str
    duration_days: int


class UpdateSettingsRequest(BaseModel):
    debug_mode: Optional[bool] = None


class AdminForgotPasswordRequest(BaseModel):
    email: EmailStr


class AdminResetPasswordRequest(BaseModel):
    token: str
    password: str


# Admin Login
@router.post("/login", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def admin_login(
    request: AdminLoginRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Admin login endpoint
    
    Verifies admin password and returns success.
    Frontend handles MFA separately.
    """
    if verify_admin_password(request.password):
        return {
            "success": True,
            "message": "Password verified"
        }
    else:
        return {
            "success": False,
            "error": "Incorrect password"
        }


# Admin Stats (alias for /metrics)
@router.get("/stats", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_admin_stats(
    db: Session = Depends(get_db),
    _: bool = Depends(get_admin_auth)
):
    """
    Get admin statistics
    
    Returns stats in format expected by frontend:
    - total_users
    - total_runs
    - total_validations
    - total_revenue
    - active_subscriptions
    - free_trial_users
    - weekly_subscribers
    - monthly_subscribers
    - total_payments
    """
    try:
        # Get basic counts
        total_users = db.query(User).count()  # User model doesn't have deleted_at
        total_runs = db.query(Run).filter(Run.deleted_at.is_(None)).count()
        total_validations = db.query(Validation).filter(Validation.deleted_at.is_(None)).count()
        
        # Calculate subscription stats
        active_subscriptions = db.query(User).filter(
            and_(
                User.subscription_type != "free",
                User.subscription_type != "free_trial",
                User.is_active == True
            )
        ).count()
        
        free_trial_users = db.query(User).filter(
            User.subscription_type == "free_trial"
        ).count()
        
        weekly_subscribers = db.query(User).filter(
            User.subscription_type == "weekly"
        ).count()
        
        monthly_subscribers = db.query(User).filter(
            User.subscription_type.in_(["starter", "pro", "monthly"])
        ).count()
        
        # Calculate revenue (mock - no Payment model yet)
        # In production, this would query a Payment table
        total_revenue = 0.0
        total_payments = 0
        
        # Calculate days remaining for users (mock - would need subscription_end_at)
        # For now, return basic stats
        
        return {
            "success": True,
            "stats": {
                "total_users": total_users,
                "total_runs": total_runs,
                "total_validations": total_validations,
                "total_revenue": total_revenue,
                "active_subscriptions": active_subscriptions,
                "free_trial_users": free_trial_users,
                "weekly_subscribers": weekly_subscribers,
                "monthly_subscribers": monthly_subscribers,
                "total_payments": total_payments
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch stats: {str(e)}"
        )


# Save Validation Questions
@router.post("/save-validation-questions", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def save_validation_questions(
    request: SaveValidationQuestionsRequest = Body(...),
    _: bool = Depends(get_admin_auth)
):
    """
    Save validation questions configuration
    
    Stores validation questions to JSON file for persistence.
    """
    try:
        config_service = AdminConfigService()
        config_service.save_validation_questions(request.questions)
        
        return {
            "success": True,
            "message": "Validation questions saved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save validation questions: {str(e)}"
        )


# Save Intake Fields
@router.post("/save-intake-fields", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def save_intake_fields(
    request: SaveIntakeFieldsRequest = Body(...),
    _: bool = Depends(get_admin_auth)
):
    """
    Save intake form fields configuration
    
    Stores intake fields to JSON file for persistence.
    """
    try:
        config = {
            "screen_id": request.screen_id,
            "screen_title": request.screen_title,
            "description": request.description,
            "fields": request.fields
        }
        
        config_service = AdminConfigService()
        config_service.save_intake_fields(config)
        
        return {
            "success": True,
            "message": "Intake fields saved successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save intake fields: {str(e)}"
        )


# Get Users
@router.get("/users", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_users(
    db: Session = Depends(get_db),
    _: bool = Depends(get_admin_auth)
):
    """
    Get list of all users with subscription information
    """
    try:
        user_service = AdminUserService(db)
        users = user_service.get_all_users()
        
        user_list = [user_service.serialize_user(user) for user in users]
        
        return {
            "users": user_list
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )


# Get User Details
@router.get("/user/{user_id}", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_user_detail(
    user_id: str,
    db: Session = Depends(get_db),
    _: bool = Depends(get_admin_auth)
):
    """
    Get detailed user information including runs, validations, and payments
    """
    try:
        user_service = AdminUserService(db)
        user = user_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user's runs and validations
        runs = user_service.get_user_runs(user_id)
        validations = user_service.get_user_validations(user_id)
        
        runs_list = [{
            "id": run.run_id,
            "run_id": run.run_id,
            "status": run.status,
            "created_at": run.created_at.isoformat() if run.created_at else None
        } for run in runs]
        
        validations_list = [{
            "id": validation.validation_id,
            "validation_id": validation.validation_id,
            "status": validation.status,
            "created_at": validation.created_at.isoformat() if validation.created_at else None
        } for validation in validations]
        
        # Get payments (mock - no Payment model)
        payments_list = []
        
        return {
            "user": user_service.serialize_user_detail(user),
            "runs": runs_list,
            "validations": validations_list,
            "payments": payments_list
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user details: {str(e)}"
        )


# Update User Subscription
@router.put("/user/{user_id}/subscription", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def update_user_subscription(
    user_id: str,
    request: UpdateSubscriptionRequest = Body(...),
    db: Session = Depends(get_db),
    _: bool = Depends(get_admin_auth)
):
    """
    Update user subscription
    
    Note: Frontend uses POST, but spec says PUT. Supporting both.
    """
    try:
        user_service = AdminUserService(db)
        user = user_service.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_service.update_subscription(user, request.subscription_type, request.duration_days)
        db.commit()
        
        return {
            "success": True,
            "message": "Subscription updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update subscription: {str(e)}"
        )


# Support POST for subscription update (frontend compatibility)
@router.post("/user/{user_id}/subscription", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def update_user_subscription_post(
    user_id: str,
    request: UpdateSubscriptionRequest = Body(...),
    db: Session = Depends(get_db),
    _: bool = Depends(get_admin_auth)
):
    """POST alias for subscription update"""
    return await update_user_subscription(user_id, request, db, _)


# Get Payments
@router.get("/payments", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_payments(
    db: Session = Depends(get_db),
    _: bool = Depends(get_admin_auth)
):
    """
    Get list of all payments
    
    Note: No Payment model exists yet, so this returns mock data.
    In production, this would query a Payment table.
    """
    try:
        # Mock payments - in production, query Payment table
        payments_list = []
        
        # For now, return empty list
        # TODO: Implement when Payment model is created
        
        return {
            "payments": payments_list
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch payments: {str(e)}"
        )


# Export Reports
@router.get("/reports/export", status_code=status.HTTP_200_OK)
async def export_reports(
    report_type: str = Query(..., description="Report type: users, payments, activity, subscriptions, revenue, full"),
    db: Session = Depends(get_db),
    _: bool = Depends(get_admin_auth)
):
    """
    Export reports as CSV
    
    Supports: users, payments, activity, subscriptions, revenue, full
    """
    try:
        report_service = AdminReportService(db)
        csv_content = report_service.generate_report(report_type)
        
        return StreamingResponse(
            iter([csv_content]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={report_type}_report_{datetime.now().strftime('%Y-%m-%d')}.csv"
            }
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export report: {str(e)}"
        )


# Get Settings
@router.get("/settings", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_settings(
    _: bool = Depends(get_admin_auth)
):
    """
    Get system settings
    """
    try:
        config_service = AdminConfigService()
        file_settings = config_service.get_settings()
        
        settings_dict = {
            "debug_mode": settings.DEBUG
        }
        settings_dict.update(file_settings)
        
        return {
            "success": True,
            "settings": settings_dict
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch settings: {str(e)}"
        )


# Update Settings
@router.post("/settings", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def update_settings(
    request: UpdateSettingsRequest = Body(...),
    _: bool = Depends(get_admin_auth)
):
    """
    Update system settings
    
    Note: debug_mode changes require server restart to take effect.
    """
    try:
        config_service = AdminConfigService()
        settings_dict = config_service.get_settings()
        
        if request.debug_mode is not None:
            settings_dict["debug_mode"] = request.debug_mode
            # Note: This won't change settings.DEBUG until server restart
        
        config_service.update_settings(settings_dict)
        
        return {
            "success": True,
            "message": "Settings updated successfully. Server restart required for debug_mode changes."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update settings: {str(e)}"
        )


# Admin Forgot Password
@router.post("/forgot-password", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def admin_forgot_password(
    request: AdminForgotPasswordRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Admin forgot password endpoint
    
    For admin accounts, this would send a reset link.
    For now, returns success message (security: don't reveal if email exists).
    """
    try:
        # Check if admin user exists with this email
        admin_user = db.query(User).filter(
            and_(
                User.email == request.email,
                User.role == "admin"
            )
        ).first()
        
        if admin_user:
            # Generate reset token
            auth_service = AuthService(db)
            reset_token_expires = timedelta(hours=1)
            reset_token = auth_service.create_access_token(
                data={"sub": admin_user.user_id, "type": "admin_password_reset"},
                expires_delta=reset_token_expires
            )
            
            # In development mode, return reset link
            reset_link = None
            if settings.DEBUG:
                cors_origins = settings.CORS_ORIGINS
                if isinstance(cors_origins, list) and len(cors_origins) > 0:
                    base_url = cors_origins[0]
                else:
                    base_url = "http://localhost:5173"
                reset_link = f"{base_url}/admin/reset-password?token={reset_token}"
            
            # TODO: In production, send email with reset link
            
            response = {
                "success": True,
                "message": "If an admin account with that email exists, a password reset link has been sent."
            }
            if reset_link:
                response["reset_link"] = reset_link
            
            return response
        else:
            # Always return success (don't reveal if email exists)
            return {
                "success": True,
                "message": "If an admin account with that email exists, a password reset link has been sent."
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process forgot password request: {str(e)}"
        )


# Admin Reset Password
@router.post("/reset-password", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def admin_reset_password(
    request: AdminResetPasswordRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Admin reset password endpoint
    
    Resets admin password using token from forgot-password.
    """
    try:
        auth_service = AuthService(db)
        
        # Decode token
        payload = auth_service.decode_access_token(request.token)
        if not payload:
            return {
                "success": False,
                "error": "Invalid or expired token",
                "message": "The reset token is invalid or has expired."
            }
        
        # Check token type
        token_type = payload.get("type")
        if token_type != "admin_password_reset":
            return {
                "success": False,
                "error": "Invalid token type",
                "message": "The reset token is invalid."
            }
        
        # Get user
        user_id = payload.get("sub")
        if not user_id:
            return {
                "success": False,
                "error": "Invalid token",
                "message": "The reset token is invalid."
            }
        
        user = auth_service.get_user_by_id(user_id)
        if not user or user.role != "admin":
            return {
                "success": False,
                "error": "User not found",
                "message": "Admin user not found."
            }
        
        # Update password
        hashed_password = auth_service.get_password_hash(request.password)
        user.hashed_password = hashed_password
        db.commit()
        
        return {
            "success": True,
            "message": "Password reset successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "error": "Failed to reset password",
            "message": f"Failed to reset password: {str(e)}"
        }


# Keep existing endpoints
@router.get("/metrics", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def get_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get admin metrics
    
    Returns comprehensive system metrics including:
    - Total, completed, and failed runs
    - Average runtime
    - Cache hit ratio
    - Runs in last 24h and 7d
    - Runs grouped by interest area
    - Estimated LLM costs
    
    Requires admin role.
    """
    try:
        admin_metrics_service = AdminMetricsService(db)
        metrics = admin_metrics_service.get_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch metrics: {str(e)}"
        )


@router.get("/observability", response_class=HTMLResponse, status_code=status.HTTP_200_OK)
async def observability_dashboard(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    view: str = "html"
):
    """
    Lightweight observability dashboard.
    Use ?view=json to get raw metrics.
    """
    try:
        service = ObservabilityService(db)
        metrics = service.get_metrics()
        if view == "json":
            return metrics
        html = service.render_html(metrics)
        return HTMLResponse(content=html, status_code=200)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch observability metrics: {str(e)}"
        )
