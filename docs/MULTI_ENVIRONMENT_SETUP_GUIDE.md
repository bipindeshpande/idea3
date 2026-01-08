# Multi-Environment Setup Guide
## Dev → QA → UAT → Production Pipeline

**Last Updated:** January 2025  
**Purpose:** Set up and manage 3 separate environments (Dev, QA, UAT) with proper isolation and configuration.

---

## 🎯 Overview

This guide explains how to maintain three separate environments:

1. **DEV (Development)** - For active development and testing
2. **QA (Quality Assurance)** - For QA team testing before UAT
3. **UAT (User Acceptance Testing)** - For stakeholder/client testing before production

---

## 📋 Architecture Approach

### Option 1: Separate Servers/Instances (Recommended for Production)
- **3 separate AWS Lightsail instances** (or similar)
- Each environment has its own:
  - Server/container
  - Database
  - Redis cache
  - Domain/subdomain
- **Cost:** ~$60/month (3 × $20/month instances)
- **Best for:** Production-grade environments with full isolation

### Option 2: Single Server with Separate Containers
- **1 AWS Lightsail instance** with 3 separate Docker Compose stacks
- Each environment runs on different ports
- Separate databases and Redis instances
- **Cost:** ~$20/month
- **Best for:** Cost-effective setup, smaller teams

### Option 3: Branch-Based Deployments
- **1 production server** with automatic deployments from Git branches
- `dev` branch → Dev environment
- `qa` branch → QA environment  
- `uat` branch → UAT environment
- **Cost:** ~$20/month
- **Best for:** CI/CD pipeline with automated deployments

---

## 🏗️ Recommended Setup: Option 1 (Separate Instances)

### Environment Structure

```
┌─────────────────────────────────────────────────────────┐
│                    DEV Environment                       │
│  Domain: dev.yourdomain.com                             │
│  Database: startup_discovery_dev                         │
│  Redis: redis_dev                                        │
│  Ports: 80, 443, 8000 (internal)                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    QA Environment                        │
│  Domain: qa.yourdomain.com                              │
│  Database: startup_discovery_qa                          │
│  Redis: redis_qa                                         │
│  Ports: 80, 443, 8000 (internal)                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    UAT Environment                       │
│  Domain: uat.yourdomain.com                             │
│  Database: startup_discovery_uat                        │
│  Redis: redis_uat                                        │
│  Ports: 80, 443, 8000 (internal)                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

### Backend Environment Files

Create separate environment files for each environment:

```
backend_v2/
├── .env                    # Local development (gitignored)
├── dev.env                 # Dev environment config
├── qa.env                  # QA environment config
├── uat.env                 # UAT environment config
├── production.env          # Production environment config
└── production.env.example  # Template (committed to git)
```

### Docker Compose Files

```
backend_v2/
├── docker-compose.yml           # Local development
├── docker-compose.dev.yml       # Dev environment
├── docker-compose.qa.yml        # QA environment
├── docker-compose.uat.yml       # UAT environment
└── docker-compose.prod.yml      # Production environment
```

---

## 🔧 Configuration Files

### 1. Environment Variable Files

#### `backend_v2/dev.env`
```env
# Application
APP_NAME=Startup Discovery SaaS - DEV
APP_VERSION=2.0.0
ENVIRONMENT=development
DEBUG=true

# Database
POSTGRES_USER=startup_discovery
POSTGRES_PASSWORD=dev_password_strong_123!
POSTGRES_DB=startup_discovery_dev
DATABASE_URL=postgresql://startup_discovery:dev_password_strong_123!@postgres:5432/startup_discovery_dev

# Redis
REDIS_PASSWORD=dev_redis_password_123!
REDIS_URL=redis://:dev_redis_password_123!@redis:6379/0
REDIS_ENABLED=true

# LLM API Keys (use test/sandbox keys if available)
OPENAI_API_KEY=sk-dev-key-here
ANTHROPIC_API_KEY=sk-ant-dev-key-here

