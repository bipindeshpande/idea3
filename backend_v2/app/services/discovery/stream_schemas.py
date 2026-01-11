"""
Schema models for structured streaming format (JSON lines/NDJSON).

Each chunk is a JSON object with a type field indicating what kind of data it contains.
This makes parsing robust and format-agnostic.
"""
from typing import Dict, Any, List, Optional, Literal
import json
from enum import Enum
from pydantic import BaseModel, Field, ValidationError, ConfigDict


class StreamChunkType(str, Enum):
    """Types of stream chunks"""
    METADATA = "metadata"
    PROFILE_START = "profile_start"
    PROFILE_CHUNK = "profile_chunk"
    PROFILE_END = "profile_end"
    RECOMMENDATION_START = "recommendation_start"
    RECOMMENDATION_CHUNK = "recommendation_chunk"
    RECOMMENDATION_END = "recommendation_end"
    ERROR = "error"
    COMPLETE = "complete"


# Pydantic Models for Schema Validation

class BaseChunk(BaseModel):
    """Base chunk model - children classes override type with Literal for strict validation"""
    type: str
    
    model_config = ConfigDict(extra="forbid")  # Reject extra fields in Pydantic v2


class MetadataChunk(BaseChunk):
    """Metadata chunk schema"""
    type: Literal["metadata"] = "metadata"
    version: str = Field(default="1.0", description="Schema version")
    sections: List[str] = Field(default_factory=lambda: ["profile", "recommendations"], description="Expected sections")


class ProfileStartChunk(BaseChunk):
    """Profile section start marker"""
    type: Literal["profile_start"] = "profile_start"


class ProfileChunk(BaseChunk):
    """Profile text chunk schema"""
    type: Literal["profile_chunk"] = "profile_chunk"
    text: str = Field(..., description="Profile text content")


class ProfileEndChunk(BaseChunk):
    """Profile section end marker"""
    type: Literal["profile_end"] = "profile_end"


class RecommendationStartChunk(BaseChunk):
    """Recommendation section start marker"""
    type: Literal["recommendation_start"] = "recommendation_start"


class RecommendationChunk(BaseChunk):
    """Recommendation text chunk schema"""
    type: Literal["recommendation_chunk"] = "recommendation_chunk"
    text: str = Field(..., description="Recommendation text content")


class RecommendationEndChunk(BaseChunk):
    """Recommendation section end marker"""
    type: Literal["recommendation_end"] = "recommendation_end"


class ErrorChunk(BaseChunk):
    """Error chunk schema"""
    type: Literal["error"] = "error"
    message: str = Field(..., description="Error message")
    details: Dict[str, Any] = Field(default_factory=dict, description="Additional error details")


class CompleteChunk(BaseChunk):
    """Completion marker"""
    type: Literal["complete"] = "complete"


