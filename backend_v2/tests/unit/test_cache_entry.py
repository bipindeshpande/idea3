"""
Unit tests for CacheEntry model
"""
import pytest
from datetime import datetime, timezone, timedelta
from app.models.cache_entry import CacheEntry


@pytest.mark.unit
class TestCacheEntry:
    """Test CacheEntry model methods"""
    
    def test_generate_key_hash(self):
        """Test generating cache key hash"""
        key = "test_key_123"
        hash1 = CacheEntry.generate_key_hash(key)
        hash2 = CacheEntry.generate_key_hash(key)
        
        assert hash1 == hash2
        assert isinstance(hash1, str)
        assert len(hash1) == 64  # SHA256 hex digest
    
    def test_is_expired_future(self):
        """Test is_expired returns False for future expiration"""
        entry = CacheEntry(
            cache_key_hash="test",
            cache_key="test",
            cache_value={},
            cache_type="test",
            ttl_seconds=3600,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        
        assert entry.is_expired() is False
    
    def test_is_expired_past(self):
        """Test is_expired returns True for past expiration"""
        entry = CacheEntry(
            cache_key_hash="test",
            cache_key="test",
            cache_value={},
            cache_type="test",
            ttl_seconds=3600,
            expires_at=datetime.now(timezone.utc) - timedelta(seconds=1)
        )
        
        assert entry.is_expired() is True
    
    def test_to_dict_with_values(self):
        """Test to_dict with all values"""
        now = datetime.now(timezone.utc)
        entry = CacheEntry(
            cache_key_hash="test_hash",
            cache_key="test_key",
            cache_value={"data": "test"},
            cache_type="test_type",
            ttl_seconds=3600,
            created_at=now,
            expires_at=now + timedelta(hours=1)
        )
        
        result = entry.to_dict()
        
        assert result["cache_key"] == "test_key"
        assert result["cache_value"] == {"data": "test"}
        assert result["cache_type"] == "test_type"
        assert result["created_at"] == now.isoformat()
        assert result["expires_at"] == (now + timedelta(hours=1)).isoformat()
    
    def test_to_dict_with_none_values(self):
        """Test to_dict handles None values"""
        entry = CacheEntry(
            cache_key_hash="test",
            cache_key="test",
            cache_value=None,
            cache_type="test",
            ttl_seconds=3600,
            created_at=None,
            expires_at=datetime.now(timezone.utc)
        )
        
        result = entry.to_dict()
        
        assert result["cache_value"] is None
        assert result["created_at"] is None