# Default LLM Settings
DEFAULT_LLM_PROVIDER=openai
DEFAULT_MODEL=gpt-4o-mini
MAX_TOKENS_STAGE1=2000
MAX_TOKENS_STAGE2=4000

# Security
SECRET_KEY=dev-secret-key-change-in-production-32-chars-min
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOW_UNAUTHENTICATED=true  # Easier for dev testing

# CORS - Frontend domain
CORS_ORIGINS=["https://dev.yourdomain.com","http://localhost:5173"]
FRONTEND_DOMAIN=https://dev.yourdomain.com

# Cache
CACHE_TTL_DISCOVERY=3600  # 1 hour (shorter for dev)
CACHE_TTL_PROFILE=1800    # 30 minutes

# Pipeline
PARALLEL_EXECUTION=true
STAGE1_TIMEOUT=300

# Rate Limiting
RATE_LIMIT_ENABLED=false  # Disabled for dev

# Logging
LOG_LEVEL=DEBUG

# Monitoring (optional for dev)
# SENTRY_DSN=https://xxx@sentry.io/xxx
```

#### `backend_v2/qa.env`
```env
# Application
APP_NAME=Startup Discovery SaaS - QA
APP_VERSION=2.0.0
ENVIRONMENT=qa
DEBUG=false

# Database
POSTGRES_USER=startup_discovery
POSTGRES_PASSWORD=qa_password_strong_123!
POSTGRES_DB=startup_discovery_qa
DATABASE_URL=postgresql://startup_discovery:qa_password_strong_123!@postgres:5432/startup_discovery_qa

# Redis
REDIS_PASSWORD=qa_redis_password_123!
REDIS_URL=redis://:qa_redis_password_123!@redis:6379/0
REDIS_ENABLED=true

# LLM API Keys (use production keys but with rate limiting)
OPENAI_API_KEY=sk-qa-key-here
ANTHROPIC_API_KEY=sk-ant-qa-key-here

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
CORS_ORIGINS=["https://qa.yourdomain.com"]
FRONTEND_DOMAIN=https://qa.yourdomain.com

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

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

#### `backend_v2/uat.env`
```env
# Application
APP_NAME=Startup Discovery SaaS - UAT
APP_VERSION=2.0.0
ENVIRONMENT=uat
DEBUG=false

# Database
POSTGRES_USER=startup_discovery
POSTGRES_PASSWORD=uat_password_strong_123!
POSTGRES_DB=startup_discovery_uat
DATABASE_URL=postgresql://startup_discovery:uat_password_strong_123!@postgres:5432/startup_discovery_uat

# Redis
REDIS_PASSWORD=uat_redis_password_123!
REDIS_URL=redis://:uat_redis_password_123!@redis:6379/0
REDIS_ENABLED=true

# LLM API Keys (production keys)
OPENAI_API_KEY=sk-uat-key-here
ANTHROPIC_API_KEY=sk-ant-uat-key-here

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
CORS_ORIGINS=["https://uat.yourdomain.com"]
FRONTEND_DOMAIN=https://uat.yourdomain.com

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

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

### 2. Docker Compose Files

#### `backend_v2/docker-compose.dev.yml`
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: idea3_postgres_dev
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-startup_discovery}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-startup_discovery_dev}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-startup_discovery} -d ${POSTGRES_DB:-startup_discovery_dev}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app_network_dev

  redis:
    image: redis:7-alpine
    container_name: idea3_redis_dev
    volumes:
      - redis_data_dev:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    restart: unless-stopped
    networks:
      - app_network_dev
    healthcheck:
      test: ["CMD", "redis-cli", "--no-auth-warning", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile.prod
    container_name: idea3_backend_dev
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER:-startup_discovery}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-startup_discovery_dev}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
      - ENVIRONMENT=development
      - DEBUG=true
    env_file:
      - dev.env
    volumes:
      - ./migrations:/app/migrations:ro
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app_network_dev
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    container_name: idea3_worker_dev
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER:-startup_discovery}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-startup_discovery_dev}
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
      - ENVIRONMENT=development
      - DEBUG=true
    env_file:
      - dev.env
    volumes:
      - ./migrations:/app/migrations:ro
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - app_network_dev
    deploy:
      replicas: 1  # Single worker for dev

  nginx:
    image: nginx:alpine
    container_name: idea3_nginx_dev
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app_network_dev
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  app_network_dev:
    driver: bridge

volumes:
  postgres_data_dev:
    driver: local
  redis_data_dev:
    driver: local
```

