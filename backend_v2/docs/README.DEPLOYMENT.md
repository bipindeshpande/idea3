# Production Deployment Guide

This guide covers deploying the Startup Discovery SaaS backend and frontend using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed
- Domain name configured (for SSL)
- SSL certificates (Let's Encrypt recommended)

## Quick Start

1. **Copy environment file:**
   ```bash
   cp production.env.example production.env
   ```

2. **Edit `production.env` with your values:**
   - Database passwords
   - Redis password
   - LLM API keys
   - Secret key (generate with: `openssl rand -hex 32`)
   - Frontend domain for CORS

3. **Generate SSL certificates (Let's Encrypt):**
   ```bash
   # Install certbot
   sudo apt-get install certbot
   
   # Generate certificates
   sudo certbot certonly --standalone -d yourdomain.com
   
   # Copy certificates to nginx/ssl/
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
   sudo chmod 644 nginx/ssl/*.pem
   ```

4. **Build frontend:**
   ```bash
   cd ../frontend
   npm run build
   cd ../backend_v2
   ```

5. **Deploy:**
   ```bash
   # Linux/Mac
   chmod +x deploy.sh
   ./deploy.sh
   
   # Windows
   .\deploy.ps1
   ```

## Manual Deployment

If you prefer manual steps:

```bash
# 1. Build images
docker-compose -f docker-compose.prod.yml build

# 2. Run migrations
docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head

# 3. Start services
docker-compose -f docker-compose.prod.yml up -d

# 4. Check status
docker-compose -f docker-compose.prod.yml ps
```

## Services

- **Backend**: FastAPI application (port 8000, internal)
- **Worker**: RQ worker for background jobs (2 replicas)
- **PostgreSQL**: Database (internal)
- **Redis**: Cache and queue (internal)
- **NGINX**: Reverse proxy with SSL (ports 80, 443)

## Health Checks

All services have health checks configured:

- Backend: `GET /health`
- Worker: Redis connection check
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- NGINX: HTTP health check

## Scaling Workers

To scale RQ workers:

```bash
docker-compose -f docker-compose.prod.yml up -d --scale worker=4
```

## Monitoring

View logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f [service_name]
```

Check service status:
```bash
docker-compose -f docker-compose.prod.yml ps
```

## SSL Certificate Renewal

Let's Encrypt certificates expire every 90 days. Set up automatic renewal:

```bash
# Add to crontab
0 0 * * * certbot renew --quiet && docker-compose -f /path/to/docker-compose.prod.yml restart nginx
```

## Backup

### Database Backup
```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U startup_discovery startup_discovery > backup.sql
```

### Restore
```bash
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U startup_discovery startup_discovery < backup.sql
```

## Troubleshooting

### Services won't start
- Check `production.env` file exists and has correct values
- Check SSL certificates exist in `nginx/ssl/`
- Check ports 80/443 are not in use

### Database connection errors
- Verify `POSTGRES_PASSWORD` in `production.env`
- Check postgres container is healthy: `docker-compose -f docker-compose.prod.yml ps postgres`

### Redis connection errors
- Verify `REDIS_PASSWORD` in `production.env`
- Check redis container is healthy

### Frontend not loading
- Verify frontend build exists in `frontend/dist/`
- Check NGINX logs: `docker-compose -f docker-compose.prod.yml logs nginx`

## Security Notes

- Never commit `production.env` to version control
- Use strong passwords for database and Redis
- Keep SSL certificates secure
- Regularly update Docker images
- Monitor logs for suspicious activity

## Environment Variables

See `production.env.example` for all required variables.

Key variables:
- `SECRET_KEY`: Generate with `openssl rand -hex 32`
- `POSTGRES_PASSWORD`: Strong password
- `REDIS_PASSWORD`: Strong password
- `CORS_ORIGINS`: JSON array of allowed frontend domains
- `FRONTEND_DOMAIN`: Primary frontend domain

