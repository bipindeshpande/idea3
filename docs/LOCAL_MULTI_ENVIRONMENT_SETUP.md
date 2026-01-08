# Local Multi-Environment Setup Guide
## Running Dev, QA, and UAT on Your Local Machine

**Last Updated:** January 2025  
**Purpose:** Set up 2-3 separate environments (Dev, QA, UAT) running simultaneously on your local development machine.

---

## 🎯 Overview

This guide shows you how to run multiple environments locally using:
- **Different ports** for each environment
- **Separate databases** for data isolation
- **Separate Redis instances** for cache isolation
- **Different Docker Compose files** for easy switching

---

## 📋 Port Allocation

| Service | Dev | QA | UAT |
|---------|-----|-----|-----|
| **Backend API** | 8000 | 8001 | 8002 |
| **Frontend** | 5173 | 5174 | 5175 |
| **PostgreSQL** | 5432 | 5433 | 5434 |
| **Redis** | 6379 | 6380 | 6381 |

---

## 📁 File Structure

### Backend Files
```
backend_v2/
├── .env                    # Default (for current docker-compose.yml)
├── .env.dev                # Dev environment
├── .env.qa                 # QA environment
├── .env.uat                # UAT environment
├── docker-compose.yml      # Default (Dev)
├── docker-compose.dev.yml  # Dev environment
├── docker-compose.qa.yml   # QA environment
└── docker-compose.uat.yml # UAT environment
```

### Frontend Files
```
frontend/
├── .env                    # Default
├── .env.dev                # Dev environment
├── .env.qa                 # QA environment
├── .env.uat                # UAT environment
└── vite.config.js          # (may need environment-specific configs)
```

---

## 🔧 Step 1: Create Environment Files

### Backend Environment Files

#### `backend_v2/.env.dev`
```env
# Application
APP_NAME=Startup Discovery SaaS - DEV
APP_VERSION=2.0.0
ENVIRONMENT=development
DEBUG=true

# Database
POSTGRES_USER=startup_discovery
POSTGRES_PASSWORD=dev_password_123
POSTGRES_DB=startup_discovery_dev
DATABASE_URL=postgresql://startup_discovery:dev_password_123@localhost:5432/startup_discovery_dev

# Redis
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379/0
REDIS_ENABLED=true

# LLM API Keys
OPENAI_API_KEY=sk-your-dev-key-here
ANTHROPIC_API_KEY=sk-ant-your-dev-key-here

# Default LLM Settings
DEFAULT_LLM_PROVIDER=openai
DEFAULT_MODEL=gpt-4o-mini
MAX_TOKENS_STAGE1=2000
MAX_TOKENS_STAGE2=4000

# Security
SECRET_KEY=dev-secret-key-change-in-production-32-chars-min
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOW_UNAUTHENTICATED=true

# CORS - Frontend domain
CORS_ORIGINS=["http://localhost:5173","http://localhost:5174","http://localhost:5175"]
FRONTEND_DOMAIN=http://localhost:5173

# Cache
CACHE_TTL_DISCOVERY=3600
CACHE_TTL_PROFILE=1800

# Pipeline
PARALLEL_EXECUTION=true
STAGE1_TIMEOUT=300

# Rate Limiting
RATE_LIMIT_ENABLED=false

# Logging
LOG_LEVEL=DEBUG
```

#### `backend_v2/.env.qa`
```env
# Application
APP_NAME=Startup Discovery SaaS - QA
APP_VERSION=2.0.0
ENVIRONMENT=qa
DEBUG=false

# Database
POSTGRES_USER=startup_discovery
POSTGRES_PASSWORD=qa_password_123
POSTGRES_DB=startup_discovery_qa
DATABASE_URL=postgresql://startup_discovery:qa_password_123@localhost:5433/startup_discovery_qa

# Redis
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6380/0
REDIS_ENABLED=true

# LLM API Keys
OPENAI_API_KEY=sk-your-qa-key-here
ANTHROPIC_API_KEY=sk-ant-your-qa-key-here

# Default LLM Settings
DEFAULT_LLM_PROVIDER=openai
DEFAULT_MODEL=gpt-4o-mini
MAX_TOKENS_STAGE1=2000
MAX_TOKENS_STAGE2=4000

# Security
SECRET_KEY=qa-secret-key-generate-strong-32-chars-min
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOW_UNAUTHENTICATED=false

# CORS - Frontend domain
CORS_ORIGINS=["http://localhost:5174"]
FRONTEND_DOMAIN=http://localhost:5174

# Cache
CACHE_TTL_DISCOVERY=604800
CACHE_TTL_PROFILE=86400

# Pipeline
PARALLEL_EXECUTION=true
STAGE1_TIMEOUT=300

# Rate Limiting
RATE_LIMIT_ENABLED=true

# Logging
LOG_LEVEL=INFO
```

