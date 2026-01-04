"""Unit tests for CacheService"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timezone, timedelta
import json
import hashlib

from app.services.cache_service import CacheService
from app.models.cache_entry import CacheEntry


@pytest.mark.unit
class TestCacheService:
    """Test cache service operations"""
    
    @pytest.fixture
    def mock_redis(self):
        """Mock Redis client"""
        return Mock()
    
    @pytest.fixture
    def cache_service(self, db_session, mock_redis):
        """Create cache service instance"""
        return CacheService(db_session, redis_client=mock_redis)
    
    @pytest.fixture
    def cache_service_no_redis(self, db_session):
        """Create cache service without Redis"""
        return CacheService(db_session, redis_client=None)
    
    def test_get_from_redis_success(self, cache_service, mock_redis):
        """Test getting value from Redis"""
        test_value = {"key": "value", "number": 123}
        mock_redis.get.return_value = json.dumps(test_value)
        
        result = cache_service.get("test_key", cache_type="test")
        
        assert result == test_value
        mock_redis.get.assert_called_once_with("test:test_key")
    
    def test_get_from_redis_not_found(self, cache_service, mock_redis):
        """Test getting value when not in Redis"""
        mock_redis.get.return_value = None
        
        result = cache_service.get("test_key", cache_type="test")
        
        assert result is None
    
    def test_get_from_redis_json_error(self, cache_service, mock_redis):
        """Test handling invalid JSON from Redis"""
        mock_redis.get.return_value = "invalid json{"
        
        # Should fall back to database
        result = cache_service.get("test_key", cache_type="test")
        
        # Since DB also doesn't have it, should return None
        assert result is None
    
    def test_get_from_database_success(self, cache_service_no_redis, db_session):
        """Test getting value from database when Redis unavailable"""
        test_value = {"key": "value", "data": [1, 2, 3]}
        key = "test_key"
        key_hash = CacheEntry.generate_key_hash(key)
        
        # Create cache entry
        entry = CacheEntry(
            cache_key_hash=key_hash,
            cache_key=key,
            cache_value=test_value,
            cache_type="test",
            ttl_seconds=3600,
            expires_at=datetime.now(timezone.utc) + timedelta(seconds=3600)
        )
        db_session.add(entry)
        db_session.commit()
        
        result = cache_service_no_redis.get(key, cache_type="test")
        
        assert result == test_value
    
    def test_get_from_database_expired(self, cache_service_no_redis, db_session):
        """Test that expired entries are not returned"""
        key = "expired_key"
        key_hash = CacheEntry.generate_key_hash(key)
        
        # Create expired entry
        entry = CacheEntry(
            cache_key_hash=key_hash,
            cache_key=key,
            cache_value={"data": "old"},
            cache_type="test",
            ttl_seconds=3600,
            expires_at=datetime.now(timezone.utc) - timedelta(seconds=1)  # Expired
        )
        db_session.add(entry)
        db_session.commit()
        
        result = cache_service_no_redis.get(key, cache_type="test")
        
        assert result is None
    
    def test_set_in_redis_and_db(self, cache_service, mock_redis, db_session):
        """Test setting value in both Redis and database"""
        key = "test_key"
        value = {"data": "test", "number": 42}
        
        result = cache_service.set(key, value, cache_type="test", ttl_seconds=1800)
        
        assert result is True
        # Check Redis was called
        mock_redis.setex.assert_called_once()
        redis_key, ttl, value_json = mock_redis.setex.call_args[0]
        assert redis_key == "test:test_key"
        assert ttl == 1800
        assert json.loads(value_json) == value
        
        # Check database entry
        key_hash = CacheEntry.generate_key_hash(key)
        entry = db_session.query(CacheEntry).filter(
            CacheEntry.cache_key_hash == key_hash
        ).first()
        assert entry is not None
        assert entry.cache_value == value
        assert entry.cache_type == "test"
        assert entry.ttl_seconds == 1800
    
    def test_set_updates_existing_entry(self, cache_service, mock_redis, db_session):
        """Test that set updates existing cache entry"""
        key = "existing_key"
        key_hash = CacheEntry.generate_key_hash(key)
        
        # Create existing entry
        old_entry = CacheEntry(
            cache_key_hash=key_hash,
            cache_key=key,
            cache_value={"old": "data"},
            cache_type="test",
            ttl_seconds=3600,
            expires_at=datetime.now(timezone.utc) + timedelta(seconds=3600)
        )
        db_session.add(old_entry)
        db_session.commit()
        
        # Update with new value
        new_value = {"new": "data"}
        result = cache_service.set(key, new_value, cache_type="test", ttl_seconds=1800)
        
        assert result is True
        db_session.refresh(old_entry)
        assert old_entry.cache_value == new_value
        assert old_entry.ttl_seconds == 1800
    
    def test_set_without_redis(self, cache_service_no_redis, db_session):
        """Test setting value when Redis unavailable"""
        key = "test_key"
        value = {"data": "test"}
        
        result = cache_service_no_redis.set(key, value, cache_type="test")
        
        assert result is True
        # Should still work with database
        key_hash = CacheEntry.generate_key_hash(key)
        entry = db_session.query(CacheEntry).filter(
            CacheEntry.cache_key_hash == key_hash
        ).first()
        assert entry is not None
        assert entry.cache_value == value
    
    def test_set_redis_failure_fallback(self, cache_service, mock_redis, db_session):
        """Test that database fallback works when Redis fails"""
        key = "test_key"
        value = {"data": "test"}
        
        # Make Redis fail
        mock_redis.setex.side_effect = Exception("Redis connection failed")
        
        result = cache_service.set(key, value, cache_type="test")
        
        # Should still succeed with database
        assert result is True
        key_hash = CacheEntry.generate_key_hash(key)
        entry = db_session.query(CacheEntry).filter(
            CacheEntry.cache_key_hash == key_hash
        ).first()
        assert entry is not None
    
    def test_set_default_ttl(self, cache_service, mock_redis):
        """Test that default TTL is used when not specified"""
        with patch('app.services.cache_service.settings') as mock_settings:
            mock_settings.CACHE_TTL_TEST = 7200
            
            cache_service.set("test_key", {"data": "test"}, cache_type="test")
            
            # Check that default TTL was used
            call_args = mock_redis.setex.call_args[0]
            assert call_args[1] == 7200  # TTL
    
    def test_delete_from_redis_and_db(self, cache_service, mock_redis, db_session):
        """Test deleting value from both Redis and database"""
        key = "test_key"
        key_hash = CacheEntry.generate_key_hash(key)
        
        # Create entry in database
        entry = CacheEntry(
            cache_key_hash=key_hash,
            cache_key=key,
            cache_value={"data": "test"},
            cache_type="test",
            ttl_seconds=3600,
            expires_at=datetime.now(timezone.utc) + timedelta(seconds=3600)
        )
        db_session.add(entry)
        db_session.commit()
        
        result = cache_service.delete(key, cache_type="test")
        
        assert result is True
        mock_redis.delete.assert_called_once_with("test:test_key")
        
        # Check database entry is deleted
        entry = db_session.query(CacheEntry).filter(
            CacheEntry.cache_key_hash == key_hash
        ).first()
        assert entry is None
    
    def test_delete_not_found(self, cache_service, mock_redis):
        """Test deleting non-existent key"""
        result = cache_service.delete("nonexistent", cache_type="test")
        
        assert result is True  # Delete is idempotent
        mock_redis.delete.assert_called_once()
    
    def test_delete_without_redis(self, cache_service_no_redis, db_session):
        """Test deleting when Redis unavailable"""
        key = "test_key"
        key_hash = CacheEntry.generate_key_hash(key)
        
        # Create entry
        entry = CacheEntry(
            cache_key_hash=key_hash,
            cache_key=key,
            cache_value={"data": "test"},
            cache_type="test",
            ttl_seconds=3600,
            expires_at=datetime.now(timezone.utc) + timedelta(seconds=3600)
        )
        db_session.add(entry)
        db_session.commit()
        
        result = cache_service_no_redis.delete(key, cache_type="test")
        
        assert result is True
        # Check database entry is deleted
        entry = db_session.query(CacheEntry).filter(
            CacheEntry.cache_key_hash == key_hash
        ).first()
        assert entry is None
    
    def test_get_json_alias(self, cache_service, mock_redis):
        """Test get_json calls get with Redis enabled"""
        test_value = {"key": "value"}
        mock_redis.get.return_value = json.dumps(test_value)
        
        with patch('app.services.cache_service.settings') as mock_settings:
            mock_settings.REDIS_ENABLED = True
            
            result = cache_service.get_json("test_key", cache_type="test")
            
            assert result == test_value
            mock_redis.get.assert_called_once_with("test:test_key")
    
    def test_build_discovery_cache_key(self, cache_service):
        """Test building discovery cache key"""
        inputs = {
            "startup_category": "tech",
            "time_commitment": "5-10 hours/week",
            "industry_interest": "AI"
        }
        user_id = "user123"
        
        key = cache_service.build_discovery_cache_key(inputs, user_id)
        
        assert isinstance(key, str)
        assert len(key) > 0
        # Key should be deterministic
        key2 = cache_service.build_discovery_cache_key(inputs, user_id)
        assert key == key2
    
    def test_build_discovery_cache_key_different_inputs(self, cache_service):
        """Test that different inputs produce different keys"""
        # Use inputs that will actually differ in the normalized key
        inputs1 = {
            "startup_category": "tech",
            "industry_interest": "AI",
            "time_commitment": "5-10 hours/week"
        }
        inputs2 = {
            "startup_category": "non-tech",
            "industry_interest": "Healthcare",
            "time_commitment": "20+ hours/week"
        }
        
        key1 = cache_service.build_discovery_cache_key(inputs1, "user1")
        key2 = cache_service.build_discovery_cache_key(inputs2, "user1")
        
        assert key1 != key2
    
    def test_build_discovery_cache_key_different_users(self, cache_service):
        """Test that different users produce different keys"""
        inputs = {"startup_category": "tech"}
        
        key1 = cache_service.build_discovery_cache_key(inputs, "user1")
        key2 = cache_service.build_discovery_cache_key(inputs, "user2")
        
        assert key1 != key2
    
    def test_build_discovery_cache_key_no_user(self, cache_service):
        """Test building cache key without user_id"""
        inputs = {"startup_category": "tech"}
        
        key = cache_service.build_discovery_cache_key(inputs, None)
        
        assert isinstance(key, str)
        assert len(key) > 0
    
    def test_cache_key_hash_deterministic(self):
        """Test that cache key hash is deterministic"""
        key = "test_key_123"
        
        hash1 = CacheEntry.generate_key_hash(key)
        hash2 = CacheEntry.generate_key_hash(key)
        
        assert hash1 == hash2
        assert isinstance(hash1, str)
        assert len(hash1) == 64  # SHA256 hex digest length
    
    def test_cache_key_hash_different_keys(self):
        """Test that different keys produce different hashes"""
        key1 = "test_key_1"
        key2 = "test_key_2"
        
        hash1 = CacheEntry.generate_key_hash(key1)
        hash2 = CacheEntry.generate_key_hash(key2)
        
        assert hash1 != hash2