#### `backend_v2/docker-compose.qa.yml` and `backend_v2/docker-compose.uat.yml`
- Similar structure to `docker-compose.dev.yml`
- Change:
  - Container names: `idea3_postgres_qa`, `idea3_redis_qa`, etc.
  - Network: `app_network_qa`
  - Volumes: `postgres_data_qa`, `redis_data_qa`
  - Environment file: `qa.env` or `uat.env`
  - Environment variables: `ENVIRONMENT=qa` or `ENVIRONMENT=uat`

---

## 🚀 Deployment Process

### Step 1: Create Environment Files

1. **Copy template:**
   ```bash
   cd backend_v2
   cp production.env.example dev.env
   cp production.env.example qa.env
   cp production.env.example uat.env
   ```

2. **Edit each file** with environment-specific values (see examples above)

3. **Generate secure keys:**
   ```bash
   # Generate SECRET_KEY for each environment
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

### Step 2: Create Docker Compose Files

1. **Copy production compose file:**
   ```bash
   cp docker-compose.prod.yml docker-compose.dev.yml
   cp docker-compose.prod.yml docker-compose.qa.yml
   cp docker-compose.prod.yml docker-compose.uat.yml
   ```

2. **Modify each file** with environment-specific names and networks

### Step 3: Deploy to Each Environment

#### Dev Environment
```bash
# On dev server
cd ~/app/backend_v2

# Build frontend
cd ../frontend
npm run build

# Start services
cd ../backend_v2
docker-compose -f docker-compose.dev.yml --env-file dev.env up -d

# Run migrations
docker-compose -f docker-compose.dev.yml --env-file dev.env run --rm backend alembic upgrade head
```

#### QA Environment
```bash
# On QA server
cd ~/app/backend_v2
cd ../frontend
npm run build
cd ../backend_v2
docker-compose -f docker-compose.qa.yml --env-file qa.env up -d
docker-compose -f docker-compose.qa.yml --env-file qa.env run --rm backend alembic upgrade head
```

#### UAT Environment
```bash
# On UAT server
cd ~/app/backend_v2
cd ../frontend
npm run build
cd ../backend_v2
docker-compose -f docker-compose.uat.yml --env-file uat.env up -d
docker-compose -f docker-compose.uat.yml --env-file uat.env run --rm backend alembic upgrade head
```

---

## 🌐 Domain Configuration

### DNS Setup

For each environment, create subdomains:

```
Type    Name    Value                    TTL
A       dev     <DEV_SERVER_IP>          3600
A       qa      <QA_SERVER_IP>           3600
A       uat     <UAT_SERVER_IP>          3600
```

### SSL Certificates

Generate SSL certificates for each subdomain:

```bash
# Dev
sudo certbot certonly --standalone -d dev.yourdomain.com

# QA
sudo certbot certonly --standalone -d qa.yourdomain.com

# UAT
sudo certbot certonly --standalone -d uat.yourdomain.com
```

---

## 🔄 Deployment Workflow

### Typical Flow

```
1. Developer commits code → Git repository
   ↓
2. Dev environment auto-deploys (or manual)
   ↓
3. Developer tests in Dev
   ↓
4. Code merged to QA branch → QA environment deploys
   ↓
5. QA team tests in QA environment
   ↓