#### `backend_v2/.env.uat`
```env
# Application
APP_NAME=Startup Discovery SaaS - UAT
APP_VERSION=2.0.0
ENVIRONMENT=uat
DEBUG=false

# Database
POSTGRES_USER=startup_discovery
POSTGRES_PASSWORD=uat_password_123
POSTGRES_DB=startup_discovery_uat
DATABASE_URL=postgresql://startup_discovery:uat_password_123@localhost:5434/startup_discovery_uat

# Redis
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6381/0
REDIS_ENABLED=true

# LLM API Keys
OPENAI_API_KEY=sk-your-uat-key-here
ANTHROPIC_API_KEY=sk-ant-your-uat-key-here

# Default LLM Settings
DEFAULT_LLM_PROVIDER=openai
DEFAULT_MODEL=gpt-4o-mini
MAX_TOKENS_STAGE1=2000
MAX_TOKENS_STAGE2=4000

# Security
SECRET_KEY=uat-secret-key-generate-strong-32-chars-min
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOW_UNAUTHENTICATED=false

# CORS - Frontend domain
CORS_ORIGINS=["http://localhost:5175"]
FRONTEND_DOMAIN=http://localhost:5175

# Cache
CACHE_TTL_DISCOVERY=604800
CACHE_TTL_PROFILE=86400

# Pipeline
PARALLEL_EXECUTION=true
STAGE1_TIMEOUT=300

# Rate Limiting
RATE_LIMIT_ENABLED=true

# Logging
LOG_LEVEL=INFO
```

---

## 🐳 Step 2: Create Docker Compose Files

### `backend_v2/docker-compose.dev.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: idea3_postgres_dev
    environment:
      POSTGRES_USER: startup_discovery
      POSTGRES_PASSWORD: dev_password_123
      POSTGRES_DB: startup_discovery_dev
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U startup_discovery -d startup_discovery_dev"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app_network_dev

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: idea3_backend_dev
    environment:
      - DATABASE_URL=postgresql://startup_discovery:dev_password_123@postgres:5432/startup_discovery_dev
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env.dev
    ports:
      - "8000:8000"
    volumes:
      - ./migrations:/app/migrations:ro
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app_network_dev
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  redis:
    image: redis:7-alpine
    container_name: idea3_redis_dev
    ports:
      - "6379:6379"
    volumes:
      - redis_data_dev:/data
    command: redis-server --loglevel verbose --logfile /data/redis.log
    restart: unless-stopped
    networks:
      - app_network_dev
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  app_network_dev:
    driver: bridge

volumes:
  postgres_data_dev:
    driver: local
  redis_data_dev:
    driver: local
```

### `backend_v2/docker-compose.qa.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: idea3_postgres_qa
    environment:
      POSTGRES_USER: startup_discovery
      POSTGRES_PASSWORD: qa_password_123
      POSTGRES_DB: startup_discovery_qa
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5433:5432"  # Different port!
    volumes:
      - postgres_data_qa:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U startup_discovery -d startup_discovery_qa"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app_network_qa

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: idea3_backend_qa
    environment:
      - DATABASE_URL=postgresql://startup_discovery:qa_password_123@postgres:5432/startup_discovery_qa
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env.qa
    ports:
      - "8001:8000"  # Different port!
    volumes:
      - ./migrations:/app/migrations:ro
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app_network_qa
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  redis:
    image: redis:7-alpine
    container_name: idea3_redis_qa
    ports:
      - "6380:6379"  # Different port!
    volumes:
      - redis_data_qa:/data
    command: redis-server --loglevel verbose --logfile /data/redis.log
    restart: unless-stopped
    networks:
      - app_network_qa
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  app_network_qa:
    driver: bridge

volumes:
  postgres_data_qa:
    driver: local
  redis_data_qa:
    driver: local
```

### `backend_v2/docker-compose.uat.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: idea3_postgres_uat
    environment:
      POSTGRES_USER: startup_discovery
      POSTGRES_PASSWORD: uat_password_123
      POSTGRES_DB: startup_discovery_uat
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5434:5432"  # Different port!
    volumes:
      - postgres_data_uat:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U startup_discovery -d startup_discovery_uat"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app_network_uat

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: idea3_backend_uat
    environment:
      - DATABASE_URL=postgresql://startup_discovery:uat_password_123@postgres:5432/startup_discovery_uat
      - REDIS_URL=redis://redis:6379/0
    env_file:
      - .env.uat
    ports:
      - "8002:8000"  # Different port!
    volumes:
      - ./migrations:/app/migrations:ro
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app_network_uat
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  redis:
    image: redis:7-alpine
    container_name: idea3_redis_uat
    ports:
      - "6381:6379"  # Different port!
    volumes:
      - redis_data_uat:/data
    command: redis-server --loglevel verbose --logfile /data/redis.log
    restart: unless-stopped
    networks:
      - app_network_uat
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  app_network_uat:
    driver: bridge

