# Discovery Session Save Fix

## Issue
Discovery runs complete successfully and show 2 ideas, but they don't appear in past sessions.

## Root Cause Analysis

The issue could be:
1. **User not authenticated** - If `current_user` is None, `user_id` will be None, and the run won't show up in `/api/user/activity` which filters by `user_id`
2. **Transaction not committed** - The commit might fail silently
3. **Exception during save** - If an exception occurs during the save process (lines 440-449 in discovery.py), the run status is set to "failed" but might not show in the list
4. **Database query issue** - The query filters by `deleted_at.is_(None)`, so soft-deleted runs won't show

## Fix Strategy

1. **Add better error handling** - Ensure exceptions during save don't silently fail
2. **Add logging** - Log when runs are saved successfully
3. **Add verification** - After commit, verify the run was saved correctly
4. **Handle unauthenticated users** - Either require authentication or handle anonymous runs differently

## Implementation

Update the discovery endpoint to:
- Log when run is saved successfully
- Verify run exists after commit
- Add error details if save fails
- Ensure user_id is always set correctly

