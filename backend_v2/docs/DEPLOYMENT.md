# Production Deployment Guide

This guide covers deploying the Startup Discovery API backend to production using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Access to a Docker registry (Docker Hub, AWS ECR, etc.)
- Production environment variables configured
- Database migrations ready

## Quick Start

### 1. Configure Environment

Copy the production environment template:

```bash
cp production.env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` - PostgreSQL connection string (use `postgres` hostname in Docker)
- `REDIS_URL` - Redis connection string (use `redis` hostname in Docker)
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - LLM provider API keys
- `SECRET_KEY` - Strong random secret key (min 32 characters)
- `CORS_ORIGINS` - Production frontend domain(s)

**CORS Configuration:**
- JSON array: `CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]`
- Comma-separated: `CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`

### 2. Run Database Migrations

Before starting the backend, ensure migrations are applied:

```bash
# Start only PostgreSQL
docker-compose up -d postgres

# Run migrations (from host or inside container)
alembic upgrade head
```

### 3. Build and Deploy

#### Option A: Using Docker Compose (Recommended for Development/Staging)

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

#### Option B: Using Build Scripts (Recommended for Production)

**Linux/Mac:**
```bash
# Build image
./scripts/build.sh build

# Build and push to registry
export REGISTRY_USER=your-username
./scripts/build.sh build-push

# Deploy to server
./scripts/build.sh deploy
```

**Windows (PowerShell):**
```powershell
# Build image
.\scripts\build.ps1 build

# Build and push to registry
$env:REGISTRY_USER = "your-username"
.\scripts\build.ps1 build-push

# Deploy to server
.\scripts\build.ps1 deploy
```

### 4. Verify Deployment

Check health endpoint:
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

Check container status:
```bash
docker ps
docker logs idea2_backend
```

## Docker Compose Services

The `docker-compose.yml` includes:

- **postgres**: PostgreSQL 16 database
- **backend**: FastAPI application (4 workers)
- **redis**: Redis cache server

All services are connected via `app_network` internal network.

## Health Checks

- Backend: `GET /health` returns `{"status": "ok"}`
- PostgreSQL: `pg_isready` check every 10s
- Redis: `redis-cli ping` check every 10s

## Container Configuration

### Backend Container

- **Image**: Built from `Dockerfile`
- **Port**: 8000 (mapped to host)
- **Workers**: 4 Uvicorn workers
- **Restart**: `unless-stopped`
- **Health Check**: Every 30s

### Environment Variables

The backend container uses:
- `.env` file (via `env_file`)
- `DATABASE_URL` (overrides .env for Docker network)
- `REDIS_URL` (overrides .env for Docker network)

## Production Checklist

- [ ] Set strong `SECRET_KEY` in `.env`
- [ ] Configure production `CORS_ORIGINS`
- [ ] Set production database credentials
- [ ] Configure LLM API keys
- [ ] Run database migrations
- [ ] Test health endpoint
- [ ] Configure reverse proxy (nginx/traefik) if needed
- [ ] Set up SSL/TLS certificates
- [ ] Configure log aggregation
- [ ] Set up monitoring and alerts
- [ ] Test auto-restart on crash

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs idea2_backend

# Check if database is ready
docker-compose ps postgres
docker exec idea2_postgres pg_isready -U startup_discovery
```

### Database connection errors

- Verify `DATABASE_URL` uses `postgres` hostname (not `localhost`)
- Check PostgreSQL container is running: `docker ps | grep postgres`
- Verify network connectivity: `docker network inspect idea2_app_network`

### CORS errors

- Verify `CORS_ORIGINS` includes your frontend domain
- Check format (JSON array or comma-separated)
- Ensure no trailing slashes in URLs

### High memory usage

- Reduce Uvicorn workers in `Dockerfile` CMD
- Adjust `MAX_TOKENS_STAGE1` and `MAX_TOKENS_STAGE2` in config

## Scaling

To scale the backend:

```bash
# Scale to 3 backend instances
docker-compose up -d --scale backend=3
```

Note: You'll need a load balancer (nginx/traefik) in front for proper distribution.

## Backup and Recovery

### Database Backup

```bash
# Backup
docker exec idea2_postgres pg_dump -U startup_discovery startup_discovery > backup.sql

# Restore
docker exec -i idea2_postgres psql -U startup_discovery startup_discovery < backup.sql
```

### Volume Backup

```bash
# Backup volumes
docker run --rm -v idea2_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

## Security Considerations

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Use strong SECRET_KEY** - Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
3. **Limit CORS origins** - Only include production domains
4. **Use non-root user** - Dockerfile already uses `appuser` (UID 1000)
5. **Keep dependencies updated** - Regularly update `requirements.txt`
6. **Use secrets management** - Consider Docker secrets or external vault for production

## Monitoring

Recommended monitoring endpoints:

- Health: `GET /health`
- Root: `GET /` (returns app info)

Consider adding:
- Prometheus metrics endpoint
- Structured logging (JSON)
- Error tracking (Sentry)
- APM (Datadog, New Relic)

## Support

For issues or questions, check:
- Application logs: `docker logs idea2_backend`
- Database logs: `docker logs idea2_postgres`
- Network status: `docker network inspect idea2_app_network`

