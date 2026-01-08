# Production Setup: Vercel + Railway

**Streamlined Production Readiness for Platform-as-a-Service Deployments**

---

## Overview

If you're deploying to **Vercel (frontend)** + **Railway (backend)**, you get many built-in features that simplify production setup. Here's what you **still need** vs what's **already handled**.

---

## ✅ What Vercel + Railway Provide Out-of-the-Box

### Vercel Provides:
- ✅ **SSL Certificates**: Automatic HTTPS
- ✅ **CDN**: Global edge network
- ✅ **Basic Analytics**: Traffic and performance metrics
- ✅ **Automatic Deployments**: Git-based deployments
- ✅ **Environment Variables**: Secure secret management
- ✅ **Edge Functions**: Serverless functions
- ✅ **Preview Deployments**: Branch previews
- ✅ **Performance Monitoring**: Core Web Vitals tracking
- ✅ **Basic Error Logging**: Vercel dashboard shows errors

### Railway Provides:
- ✅ **SSL Certificates**: Automatic HTTPS
- ✅ **Monitoring Dashboard**: CPU, memory, network metrics
- ✅ **Log Aggregation**: Centralized logs in dashboard
- ✅ **Health Checks**: Automatic health monitoring
- ✅ **Auto-scaling**: Can scale based on load
- ✅ **Database Backups**: Automatic backups for Railway databases
- ✅ **Environment Variables**: Secure secret management
- ✅ **One-Click Deployments**: Git-based deployments
- ✅ **Metrics**: Request counts, response times, error rates

---

## ⚠️ What You Still Need

### Critical (Must Have)

#### 1. **Error Tracking** 🔴
**Why**: Vercel/Railway show errors but don't provide full error tracking with stack traces, user context, and alerting.

**Recommended**: **Sentry** (free tier: 5,000 events/month)

**Setup Time**: 15-30 minutes

**For Backend (Railway)**:
```python
# In your FastAPI app
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    environment="production",
    traces_sample_rate=0.1,
)
```

**For Frontend (Vercel)**:
```javascript
// In your React app
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: "production",
});
```

**Cost**: Free (up to 5k events/month)

---

#### 2. **External Uptime Monitoring** 📡
**Why**: Railway/Vercel can go down. You need external monitoring to know when they're down.

**Recommended**: **UptimeRobot** (free tier: 50 monitors, 5-min checks)

**Setup**:
1. Sign up at uptimerobot.com
2. Add monitor:
   - URL: `https://your-domain.railway.app/health`
   - Interval: 5 minutes
   - Alert: Email/SMS

**Cost**: Free

**Alternative**: Pingdom ($10/month) for 1-min checks

---

#### 3. **Database Backups** (If using external database) 💾
**Why**: Railway provides backups for Railway-managed databases, but if you're using external PostgreSQL, you need your own backups.

**If using Railway PostgreSQL**: ✅ Covered - automatic daily backups  
**If using external DB** (AWS RDS, DigitalOcean, etc.): ⚠️ You need backups

**Quick Setup** (for external DB):
```bash
# Daily backup script
#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
# Upload to S3 or similar
```

---

### Important (Should Have)

#### 4. **Load Testing** ⚡
**Why**: Even with auto-scaling, you need to know:
- What traffic your app can handle
- Where bottlenecks are
- Cost implications of scaling

**Recommended**: **Locust** or **k6** (free)

**Minimal Setup**: Test your critical endpoints before launch

**When to do it**:
- Before production launch
- After major changes
- Periodically (quarterly)

**Time**: 2-4 hours to set up and run first test

---

#### 5. **Application Performance Monitoring (APM)** 📊
**Why**: Railway shows basic metrics, but not detailed application performance (slow queries, endpoint breakdowns, etc.)

**Railway provides**: Basic metrics (CPU, memory, request counts)  
**You might want**: Detailed APM (slow endpoints, database queries, etc.)

