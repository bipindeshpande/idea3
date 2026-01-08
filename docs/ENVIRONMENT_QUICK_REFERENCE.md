# Environment Setup - Quick Reference

## 🎯 Three Environments

1. **DEV** → `dev.yourdomain.com` → Development & Testing
2. **QA** → `qa.yourdomain.com` → Quality Assurance Testing
3. **UAT** → `uat.yourdomain.com` → User Acceptance Testing

---

## 📁 Required Files

### Backend
```
backend_v2/
├── dev.env          # Dev environment variables
├── qa.env           # QA environment variables
├── uat.env          # UAT environment variables
├── production.env   # Production environment variables
├── docker-compose.dev.yml
├── docker-compose.qa.yml
├── docker-compose.uat.yml
└── docker-compose.prod.yml
```

### Frontend
```
frontend/
├── .env.dev         # Dev frontend config
├── .env.qa          # QA frontend config
├── .env.uat         # UAT frontend config
└── .env.production  # Production frontend config
```

---

## 🚀 Quick Commands

### Deploy to Dev
```bash
cd backend_v2
docker-compose -f docker-compose.dev.yml --env-file dev.env up -d
docker-compose -f docker-compose.dev.yml --env-file dev.env run --rm backend alembic upgrade head
```

### Deploy to QA
```bash
cd backend_v2
docker-compose -f docker-compose.qa.yml --env-file qa.env up -d
docker-compose -f docker-compose.qa.yml --env-file qa.env run --rm backend alembic upgrade head
```

### Deploy to UAT
```bash
cd backend_v2
docker-compose -f docker-compose.uat.yml --env-file uat.env up -d
docker-compose -f docker-compose.uat.yml --env-file uat.env run --rm backend alembic upgrade head
```

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

---

## 🔑 Key Differences

| Setting | Dev | QA | UAT |
|---------|-----|-----|-----|
| **DEBUG** | `true` | `false` | `false` |
| **LOG_LEVEL** | `DEBUG` | `INFO` | `INFO` |
| **RATE_LIMIT_ENABLED** | `false` | `true` | `true` |
| **ALLOW_UNAUTHENTICATED** | `true` | `false` | `false` |
| **Database** | `startup_discovery_dev` | `startup_discovery_qa` | `startup_discovery_uat` |

---

## 📋 Environment Variables Checklist

Each environment file must have:
- [ ] Unique `SECRET_KEY` (generate with: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`)
- [ ] Unique `POSTGRES_PASSWORD`
- [ ] Unique `REDIS_PASSWORD`
- [ ] Correct `DATABASE_URL` with matching database name
- [ ] Correct `REDIS_URL` with matching password
- [ ] Correct `CORS_ORIGINS` with matching domain
- [ ] `ENVIRONMENT` set to: `development`, `qa`, `uat`, or `production`

---

## 🌐 DNS Configuration

```
Type    Name    Value
A       dev     <DEV_SERVER_IP>
A       qa      <QA_SERVER_IP>
A       uat     <UAT_SERVER_IP>
```

---

## 💰 Cost Options

- **Option 1:** 3 separate servers = $60/month (recommended)
- **Option 2:** 1 server with containers = $20/month
- **Option 3:** Branch-based deployments = $20/month

---

## 📚 Full Guide

See `docs/MULTI_ENVIRONMENT_SETUP_GUIDE.md` for complete details.

