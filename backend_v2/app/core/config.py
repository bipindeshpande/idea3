"""Application configuration"""
import os
import json
from typing import Optional, List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "Startup Discovery API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    
    # Database - PostgreSQL via Docker
    DATABASE_URL: str = "postgresql://startup_discovery:startup_discovery_dev@localhost:5432/startup_discovery"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = True
    
    # LLM Providers
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    DEFAULT_LLM_PROVIDER: str = "openai"
    DEFAULT_MODEL: str = "gpt-4o-mini"
    MAX_TOKENS_STAGE2: int = 3000  # Max tokens for Stage 2 (recommendations) - reduced from 4000 for faster generation
    MAX_TOKENS_STAGE1: int = 1500  # Max tokens for Stage 1 (profile analysis) - reduced from 2000 for faster generation
    
    # API
    API_V1_PREFIX: str = "/api"
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from environment variable.
        
        Supports:
        - JSON array string: '["https://domain.com","https://www.domain.com"]'
        - Comma-separated string: 'https://domain.com,https://www.domain.com'
        - List (default)
        """
        if isinstance(v, str):
            # Try parsing as JSON first
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except json.JSONDecodeError:
                pass
            # Fall back to comma-separated
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    # Cache
    CACHE_TTL_PROFILE: int = 3600  # 1 hour
    CACHE_TTL_RECOMMENDATIONS: int = 7200  # 2 hours
    CACHE_TTL_TOOLS: int = 86400  # 24 hours
    
    # Pipeline
    STAGE1_TIMEOUT: int = 60  # seconds
    STAGE2_TIMEOUT: int = 120  # seconds
    PARALLEL_EXECUTION: bool = True
    
    # Security
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALLOW_UNAUTHENTICATED: bool = False  # Allow unauthenticated access if True
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields in .env file


settings = Settings()

