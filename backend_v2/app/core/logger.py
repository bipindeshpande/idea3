"""Structured JSON logging configuration"""
import json
import logging
import sys
from datetime import datetime
from typing import Any, Dict, Optional
from contextvars import ContextVar

# Context variable for request ID
request_id_var: ContextVar[Optional[str]] = ContextVar('request_id', default=None)

# Context variable for run ID
run_id_var: ContextVar[Optional[str]] = ContextVar('run_id', default=None)


class JSONFormatter(logging.Formatter):
    """Custom formatter that outputs JSON logs"""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON"""
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add request ID if available
        request_id = request_id_var.get()
        if request_id:
            log_data["request_id"] = request_id
        
        # Add run_id if available
        run_id = run_id_var.get()
        if run_id:
            log_data["run_id"] = run_id
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields from record
        if hasattr(record, "extra_fields"):
            log_data.update(record.extra_fields)
        
        return json.dumps(log_data, default=str)


def setup_logger(name: str = "startup_discovery", level: str = "INFO") -> logging.Logger:
    """Setup and return a configured JSON logger"""
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Remove existing handlers
    logger.handlers.clear()
    
    # Create console handler with JSON formatter
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())
    logger.addHandler(handler)
    
    # Prevent propagation to root logger
    logger.propagate = False
    
    return logger


# Global logger instance
logger = setup_logger()


def log_discovery_run(
    run_id: str,
    user_id: Optional[str],
    timestamp_start: datetime,
    timestamp_end: datetime,
    total_duration_ms: float,
    cache_hit: bool,
    error: Optional[str] = None,
    extra_fields: Optional[Dict[str, Any]] = None
):
    """Log a discovery run with structured data"""
    duration_seconds = total_duration_ms / 1000.0
    is_slow = duration_seconds > 60.0
    
    message = f"Discovery run {run_id} {'failed' if error else 'completed'}"
    if is_slow:
        message += f" (slow: {duration_seconds:.2f}s)"
    
    log_data = {
        "event": "discovery_run",
        "run_id": run_id,
        "user_id": user_id,
        "timestamp_start": timestamp_start.isoformat() + "Z",
        "timestamp_end": timestamp_end.isoformat() + "Z",
        "total_duration_ms": round(total_duration_ms, 2),
        "total_duration_seconds": round(duration_seconds, 2),
        "cache_hit": cache_hit,
    }
    
    if error:
        log_data["error"] = error
        log_data["status"] = "failed"
    else:
        log_data["status"] = "completed"
    
    if is_slow:
        log_data["slow_run"] = True
        log_data["warning"] = f"Discovery run took {duration_seconds:.2f}s (threshold: 60s)"
    
    if extra_fields:
        log_data.update(extra_fields)
    
    # Set run_id in context for this log
    run_id_var.set(run_id)
    
    # Log with extra_fields (will be picked up by JSONFormatter)
    record = logging.LogRecord(
        name=logger.name,
        level=logging.ERROR if error else (logging.WARNING if is_slow else logging.INFO),
        pathname="",
        lineno=0,
        msg=message,
        args=(),
        exc_info=None
    )
    record.extra_fields = log_data
    logger.handle(record)
    
    # Clear run_id from context
    run_id_var.set(None)

