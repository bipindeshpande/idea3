# PostgreSQL Docker Setup Guide

## Quick Start

### 1. How to Start the Database

**Windows (PowerShell):**
```powershell
.\start-db.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x start-db.sh
./start-db.sh
```

**Manual (any platform):**
```bash
# Check port and set environment variable
# Windows PowerShell:
$env:POSTGRES_PORT = "5432"  # or "5433" if 5432 is occupied

# Linux/Mac:
export POSTGRES_PORT=5432  # or 5433 if 5432 is occupied

# Start container
docker-compose up -d idea2_postgres
```

The script automatically detects if port 5432 is occupied and uses 5433 instead.

### 2. How to Run Alembic Migrations

**First, ensure your `.env` file has the correct DATABASE_URL:**

```bash
# The DATABASE_URL should match the port used by Docker
# If using port 5432:
DATABASE_URL=postgresql://startup_discovery:startup_discovery_dev@localhost:5432/startup_discovery

# If using port 5433:
DATABASE_URL=postgresql://startup_discovery:startup_discovery_dev@localhost:5433/startup_discovery
```

**Then run migrations:**

```bash
# Navigate to backend_v2 directory
cd backend_v2

# Run all pending migrations
alembic upgrade head

# Or create a new migration
alembic revision --autogenerate -m "description"

# Check current migration status
alembic current

# View migration history
alembic history
```

### 3. How to Connect FastAPI to the DB

**The connection is automatic via `DATABASE_URL` in your `.env` file.**

1. **Create/update `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and set DATABASE_URL:**
   ```env
   DATABASE_URL=postgresql://startup_discovery:startup_discovery_dev@localhost:5432/startup_discovery
   ```
   (Use port 5433 if 5432 is occupied)

3. **Start FastAPI:**
   ```bash
   python -m uvicorn app.main:app --reload
   # or
   python run.py
   ```

The app will automatically connect using the DATABASE_URL from settings.

### 4. How to Confirm the DB is Running

**Check Docker container:**
```bash
docker ps --filter "name=idea2_postgres"
```

**Check container logs:**
```bash
docker-compose logs idea2_postgres
```

**Test connection with psql:**
```bash
# If using port 5432:
docker exec -it idea2_postgres psql -U startup_discovery -d startup_discovery

# If using port 5433, connect from host:
# First install psql client, then:
psql -h localhost -p 5433 -U startup_discovery -d startup_discovery
```

**Test connection with Python:**
```python
from app.core.database import engine
from sqlalchemy import text

# Test connection
with engine.connect() as conn:
    result = conn.execute(text("SELECT version();"))
    print(result.fetchone())
```

**Check via FastAPI health endpoint:**
```bash
curl http://localhost:8000/health
```

## Database Credentials

- **User:** `startup_discovery`
- **Password:** `startup_discovery_dev`
- **Database:** `startup_discovery`
- **Host:** `localhost`
- **Port:** `5432` (or `5433` if 5432 is occupied)

## Troubleshooting

### Port Already in Use
If you get a port conflict error:
```bash
# Check what's using port 5432
# Windows:
netstat -ano | findstr :5432

# Linux/Mac:
lsof -i :5432

# Then either stop that service or use port 5433
export POSTGRES_PORT=5433  # or $env:POSTGRES_PORT="5433" on Windows
docker-compose up -d idea2_postgres
```

### Container Won't Start
```bash
# Check logs
docker-compose logs idea2_postgres

# Remove and recreate
docker-compose down -v
docker-compose up -d idea2_postgres
```

### Connection Refused
1. Verify container is running: `docker ps`
2. Check port mapping: `docker port idea2_postgres`
3. Verify DATABASE_URL in `.env` matches the port
4. Ensure migrations have run: `alembic current`

### Reset Database
```bash
# Stop and remove container + volumes
docker-compose down -v

# Start fresh
docker-compose up -d idea2_postgres

# Run migrations
alembic upgrade head
```

## Useful Commands

```bash
# Stop database
docker-compose stop idea2_postgres

# Start database
docker-compose start idea2_postgres

# Restart database
docker-compose restart idea2_postgres

# View logs
docker-compose logs -f idea2_postgres

# Execute SQL
docker exec -it idea2_postgres psql -U startup_discovery -d startup_discovery

# Backup database
docker exec idea2_postgres pg_dump -U startup_discovery startup_discovery > backup.sql

# Restore database
docker exec -i idea2_postgres psql -U startup_discovery startup_discovery < backup.sql
```

