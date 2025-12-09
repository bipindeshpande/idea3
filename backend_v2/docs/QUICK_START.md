# PostgreSQL Docker Setup - Quick Start

## Complete Setup Instructions

### 1. How to Start the Database

**Option A: Use the helper script (recommended)**

**Windows:**
```powershell
.\start-db.ps1
```

**Linux/Mac:**
```bash
chmod +x start-db.sh
./start-db.sh
```

**Option B: Manual start**
```bash
# Check if port 5432 is available, if not use 5433
# Windows PowerShell:
$env:POSTGRES_PORT = "5432"  # Change to "5433" if 5432 is occupied

# Linux/Mac:
export POSTGRES_PORT=5432  # Change to 5433 if 5432 is occupied

# Start container
docker-compose up -d idea2_postgres
```

**Verify it's running:**
```bash
docker ps --filter "name=idea2_postgres"
```

---

### 2. How to Run Alembic Migrations

**Step 1: Create/update `.env` file**

Create a `.env` file in `backend_v2/` directory with:

```env
DATABASE_URL=postgresql://startup_discovery:startup_discovery_dev@localhost:5432/startup_discovery
```

**Important:** If you're using port 5433, change the port in DATABASE_URL:
```env
DATABASE_URL=postgresql://startup_discovery:startup_discovery_dev@localhost:5433/startup_discovery
```

**Step 2: Run migrations**

```bash
cd backend_v2
alembic upgrade head
```

**Expected output:**
```
INFO  [alembic.runtime.migration] Running upgrade  -> 001_initial, Initial migration with PostgreSQL JSONB
```

**Verify migration:**
```bash
alembic current
```

---

### 3. How to Connect FastAPI to the DB

**The connection is automatic!** Just ensure your `.env` file has the correct `DATABASE_URL`.

**Step 1: Verify `.env` file exists and has correct DATABASE_URL**

```bash
# Check your .env file
cat .env | grep DATABASE_URL
```

Should show:
```
DATABASE_URL=postgresql://startup_discovery:startup_discovery_dev@localhost:5432/startup_discovery
```
(Use port 5433 if that's what Docker is using)

**Step 2: Start FastAPI**

```bash
python -m uvicorn app.main:app --reload
# or
python run.py
```

**The app automatically:**
- Reads `DATABASE_URL` from `.env`
- Connects to PostgreSQL via SQLAlchemy
- Uses the connection for all database operations

**No additional configuration needed!**

---

### 4. How to Confirm the DB is Running

**Method 1: Check Docker container**
```bash
docker ps --filter "name=idea2_postgres"
```

Should show:
```
CONTAINER ID   IMAGE                STATUS         PORTS                    NAMES
xxxxx          postgres:16-alpine   Up X minutes   0.0.0.0:5432->5432/tcp   idea2_postgres
```

**Method 2: Check container logs**
```bash
docker-compose logs idea2_postgres
```

Look for: `database system is ready to accept connections`

**Method 3: Test connection with psql**
```bash
# Connect via Docker
docker exec -it idea2_postgres psql -U startup_discovery -d startup_discovery

# Then run:
SELECT version();
\dt  # List tables
\q   # Quit
```

**Method 4: Test connection with Python**
```python
from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT version();"))
    print("PostgreSQL version:", result.fetchone()[0])
```

**Method 5: Check via FastAPI**
```bash
# Start FastAPI, then:
curl http://localhost:8000/health
```

Should return: `{"status":"healthy"}`

---

## Database Credentials

- **User:** `startup_discovery`
- **Password:** `startup_discovery_dev`
- **Database:** `startup_discovery`
- **Host:** `localhost`
- **Port:** `5432` (or `5433` if 5432 is occupied)

---

## Troubleshooting

### Port 5432 Already in Use

**Check what's using it:**
```bash
# Windows:
netstat -ano | findstr :5432

# Linux/Mac:
lsof -i :5432
```

**Solution:** Use port 5433
1. Set environment variable: `export POSTGRES_PORT=5433` (or `$env:POSTGRES_PORT="5433"` on Windows)
2. Update `.env` file: Change port in `DATABASE_URL` to `5433`
3. Restart container: `docker-compose up -d idea2_postgres`

### Connection Refused

1. **Verify container is running:**
   ```bash
   docker ps --filter "name=idea2_postgres"
   ```

2. **Check port mapping:**
   ```bash
   docker port idea2_postgres
   ```

3. **Verify DATABASE_URL in `.env` matches the port**

4. **Ensure migrations have run:**
   ```bash
   alembic current
   ```

### Container Won't Start

```bash
# Check logs
docker-compose logs idea2_postgres

# Remove and recreate
docker-compose down -v
docker-compose up -d idea2_postgres
```

### Reset Everything

```bash
# Stop and remove container + volumes
docker-compose down -v

# Start fresh
docker-compose up -d idea2_postgres

# Wait for DB to be ready (5-10 seconds)
sleep 5

# Run migrations
alembic upgrade head
```

---

## Summary Checklist

- [ ] Docker and Docker Compose installed
- [ ] `.env` file created with correct `DATABASE_URL`
- [ ] PostgreSQL container started (`docker-compose up -d idea2_postgres`)
- [ ] Container is running (`docker ps`)
- [ ] Migrations run (`alembic upgrade head`)
- [ ] FastAPI can connect (start server and check logs)

---

## Files Created/Updated

✅ `docker-compose.yml` - PostgreSQL container configuration
✅ `start-db.ps1` - Windows helper script
✅ `start-db.sh` - Linux/Mac helper script
✅ `.env.example` - Environment template
✅ `alembic.ini` - Updated to use settings.DATABASE_URL
✅ `app/main.py` - Removed SQLite fallback
✅ `app/core/config.py` - Updated default DATABASE_URL
✅ `app/core/database.py` - Already configured correctly

