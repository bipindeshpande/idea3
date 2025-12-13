# Logging Setup Guide

## Backend Logging

### Log File Location
- **Path**: `backend_v2/mylog.log`
- **Format**: Text file with timestamps, log levels, and source identifiers

### What Gets Logged
1. **Full Enrichment Prompt** - Complete system + user prompt sent to LLM
2. **Raw LLM Response** - Unprocessed markdown returned by LLM
3. **Parsed Enrichment Result** - Structured sections after parsing
4. **API JSON Payloads** - Complete responses sent to frontend

### How to View Backend Logs
```bash
# View last 50 lines
tail -n 50 backend_v2/mylog.log

# View entire file
cat backend_v2/mylog.log

# Follow logs in real-time
tail -f backend_v2/mylog.log
```

### Testing Backend Logger
```python
from app.utils.file_logger import write_to_log, write_section_to_log

# Test simple log
write_to_log("Test message", "INFO", "TEST")

# Test section log
write_section_to_log("Test Section", "Test content here", "DEBUG", "TEST")
```

---

## Frontend Logging

### How It Works
- Frontend logs are collected in **memory** (not written to disk automatically)
- Logs accumulate as you interact with the page
- Use the **"Download Logs"** button to download all collected logs as `mylog.log`

### Log File Location
- **Download**: Click "📥 Download Logs" button in dev mode
- **File**: Downloads as `mylog.log` to your browser's download folder

### What Gets Logged
1. **Component Mount** - When RecommendationDetail loads
2. **Body Parsing** - Full body content and parsing process
3. **Section Extraction** - Each heading found and matched
4. **Final Sections** - Complete parsed sections object

### How to View Frontend Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to a recommendation detail page
4. Click "📥 Download Logs" button (shows count of log entries)
5. Check your Downloads folder for `mylog.log`

---

## Troubleshooting

### Backend: Log file not created
1. Check file permissions in `backend_v2/` directory
2. Verify Python can write to the directory
3. Check console for error messages from file_logger
4. Test manually: `python -c "from app.utils.file_logger import write_to_log; write_to_log('test', 'INFO', 'TEST')"`

### Frontend: No logs collected
1. Check browser console for errors
2. Verify you're on the RecommendationDetail page
3. Check that `fileLogger.js` is imported correctly
4. Look for "RecommendationDetail component mounted" in console
5. Try clicking "Download Logs" button - it shows count of entries

### Logs not appearing in file
1. **Backend**: Check if enrichment is actually being called
2. **Backend**: Verify imports are correct in tool_service.py
3. **Frontend**: Check browser console for any JavaScript errors
4. **Frontend**: Verify the component is actually rendering

---

## Log Format

### Backend Log Format
```
[YYYY-MM-DD HH:MM:SS] [LEVEL] [SOURCE] Message
```

### Section Format
```
================================================================================
[YYYY-MM-DD HH:MM:SS] [LEVEL] [SOURCE] Section Title
================================================================================
Content here...
================================================================================
```

### Frontend Log Format
```
[ISO_TIMESTAMP] [LEVEL] [SOURCE] Message
```

---

## Verification Checklist

- [ ] Backend log file exists at `backend_v2/mylog.log`
- [ ] Can write test log to backend file
- [ ] Frontend "Download Logs" button appears (dev mode)
- [ ] Frontend button shows log count
- [ ] Console shows log entries being created
- [ ] Download creates `mylog.log` file

