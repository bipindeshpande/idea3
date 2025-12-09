# Backend v2 Architecture

## Overview

This backend implements a clean, service-based architecture for the Startup Discovery SaaS. The pipeline supports parallel execution, caching, and structured outputs.

## Service Layer

### 1. DiscoveryService (Orchestration)
**Location**: `app/services/discovery_service.py`

Main orchestrator that coordinates the entire discovery pipeline:
- Creates/updates Run records
- Executes Stage 1 (Profile Analysis) and tool preprocessing in parallel
- Executes Stage 2 (Recommendations) after Stage 1 completes
- Assembles and validates final outputs

**Key Methods**:
- `run_discovery()`: Main entry point
- `_run_parallel_pipeline()`: Parallel execution path
- `_run_sequential_pipeline()`: Sequential execution path
- `_run_stage2()`: Stage 2 execution

### 2. ProfileAnalysisService (Stage 1)
**Location**: `app/services/profile_analysis_service.py`

Analyzes user profile from intake form inputs:
- Builds profile analysis prompt
- Calls LLM to generate analysis
- Caches results
- Returns markdown-formatted profile analysis

**Key Methods**:
- `analyze_profile()`: Main analysis method
- `_build_profile_prompt()`: Constructs prompt from inputs
- `_generate_cache_key()`: Creates cache key

### 3. ToolService
**Location**: `app/services/tool_service.py`

Manages static blocks and dynamic tools:
- Loads static content blocks from JSON files
- Executes dynamic tools based on definitions
- Preprocesses tools in parallel with Stage 1
- Caches tool results

**Key Methods**:
- `load_static_blocks()`: Load all static blocks
- `get_static_block()`: Get specific block by ID
- `execute_dynamic_tool()`: Execute a dynamic tool
- `preprocess_tools()`: Preprocess all relevant tools

### 4. PromptBuilder
**Location**: `app/services/prompt_builder.py`

Builds comprehensive prompts for Stage 2:
- Combines profile analysis, inputs, and tool results
- Structures prompt with clear sections
- Includes static blocks and dynamic tool outputs
- Provides system prompt for LLM

**Key Methods**:
- `build_recommendations_prompt()`: Main prompt builder
- `build_system_prompt()`: System prompt for Stage 2

### 5. LLMService
**Location**: `app/services/llm_service.py`

Wrapper for OpenAI and Claude APIs:
- Supports both providers
- Handles structured outputs (JSON mode)
- Manages API keys and configuration
- Returns usage statistics

**Key Methods**:
- `generate()`: Generate text from prompt
- `generate_structured()`: Generate structured JSON output
- `_generate_openai()`: OpenAI implementation
- `_generate_anthropic()`: Anthropic implementation

### 6. CacheService
**Location**: `app/services/cache_service.py`

Dual-layer caching (Redis + Database):
- Primary: Redis for fast access
- Fallback: Database for persistence
- TTL management
- Automatic expiration cleanup

**Key Methods**:
- `get()`: Retrieve cached value
- `set()`: Store value in cache
- `delete()`: Remove from cache
- `clear_expired()`: Cleanup expired entries

### 7. ResultAssembler
**Location**: `app/services/result_assembler.py`

Extracts and structures outputs:
- Assembles final output dictionary
- Extracts individual ideas from markdown
- Parses recommendation matrix
- Validates output quality

**Key Methods**:
- `assemble_outputs()`: Create final output structure
- `extract_ideas()`: Parse ideas from markdown
- `extract_matrix()`: Extract comparison matrix
- `validate_output()`: Validate output quality

## Database Models

### Run Model
**Location**: `app/models/run.py`

Stores discovery run data:
- `run_id`: UUID primary key
- `user_id`: Foreign key to User
- `inputs`: JSON intake form responses
- `reports`: JSON complete reports
- `profile_analysis`: Text Stage 1 output
- `personalized_recommendations`: Text Stage 2 output
- `status`: pending/processing/completed/failed
- Timestamps: created_at, updated_at, completed_at

### User Model
**Location**: `app/models/user.py`

