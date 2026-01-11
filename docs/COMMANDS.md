# Project Commands Reference

Quick reference guide for all common development and operations commands.

## 📋 Table of Contents

- [Server Management](#server-management)
- [Database Operations](#database-operations)
- [Logs](#logs)
- [Testing](#testing)
- [Migrations](#migrations)
- [Frontend Commands](#frontend-commands)
- [Docker Commands](#docker-commands)
- [Utilities](#utilities)

---

## 🚀 Server Management

### Start Backend Server

**PowerShell:**
```powershell
cd backend_v2
.\start-backend.ps1
```

**Manual (Python):**
```bash
cd backend_v2
python run.py
```

**Docker:**
```bash
cd backend_v2
docker-compose up -d backend
```

**Uvicorn (direct):**
```bash
cd backend_v2
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Stop Backend Server

**If running in terminal:**
- Press `Ctrl+C`

**Docker:**
```bash
cd backend_v2
docker-compose stop backend
# Or to remove container:
docker-compose down backend
```

### Start Frontend Server

```bash
cd frontend
npm run dev
```

### Stop Frontend Server

- Press `Ctrl+C` in the terminal

---

## 🗄️ Database Operations

### Start Database (PostgreSQL + Redis)

**PowerShell:**
```powershell
cd backend_v2
.\start-db.ps1
```

**Docker:**
```bash
cd backend_v2
docker-compose up -d postgres redis
```

**Start only PostgreSQL:**
```bash
cd backend_v2
docker-compose up -d postgres
```

**Start only Redis:**
```bash
cd backend_v2
docker-compose up -d redis
```

### Stop Database

```bash
cd backend_v2
docker-compose stop postgres redis
# Or to remove containers:
docker-compose down postgres redis
```

### Clear Database (Delete ALL Data)

**⚠️ WARNING: This deletes all data but preserves schema**

**PowerShell:**
```powershell
cd backend_v2
.\clear-db.ps1
```

**Manual (Docker):**
```bash
cd backend_v2
# Stop containers
docker-compose down

# Remove volumes (deletes all data)
docker volume rm idea3_postgres_data
docker volume rm backend_v2_postgres_data  # if exists
docker volume rm idea3_redis_data
docker volume rm backend_v2_redis_data  # if exists

# Start fresh
docker-compose up -d postgres redis

# Wait for DB to be ready, then run migrations
docker-compose run --rm backend alembic upgrade head
```

### Reset Database (Clear Data, Preserve Schema)

**PowerShell:**
```powershell
cd backend_v2
.\reset-db.ps1
```

**With seeding (includes test data):**
```powershell
cd backend_v2
.\reset-db.ps1 -Seed
```

**Manual (Python script):**
```bash
cd backend_v2
docker-compose run --rm backend python -c "
from app.core.database import engine
from sqlalchemy import text, inspect

inspector = inspect(engine)
table_names = inspector.get_table_names()
data_tables = [t for t in table_names if t != 'alembic_version']

with engine.begin() as conn:
    conn.execute(text('SET session_replication_role = replica;'))
    for table_name in data_tables:
        conn.execute(text(f'TRUNCATE TABLE \"{table_name}\" RESTART IDENTITY CASCADE;'))
    conn.execute(text('SET session_replication_role = DEFAULT;')
"
```

### Seed Database (Add Test Data)

**PowerShell:**
```powershell
cd backend_v2
.\scripts\seed-db.ps1
```

**Docker:**
```bash
cd backend_v2
docker-compose run --rm backend python scripts/seed-db.py
```

**Test Accounts Created:**
- `test@example.com` / `test123` (Premium, has sample data)
- `demo@example.com` / `demo123` (Free)
- `admin@example.com` / `admin123` (Admin)

### Access Database Directly

**PostgreSQL:**
```bash
# Via Docker
cd backend_v2
docker-compose exec postgres psql -U startup_discovery -d startup_discovery

# Via local psql (if installed)
psql -h localhost -p 5432 -U startup_discovery -d startup_discovery
# Password: startup_discovery_dev
```

**Redis:**
```bash
cd backend_v2
docker-compose exec redis redis-cli
```

### Backup Database

```bash
cd backend_v2
docker-compose exec postgres pg_dump -U startup_discovery startup_discovery > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
cd backend_v2
cat backup_file.sql | docker-compose exec -T postgres psql -U startup_discovery -d startup_discovery
```

---

## 📝 Logs

### View Backend Logs

**Docker (follow logs):**
```bash
cd backend_v2
docker-compose logs -f backend
```

**Docker (last 100 lines):**
```bash
cd backend_v2
docker-compose logs --tail=100 backend
```

**Docker (all services):**
```bash
cd backend_v2
docker-compose logs -f
```

**Application log file:**
```bash
cd backend_v2
cat mylog.log
# Or follow:
tail -f mylog.log
```

### View Database Logs

**PostgreSQL:**
```bash
cd backend_v2
docker-compose logs -f postgres
```

**Redis:**
```bash
cd backend_v2
docker-compose logs -f redis
```

### View All Container Logs

```bash
cd backend_v2
docker-compose logs -f
```

### Check Container Status

```bash
cd backend_v2
docker-compose ps
```

---

## 🧪 Testing

### Run All Tests

**PowerShell:**
```powershell
cd backend_v2
.\run_tests.ps1
```

**Manual:**
```bash
cd backend_v2
pytest
```

### Run Unit Tests Only

```bash
cd backend_v2
pytest tests/unit -v
```

### Run Integration Tests

```bash
cd backend_v2
pytest tests/integration -v
```

### Run Tests with Coverage

```bash
cd backend_v2
pytest --cov=app --cov-report=term-missing --cov-report=html
```

### Run Specific Test File

```bash
cd backend_v2
pytest tests/unit/test_specific.py -v
```

### Run Frontend Tests

```bash
cd frontend
npm test
npm run test:run
npm run test:coverage
```

### Run E2E Tests (Frontend)

```bash
cd frontend
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed
```

---

## 🔄 Migrations

### Create New Migration

```bash
cd backend_v2
docker-compose run --rm backend alembic revision --autogenerate -m "description"
# Or locally:
alembic revision --autogenerate -m "description"
```

### Run Migrations

```bash
cd backend_v2
docker-compose run --rm backend alembic upgrade head
# Or locally:
alembic upgrade head
```

### Rollback Migration

```bash
cd backend_v2
docker-compose run --rm backend alembic downgrade -1
# Or to specific revision:
alembic downgrade <revision_id>
```

### Check Migration Status

```bash
cd backend_v2
docker-compose run --rm backend alembic current
docker-compose run --rm backend alembic history
```

### Stamp Database (mark as migrated without running)

```bash
cd backend_v2
docker-compose run --rm backend alembic stamp head
```

---

## 🎨 Frontend Commands

### Development Server

```bash
cd frontend
npm run dev
```

### Build for Production

```bash
cd frontend
npm run build
```

### Preview Production Build

```bash
cd frontend
npm run preview
```

### Install Dependencies

```bash
cd frontend
npm install
```

---

## 🐳 Docker Commands

### Start All Services

```bash
cd backend_v2
docker-compose up -d
```

### Stop All Services

```bash
cd backend_v2
docker-compose down
```

### Restart Service

```bash
cd backend_v2
docker-compose restart backend
docker-compose restart postgres
docker-compose restart redis
```

### Rebuild and Start

```bash
cd backend_v2
docker-compose up -d --build
```

### View Running Containers

```bash
cd backend_v2
docker-compose ps
# Or:
docker ps
```

### Execute Command in Container

```bash
cd backend_v2
docker-compose exec backend <command>
# Example:
docker-compose exec backend python -c "print('Hello')"
```

### Remove All Containers and Volumes

```bash
cd backend_v2
docker-compose down -v
```

### Check Port Availability

**PowerShell:**
```powershell
cd backend_v2
.\check_port.ps1
```

**Manual:**
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Mac/Linux
```

---

## 🛠️ Utilities

### Create Admin User

```bash
cd backend_v2
docker-compose run --rm backend python scripts/create_admin.py
```

### Create Test User

```bash
cd backend_v2
docker-compose run --rm backend python scripts/create_test_user.py
```

### Monitor Redis

```bash
cd backend_v2
docker-compose run --rm backend python scripts/redis_monitor.py
```

### Check Health Endpoint

```bash
curl http://localhost:8000/health
```

### View API Documentation

Open in browser:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Access Backend Shell

```bash
cd backend_v2
docker-compose exec backend python
# Or bash:
docker-compose exec backend bash
```

---

## 🔧 Common Workflows

### Fresh Start (Clean Everything)

```powershell
# 1. Stop everything
cd backend_v2
docker-compose down -v

# 2. Start database
.\start-db.ps1

# 3. Reset and seed database
.\reset-db.ps1 -Seed

# 4. Start backend
.\start-backend.ps1
```

### Daily Development Start

```powershell
# 1. Start database
cd backend_v2
.\start-db.ps1

# 2. Start backend (in separate terminal)
.\start-backend.ps1

# 3. Start frontend (in separate terminal)
cd frontend
npm run dev
```

### Update and Restart

```bash
# 1. Pull latest code
git pull

# 2. Rebuild containers
cd backend_v2
docker-compose up -d --build

# 3. Run migrations if needed
docker-compose run --rm backend alembic upgrade head
```

### Debug Database Issues

```bash
# 1. Check database logs
cd backend_v2
docker-compose logs postgres

# 2. Check connection
docker-compose exec postgres pg_isready -U startup_discovery

# 3. Access database
docker-compose exec postgres psql -U startup_discovery -d startup_discovery

# 4. Check tables
\dt

# 5. Check data
SELECT * FROM users LIMIT 5;
```

---

## 📍 Quick Reference

| Task | Command |
|------|---------|
| Start backend | `cd backend_v2 && .\start-backend.ps1` |
| Start database | `cd backend_v2 && .\start-db.ps1` |
| Clear DB | `cd backend_v2 && .\clear-db.ps1` |
| Reset DB | `cd backend_v2 && .\reset-db.ps1` |
| Seed DB | `cd backend_v2 && .\scripts\seed-db.ps1` |
| View logs | `cd backend_v2 && docker-compose logs -f backend` |
| Run tests | `cd backend_v2 && pytest` |
| Run migrations | `cd backend_v2 && docker-compose run --rm backend alembic upgrade head` |
| Start frontend | `cd frontend && npm run dev` |

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000
netstat -ano | findstr :8000  # Windows
lsof -i :8000  # Mac/Linux

# Kill process (Windows)
taskkill /PID <pid> /F

# Kill process (Mac/Linux)
kill -9 <pid>
```

### Database Connection Issues

```bash
# Check if database is running
cd backend_v2
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Container Won't Start

```bash
# Check logs
cd backend_v2
docker-compose logs <service_name>

# Rebuild container
docker-compose up -d --build <service_name>

# Remove and recreate
docker-compose rm -f <service_name>
docker-compose up -d <service_name>
```

### Migration Issues

```bash
# Check current migration state
cd backend_v2
docker-compose run --rm backend alembic current

# View migration history
docker-compose run --rm backend alembic history

# If stuck, stamp database
docker-compose run --rm backend alembic stamp head
```

---

**Last Updated:** 2025-01-27

