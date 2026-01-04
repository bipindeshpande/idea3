"""Unit tests for RateLimitService"""
import pytest
from unittest.mock import Mock, MagicMock
from fastapi import Request

from app.services.rate_limit_service import RateLimitService
from app.models.rate_limit_log import RateLimitLog


@pytest.mark.unit
class TestRateLimitService:
    """Test rate limit service operations"""
    
    @pytest.fixture
    def mock_redis(self):
        """Mock Redis client"""
        return Mock()
    
    @pytest.fixture
    def rate_limit_service(self, db_session, mock_redis):
        """Create rate limit service instance"""
        return RateLimitService(db_session, redis_client=mock_redis)
    
    @pytest.fixture
    def rate_limit_service_no_redis(self, db_session):
        """Create rate limit service without Redis"""
        return RateLimitService(db_session, redis_client=None)
    
    def test_get_client_ip_from_x_forwarded_for(self, rate_limit_service):
        """Test extracting IP from X-Forwarded-For header"""
        request = Mock(spec=Request)
        request.headers = {"X-Forwarded-For": "192.168.1.1, 10.0.0.1"}
        request.client = None
        
        ip = rate_limit_service.get_client_ip(request)
        
        assert ip == "192.168.1.1"
    
    def test_get_client_ip_from_x_real_ip(self, rate_limit_service):
        """Test extracting IP from X-Real-IP header"""
        request = Mock(spec=Request)
        request.headers = {"X-Real-IP": "192.168.1.2"}
        request.client = None
        
        ip = rate_limit_service.get_client_ip(request)
        
        assert ip == "192.168.1.2"
    
    def test_get_client_ip_from_client_host(self, rate_limit_service):
        """Test extracting IP from client.host"""
        request = Mock(spec=Request)
        request.headers = {}
        request.client = Mock()
        request.client.host = "192.168.1.3"
        
        ip = rate_limit_service.get_client_ip(request)
        
        assert ip == "192.168.1.3"
    
    def test_get_client_ip_unknown(self, rate_limit_service):
        """Test fallback to 'unknown' when no IP available"""
        request = Mock(spec=Request)
        request.headers = {}
        request.client = None
        
        ip = rate_limit_service.get_client_ip(request)
        
        assert ip == "unknown"
    
    def test_get_client_ip_x_forwarded_for_priority(self, rate_limit_service):
        """Test that X-Forwarded-For takes priority over X-Real-IP"""
        request = Mock(spec=Request)
        request.headers = {
            "X-Forwarded-For": "192.168.1.1",
            "X-Real-IP": "192.168.1.2"
        }
        request.client = Mock()
        request.client.host = "192.168.1.3"
        
        ip = rate_limit_service.get_client_ip(request)
        
        assert ip == "192.168.1.1"
    
    def test_check_rate_limit_allowed(self, rate_limit_service, mock_redis):
        """Test rate limit check when under limit"""
        mock_redis.incr.return_value = 3
        mock_redis.expire = Mock()
        
        is_allowed, current_count, limit = rate_limit_service.check_rate_limit(
            "192.168.1.1",
            limit=5,
            window_seconds=60,
            endpoint="discovery"
        )
        
        assert is_allowed is True
        assert current_count == 3
        assert limit == 5
        mock_redis.incr.assert_called_once_with("rate_limit:discovery:192.168.1.1")
    
    def test_check_rate_limit_exceeded(self, rate_limit_service, mock_redis):
        """Test rate limit check when limit exceeded"""
        mock_redis.incr.return_value = 6
        mock_redis.expire = Mock()
        
        is_allowed, current_count, limit = rate_limit_service.check_rate_limit(
            "192.168.1.1",
            limit=5,
            window_seconds=60,
            endpoint="discovery"
        )
        
        assert is_allowed is False
        assert current_count == 6
        assert limit == 5
    
    def test_check_rate_limit_first_request(self, rate_limit_service, mock_redis):
        """Test that TTL is set on first request"""
        mock_redis.incr.return_value = 1
        mock_redis.expire = Mock()
        
        rate_limit_service.check_rate_limit(
            "192.168.1.1",
            limit=5,
            window_seconds=60,
            endpoint="discovery"
        )
        
        # Should set TTL on first request
        mock_redis.expire.assert_called_once_with(
            "rate_limit:discovery:192.168.1.1",
            60
        )
    
    def test_check_rate_limit_subsequent_request(self, rate_limit_service, mock_redis):
        """Test that TTL is not reset on subsequent requests"""
        mock_redis.incr.return_value = 2
        mock_redis.expire = Mock()
        
        rate_limit_service.check_rate_limit(
            "192.168.1.1",
            limit=5,
            window_seconds=60,
            endpoint="discovery"
        )
        
        # Should not call expire on subsequent requests
        mock_redis.expire.assert_not_called()
    
    def test_check_rate_limit_no_redis(self, rate_limit_service_no_redis):
        """Test rate limit check when Redis unavailable"""
        is_allowed, current_count, limit = rate_limit_service_no_redis.check_rate_limit(
            "192.168.1.1",
            limit=5
        )
        
        # Should allow request when Redis unavailable
        assert is_allowed is True
        assert current_count == 0
        assert limit == 5
    
    def test_check_rate_limit_redis_error(self, rate_limit_service, mock_redis):
        """Test rate limit check when Redis operation fails"""
        mock_redis.incr.side_effect = Exception("Redis connection error")
        
        is_allowed, current_count, limit = rate_limit_service.check_rate_limit(
            "192.168.1.1",
            limit=5
        )
        
        # Should allow request on error
        assert is_allowed is True
        assert current_count == 0
        assert limit == 5
    
    def test_check_rate_limit_different_endpoints(self, rate_limit_service, mock_redis):
        """Test that different endpoints have separate rate limits"""
        mock_redis.incr.side_effect = [1, 1]  # Both return 1 (first request)
        mock_redis.expire = Mock()
        
        # Check discovery endpoint
        rate_limit_service.check_rate_limit(
            "192.168.1.1",
            endpoint="discovery"
        )
        
        # Check validation endpoint
        rate_limit_service.check_rate_limit(
            "192.168.1.1",
            endpoint="validation"
        )
        
        # Should create separate keys
        assert mock_redis.incr.call_count == 2
        calls = [call[0][0] for call in mock_redis.incr.call_args_list]
        assert "rate_limit:discovery:192.168.1.1" in calls
        assert "rate_limit:validation:192.168.1.1" in calls
    
    def test_check_rate_limit_different_ips(self, rate_limit_service, mock_redis):
        """Test that different IPs have separate rate limits"""
        mock_redis.incr.side_effect = [1, 1]
        mock_redis.expire = Mock()
        
        rate_limit_service.check_rate_limit("192.168.1.1", endpoint="discovery")
        rate_limit_service.check_rate_limit("192.168.1.2", endpoint="discovery")
        
        # Should create separate keys
        assert mock_redis.incr.call_count == 2
        calls = [call[0][0] for call in mock_redis.incr.call_args_list]
        assert "rate_limit:discovery:192.168.1.1" in calls
        assert "rate_limit:discovery:192.168.1.2" in calls
    
    def test_log_rate_limit_violation(self, rate_limit_service, db_session, test_user):
        """Test logging rate limit violation"""
        import uuid
        request_id = str(uuid.uuid4())
        
        log_entry = rate_limit_service.log_rate_limit_violation(
            ip_address="192.168.1.1",
            endpoint="discovery",
            current_count=6,
            limit=5,
            request_id=request_id,
            user_id=test_user.user_id
        )
        
        assert log_entry is not None
        assert log_entry.ip_address == "192.168.1.1"
        assert log_entry.endpoint == "discovery"
        assert log_entry.request_count == 6
        assert log_entry.limit == 5
        assert log_entry.request_id == request_id
        assert log_entry.user_id == test_user.user_id
        
        # Verify it's in database
        db_entry = db_session.query(RateLimitLog).filter(
            RateLimitLog.id == log_entry.id
        ).first()
        assert db_entry is not None
        assert db_entry.ip_address == "192.168.1.1"
    
    def test_log_rate_limit_violation_no_optional_fields(self, rate_limit_service, db_session):
        """Test logging rate limit violation without optional fields"""
        log_entry = rate_limit_service.log_rate_limit_violation(
            ip_address="192.168.1.1",
            endpoint="discovery",
            current_count=6,
            limit=5
        )
        
        assert log_entry is not None
        assert log_entry.request_id is None
        assert log_entry.user_id is None
    
    def test_check_rate_limit_custom_limit(self, rate_limit_service, mock_redis):
        """Test rate limit with custom limit"""
        mock_redis.incr.return_value = 10
        mock_redis.expire = Mock()
        
        is_allowed, current_count, limit = rate_limit_service.check_rate_limit(
            "192.168.1.1",
            limit=10,
            window_seconds=120
        )
        
        assert is_allowed is True
        assert current_count == 10
        assert limit == 10
    
    def test_check_rate_limit_custom_window(self, rate_limit_service, mock_redis):
        """Test rate limit with custom window"""
        mock_redis.incr.return_value = 1
        mock_redis.expire = Mock()
        
        rate_limit_service.check_rate_limit(
            "192.168.1.1",
            limit=5,
            window_seconds=300  # 5 minutes
        )
        
        # Should set TTL to custom window
        mock_redis.expire.assert_called_once_with(
            "rate_limit:discovery:192.168.1.1",
            300
        )

