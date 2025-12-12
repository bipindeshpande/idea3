# Old Files Analysis

## Files That Can Be Safely Deleted (After Verification)

The following files in `/batch/` are **ONLY used by the batch regeneration system** and are **NOT imported by the main application**:

### Safe to Delete (if not using batch regeneration):
1. `backend_v2/batch/regenerate_industry_static_data.py`
   - **Status**: Only used for LLM-based regeneration of static files
   - **Imports**: Only imported by `batch/run_regeneration.bat`
   - **Usage**: Standalone script, not imported by app code
   - **Action**: Keep if you want LLM-based regeneration, delete if using only static engine

2. `backend_v2/batch/static_schema.py`
   - **Status**: Only imported by `regenerate_industry_static_data.py`
   - **Usage**: Schema validation for batch regeneration
   - **Action**: Keep if keeping batch regeneration, delete otherwise

3. `backend_v2/batch/run_regeneration.bat`
   - **Status**: Windows batch script for running regeneration
   - **Usage**: Manual/automated regeneration trigger
   - **Action**: Keep if using batch regeneration, delete if using only static engine

4. `backend_v2/batch/README.md`
   - **Status**: Documentation for batch system
   - **Action**: Can be deleted if not using batch regeneration

5. `backend_v2/batch/batch.log`
   - **Status**: Log file
   - **Action**: Can be deleted (will be regenerated if batch system runs)

## Files That Are Still In Use

### DO NOT DELETE:
1. `backend_v2/app/tools/static_blocks/ai.json`
   - **Status**: Still used by `ToolService` as fallback
   - **Usage**: Loaded by `tool_service.py` for Stage 2 LLM fallback
   - **Action**: Keep until static engine is fully tested and LLM fallback removed

2. `backend_v2/app/services/tool_service.py`
   - **Status**: Still used for LLM fallback path
   - **Usage**: Called by `discovery_service.py` when static engine fails
   - **Action**: Keep for fallback compatibility

## Recommendation

**Before deleting any files:**
1. Test the static engine thoroughly
2. Verify LLM fallback still works
3. Confirm no other services depend on batch files
4. Keep batch files if you want to regenerate industry data via LLM in the future

**Safe deletion order:**
1. Delete `batch.log` (can be regenerated)
2. After testing: Consider deleting batch regeneration files if not needed
3. Keep `app/tools/static_blocks/` until static engine is production-ready

