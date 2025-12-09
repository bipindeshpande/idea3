# Backend v2 - Startup Discovery SaaS

Clean architecture backend for the Startup Discovery SaaS application.

## Architecture

### Services

- **DiscoveryService**: Main orchestration service that coordinates the entire pipeline
- **ProfileAnalysisService**: Stage 1 - Analyzes user profile from intake form
- **ToolService**: Manages static blocks and dynamic tools
- **PromptBuilder**: Builds prompts for Stage 2 (recommendations)
- **LLMService**: Wrapper for OpenAI and Claude APIs
- **CacheService**: Redis + Database-backed caching
- **ResultAssembler**: Extracts and structures outputs

### Pipeline Flow

1. **Stage 1 (Profile Analysis)** + **Tool Preprocessing** (parallel execution)
   - ProfileAnalysisService analyzes user inputs
   - ToolService preprocesses static blocks and dynamic tools
   
2. **Stage 2 (Recommendations)**
   - PromptBuilder creates comprehensive prompt using Stage 1 output
   - LLMService generates personalized recommendations
   - ResultAssembler structures the final output

### Database Models

- **Run**: Stores discovery runs with inputs and outputs
- **User**: User accounts and authentication
- **CacheEntry**: Database-backed cache entries

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database**:
   ```bash
   # Create PostgreSQL database
   createdb startup_discovery
   
   # Run migrations (when available)
   alembic upgrade head
   ```

4. **Start Redis** (optional, for caching):
   ```bash
   redis-server
   ```

5. **Run the application**:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### POST /api/run
Create a new discovery run.

**Request Body**:
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
    "profile_analysis": "...",
    "personalized_recommendations": "...",
    "inputs": {...}
  }
}
```

### GET /api/user/run/{run_id}
Get a discovery run by ID.

## Configuration

See `.env.example` for all configuration options.

Key settings:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string (optional)
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`: LLM provider API keys
- `DEFAULT_LLM_PROVIDER`: "openai" or "anthropic"
- `PARALLEL_EXECUTION`: Enable parallel Stage 1 + tool preprocessing

## Development

### Project Structure

```
backend_v2/
├── app/
│   ├── api/
│   │   └── routes/
│   │       └── discovery.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── redis_client.py
│   ├── models/
│   │   ├── run.py
│   │   ├── user.py
│   │   └── cache_entry.py
│   ├── services/
│   │   ├── discovery_service.py
│   │   ├── profile_analysis_service.py
│   │   ├── tool_service.py
│   │   ├── prompt_builder.py
│   │   ├── llm_service.py
│   │   ├── cache_service.py
│   │   └── result_assembler.py
│   ├── tools/
│   │   ├── static_blocks/
│   │   └── dynamic/
│   └── main.py
├── migrations/
├── tests/
├── requirements.txt
└── README.md
```

## Testing

```bash
pytest
```

## Notes

- The pipeline supports parallel execution of Stage 1 and tool preprocessing for better performance
- Caching is implemented with Redis (primary) and database (fallback)
- All services are designed to be testable and maintainable
- The architecture supports easy addition of new tools and services

