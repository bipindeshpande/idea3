"""Redis client configuration"""
from typing import Optional
from app.core.config import settings

# Try to import redis, but make it optional
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None

_redis_client = None


def get_redis():
    """Get Redis client instance"""
    global _redis_client
    
    if not settings.REDIS_ENABLED or not REDIS_AVAILABLE:
        return None
    
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # Test connection
            _redis_client.ping()
        except Exception as e:
            print(f"Redis connection failed: {e}. Continuing without cache.")
            return None
    
    return _redis_client

