# Local Multi-Environment - Quick Reference

## 🚀 Quick Start

### Start Dev Environment
```bash
# Backend
cd backend_v2
docker-compose -f docker-compose.dev.yml --env-file .env.dev up

# Frontend (new terminal)
cd frontend
cp .env.dev .env
npm run dev
# → http://localhost:5173
```

### Start QA Environment
```bash
# Backend
cd backend_v2
docker-compose -f docker-compose.qa.yml --env-file .env.qa up

# Frontend (new terminal)
cd frontend
cp .env.qa .env
npm run dev -- --port 5174
# → http://localhost:5174
```

### Start UAT Environment
```bash
# Backend
cd backend_v2
docker-compose -f docker-compose.uat.yml --env-file .env.uat up

# Frontend (new terminal)
cd frontend
cp .env.uat .env
npm run dev -- --port 5175
# → http://localhost:5175
```

---

## 📊 Port Reference

| Service | Dev | QA | UAT |
|---------|-----|-----|-----|
| **Backend** | 8000 | 8001 | 8002 |
| **Frontend** | 5173 | 5174 | 5175 |
| **PostgreSQL** | 5432 | 5433 | 5434 |
| **Redis** | 6379 | 6380 | 6381 |

---

## 📁 Required Files

### Backend
- `backend_v2/.env.dev`
- `backend_v2/.env.qa`
- `backend_v2/.env.uat`
- `backend_v2/docker-compose.dev.yml`
- `backend_v2/docker-compose.qa.yml`
- `backend_v2/docker-compose.uat.yml`

### Frontend
- `frontend/.env.dev`
- `frontend/.env.qa`
- `frontend/.env.uat`

---

## 🔑 Key Differences

| Setting | Dev | QA | UAT |
|---------|-----|-----|-----|
| **DEBUG** | `true` | `false` | `false` |
| **LOG_LEVEL** | `DEBUG` | `INFO` | `INFO` |
| **RATE_LIMIT** | `false` | `true` | `true` |
| **Database** | `startup_discovery_dev` | `startup_discovery_qa` | `startup_discovery_uat` |

---

## 🛠️ Common Commands

### Stop Environment
```bash
# Dev
docker-compose -f docker-compose.dev.yml --env-file .env.dev down

# QA
docker-compose -f docker-compose.qa.yml --env-file .env.qa down

# UAT
docker-compose -f docker-compose.uat.yml --env-file .env.uat down
```

### View Logs
```bash
# Dev
docker-compose -f docker-compose.dev.yml --env-file .env.dev logs -f

# QA
docker-compose -f docker-compose.qa.yml --env-file .env.qa logs -f

# UAT
docker-compose -f docker-compose.uat.yml --env-file .env.uat logs -f
```

### Run Migrations
```bash
# Dev
docker-compose -f docker-compose.dev.yml --env-file .env.dev run --rm backend alembic upgrade head

# QA
docker-compose -f docker-compose.qa.yml --env-file .env.qa run --rm backend alembic upgrade head

# UAT
docker-compose -f docker-compose.uat.yml --env-file .env.uat run --rm backend alembic upgrade head
```

---

## 📚 Full Guide

See `docs/LOCAL_MULTI_ENVIRONMENT_SETUP.md` for complete setup instructions.