6. Code merged to UAT branch → UAT environment deploys
   ↓
7. Stakeholders test in UAT environment
   ↓
8. Code merged to main/production → Production deploys
```

### Git Branch Strategy

```
main          → Production
├── uat       → UAT environment
├── qa        → QA environment
└── dev       → Dev environment
```

---

## 📊 Environment Comparison

| Feature | Dev | QA | UAT | Production |
|---------|-----|-----|-----|------------|
| **Debug Mode** | ✅ Enabled | ❌ Disabled | ❌ Disabled | ❌ Disabled |
| **Log Level** | DEBUG | INFO | INFO | INFO |
| **Rate Limiting** | ❌ Disabled | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| **Unauthenticated Access** | ✅ Allowed | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| **Cache TTL** | Short (1hr) | Normal | Normal | Normal |
| **Database** | Separate | Separate | Separate | Separate |
| **Monitoring** | Optional | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| **Backups** | Optional | ✅ Daily | ✅ Daily | ✅ Daily |

---

## 🔐 Security Best Practices

1. **Separate Secrets:**
   - Each environment must have unique `SECRET_KEY`
   - Different database passwords
   - Different Redis passwords

2. **Access Control:**
   - Dev: Open to development team
   - QA: Open to QA team + developers
   - UAT: Open to stakeholders + QA team
   - Production: Restricted access

3. **API Keys:**
   - Use separate API keys for each environment if possible
   - Monitor usage per environment
   - Set rate limits appropriately

4. **Environment Files:**
   - **NEVER commit** `.env`, `dev.env`, `qa.env`, `uat.env`, `production.env` to Git
   - Add to `.gitignore`
   - Use `.env.example` files as templates

---

## 📝 Frontend Configuration

### Environment-Specific Builds

The frontend needs to know which backend to connect to. You can:

#### Option A: Build-time Environment Variables

Create `.env` files in `frontend/`:

**`frontend/.env.dev`**
```env
VITE_API_URL=https://dev.yourdomain.com
VITE_ENVIRONMENT=development
VITE_SENTRY_DSN=your-dev-sentry-dsn
```

**`frontend/.env.qa`**
```env
VITE_API_URL=https://qa.yourdomain.com
VITE_ENVIRONMENT=qa
VITE_SENTRY_DSN=your-qa-sentry-dsn
```

**`frontend/.env.uat`**
```env
VITE_API_URL=https://uat.yourdomain.com
VITE_ENVIRONMENT=uat
VITE_SENTRY_DSN=your-uat-sentry-dsn
```

**Build commands:**
```bash
# Dev
cp frontend/.env.dev frontend/.env
cd frontend && npm run build

# QA
cp frontend/.env.qa frontend/.env
cd frontend && npm run build

# UAT
cp frontend/.env.uat frontend/.env
cd frontend && npm run build
```

#### Option B: Runtime Configuration

Use a config file that's loaded at runtime (not at build time):

```javascript
// frontend/src/config/api.js
const config = {
  development: {
    apiUrl: 'https://dev.yourdomain.com',
  },
  qa: {
    apiUrl: 'https://qa.yourdomain.com',
  },
  uat: {
    apiUrl: 'https://uat.yourdomain.com',
  },
  production: {
    apiUrl: 'https://yourdomain.com',
  },
};

const env = import.meta.env.MODE || 'development';
export default config[env] || config.development;
```

---

## 🛠️ Maintenance Commands

### View Logs
```bash
# Dev
docker-compose -f docker-compose.dev.yml --env-file dev.env logs -f

# QA
docker-compose -f docker-compose.qa.yml --env-file qa.env logs -f

# UAT
docker-compose -f docker-compose.uat.yml --env-file uat.env logs -f
```

### Restart Services
```bash
# Dev
docker-compose -f docker-compose.dev.yml --env-file dev.env restart

# QA
docker-compose -f docker-compose.qa.yml --env-file qa.env restart

