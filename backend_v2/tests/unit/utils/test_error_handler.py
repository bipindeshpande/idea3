"""Tests for error_handler.py"""
import pytest
from unittest.mock import patch
from fastapi import HTTPException, status
from app.utils.error_handler import (
    AppError,
    ValidationError,
    NotFoundError,
    AuthorizationError,
    handle_exception,
    safe_execute
)
from app.core.logger import request_id_var


@pytest.mark.unit
class TestAppError:
    """Test AppError base class"""
    
    def test_app_error_creation(self):
        """Test creating AppError with default values"""
        error = AppError("Test error")
        assert error.message == "Test error"
        assert error.error_type == "APPLICATION_ERROR"
        assert error.status_code == 500
        assert error.details == {}
        assert str(error) == "Test error"
    
    def test_app_error_with_custom_values(self):
        """Test creating AppError with custom values"""
        details = {"field": "value"}
        error = AppError(
            message="Custom error",
            error_type="CUSTOM_ERROR",
            status_code=400,
            details=details
        )
        assert error.message == "Custom error"
        assert error.error_type == "CUSTOM_ERROR"
        assert error.status_code == 400
        assert error.details == details


@pytest.mark.unit
class TestValidationError:
    """Test ValidationError class"""
    
    def test_validation_error_creation(self):
        """Test creating ValidationError"""
        error = ValidationError("Invalid input", {"field": "email"})
        assert error.message == "Invalid input"
        assert error.error_type == "VALIDATION_ERROR"
        assert error.status_code == status.HTTP_400_BAD_REQUEST
        assert error.details == {"field": "email"}
    
    def test_validation_error_without_details(self):
        """Test creating ValidationError without details"""
        error = ValidationError("Invalid input")
        assert error.message == "Invalid input"
        assert error.details == {}


@pytest.mark.unit
class TestNotFoundError:
    """Test NotFoundError class"""
    
    def test_not_found_error_creation(self):
        """Test creating NotFoundError"""
        error = NotFoundError("User", "123")
        assert error.message == "User not found: 123"
        assert error.error_type == "NOT_FOUND"
        assert error.status_code == status.HTTP_404_NOT_FOUND
        assert error.details == {"resource_type": "User", "resource_id": "123"}


@pytest.mark.unit
class TestAuthorizationError:
    """Test AuthorizationError class"""
    
    def test_authorization_error_creation(self):
        """Test creating AuthorizationError with default message"""
        error = AuthorizationError()
        assert error.message == "Unauthorized access"
        assert error.error_type == "AUTHORIZATION_ERROR"
        assert error.status_code == status.HTTP_403_FORBIDDEN
    
    def test_authorization_error_with_custom_message(self):
        """Test creating AuthorizationError with custom message"""
        error = AuthorizationError("Custom unauthorized message")
        assert error.message == "Custom unauthorized message"


