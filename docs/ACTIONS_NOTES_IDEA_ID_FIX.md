# Actions & Notes idea_id Format Fix

## Problem
Actions and notes were being created but not appearing when fetched because `idea_id` format was inconsistent across:
- Idea generation
- Frontend POST requests
- Frontend GET requests

Different formats were used (`run_{runId}_idea_{index}`, `idea_{index}`, etc.), causing strict backend filtering to return empty results.

## Solution: Canonical Format

**Canonical Format (LOCKED):**
```
{run_id}::idea_{index}
```

**Example:**
```
abc123::idea_1
```

**This format must not change.**

## Changes Applied

### Backend

#### 1. Models (`backend_v2/app/models/action.py`, `backend_v2/app/models/note.py`)
- Added contract comments documenting canonical format
- Updated field comments to reference canonical format

#### 2. Service Layer (`backend_v2/app/services/user_service.py`)

**`create_action()`:**
- ✅ Enforces canonical format (rejects invalid formats)
- ✅ Validates `idea_id` contains `::idea_`
- ✅ Raises clear `ValueError` for invalid formats
- ✅ Minimal logging (one info log per creation)
- ✅ Contract comment added

**`create_note()`:**
- ✅ Same enforcement as `create_action()`
- ✅ Minimal logging
- ✅ Contract comment added

**`get_user_actions()` and `get_user_notes()`:**
- ✅ Normalizes old format in GET requests (backward compatibility)
- ✅ Supports both old format (`run_{runId}_idea_{index}`) and canonical format
- ✅ Minimal logging (one info log when filtering)
- ✅ Contract comments added

#### 3. API Routes (`backend_v2/app/api/routes/user.py`)

**`POST /api/user/actions`:**
- ✅ Contract comment added
- ✅ Error logging only (no verbose logs)
- ✅ Clear error messages

**`POST /api/user/notes`:**
- ✅ Contract comment added
- ✅ Error logging only
- ✅ Clear error messages

### Frontend

#### 1. RecommendationDetail Component (`frontend/src/pages/discovery/RecommendationDetail.jsx`)

**ideaId Computation:**
- ✅ Uses canonical format: `{runId}::idea_{index}`
- ✅ Contract comment added
- ✅ Returns `null` if runId missing (error case)

**Validation Guard:**
- ✅ Added `isValidIdeaId` check: `ideaId && typeof ideaId === 'string' && ideaId.includes('::idea_')`
- ✅ Prevents creation when ideaId is invalid

**UI Guards:**
- ✅ "Add action" button disabled when `!isValidIdeaId`
- ✅ "Save note" button disabled when `!isValidIdeaId`
- ✅ Shows "Idea reference not ready" message when invalid
- ✅ Input fields hidden when ideaId invalid

**Handler Functions:**
- ✅ `handleCreateAction()` checks `isValidIdeaId` before API call
- ✅ `handleCreateNote()` checks `isValidIdeaId` before API call
- ✅ Contract comments added to both handlers

## Verification Steps

### End-to-End Test

1. **Create Action:**
   ```bash
   POST /api/user/actions
   {
     "idea_id": "abc123::idea_1",
     "action_text": "Research competitors",
     "status": "pending"
   }
   ```

2. **Immediately Fetch:**
   ```bash
   GET /api/user/actions?idea_id=abc123::idea_1
   ```

3. **Expected Result:**
   - Action appears in response
   - `idea_id` in DB matches exactly: `abc123::idea_1`

4. **Repeat for Notes:**
   ```bash
   POST /api/user/notes
   {
     "idea_id": "abc123::idea_1",
     "content": "Customer feedback: positive",
     "tags": []
   }
   ```

5. **Fetch Notes:**
   ```bash
   GET /api/user/notes?idea_id=abc123::idea_1
   ```

6. **Expected Result:**
   - Note appears in response
   - `idea_id` in DB matches exactly: `abc123::idea_1`

## Backward Compatibility

- **CREATE endpoints:** Strict enforcement - only canonical format accepted
- **GET endpoints:** Normalizes old format for querying (supports existing data)

This allows:
- New records use canonical format
- Old records can still be queried (normalized in GET)

## Logging

**Minimal Logging (kept):**
- One info log per create operation
- One info log per GET when filtering by idea_id
- Error logs for validation failures

**Removed:**
- Before/after count logs
- Sample idea_ids debugging logs
- Verbose parameter logging

## Contract Lock

All relevant files now include:
```python
# Canonical idea_id format: {run_id}::idea_{index}
# Example: "abc123::idea_1"
# This format must not change.
```

**Files with contract comments:**
- `backend_v2/app/models/action.py`
- `backend_v2/app/models/note.py`
- `backend_v2/app/services/user_service.py` (all 4 methods)
- `backend_v2/app/api/routes/user.py` (POST endpoints)
- `frontend/src/pages/discovery/RecommendationDetail.jsx` (ideaId computation)

## Remaining Risks

1. **Old Data in Database:**
   - Existing records may use old format (`run_{runId}_idea_{index}`)
   - GET endpoints normalize queries to handle this
   - No migration needed (format is just a string)

2. **End-to-End Testing:**
   - Need to verify create + immediate fetch works
   - Test with real run_id and idea_index

3. **Migration Check:**
   - Ensure `alembic upgrade head` has been run
   - Verify `actions` and `notes` tables exist

## Files Modified

### Backend
- `backend_v2/app/models/action.py`
- `backend_v2/app/models/note.py`
- `backend_v2/app/services/user_service.py`
- `backend_v2/app/api/routes/user.py`

### Frontend
- `frontend/src/pages/discovery/RecommendationDetail.jsx`

## Success Criteria

✅ **Canonical format enforced in CREATE**
✅ **Backward compatibility in GET**
✅ **Frontend uses canonical format**
✅ **UI guards prevent invalid submissions**
✅ **Contract comments lock the format**
✅ **Minimal logging (cleanup complete)**
✅ **Clear error messages**

## Next Steps

1. Run end-to-end test: Create action/note → immediately fetch
2. Verify DB records use canonical format
3. Monitor logs for any normalization warnings
4. Once confirmed working, consider removing backward compatibility in GET (if no old data exists)