# UAT
docker-compose -f docker-compose.uat.yml --env-file uat.env restart
```

### Update Application
```bash
# Dev
cd ~/app
git pull origin dev
cd frontend && npm install && npm run build
cd ../backend_v2
docker-compose -f docker-compose.dev.yml --env-file dev.env up -d --build
docker-compose -f docker-compose.dev.yml --env-file dev.env run --rm backend alembic upgrade head
```

### Check Status
```bash
# Dev
docker-compose -f docker-compose.dev.yml --env-file dev.env ps

# QA
docker-compose -f docker-compose.qa.yml --env-file qa.env ps

# UAT
docker-compose -f docker-compose.uat.yml --env-file uat.env ps
```

---

## 💰 Cost Breakdown

### Option 1: Separate Instances (Recommended)
- **Dev Server:** $20/month
- **QA Server:** $20/month
- **UAT Server:** $20/month
- **Total:** $60/month

### Option 2: Single Server with Containers
- **Single Server:** $20/month
- **Total:** $20/month

### Option 3: Branch-Based Deployments
- **Single Server:** $20/month
- **Total:** $20/month

---

## ✅ Checklist

### Initial Setup
- [ ] Create 3 environment files (`dev.env`, `qa.env`, `uat.env`)
- [ ] Create 3 Docker Compose files (`docker-compose.dev.yml`, `docker-compose.qa.yml`, `docker-compose.uat.yml`)
- [ ] Set up 3 servers/instances (or configure single server)
- [ ] Configure DNS for subdomains (dev, qa, uat)
- [ ] Generate SSL certificates for each subdomain
- [ ] Set up separate databases for each environment
- [ ] Configure frontend builds for each environment
- [ ] Set up monitoring (Sentry) for each environment
- [ ] Configure backups for QA and UAT databases

### Security
- [ ] Generate unique `SECRET_KEY` for each environment
- [ ] Use strong, unique passwords for each database
- [ ] Use strong, unique passwords for each Redis instance
- [ ] Add all `.env` files to `.gitignore`
- [ ] Set up access controls for each environment
- [ ] Configure CORS properly for each environment

### Deployment
- [ ] Set up Git branches (dev, qa, uat, main)
- [ ] Configure CI/CD pipeline (optional)
- [ ] Document deployment process
- [ ] Test deployment to each environment
- [ ] Verify database migrations work in each environment

---

## 🆘 Troubleshooting

### Database Connection Issues
- Check environment file has correct database credentials
- Verify database container is running: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`

### CORS Errors
- Verify `CORS_ORIGINS` in environment file matches frontend domain
- Check nginx configuration allows CORS headers

### Environment Variables Not Loading
- Ensure `--env-file` flag is used with docker-compose
- Check file path is correct
- Verify environment file syntax (no spaces around `=`)

### Port Conflicts
- If running multiple environments on same server, use different ports
- Or use separate servers (recommended)

---

## 📚 Additional Resources

- **Production Deployment:** See `docs/SIMPLE_PRODUCTION_DEPLOYMENT_GUIDE.md`
- **AWS Lightsail Guide:** See `docs/AWS_LIGHTSAIL_DEPLOYMENT.md`
- **Monitoring Setup:** See `docs/PRODUCTION_MONITORING_GUIDE.md`

---

## 🎯 Summary

**Recommended Approach:**
1. Use **Option 1 (Separate Instances)** for production-grade environments
2. Create separate environment files for each environment
3. Use separate Docker Compose files for isolation
4. Set up subdomains (dev, qa, uat) with SSL
5. Implement proper Git branch strategy
6. Configure monitoring and backups for QA and UAT

**Total Setup Time:** 2-3 hours  
**Monthly Cost:** $60 (separate instances) or $20 (single server)  
**Maintenance:** 15-30 minutes per deployment

---

**You're all set!** Follow this guide to set up your three environments and maintain a proper Dev → QA → UAT → Production pipeline.