**Options**:
- **Sentry Performance** (free with Sentry account)
- **New Relic** ($0-25/month for small apps)
- **Skip for now** if budget is tight - Railway metrics might be enough initially

---

### Optional (Nice to Have)

#### 6. **Advanced Monitoring Dashboards** 📈
**Why**: Railway dashboard is good, but you might want custom dashboards.

**Skip if**: Railway dashboard meets your needs  
**Consider if**: You want custom metrics, better visualization, or multi-service dashboards

**Options**: Grafana (self-hosted) or Datadog (paid)

---

#### 7. **Log Aggregation & Search** 🔍
**Why**: Railway has logs, but advanced search/filtering might be limited.

**Railway provides**: Basic logs in dashboard  
**You might want**: Advanced search, filtering, alerting on log patterns

**Skip for now** - Railway logs should be sufficient initially

---

## 🎯 Minimal Production Setup for Vercel + Railway

### Week 1: Essential (2-3 hours)

1. **✅ Set up Sentry** (30 min)
   - Backend: Add Sentry SDK to FastAPI
   - Frontend: Add Sentry SDK to React
   - Configure alerts

2. **✅ Set up UptimeRobot** (15 min)
   - Monitor backend health endpoint
   - Monitor frontend URL
   - Configure email alerts

3. **✅ Verify Database Backups** (30 min)
   - If Railway DB: Verify backups are enabled
   - If external DB: Set up automated backups

**Total Time**: ~2 hours  
**Cost**: $0/month (all free tiers)

---

### Week 2: Important (4-6 hours)

4. **✅ Load Testing** (2-4 hours)
   - Set up Locust or k6
   - Test critical endpoints
   - Document capacity limits

5. **✅ Review Railway Metrics** (1 hour)
   - Set up alerts in Railway dashboard
   - Understand what metrics are available
   - Configure notification preferences

**Total Time**: 4-6 hours  
**Cost**: $0/month

---

## 📋 Configuration Checklist for Vercel + Railway

### Vercel Configuration

- [ ] **Environment Variables**: Set production secrets
  - API endpoints
  - Sentry DSN (for frontend)
  - Any API keys needed by frontend

- [ ] **Domain Setup**: Connect custom domain
  - Vercel handles SSL automatically

- [ ] **Build Settings**: Verify build command
  - Should be: `npm run build`
  - Output directory: `dist`

- [ ] **Performance Settings**: Enable edge caching if needed

---

### Railway Configuration

- [ ] **Environment Variables**: Set production secrets
  - `DATABASE_URL` (if external DB)
  - `REDIS_URL` (if using Redis)
  - `SENTRY_DSN` (for backend)
  - `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`
  - `SECRET_KEY` (strong random key)
  - `CORS_ORIGINS` (your Vercel frontend URL)
  - All other production env vars

- [ ] **Health Check**: Verify `/health` endpoint works
  - Railway uses this for monitoring

- [ ] **Resource Limits**: Set appropriate CPU/memory limits
  - Start conservative, scale up as needed

- [ ] **Scaling**: Configure auto-scaling if needed
  - Railway can auto-scale based on metrics

- [ ] **Database** (if using Railway PostgreSQL):
  - [ ] Verify backups are enabled (should be automatic)
  - [ ] Note backup retention policy

---

## 🚀 Deployment Steps

### 1. Deploy Backend to Railway

```bash
# Option A: Connect GitHub repo
# 1. Go to Railway dashboard
# 2. Click "New Project" -> "Deploy from GitHub repo"
# 3. Select your backend repository
# 4. Railway auto-detects and builds

# Option B: Use Railway CLI
railway login
railway init
railway up
```

**Configure**:
- Set root directory to `backend_v2`
- Set build command (if needed)
- Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

### 2. Deploy Frontend to Vercel

