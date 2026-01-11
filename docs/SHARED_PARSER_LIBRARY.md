# Shared Parser Library

## Overview

The Shared Parser Library (`app.services.parsers`) is the **single source of truth** for all parsing logic in the application. This library consolidates all profile analysis, recommendation, and stream parsing functionality to ensure consistency across the codebase.

## Why Shared Parser Library?

**Problem**: Parsing logic was duplicated across multiple files:
- `profile_analysis_utils.py` - Profile JSON parsing
- `text_cleaner.py` - Profile JSON extraction
- `recommendation_parser.py` - Recommendation/idea parsing
- `splitProfileAndRecommendations.js` (frontend) - Stream splitting
- Inline parsing in `final_recommendation_service.py`, `stage2_service.py`, etc.

**Solution**: Centralize all parsing logic in a single library with a consistent interface.

## Architecture

```
app/services/parsers/
├── __init__.py          # Main exports
├── profile_parser.py    # Profile analysis parsing
├── recommendation_parser.py  # Recommendation/idea parsing
└── stream_parser.py     # Stream text splitting
```

## Parser Classes

### ProfileParser

Single source of truth for profile analysis JSON parsing.

**Methods:**
- `extract_json(text: str) -> Optional[Dict[str, Any]]` - Extract profile JSON from delimited text
- `parse_response(raw_response: str) -> Dict[str, Any]` - Parse and validate LLM response
- `clean_and_wrap(text: str) -> str` - Clean and wrap profile JSON with delimiters
- `wrap(json_obj: Dict[str, Any]) -> str` - Wrap profile JSON in delimiters
- `extract_json_string(text: str) -> str` - Extract JSON string without parsing

**Example:**
```python
from app.services.parsers.profile_parser import ProfileParser

# Extract JSON from delimited text
profile_data = ProfileParser.extract_json(streamed_text)

# Parse LLM response (with validation)
profile_data = ProfileParser.parse_response(llm_response)

# Wrap JSON for output
wrapped = ProfileParser.wrap(profile_data)
```

### RecommendationParser

Single source of truth for recommendation/idea parsing.

**Methods:**
- `parse_recommendations(text: str) -> List[Dict[str, Any]]` - Parse recommendations from IDEA_X format
- `format_recommendations_for_frontend(recommendations: List[Dict]) -> str` - Format for frontend display

**Example:**
```python
from app.services.parsers.recommendation_parser import RecommendationParser

# Parse recommendations from text
recommendations = RecommendationParser.parse_recommendations(llm_output)

# Format for frontend (markdown fallback)
markdown = RecommendationParser.format_recommendations_for_frontend(recommendations)
```

### StreamParser

Single source of truth for streamed text splitting.

**Methods:**
- `split_profile_and_recommendations(text: str) -> Dict[str, str]` - Split stream into profile/recommendations
- `extract_profile_section(text: str) -> str` - Extract only profile section
- `extract_recommendations_section(text: str) -> str` - Extract only recommendations section
- `has_profile_markers(text: str) -> bool` - Check for profile markers
- `has_recommendation_markers(text: str) -> bool` - Check for recommendation markers

**Example:**
```python
from app.services.parsers.stream_parser import StreamParser

# Split streamed text
result = StreamParser.split_profile_and_recommendations(streamed_text)
profile = result["profile_analysis"]
recommendations = result["recommendations"]
```

## Backward Compatibility

All existing imports continue to work through backward-compatible wrappers:

- `app.services.recommendation_parser.RecommendationParser` → redirects to shared library
- `app.services.profile_analysis.profile_analysis_utils` → uses shared library internally
- `app.utils.text_cleaner.extract_profile_json` → uses shared library internally

**Migration**: Existing code continues to work, but new code should import from `app.services.parsers` directly.

## Frontend Contract

Since frontend and backend are different languages, the frontend should follow the same contract:

### ProfileParser Contract (JavaScript)

```javascript
// Extract JSON from delimited text
function extractProfileJSON(text) {
  // Same logic as ProfileParser.extract_json()
  // Returns: Object | null
}

// Wrap JSON in delimiters
function wrapProfileJSON(jsonObj) {
  // Same logic as ProfileParser.wrap()
  // Returns: string
}
```

### RecommendationParser Contract (JavaScript)

```javascript
// Parse recommendations from IDEA_X format
function parseRecommendations(text) {
  // Same logic as RecommendationParser.parse_recommendations()
  // Returns: Array<Object>
}
```

### StreamParser Contract (JavaScript)

```javascript
// Split profile and recommendations
function splitProfileAndRecommendations(text) {
  // Same logic as StreamParser.split_profile_and_recommendations()
  // Returns: { profileAnalysis: string, recommendations: string }
}
```

## Benefits

1. **Single Source of Truth**: All parsing logic in one place
2. **Consistency**: Same parsing behavior across all services
3. **Maintainability**: Fix bugs once, benefits everywhere
4. **Testability**: Test parsing logic independently
5. **Documentation**: Clear interface and contract
6. **Backward Compatible**: Existing code continues to work

## Usage Guidelines

### ✅ DO

- Use parsers from `app.services.parsers` in new code
- Import directly: `from app.services.parsers.profile_parser import ProfileParser`
- Follow the same contract in frontend JavaScript
- Test parsing logic independently

### ❌ DON'T

- Duplicate parsing logic in other files
- Parse inline without using the shared library
- Bypass the shared library for "quick fixes"
- Create new parsing functions outside the library

## Future Enhancements

The shared parser library enables future improvements:

- **Schema Validation** (#5): Add validation layer using shared parsers
- **Versioned Parsing** (#8): Handle format changes over time
- **Fallback Chain** (#7): Better error handling with explicit states
- **Contract Testing** (#10): Test parsing contracts across frontend/backend

## Migration Checklist

- [x] Create shared parser library structure
- [x] Implement ProfileParser
- [x] Implement RecommendationParser  
- [x] Implement StreamParser
- [x] Update backend services to use shared library
- [x] Maintain backward compatibility
- [ ] Document frontend contract
- [ ] Update frontend to follow same contract
- [ ] Add contract tests

## Related Solutions

This is Solution #2: Shared Parser Library from the robustness improvements:
- #1: Structured Streaming (format change)
- #2: Shared Parser Library ✅ (this solution)
- #3: Two-Phase Extraction (process change)
- #5: Schema Validation (validation layer)
- #7: Fallback Chain (error handling)
- #8: Versioned Parsing (evolution)
- #10: Contract Testing (quality)

