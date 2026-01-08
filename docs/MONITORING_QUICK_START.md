# Monitoring Quick Start (5 Minutes)

## ✅ What's Already Done

- ✅ Sentry SDK installed (backend & frontend)
- ✅ Error tracking configured
- ✅ Performance monitoring enabled
- ✅ Error filtering configured
- ✅ Documentation created

## 🚀 What You Need to Do

### 1. Create Sentry Account (2 min)
- Go to [sentry.io](https://sentry.io) → Sign up (free)
- Create 2 projects: "Backend" (Python/FastAPI) and "Frontend" (React)

### 2. Get DSNs (1 min)
- Copy DSN from each project settings
- Backend DSN → `SENTRY_DSN` in `production.env`
- Frontend DSN → `VITE_SENTRY_DSN` in frontend environment

### 3. Add to Environment (1 min)
**Backend (`production.env`):**
```env
SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Frontend (`.env.production` or build env):**
```env
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### 4. Test (1 min)
- Deploy or run locally
- Trigger a test error
- Check Sentry dashboard - error should appear!

## 📧 Set Up Alerts

1. Sentry → Settings → Alerts
2. Create alert: "When issue is created" → Email you
3. Done!

## 🎉 That's It!

You now have:
- ✅ Error tracking
- ✅ Performance monitoring  
- ✅ Email alerts
- ✅ Free tier (5,000 events/month)

**Full guide:** See `docs/MONITORING_SETUP_GUIDE.md`