@pytest.mark.unit
class TestHandleException:
    """Test handle_exception function"""
    
    def test_handle_app_error(self):
        """Test handling AppError"""
        error = AppError("Test error", status_code=400)
        http_exception = handle_exception(error, log_error=False)
        
        assert isinstance(http_exception, HTTPException)
        assert http_exception.status_code == 400
        assert "error" in http_exception.detail
        assert http_exception.detail["error"]["type"] == "APPLICATION_ERROR"
        assert http_exception.detail["error"]["message"] == "Test error"
    
    def test_handle_validation_error(self):
        """Test handling ValidationError"""
        error = ValidationError("Invalid input", {"field": "email"})
        http_exception = handle_exception(error, log_error=False)
        
        assert http_exception.status_code == status.HTTP_400_BAD_REQUEST
        assert http_exception.detail["error"]["type"] == "VALIDATION_ERROR"
        assert http_exception.detail["error"]["details"] == {"field": "email"}
    
    def test_handle_not_found_error(self):
        """Test handling NotFoundError"""
        error = NotFoundError("User", "123")
        http_exception = handle_exception(error, log_error=False)
        
        assert http_exception.status_code == status.HTTP_404_NOT_FOUND
        assert http_exception.detail["error"]["type"] == "NOT_FOUND"
    
    def test_handle_authorization_error(self):
        """Test handling AuthorizationError"""
        error = AuthorizationError()
        http_exception = handle_exception(error, log_error=False)
        
        assert http_exception.status_code == status.HTTP_403_FORBIDDEN
        assert http_exception.detail["error"]["type"] == "AUTHORIZATION_ERROR"
    
    def test_handle_http_exception(self):
        """Test handling HTTPException (re-raise as-is)"""
        original_error = HTTPException(
            status_code=404,
            detail="Not found"
        )
        http_exception = handle_exception(original_error, log_error=False)
        
        # Should return the same exception
        assert http_exception is original_error
        assert http_exception.status_code == 404
    
    def test_handle_unexpected_error(self):
        """Test handling unexpected errors"""
        error = ValueError("Unexpected error")
        http_exception = handle_exception(error, log_error=False)
        
        assert isinstance(http_exception, HTTPException)
        assert http_exception.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert http_exception.detail["error"]["type"] == "INTERNAL_SERVER_ERROR"
        assert "request_id" in http_exception.detail
    
    def test_handle_exception_with_context(self):
        """Test handling exception with additional context"""
        error = AppError("Test error")
        context = {"user_id": "123", "action": "test"}
        http_exception = handle_exception(error, context=context, log_error=False)
        
        assert http_exception.status_code == 500
        assert "request_id" in http_exception.detail
    
    def test_handle_exception_with_request_id(self):
        """Test handling exception with request_id in context"""
        # Set request_id in context
        request_id_var.set("test-request-id")
        try:
            error = AppError("Test error")
            http_exception = handle_exception(error, log_error=False)
            
            assert http_exception.detail["request_id"] == "test-request-id"
        finally:
            request_id_var.set(None)
    
    @patch('app.utils.error_handler.logger')
    def test_handle_http_exception_with_logging(self, mock_logger):
        """Test handling HTTPException with logging enabled"""
        original_error = HTTPException(
            status_code=404,
            detail="Not found"
        )
        http_exception = handle_exception(original_error, log_error=True)
        
        # Should log warning
        mock_logger.warning.assert_called_once()
        assert http_exception is original_error
    
    @patch('app.utils.error_handler.logger')
    def test_handle_unexpected_error_with_logging(self, mock_logger):
        """Test handling unexpected error with logging enabled"""
        error = ValueError("Unexpected error")
        http_exception = handle_exception(error, log_error=True)
        
        # Should log error with traceback
        mock_logger.error.assert_called_once()
        assert http_exception.status_code == 500
    
    @patch('app.utils.error_handler.logger')
    @patch('app.core.config.settings')
    def test_handle_unexpected_error_debug_mode(self, mock_settings, mock_logger):
        """Test handling unexpected error in debug mode includes traceback"""
        mock_settings.DEBUG = True
        error = ValueError("Unexpected error")
        http_exception = handle_exception(error, log_error=True)
        
        # Should include traceback in error message in debug mode
        assert http_exception.status_code == 500
        mock_logger.error.assert_called_once()


@pytest.mark.unit
class TestSafeExecute:
    """Test safe_execute function"""
    
    def test_safe_execute_success(self):
        """Test successful execution"""
        def func():
            return "success"
        
        result = safe_execute(func, "Operation failed")
        assert result == "success"
    
    def test_safe_execute_with_app_error(self):
        """Test execution that raises AppError (should re-raise)"""
        def func():
            raise ValidationError("Invalid input")
        
        with pytest.raises(ValidationError):
            safe_execute(func, "Operation failed")
    
    def test_safe_execute_with_exception_and_default_return(self):
        """Test execution that raises exception with default_return"""
        def func():
            raise ValueError("Error occurred")
        
        result = safe_execute(
            func,
            "Operation failed",
            default_return="default_value"
        )
        assert result == "default_value"
    
    def test_safe_execute_with_exception_no_default(self):
        """Test execution that raises exception without default_return"""
        def func():
            raise ValueError("Error occurred")
        
        with pytest.raises(AppError) as exc_info:
            safe_execute(func, "Operation failed")
        
        assert exc_info.value.message == "Operation failed"
        assert "original_error" in exc_info.value.details
    
    def test_safe_execute_with_context(self):
        """Test execution with context"""
        def func():
            raise ValueError("Error occurred")
        
        context = {"user_id": "123"}
        result = safe_execute(
            func,
            "Operation failed",
            context=context,
            default_return="default"
        )
        assert result == "default"
    
    def test_safe_execute_with_lambda(self):
        """Test execution with lambda function"""
        result = safe_execute(
            lambda: 42,
            "Operation failed"
        )
        assert result == 42

