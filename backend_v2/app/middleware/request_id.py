"""Request ID middleware for tracking requests"""
import json
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logger import request_id_var, logger


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware to add request ID to every request"""
    
    async def dispatch(self, request: Request, call_next):
        # Generate or extract request ID
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        
        # Set in context variable
        request_id_var.set(request_id)
        
        # Add to response headers
        response: Response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        # Log request
        # Commented out to reduce log noise
        # logger.info(
        #     json.dumps({
        #         "event": "http_request",
        #         "request_id": request_id,
        #         "method": request.method,
        #         "path": request.url.path,
        #         "status_code": response.status_code,
        #     })
        # )
        
        return response