volumes:
  postgres_data_uat:
    driver: local
  redis_data_uat:
    driver: local
```

---

## 🎨 Step 3: Configure Frontend

### Frontend Environment Files

#### `frontend/.env.dev`
```env
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

#### `frontend/.env.qa`
```env
VITE_API_URL=http://localhost:8001
VITE_ENVIRONMENT=qa
```

#### `frontend/.env.uat`
```env
VITE_API_URL=http://localhost:8002
VITE_ENVIRONMENT=uat
```

### Update `frontend/vite.config.js`

You'll need to make the proxy config dynamic based on environment. Here's an updated version:

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// Get API URL from environment or default to dev
const API_URL = process.env.VITE_API_URL || "http://localhost:8000";
const API_PORT = API_URL.split(':').pop() || '8000';

export default defineConfig({
  plugins: [
    react(),
    process.env.NODE_ENV === "production" && process.env.VITE_SENTRY_DSN
      ? sentryVitePlugin({
          org: process.env.VITE_SENTRY_ORG,
          project: process.env.VITE_SENTRY_PROJECT,
          authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
        })
      : null,
  ].filter(Boolean),
  server: {
    port: parseInt(process.env.VITE_FRONTEND_PORT || '5173'),
    proxy: {
      "/api": {
        target: API_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'markdown': ['react-markdown'],
          'pdf': ['jspdf', 'html2canvas'],
        },
      },
    },
  },
});
```

### Alternative: Create Separate Vite Configs

Or create separate config files:

- `frontend/vite.config.dev.js` → Port 5173, proxy to 8000
- `frontend/vite.config.qa.js` → Port 5174, proxy to 8001
- `frontend/vite.config.uat.js` → Port 5175, proxy to 8002

---

## 🚀 Step 4: Usage Commands

### Start Dev Environment
```bash
# Terminal 1: Backend
cd backend_v2
docker-compose -f docker-compose.dev.yml --env-file .env.dev up

# Terminal 2: Frontend
cd frontend
cp .env.dev .env
npm run dev
# Access at http://localhost:5173
```

### Start QA Environment
```bash
# Terminal 1: Backend
cd backend_v2
docker-compose -f docker-compose.qa.yml --env-file .env.qa up

# Terminal 2: Frontend
cd frontend
cp .env.qa .env
npm run dev -- --port 5174
# Access at http://localhost:5174
```

### Start UAT Environment
```bash
# Terminal 1: Backend
cd backend_v2
docker-compose -f docker-compose.uat.yml --env-file .env.uat up

# Terminal 2: Frontend
cd frontend
cp .env.uat .env
npm run dev -- --port 5175
# Access at http://localhost:5175
```

### Run Multiple Environments Simultaneously

You can run all 3 at the same time! Just use different terminals:

**Terminal 1 - Dev:**
```bash
cd backend_v2 && docker-compose -f docker-compose.dev.yml --env-file .env.dev up
```

**Terminal 2 - QA:**
```bash
cd backend_v2 && docker-compose -f docker-compose.qa.yml --env-file .env.qa up
```

**Terminal 3 - UAT:**
```bash
cd backend_v2 && docker-compose -f docker-compose.uat.yml --env-file .env.uat up
```

**Terminal 4 - Frontend Dev:**
```bash
cd frontend && cp .env.dev .env && npm run dev
```

**Terminal 5 - Frontend QA:**
```bash
cd frontend && cp .env.qa .env && npm run dev -- --port 5174
```

**Terminal 6 - Frontend UAT:**
```bash
cd frontend && cp .env.uat .env && npm run dev -- --port 5175
```

---

## 📝 Helper Scripts

### Create Startup Scripts

#### `backend_v2/start-dev.ps1` (Windows PowerShell)
```powershell
docker-compose -f docker-compose.dev.yml --env-file .env.dev up
```

#### `backend_v2/start-qa.ps1`
```powershell
docker-compose -f docker-compose.qa.yml --env-file .env.qa up
```

#### `backend_v2/start-uat.ps1`
```powershell
docker-compose -f docker-compose.uat.yml --env-file .env.uat up
```

#### `frontend/start-dev.ps1`
```powershell
Copy-Item .env.dev .env
npm run dev
```

#### `frontend/start-qa.ps1`
```powershell
Copy-Item .env.qa .env
npm run dev -- --port 5174
```

#### `frontend/start-uat.ps1`
```powershell
Copy-Item .env.uat .env
npm run dev -- --port 5175
```

---

## 🔄 Database Migrations

### Run Migrations for Each Environment

```bash
# Dev
docker-compose -f docker-compose.dev.yml --env-file .env.dev run --rm backend alembic upgrade head

