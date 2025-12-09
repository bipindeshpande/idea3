"""Base service class"""
from abc import ABC
from typing import Optional
from sqlalchemy.orm import Session
from app.core.redis_client import get_redis


class BaseService(ABC):
    """Base class for all services"""
    
    def __init__(self, db: Session, redis_client: Optional[object] = None):
        self.db = db
        self.redis = redis_client or get_redis()
    
    def _log(self, message: str, level: str = "INFO"):
        """Simple logging (can be replaced with proper logger)"""
        print(f"[{level}] {self.__class__.__name__}: {message}")

