# Cleanup: Remove Old idea_id Format Support

## Decision
Remove backward compatibility for old idea_id formats. Only canonical format is now accepted everywhere.

## Changes Made

### Backend GET Endpoints

**`get_user_actions()` and `get_user_notes()`:**
- ✅ Removed normalization logic for old format (`run_{runId}_idea_{index}`)
- ✅ Added validation to enforce canonical format in GET requests
- ✅ Raises `ValueError` if non-canonical format provided
- ✅ Removed verbose logging

**API Routes:**
- ✅ Updated `GET /api/user/actions` to validate format and return 400 for invalid
- ✅ Updated `GET /api/user/notes` to validate format and return 400 for invalid
- ✅ Added contract comments to both endpoints
- ✅ Removed verbose logging

## Impact

### Records Using Old Format
- Records with old format (`run_{runId}_idea_{index}`) will no longer be queryable
- If any exist in database, they will effectively be orphaned
- Consider running a migration script to convert old records (if needed)

### New Records
- All new records must use canonical format: `{run_id}::idea_{index}`
- Frontend already uses canonical format
- Backend validates on both CREATE and GET

## Database Cleanup (Optional)

If you want to remove old format records, you can run:

```sql
-- Check for old format records
SELECT COUNT(*) FROM actions WHERE idea_id LIKE 'run_%_idea_%' AND idea_id NOT LIKE '%::idea_%';
SELECT COUNT(*) FROM notes WHERE idea_id LIKE 'run_%_idea_%' AND idea_id NOT LIKE '%::idea_%';

-- Delete old format records (if desired)
-- DELETE FROM actions WHERE idea_id LIKE 'run_%_idea_%' AND idea_id NOT LIKE '%::idea_%';
-- DELETE FROM notes WHERE idea_id LIKE 'run_%_idea_%' AND idea_id NOT LIKE '%::idea_%';
```

## Files Modified

- `backend_v2/app/services/user_service.py`
  - `get_user_actions()`: Removed normalization, added validation
  - `get_user_notes()`: Removed normalization, added validation

- `backend_v2/app/api/routes/user.py`
  - `GET /api/user/actions`: Added validation, removed verbose logs
  - `GET /api/user/notes`: Added validation, removed verbose logs

## Benefits

1. **Simpler Code**: No normalization logic to maintain
2. **Consistency**: Same validation everywhere
3. **Clear Errors**: Immediate feedback on format violations
4. **Performance**: No string manipulation for normalization

## Testing

After this change:
1. Old format requests will return 400 Bad Request
2. Only canonical format works for GET requests
3. Frontend already uses canonical format, so should work seamlessly

