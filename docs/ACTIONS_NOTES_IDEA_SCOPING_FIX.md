# Actions & Notes Idea Scoping Fix

## 🐛 Issue

Actions and notes created for one idea were showing up when viewing other ideas. This created confusion as users couldn't tell which tasks and notes belonged to which idea.

**Example:**
- User creates action "Test pricing" on Idea #1
- User navigates to Idea #2
- Action "Test pricing" still shows (incorrectly)

**Root Cause:**
When switching between ideas, the old actions/notes data remained in React state until the new data loaded from the API, causing a brief (but confusing) period where the wrong data was displayed.

---

## ✅ Solution

Applied two fixes to ensure proper data scoping:

### 1. Clear State Immediately on ideaId Change
**File:** `frontend/src/hooks/recommendation/useActionsAndNotes.js`

When `ideaId` changes (user navigates to different idea), immediately clear the old data before fetching new data:

```javascript
useEffect(() => {
  if (!isAuthenticated || !ideaId) {
    setActions([]);
    setNotes([]);
    return;
  }

  // Clear previous data immediately when ideaId changes
  console.log("[useActionsAndNotes] Clearing and loading actions/notes for ideaId:", ideaId);
  setActions([]);
  setNotes([]);

  // ... then load new data
}, [ideaId, isAuthenticated, getAuthHeaders]);
```

**Benefit:** Prevents showing stale data during navigation.

---

### 2. Client-Side Filter (Safety Layer)
Added defensive filtering to ensure only actions/notes matching the current `ideaId` are displayed:

```javascript
const safeActions = Array.isArray(actions) 
  ? actions.filter(action => action.idea_id === ideaId)
  : [];
  
const safeNotes = Array.isArray(notes) 
  ? notes.filter(note => note.idea_id === ideaId)
  : [];
```

**Benefit:** 
- Protects against backend bugs
- Handles race conditions during navigation
- Ensures data integrity even if API returns wrong data

---

## 🔍 How ideaId Works

The `ideaId` is a composite key that uniquely identifies each idea:

**Format:** `{runId}::idea_{ideaIndex}`

**Examples:**
- `run_abc123::idea_1` → First idea in run abc123
- `run_abc123::idea_2` → Second idea in same run
- `run_xyz789::idea_1` → First idea in different run

**Computed in:** `frontend/src/hooks/recommendation/useRecommendationData.js`

```javascript
const ideaId = useMemo(() => {
  const effectiveRunId = runId || currentRunId;
  if (effectiveRunId && activeIdea?.index !== undefined) {
    return `${effectiveRunId}::idea_${activeIdea.index}`;
  }
  return null;
}, [runId, currentRunId, activeIdea?.index]);
```

When user navigates from Idea #1 to Idea #2:
- `ideaId` changes from `run_xxx::idea_1` → `run_xxx::idea_2`
- `useEffect` triggers (ideaId in dependency array)
- Old data is cleared
- New data is fetched with correct `ideaId` parameter

---

## 🧪 Testing Checklist

### Test Case 1: Create Action on Idea #1
1. Navigate to Idea #1
2. Go to Actions & Notes tab
3. Create action: "Test market demand"
4. Verify action appears
5. Navigate to Idea #2
6. **Expected:** Action should NOT appear on Idea #2
7. Navigate back to Idea #1
8. **Expected:** Action should reappear on Idea #1

### Test Case 2: Create Note on Idea #2
1. Navigate to Idea #2
2. Go to Actions & Notes tab
3. Create note: "Customer interview feedback"
4. Verify note appears
5. Navigate to Idea #3
6. **Expected:** Note should NOT appear on Idea #3
7. Navigate back to Idea #2
8. **Expected:** Note should reappear on Idea #2

### Test Case 3: Quick Navigation
1. Navigate to Idea #1
2. Create action "Task A"
3. Quickly navigate to Idea #2, then #3, then #1
4. **Expected:** 
   - No actions visible on #2 or #3
   - "Task A" visible on #1

### Test Case 4: Multiple Actions Across Ideas
1. Idea #1: Create actions "A1", "A2"
2. Idea #2: Create actions "B1", "B2"
3. Idea #3: Create actions "C1", "C2"
4. Navigate between all ideas
5. **Expected:** Each idea shows only its own actions

---

## 📊 API Calls

Actions and notes are fetched with `idea_id` query parameter:

```http
GET /api/user/actions?idea_id=run_abc123::idea_1
GET /api/user/notes?idea_id=run_abc123::idea_1
```

Backend should filter results by `idea_id` before returning.

---

## 🔒 Data Integrity

### Server-Side (Backend)
- API filters by `idea_id` in database query
- Only returns actions/notes for requested idea

### Client-Side (Frontend)
- State cleared on navigation
- Additional filter applied before display
- `ideaId` passed to create/update operations

### Defense in Depth
Even if backend accidentally returns wrong data, client-side filter catches it.

---

## 📝 Debug Logging

Added logging to help diagnose issues:

```javascript
console.log("[useActionsAndNotes] Returning filtered data:", {
  ideaId,
  actionsCount: safeActions.length,
  notesCount: safeNotes.length,
  allActionsCount: actions.length,
  allNotesCount: notes.length
});
```

**How to use:**
1. Open browser console (F12)
2. Navigate between ideas
3. Check console output for data counts
4. Verify `actionsCount` matches expectations for each idea

---

## 🐛 Common Issues

### Issue: Actions still showing on wrong idea
**Debug:**
- Check console for `ideaId` value
- Verify `idea_id` field exists on action/note objects
- Check API response in Network tab

**Fix:**
- Ensure backend is filtering correctly
- Verify `idea_id` is being saved correctly on create

### Issue: Actions disappear briefly during navigation
**Expected behavior:** This is intentional!
- State is cleared immediately on navigation
- Brief loading state while new data fetches
- Better than showing wrong data

---

## 📂 Files Changed

1. `frontend/src/hooks/recommendation/useActionsAndNotes.js`
   - Added state clearing on ideaId change
   - Added client-side filtering
   - Added debug logging

2. `docs/ACTIONS_NOTES_IDEA_SCOPING_FIX.md` (this file)

---

## 🎯 Success Criteria

✅ Actions created on Idea #1 only visible on Idea #1  
✅ Notes created on Idea #2 only visible on Idea #2  
✅ No data bleed between ideas  
✅ Navigation clears old data immediately  
✅ Loading states handled gracefully  
✅ Debug logs help troubleshoot issues

---

**Status:** ✅ Complete  
**Priority:** High (data integrity)  
**Impact:** All users viewing multiple ideas