class StreamChunk:
    """Base class for stream chunks"""
    
    @staticmethod
    def create_metadata(version: str = "1.0", sections: List[str] = None) -> str:
        """Create metadata chunk"""
        chunk = {
            "type": StreamChunkType.METADATA.value,
            "version": version,
            "sections": sections or ["profile", "recommendations"]
        }
        return json.dumps(chunk) + "\n"
    
    @staticmethod
    def create_profile_start() -> str:
        """Create profile section start marker"""
        chunk = {
            "type": StreamChunkType.PROFILE_START.value
        }
        return json.dumps(chunk) + "\n"
    
    @staticmethod
    def create_profile_chunk(text: str) -> str:
        """Create profile text chunk"""
        chunk = {
            "type": StreamChunkType.PROFILE_CHUNK.value,
            "text": text
        }
        return json.dumps(chunk) + "\n"
    
    @staticmethod
    def create_profile_end() -> str:
        """Create profile section end marker"""
        chunk = {
            "type": StreamChunkType.PROFILE_END.value
        }
        return json.dumps(chunk) + "\n"
    
    @staticmethod
    def create_recommendation_start() -> str:
        """Create recommendation section start marker"""
        chunk = {
            "type": StreamChunkType.RECOMMENDATION_START.value
        }
        return json.dumps(chunk) + "\n"
    
    @staticmethod
    def create_recommendation_chunk(text: str) -> str:
        """Create recommendation text chunk"""
        chunk = {
            "type": StreamChunkType.RECOMMENDATION_CHUNK.value,
            "text": text
        }
        return json.dumps(chunk) + "\n"
    
    @staticmethod
    def create_recommendation_end() -> str:
        """Create recommendation section end marker"""
        chunk = {
            "type": StreamChunkType.RECOMMENDATION_END.value
        }
        return json.dumps(chunk) + "\n"
    
    @staticmethod
    def create_error(message: str, details: Optional[Dict[str, Any]] = None) -> str:
        """Create error chunk"""
        chunk = {
            "type": StreamChunkType.ERROR.value,
            "message": message,
            "details": details or {}
        }
        return json.dumps(chunk) + "\n"
    
    @staticmethod
    def create_complete() -> str:
        """Create completion marker"""
        chunk = {
            "type": StreamChunkType.COMPLETE.value
        }
        return json.dumps(chunk) + "\n"
    
    @staticmethod
    def parse_chunk(line: str) -> Optional[Dict[str, Any]]:
        """Parse a single JSON line chunk"""
        line = line.strip()
        if not line:
            return None
        
        try:
            return json.loads(line)
        except json.JSONDecodeError:
            return None
    
    @staticmethod
    def validate_chunk(chunk: Dict[str, Any]) -> tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Validate chunk structure using Pydantic models.
        
        Returns:
            Tuple of (is_valid, error_message, validated_data)
            - is_valid: True if chunk is valid
            - error_message: Error message if validation failed, None otherwise
            - validated_data: Validated and normalized chunk data, None if invalid
        """
        if not isinstance(chunk, dict):
            return False, "Chunk must be a dictionary", None
        
        chunk_type = chunk.get("type")
        if not chunk_type:
            return False, "Missing 'type' field", None
        
        # Map chunk type to Pydantic model
        chunk_type_models = {
            StreamChunkType.METADATA.value: MetadataChunk,
            StreamChunkType.PROFILE_START.value: ProfileStartChunk,
            StreamChunkType.PROFILE_CHUNK.value: ProfileChunk,
            StreamChunkType.PROFILE_END.value: ProfileEndChunk,
            StreamChunkType.RECOMMENDATION_START.value: RecommendationStartChunk,
            StreamChunkType.RECOMMENDATION_CHUNK.value: RecommendationChunk,
            StreamChunkType.RECOMMENDATION_END.value: RecommendationEndChunk,
            StreamChunkType.ERROR.value: ErrorChunk,
            StreamChunkType.COMPLETE.value: CompleteChunk,
        }
        
        model_class = chunk_type_models.get(chunk_type)
        if not model_class:
            valid_types = ", ".join([e.value for e in StreamChunkType])
            return False, f"Invalid chunk type: {chunk_type}. Must be one of: {valid_types}", None
        
        try:
            # Validate and normalize chunk using Pydantic
            validated = model_class(**chunk)
            return True, None, validated.model_dump()
        except ValidationError as e:
            # Extract validation errors
            errors = []
            for error in e.errors():
                field = " -> ".join(str(x) for x in error.get("loc", []))
                msg = error.get("msg", "Validation error")
                errors.append(f"{field}: {msg}")
            error_message = "; ".join(errors)
            return False, error_message, None


class StreamAccumulator:
    """Accumulates stream chunks and extracts sections"""
    
    def __init__(self):
        self.metadata = None
        self.profile_text = []
        self.recommendation_text = []
        self.errors = []
        self.current_section = None
        self.profile_complete = False
        self.recommendation_complete = False
    
    def add_chunk(self, chunk_data: Dict[str, Any], auto_fix: bool = True) -> tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """
        Add and validate a chunk using Pydantic validation.
        
        Args:
            chunk_data: Raw chunk dictionary to validate and add
            auto_fix: If True, attempt to auto-fix common validation issues
        
        Returns:
            Tuple of (success, error_message, validated_data)
            - success: True if chunk was added successfully
            - error_message: Error message if validation/processing failed, None otherwise
            - validated_data: Validated and normalized chunk data, None if failed
        """
        # Validate chunk using Pydantic
        is_valid, error_message, validated_data = StreamChunk.validate_chunk(chunk_data)
        
        if not is_valid:
            # Try auto-fix if enabled
            if auto_fix:
                fixed_data = StreamAccumulator._auto_fix_chunk(chunk_data)
                if fixed_data:
                    is_valid, error_message, validated_data = StreamChunk.validate_chunk(fixed_data)
            
            if not is_valid:
                self.errors.append({
                    "type": "validation_error",
                    "chunk": chunk_data,
                    "error": error_message
                })
                return False, error_message, None
        
        # Use validated data (may be normalized by Pydantic)
        chunk_to_process = validated_data or chunk_data
        chunk_type = chunk_to_process.get("type")
        
        if chunk_type == StreamChunkType.METADATA.value:
            self.metadata = chunk_to_process
        elif chunk_type == StreamChunkType.PROFILE_START.value:
            self.current_section = "profile"
            self.profile_text = []
        elif chunk_type == StreamChunkType.PROFILE_CHUNK.value:
            if self.current_section == "profile":
                self.profile_text.append(chunk_to_process.get("text", ""))
        elif chunk_type == StreamChunkType.PROFILE_END.value:
            self.profile_complete = True
            self.current_section = None
        elif chunk_type == StreamChunkType.RECOMMENDATION_START.value:
            self.current_section = "recommendation"
            self.recommendation_text = []
        elif chunk_type == StreamChunkType.RECOMMENDATION_CHUNK.value:
            if self.current_section == "recommendation":
                self.recommendation_text.append(chunk_to_process.get("text", ""))
        elif chunk_type == StreamChunkType.RECOMMENDATION_END.value:
            self.recommendation_complete = True
            self.current_section = None
        elif chunk_type == StreamChunkType.ERROR.value:
            self.errors.append(chunk_to_process)
        elif chunk_type == StreamChunkType.COMPLETE.value:
            pass  # Just a marker
        
        return True, None, chunk_to_process
    
    def get_profile(self) -> str:
        """Get accumulated profile text"""
        return "".join(self.profile_text)
    
    def get_recommendations(self) -> str:
        """Get accumulated recommendation text"""
        return "".join(self.recommendation_text)
    
    def is_complete(self) -> bool:
        """Check if both sections are complete"""
        return self.profile_complete and self.recommendation_complete
    
    def has_errors(self) -> bool:
        """Check if there are any errors"""
        return len(self.errors) > 0
    
    @staticmethod
    def _auto_fix_chunk(chunk: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Attempt to auto-fix common validation issues.
        
        Args:
            chunk: Raw chunk dictionary
        
        Returns:
            Fixed chunk dictionary, or None if can't fix
        """
        if not isinstance(chunk, dict):
            return None
        
        fixed = chunk.copy()
        chunk_type = fixed.get("type")
        
        # Fix missing required fields based on type
        if chunk_type == StreamChunkType.METADATA.value:
            if "version" not in fixed:
                fixed["version"] = "1.0"
            if "sections" not in fixed:
                fixed["sections"] = ["profile", "recommendations"]
        
        elif chunk_type in [StreamChunkType.PROFILE_CHUNK.value, StreamChunkType.RECOMMENDATION_CHUNK.value]:
            # Ensure text field is present and is string
            if "text" not in fixed:
                fixed["text"] = ""
            elif not isinstance(fixed.get("text"), str):
                fixed["text"] = str(fixed.get("text", ""))
        
        elif chunk_type == StreamChunkType.ERROR.value:
            if "message" not in fixed:
                fixed["message"] = "Unknown error"
            if "details" not in fixed:
                fixed["details"] = {}
            elif not isinstance(fixed.get("details"), dict):
                fixed["details"] = {}
        
        return fixed