# QA
docker-compose -f docker-compose.qa.yml --env-file .env.qa run --rm backend alembic upgrade head

# UAT
docker-compose -f docker-compose.uat.yml --env-file .env.uat run --rm backend alembic upgrade head
```

---

## 🛠️ Useful Commands

### View Logs
```bash
# Dev
docker-compose -f docker-compose.dev.yml --env-file .env.dev logs -f

# QA
docker-compose -f docker-compose.qa.yml --env-file .env.qa logs -f

# UAT
docker-compose -f docker-compose.uat.yml --env-file .env.uat logs -f
```

### Stop Environments
```bash
# Dev
docker-compose -f docker-compose.dev.yml --env-file .env.dev down

# QA
docker-compose -f docker-compose.qa.yml --env-file .env.qa down

# UAT
docker-compose -f docker-compose.uat.yml --env-file .env.uat down
```

### Check Status
```bash
# Dev
docker-compose -f docker-compose.dev.yml --env-file .env.dev ps

# QA
docker-compose -f docker-compose.qa.yml --env-file .env.qa ps

# UAT
docker-compose -f docker-compose.uat.yml --env-file .env.uat ps
```

### Access Databases Directly
```bash
# Dev
psql -h localhost -p 5432 -U startup_discovery -d startup_discovery_dev

# QA
psql -h localhost -p 5433 -U startup_discovery -d startup_discovery_qa

# UAT
psql -h localhost -p 5434 -U startup_discovery -d startup_discovery_uat
```

---

## 📊 Environment Comparison

| Feature | Dev | QA | UAT |
|---------|-----|-----|-----|
| **Backend Port** | 8000 | 8001 | 8002 |
| **Frontend Port** | 5173 | 5174 | 5175 |
| **PostgreSQL Port** | 5432 | 5433 | 5434 |
| **Redis Port** | 6379 | 6380 | 6381 |
| **Database Name** | startup_discovery_dev | startup_discovery_qa | startup_discovery_uat |
| **DEBUG** | true | false | false |
| **LOG_LEVEL** | DEBUG | INFO | INFO |
| **Rate Limiting** | Disabled | Enabled | Enabled |

---

## ✅ Quick Setup Checklist

1. [ ] Create `.env.dev`, `.env.qa`, `.env.uat` in `backend_v2/`
2. [ ] Create `docker-compose.dev.yml`, `docker-compose.qa.yml`, `docker-compose.uat.yml`
3. [ ] Create `.env.dev`, `.env.qa`, `.env.uat` in `frontend/`
4. [ ] Update `vite.config.js` or create separate configs
5. [ ] Test starting Dev environment
6. [ ] Test starting QA environment
7. [ ] Test starting UAT environment
8. [ ] Run migrations for each environment
9. [ ] Verify all environments can run simultaneously

---

## 🆘 Troubleshooting

### Port Already in Use
- Check what's using the port: `netstat -ano | findstr :8000` (Windows) or `lsof -i :8000` (Mac/Linux)
- Stop the conflicting service or change the port in docker-compose file

### Database Connection Errors
- Verify the port in `DATABASE_URL` matches the exposed port in docker-compose
- Check database container is running: `docker ps`
- Check database logs: `docker-compose logs postgres`

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` in frontend `.env` matches backend port
- Check CORS settings in backend `.env` includes frontend URL
- Verify backend is running: `curl http://localhost:8000/health`

### Multiple Environments Conflict
- Each environment uses separate Docker networks (app_network_dev, app_network_qa, app_network_uat)
- Each uses separate volumes (postgres_data_dev, postgres_data_qa, etc.)
- They should not conflict if ports are different

---

## 💡 Tips

1. **Use Different Browser Profiles** - Open each environment in a different browser profile to avoid cookie/session conflicts
2. **Bookmark URLs** - Bookmark each environment URL for quick access
3. **Color Code Terminals** - Use different terminal colors for each environment
4. **Database Dumps** - Export/import data between environments for testing:
   ```bash
   # Export from Dev
   pg_dump -h localhost -p 5432 -U startup_discovery startup_discovery_dev > dev_dump.sql
   
   # Import to QA
   psql -h localhost -p 5433 -U startup_discovery startup_discovery_qa < dev_dump.sql
   ```

---

## 🎯 Summary

**What You Get:**
- ✅ 2-3 separate environments running locally
- ✅ Complete data isolation (separate databases)
- ✅ Can run simultaneously or individually
- ✅ Easy switching between environments
- ✅ No additional server costs

**Setup Time:** 30-45 minutes  
**Resource Usage:** ~2-4GB RAM when all 3 running  
**Disk Space:** ~500MB per environment (databases)

---

**You're all set!** You can now run Dev, QA, and UAT environments locally on your machine. 🎉

