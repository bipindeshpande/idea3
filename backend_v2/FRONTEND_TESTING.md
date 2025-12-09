# Frontend Testing Guide

## Quick Start

### 1. Ensure Services Are Running

```bash
# Check backend is running
curl http://localhost:8000/health

# Check Redis (if using background jobs)
docker ps | grep redis
```

### 2. Main Endpoint: Streaming Discovery (Recommended)

**Endpoint:** `POST http://localhost:8000/api/discovery`

**Request Body:**
```json
{
  "goal_type": "start_business",
  "time_commitment": "part_time",
  "budget_range": "low",
  "interest_area": "technology",
  "sub_interest_area": "AI/ML",
  "work_style": "solo",
  "skill_strength": "technical",
  "experience_summary": "5 years software development"
}
```

**Response:** Streaming text (Server-Sent Events or plain text)

**Format Options:**
- `?format=sse` - Server-Sent Events (default)
- `?format=plain` - Plain text stream

**Example Frontend Code:**
```javascript
// Using fetch with streaming
const response = await fetch('http://localhost:8000/api/discovery', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    goal_type: 'start_business',
    time_commitment: 'part_time',
    budget_range: 'low',
    interest_area: 'technology',
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  console.log(chunk); // Display in UI
}
```

### 3. Alternative: Background Job Endpoint

**Endpoint:** `POST http://localhost:8000/api/discovery/run`

**Returns:**
```json
{
  "success": true,
  "run_id": "uuid-here",
  "job_id": "job-uuid",
  "status": "pending"
}
```

**Then Poll Status:**
```
GET http://localhost:8000/api/discovery/status/{run_id}
```

**Get Results:**
```
GET http://localhost:8000/api/runs/{run_id}
```

**Note:** Requires Redis running + RQ worker:
```bash
# Start worker in separate terminal
python worker/worker.py
```

### 4. Other Useful Endpoints

**Health Check:**
```
GET http://localhost:8000/health
```

**API Documentation:**
```
GET http://localhost:8000/docs
```

**Get Run History:**
```
GET http://localhost:8000/api/runs?page=1&page_size=20
```

**Get Specific Run:**
```
GET http://localhost:8000/api/runs/{run_id}
```

## CORS

Backend is configured to allow:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)
- `http://127.0.0.1:5173`

## Authentication (Optional)

If `ALLOW_UNAUTHENTICATED=false` in `.env`, you'll need to:

1. Register:
```
POST http://localhost:8000/api/auth/register
Body: { "email": "test@example.com", "password": "password123" }
```

2. Login:
```
POST http://localhost:8000/api/auth/login
Body: { "email": "test@example.com", "password": "password123" }
Returns: { "access_token": "...", "token_type": "bearer" }
```

3. Use token in requests:
```
Authorization: Bearer {access_token}
```

## Testing Checklist

- [ ] Backend running on port 8000
- [ ] Health endpoint responds
- [ ] Streaming endpoint works
- [ ] Frontend can connect (CORS)
- [ ] Results display correctly

## Troubleshooting

**"Redis not available" error:**
- Start Redis: `docker-compose up -d redis`
- Or use streaming endpoint (doesn't need Redis)

**CORS errors:**
- Check `CORS_ORIGINS` in `config.py`
- Add your frontend URL if needed

**401 Unauthorized:**
- Set `ALLOW_UNAUTHENTICATED=true` in `.env` for testing
- Or register/login and use token

