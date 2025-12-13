# How to Start All Services

## Quick Start Guide

### 1. Start PostgreSQL and Redis (Docker)

```bash
cd backend_v2
docker-compose up -d postgres redis
```

**Verify:**
```bash
docker ps
# Should see: idea2_postgres and idea2_redis
```

### 2. Start Backend (FastAPI)

```bash
cd backend_v2
uvicorn app.main:app --reload
```

**Verify:**
- Open: http://localhost:8000/health
- Should return: `{"status": "ok"}`
- API docs: http://localhost:8000/docs

### 3. Start Frontend (Vite)

```bash
cd frontend
npm run dev
```

**Verify:**
- Frontend runs on: http://localhost:5173
- Vite proxy forwards `/api/*` to backend automatically

---

## Service URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## Testing New Endpoints

After starting all services, test the new endpoints:

### 1. Register/Login First
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'

# Login (save the access_token)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

### 2. Test New Endpoints (use token from login)
```bash
# Get current user
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get dashboard
curl http://localhost:8000/api/user/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get activity
curl http://localhost:8000/api/user/activity \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get actions
curl http://localhost:8000/api/user/actions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get notes
curl http://localhost:8000/api/user/notes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get subscription status
curl http://localhost:8000/api/subscription/status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `docker ps | grep postgres`
- Check port 8000 is free: `netstat -ano | findstr :8000`
- Check `.env` file exists with correct `DATABASE_URL`

### Frontend can't connect to backend
- Verify backend is running on port 8000
- Check CORS settings in `backend_v2/app/core/config.py`
- Verify Vite proxy in `frontend/vite.config.js`

### Redis errors
- Start Redis: `docker-compose up -d redis`
- Check Redis is accessible: `docker exec -it idea2_redis redis-cli ping`

---

## Service Dependencies

```
Frontend (5173)
    └─> Proxies to Backend (8000)
            ├─> PostgreSQL (5432)
            └─> Redis (6379) [optional]
```

---

## Quick Commands

**Start everything:**
```bash
# Terminal 1: Docker services
cd backend_v2 && docker-compose up -d postgres redis

# Terminal 2: Backend
cd backend_v2 && uvicorn app.main:app --reload

# Terminal 3: Frontend
cd frontend && npm run dev
```

**Stop everything:**
```bash
# Stop Docker
docker-compose down

# Stop backend: Ctrl+C in terminal
# Stop frontend: Ctrl+C in terminal
```


