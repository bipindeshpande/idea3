"""Main FastAPI application"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import discovery
from app.api.routes import router as api_router
from app.middleware.request_id import RequestIDMiddleware

# Initialize Sentry for error tracking (if DSN is provided)
SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            FastApiIntegration(transaction_style='endpoint'),
            SqlalchemyIntegration(),
        ],
        traces_sample_rate=0.1,  # 10% of transactions for performance monitoring
        environment=os.getenv("ENVIRONMENT", "production"),
        # Filter out expected errors
        before_send=lambda event, hint: None if _should_filter_error(event, hint) else event,
    )


def _should_filter_error(event, hint):
    """Filter out expected/non-critical errors"""
    if 'exc_info' in hint:
        exc_type, exc_value, tb = hint['exc_info']
        # Skip validation errors (these are expected)
        from pydantic import ValidationError
        if isinstance(exc_value, ValidationError):
            return True
        # Skip 404s (expected)
        from fastapi import HTTPException
        if isinstance(exc_value, HTTPException) and exc_value.status_code == 404:
            return True
    return False

# Note: Tables are created via Alembic migrations, not here
# Run: alembic upgrade head

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

# Request ID middleware (must be first)
app.add_middleware(RequestIDMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(discovery.router)
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}

