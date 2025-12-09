"""Cache service for Redis and database-backed caching"""
import json
import hashlib
from typing import Optional, Any, Dict
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.services.base_service import BaseService
from app.models.cache_entry import CacheEntry
from app.core.config import settings


class CacheService(BaseService):
    """Service for managing cache (Redis + DB fallback)"""
    
    def get(self, key: str, cache_type: str = "general") -> Optional[Any]:
        """Get value from cache"""
        # Try Redis first
        if self.redis:
            try:
                redis_key = f"{cache_type}:{key}"
                value = self.redis.get(redis_key)
                if value:
                    return json.loads(value)
            except Exception as e:
                self._log(f"Redis get failed: {e}", "WARNING")
        
        # Fallback to database
        try:
            key_hash = CacheEntry.generate_key_hash(key)
            entry = self.db.query(CacheEntry).filter(
                and_(
                    CacheEntry.cache_key_hash == key_hash,
                    CacheEntry.cache_type == cache_type,
                    CacheEntry.expires_at > datetime.now(timezone.utc)
                )
            ).first()
            
            if entry:
                # JSONB columns return Python dicts directly
                return entry.cache_value
        except Exception as e:
            self._log(f"DB cache get failed: {e}", "WARNING")
        
        return None
    
    def set(
        self,
        key: str,
        value: Any,
        cache_type: str = "general",
        ttl_seconds: Optional[int] = None
    ) -> bool:
        """Set value in cache"""
        if ttl_seconds is None:
            ttl_seconds = getattr(settings, f"CACHE_TTL_{cache_type.upper()}", 3600)
        
        value_json = json.dumps(value)
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)
        
        # Set in Redis
        if self.redis:
            try:
                redis_key = f"{cache_type}:{key}"
                self.redis.setex(redis_key, ttl_seconds, value_json)
            except Exception as e:
                self._log(f"Redis set failed: {e}", "WARNING")
        
        # Also store in database as fallback
        try:
            key_hash = CacheEntry.generate_key_hash(key)
            entry = self.db.query(CacheEntry).filter(
                CacheEntry.cache_key_hash == key_hash
            ).first()
            
            if entry:
                # JSONB columns accept Python dicts directly
                entry.cache_value = value
                entry.expires_at = expires_at
                entry.ttl_seconds = ttl_seconds
            else:
                entry = CacheEntry(
                    cache_key_hash=key_hash,
                    cache_key=key[:500],  # Truncate if too long
                    cache_value=value,  # JSONB accepts dict directly
                    cache_type=cache_type,
                    ttl_seconds=ttl_seconds,
                    expires_at=expires_at
                )
                self.db.add(entry)
            
            self.db.commit()
            return True
        except Exception as e:
            self._log(f"DB cache set failed: {e}", "WARNING")
            self.db.rollback()
            return False
    
    def delete(self, key: str, cache_type: str = "general") -> bool:
        """Delete value from cache"""
        # Delete from Redis
        if self.redis:
            try:
                redis_key = f"{cache_type}:{key}"
                self.redis.delete(redis_key)
            except Exception as e:
                self._log(f"Redis delete failed: {e}", "WARNING")
        
        # Delete from database
        try:
            key_hash = CacheEntry.generate_key_hash(key)
            self.db.query(CacheEntry).filter(
                CacheEntry.cache_key_hash == key_hash
            ).delete()
            self.db.commit()
            return True
        except Exception as e:
            self._log(f"DB cache delete failed: {e}", "WARNING")
            self.db.rollback()
            return False
    
    def clear_expired(self) -> int:
        """Clear expired cache entries from database"""
        try:
            count = self.db.query(CacheEntry).filter(
                CacheEntry.expires_at < datetime.now(timezone.utc)
            ).delete()
            self.db.commit()
            return count
        except Exception as e:
            self._log(f"Clear expired cache failed: {e}", "WARNING")
            self.db.rollback()
            return 0
    
    def delete_user_cache(self, user_id: str, cache_type: str = "discovery") -> int:
        """
        Delete all cache entries for a specific user
        
        This ensures cache invalidation works independently per user.
        
        Args:
            user_id: User ID to delete cache for
            cache_type: Cache type (default: "discovery")
        
        Returns:
            Number of cache entries deleted
        """
        deleted_count = 0
        
        # Delete from Redis using pattern matching
        if self.redis:
            try:
                # Pattern: discovery:discovery_user:{user_id}:*
                pattern = f"{cache_type}:discovery_user:{user_id}:*"
                keys = self.redis.keys(pattern)
                if keys:
                    deleted_count += self.redis.delete(*keys)
                    self._log(f"Deleted {len(keys)} Redis cache entries for user {user_id}", "INFO")
            except Exception as e:
                self._log(f"Redis user cache delete failed: {e}", "WARNING")
        
        # Delete from database
        try:
            # Find all cache entries that start with the user-specific prefix
            user_prefix = f"discovery_user:{user_id}:"
            entries = self.db.query(CacheEntry).filter(
                CacheEntry.cache_key.like(f"{user_prefix}%"),
                CacheEntry.cache_type == cache_type
            ).all()
            
            for entry in entries:
                self.db.delete(entry)
            
            self.db.commit()
            deleted_count += len(entries)
            if entries:
                self._log(f"Deleted {len(entries)} DB cache entries for user {user_id}", "INFO")
        except Exception as e:
            self._log(f"DB user cache delete failed: {e}", "WARNING")
            self.db.rollback()
        
        return deleted_count
    
    # ----------------------------------------------------------------------
    # DISCOVERY CACHE HELPERS
    # ----------------------------------------------------------------------
    @staticmethod
    def build_discovery_cache_key(payload: Dict[str, Any], user_id: Optional[str] = None) -> str:
        """
        Build a stable cache key for discovery queries using SHA256
        
        Creates a hash from the new universal intake schema fields:
        (time_commitment, budget_range, risk_tolerance, preferred_work_style,
         startup_style, skills, customer_interaction, location_context,
         industry_interest, sub_interest_area, business_type, earnings_timeline,
         founder_ambition, experience_summary)
        
        If user_id is provided, it's included in the hash for per-user caching.
        If user_id is None, falls back to global cache.
        
        Args:
            payload: Input payload dictionary (new universal schema)
            user_id: Optional user ID for per-user caching
        
        Returns:
            Cache key string in format "discovery:{hash}" or "discovery_user:{hash}"
        """
        # Normalize skills to a consistent string format
        skills = payload.get("skills", {})
        if isinstance(skills, dict):
            skills_str = json.dumps(skills, sort_keys=True)
        else:
            skills_str = str(skills)
        
        # Extract fields in exact order (new universal schema)
        key_tuple = (
            payload.get("time_commitment", ""),
            payload.get("budget_range", ""),
            payload.get("risk_tolerance", ""),
            payload.get("preferred_work_style", ""),
            payload.get("startup_style", ""),
            skills_str,
            payload.get("customer_interaction", ""),
            payload.get("location_context", ""),
            payload.get("industry_interest", ""),
            payload.get("sub_interest_area", ""),
            payload.get("business_type", ""),
            payload.get("earnings_timeline", ""),
            payload.get("founder_ambition", ""),
            payload.get("experience_summary", "")
        )
        
        # Create normalized string representation of input
        serialized_input = json.dumps(key_tuple, sort_keys=False)
        
        # Include user_id in the hash if available
        if user_id:
            # Per-user cache: hash includes user_id + serialized_input
            cache_key_data = f"{user_id}{serialized_input}"
            prefix = "discovery_user"
        else:
            # Global cache: hash only includes serialized_input
            cache_key_data = serialized_input
            prefix = "discovery_global"
        
        # Generate SHA256 hash
        hashed = hashlib.sha256(cache_key_data.encode()).hexdigest()
        
        return f"{prefix}:{hashed}"
    
    def get_json(self, key: str, cache_type: str = "discovery") -> Optional[Any]:
        """
        Get JSON value from cache (wrapper for get with logging)
        
        Args:
            key: Cache key
            cache_type: Cache type (default: "discovery")
        
        Returns:
            Cached value or None
        """
        if not settings.REDIS_ENABLED:
            return None
        
        result = self.get(key, cache_type=cache_type)
        
        if result:
            self._log(f"[REDIS] Cache hit for key {key}", "INFO")
        else:
            self._log(f"[REDIS] Cache miss for key {key}", "INFO")
        
        return result
    
    def set_json(
        self,
        key: str,
        value: Any,
        cache_type: str = "discovery",
        ttl_seconds: Optional[int] = None
    ) -> bool:
        """
        Set JSON value in cache (wrapper for set)
        
        Args:
            key: Cache key
            value: Value to cache
            cache_type: Cache type (default: "discovery")
            ttl_seconds: Time to live in seconds
        
        Returns:
            True if successful, False otherwise
        """
        if not settings.REDIS_ENABLED:
            return False
        
        return self.set(key, value, cache_type=cache_type, ttl_seconds=ttl_seconds)