```bash
# Option A: Vercel CLI
npm i -g vercel
cd frontend
vercel --prod

# Option B: GitHub Integration
# 1. Connect GitHub repo in Vercel dashboard
# 2. Set root directory to "frontend"
# 3. Auto-deploys on push to main
```

**Configure**:
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: Set `VITE_API_URL` to Railway backend URL

---

### 3. Connect Custom Domain (Optional)

**Vercel**:
1. Go to project settings -> Domains
2. Add your domain
3. Follow DNS instructions
4. SSL is automatic

**Railway**:
1. Go to service settings -> Networking
2. Generate domain or add custom domain
3. SSL is automatic

---

## 💰 Cost Estimate

### Minimal Setup (Free Tier):
- **Vercel**: Free (up to 100GB bandwidth)
- **Railway**: $5/month (Hobby plan) or free with credits
- **Sentry**: Free (5k events/month)
- **UptimeRobot**: Free (50 monitors)
- **Total**: ~$5-10/month

### Growth Phase:
- **Vercel Pro**: $20/month (if needed)
- **Railway**: Scales with usage (~$10-50/month)
- **Sentry**: $26/month (if you exceed free tier)
- **Total**: ~$50-100/month

---

## 🔍 What Railway Dashboard Shows You

Railway provides these metrics automatically:

- ✅ **CPU Usage**: Real-time and historical
- ✅ **Memory Usage**: Current and peak
- ✅ **Network**: Incoming/outgoing traffic
- ✅ **Request Metrics**: Count, latency, errors
- ✅ **Logs**: Real-time streaming logs
- ✅ **Deployments**: History and status
- ✅ **Health Checks**: Service health status

**You can set alerts on**:
- High CPU usage
- High memory usage
- Health check failures
- Deployment failures

---

## ⚠️ Limitations to Be Aware Of

### Railway:
- **Database Backups**: Only for Railway-managed databases
- **Advanced Logging**: Basic search, not as advanced as ELK
- **Custom Metrics**: Limited to what Railway provides
- **Monitoring**: Good but not as detailed as dedicated APM tools

### Vercel:
- **Analytics**: Basic, not as detailed as Google Analytics
- **Error Tracking**: Shows errors but limited context
- **Performance**: Shows Core Web Vitals but limited deep dives

---

## ✅ Simplified Production Checklist

### Critical (Must Do):
- [x] Deploy backend to Railway
- [x] Deploy frontend to Vercel
- [x] Set environment variables
- [ ] **Add Sentry error tracking** (30 min)
- [ ] **Set up UptimeRobot monitoring** (15 min)
- [ ] **Verify database backups** (30 min)

### Important (Should Do):
- [ ] Run basic load tests (2-4 hours)
- [ ] Configure Railway alerts (30 min)
- [ ] Test disaster recovery (1 hour)

### Optional (Can Wait):
- [ ] Advanced APM tools
- [ ] Custom monitoring dashboards
- [ ] Advanced log aggregation

---

## 🎯 Bottom Line

**If deploying to Vercel + Railway, you only need:**

1. **Sentry** for error tracking (free)
2. **UptimeRobot** for external uptime monitoring (free)
3. **Verify backups** (if external database)

**You can skip**:
- ❌ Manual SSL setup (automatic)
- ❌ Prometheus/Grafana (Railway has monitoring)
- ❌ Complex backup scripts (Railway handles DB backups)
- ❌ Manual deployment setup (Git-based auto-deploy)

**Total setup time**: 2-3 hours (vs 2-3 days for full manual setup)  
**Monthly cost**: ~$5-10 (vs potentially $50-100+ for full setup)

---

## 📚 Quick Start Commands

### Railway:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# View logs
railway logs

# Open dashboard
railway open
```

### Vercel:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# View logs
vercel logs
```

---

**Summary**: With Vercel + Railway, you get ~80% of production infrastructure out-of-the-box. You mainly need error tracking (Sentry) and external uptime monitoring (UptimeRobot). Much simpler than full manual setup!