User accounts:
- `user_id`: UUID primary key
- `email`: Unique email address
- `hashed_password`: Password hash
- `subscription_type`: free/pro/weekly
- Authentication and profile fields

### CacheEntry Model
**Location**: `app/models/cache_entry.py`

Database-backed cache:
- `cache_key_hash`: SHA256 hash of key
- `cache_key`: Original key (for debugging)
- `cache_value`: JSON string value
- `cache_type`: profile/recommendations/tools
- `expires_at`: Expiration timestamp

## Pipeline Flow

### Parallel Execution Path (Default)

```
┌─────────────────────────────────────────┐
│  POST /api/run                          │
│  (DiscoveryService.run_discovery)       │
└──────────────┬──────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Create Run Record    │
    │  (status: processing) │
    └──────────┬────────────┘
               │
               ▼
    ┌─────────────────────────────────────┐
    │  PARALLEL EXECUTION                 │
    │  ┌──────────────┐  ┌──────────────┐ │
    │  │ Stage 1:     │  │ Tool        │ │
    │  │ Profile      │  │ Preprocess  │ │
    │  │ Analysis     │  │             │ │
    │  └──────┬───────┘  └──────┬───────┘ │
    │         │                  │         │
    └─────────┼──────────────────┼─────────┘
              │                  │
              ▼                  ▼
    ┌─────────────────────────────────────┐
    │  Stage 2: Recommendations           │
    │  (Uses Stage 1 output + tools)      │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │  Assemble & Validate Outputs        │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │  Update Run Record                  │
    │  (status: completed)                 │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │  Return Results                     │
    └─────────────────────────────────────┘
```

## API Endpoints

### POST /api/run
Create a new discovery run.

**Request**:
```json
{
  "goal_type": "Extra Income",
  "time_commitment": "<5 hrs/week",
  "budget_range": "< $1 K",
  "interest_area": "AI / Automation",
  "sub_interest_area": "Chatbots",
  "work_style": "Solo",
  "skill_strength": "Technical / Automation",
  "experience_summary": "5 years in software development"
}
```

**Response**:
```json
{
  "success": true,
  "run_id": "uuid-here",
  "outputs": {
    "profile_analysis": "## Profile Analysis...",
    "personalized_recommendations": "## Recommendations...",
    "inputs": {...}
  }
}
```

### GET /api/user/run/{run_id}
Retrieve a discovery run by ID.

## Configuration

All configuration is managed through environment variables (see `.env.example`):

- **Database**: PostgreSQL connection string
- **Redis**: Optional Redis URL for caching
- **LLM**: OpenAI and/or Anthropic API keys
- **Pipeline**: Timeouts, parallel execution settings
- **Cache**: TTL values for different cache types

## Caching Strategy

1. **Profile Analysis**: Cached by input hash (1 hour TTL)
2. **Recommendations**: Cached by profile + inputs (2 hours TTL)
3. **Tools**: Cached by tool name + inputs (24 hours TTL)

Cache layers:
1. Redis (primary) - fast in-memory access
2. Database (fallback) - persistent storage

## Error Handling

- All services log errors with context
- Run records track status and error messages
- Failed runs can be retried
- Tool failures don't block pipeline (graceful degradation)

## Extensibility

### Adding New Tools

1. Create tool definition JSON in `app/tools/dynamic/`
2. Implement tool execution logic in `ToolService._execute_tool()`
3. Tool will be automatically discovered and available

### Adding New Services

1. Extend `BaseService`
2. Inject dependencies (db, redis) via constructor
3. Use existing services as needed
4. Register in `DiscoveryService` if part of pipeline

### Adding New LLM Providers

1. Add provider client initialization in `LLMService.__init__()`
2. Implement `_generate_{provider}()` method
3. Update `generate()` to route to new provider

## Testing Strategy

- Unit tests for each service
- Integration tests for pipeline
- Mock LLM responses for testing
- Test cache behavior (Redis + DB fallback)

## Performance Considerations

- Parallel execution reduces total pipeline time
- Caching reduces redundant LLM calls
- Database indexes on frequently queried fields
- Connection pooling for database and Redis

