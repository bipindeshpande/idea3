# Migration and Parallel Execution Implementation

## PostgreSQL JSONB Migration

All database models have been updated to use PostgreSQL-specific features:

### Changes Made

1. **Run Model** (`app/models/run.py`):
   - Changed `inputs` from `JSON` to `JSONB`
   - Changed `reports` from `JSON` to `JSONB`
   - Changed `run_id` and `user_id` from `String(36)` to `UUID` type

2. **User Model** (`app/models/user.py`):
   - Changed `preferences` from `Text` (JSON string) to `JSONB`
   - Changed `user_id` from `String(36)` to `UUID` type

3. **CacheEntry Model** (`app/models/cache_entry.py`):
   - Changed `cache_value` from `Text` (JSON string) to `JSONB`

4. **CacheService** (`app/services/cache_service.py`):
   - Updated to work with JSONB (pass dicts directly, no json.loads needed)
   - JSONB columns automatically handle Python dict conversion

### Benefits of JSONB

- **Better Performance**: JSONB is stored in binary format, faster queries
- **Indexing**: Can create GIN indexes on JSONB columns for fast searches
- **Native Operations**: PostgreSQL provides rich JSONB operators and functions
- **Type Safety**: Better validation and structure

## Initial Migration File

Created `migrations/versions/001_initial_migration.py` with:
- All three tables (users, runs, cache_entries)
- Proper JSONB column definitions
- UUID types for primary/foreign keys
- All indexes and constraints
- Upgrade and downgrade functions

### To Apply Migration

```bash
# When Alembic is installed
alembic upgrade head
```

Or manually run the SQL from the migration file.

## Parallel Execution Implementation

### DiscoveryService Updates

The `_run_parallel_pipeline()` method now uses `ThreadPoolExecutor` with proper future handling:

1. **Stage 1**: `ProfileAnalysisService.run()` - Profile analysis
2. **Stage 2 Preprocessing**: `ToolService.load_or_execute()` - Load static blocks and execute dynamic tools

### Key Features

- **ThreadPoolExecutor**: Uses 2 workers for parallel execution
- **Future Completion**: Uses `as_completed()` to handle futures as they finish
- **Timeout Handling**: Both tasks have a configurable timeout (STAGE1_TIMEOUT)
- **Error Handling**: 
  - Profile analysis failure raises exception (critical)
  - Tool preprocessing failure is logged but doesn't block pipeline (graceful degradation)
- **Completion Verification**: Ensures both futures complete before proceeding to Stage 2

### Method Signatures

**ProfileAnalysisService.run()**:
```python
def run(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """Run profile analysis (alias for analyze_profile)"""
    return self.analyze_profile(inputs)
```

**ToolService.load_or_execute()**:
```python
def load_or_execute(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """Load static blocks and execute dynamic tools"""
    return self.preprocess_tools(inputs)
```

### Execution Flow

```
┌─────────────────────────────────────────┐
│  ThreadPoolExecutor (max_workers=2)    │
│  ┌──────────────────┐  ┌──────────────┐ │
│  │ ProfileService   │  │ ToolService  │ │
│  │ .run()           │  │ .load_or_    │ │
│  │                  │  │ execute()    │ │
│  └────────┬─────────┘  └──────┬────────┘ │
│           │                   │          │
│           └─────────┬──────────┘          │
│                     │                     │
│         as_completed() waits for both      │
└─────────────────────┼─────────────────────┘
                      │
                      ▼
         Both futures completed
                      │
                      ▼
         Validate results
                      │
                      ▼
         Start Stage 2 (prompt building)
```

### Configuration

Parallel execution is controlled by:
- `PARALLEL_EXECUTION`: Boolean flag (default: True)
- `STAGE1_TIMEOUT`: Timeout in seconds for Stage 1 + tools (default: 60)

## Testing

To test the parallel execution:

1. Set `PARALLEL_EXECUTION=True` in `.env`
2. Make a request to `/api/run`
3. Check logs for:
   - "Stage 1 (Profile Analysis) completed"
   - "Tool preprocessing completed"
   - "Both Stage 1 and tool preprocessing completed, starting Stage 2"

The pipeline will only proceed to Stage 2 after both parallel tasks complete successfully (or tool preprocessing fails gracefully).

