#!/usr/bin/env python3
"""Development server runner"""
import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    # Enable auto-reload in development (always on for local dev)
    # Set DEBUG=False in production to disable
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Always enable auto-reload for development
        log_level="info" if not settings.DEBUG else "debug",
    )

