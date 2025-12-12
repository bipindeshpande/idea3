# Logging Verification & Usage Guide

## ✅ Backend Logging Status

**Status**: ✅ WORKING
**Log File**: `backend_v2/mylog.log`
**Test Result**: File created successfully, logs are being written

### Verification Steps:
1. Run test script: `cd backend_v2 && python test_logging.py`
2. Check log file: `cat backend_v2/mylog.log` or `Get-Content backend_v2/mylog.log`
3. Logs should appear when enrichment is called

### What Gets Logged:
- Full enrichment prompt (system + user prompt)
- Raw LLM markdown response
- Parsed enrichment result (JSON)
- API JSON payloads

---

## ✅ Frontend Logging Status

**Status**: ✅ CONFIGURED (In-Memory Collection)
**Log File**: Downloadable via "📥 Download Logs" button
**Location**: Browser downloads folder (when button clicked)

### How It Works:
1. Logs are collected in **memory** as you interact with the page
2. Click "📥 Download Logs" button to download as `mylog.log`
3. Button shows count of log entries: "📥 Download Logs (X)"

### Verification Steps:
1. Open browser DevTools (F12) → Console tab
2. Navigate to a recommendation detail page
3. Look for log entries in console
4. Click "📥 Download Logs" button (shows entry count)
5. Check Downloads folder for `mylog.log`

### What Gets Logged:
- Component mount events
- Body parsing process
- Section extraction details
- Heading matches
- Final parsed sections object

---

## Troubleshooting

### Backend: No logs in mylog.log

**Check 1**: Verify file exists
```bash
cd backend_v2
ls -la mylog.log  # Linux/Mac
dir mylog.log     # Windows
```

**Check 2**: Test logging manually
```python
from app.utils.file_logger import write_to_log
write_to_log("Manual test", "INFO", "MANUAL")
```

**Check 3**: Verify enrichment is being called
- Check backend console for "ToolService: Enriching idea..." messages
- Verify API endpoint `/discovery/enrich_idea` is being hit

**Check 4**: Check for errors
- Look for "Failed to write to log file" messages in console
- Check file permissions on `backend_v2/` directory

### Frontend: No logs collected

**Check 1**: Verify button appears
- Button only shows in development mode (`NODE_ENV === 'development'`)
- Should appear next to "Back to recommendations" button

**Check 2**: Check browser console
- Look for "RecommendationDetail component mounted" message
- Check for any JavaScript errors
- Verify `fileLogger.js` is imported correctly

**Check 3**: Verify logs are being collected
- Button should show count: "📥 Download Logs (X)"
- If count is 0, logs aren't being collected yet
- Try navigating to a recommendation detail page

**Check 4**: Test download
- Click "📥 Download Logs" button
- Should trigger file download
- Check browser Downloads folder

---

## Quick Test Commands

### Backend Test:
```bash
cd backend_v2
python test_logging.py
cat mylog.log  # View logs
```

### Frontend Test:
1. Open app in browser
2. Navigate to a recommendation detail page
3. Open DevTools Console (F12)
4. Look for log entries
5. Click "📥 Download Logs" button
6. Check Downloads folder

---

## Expected Log Entries

### Backend (when enrichment called):
```
================================================================================
[timestamp] [DEBUG] [ToolService] FULL ENRICHMENT PROMPT
================================================================================
SYSTEM PROMPT:
...
USER PROMPT:
...
================================================================================

================================================================================
[timestamp] [DEBUG] [ToolService] RAW ENRICHMENT MARKDOWN (BEFORE PARSING)
================================================================================
Content length: XXXX
Full content:
...
================================================================================

================================================================================
[timestamp] [DEBUG] [ToolService] PARSED ENRICHMENT RESULT
================================================================================
{
  "intro": "...",
  "financial_snapshot": "...",
  ...
}
================================================================================
```

### Frontend (when page loads):
```
[timestamp] [INFO] [RecommendationDetail] RecommendationDetail component mounted
[timestamp] [INFO] [RecommendationDetail] Parsing sections from body...
[timestamp] [DEBUG] [splitIdeaSections] Found heading: ### intro
[timestamp] [DEBUG] [splitIdeaSections] Matched heading to section: intro
...
[timestamp] [INFO] [RecommendationDetail] SECTIONS PARSED (FINAL)
```

---

## File Locations Summary

- **Backend log file**: `backend_v2/mylog.log` (auto-created, appended to)
- **Frontend log file**: Download via button → `mylog.log` in Downloads folder
- **Test script**: `backend_v2/test_logging.py`

---

## Next Steps

1. **Trigger enrichment** by clicking on an idea in recommendations
2. **Check backend log file** at `backend_v2/mylog.log`
3. **Check frontend console** for log entries
4. **Download frontend logs** using the button
5. **Compare both log files** to see full pipeline flow

