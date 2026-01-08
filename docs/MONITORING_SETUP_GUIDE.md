# Monitoring & Alerting Setup Guide

**Status:** ✅ Implementation Complete  
**Time to Setup:** 15-30 minutes  
**Cost:** Free (up to 5,000 events/month)

---

## 📊 What's Included

### ✅ Backend (FastAPI)
- Sentry error tracking configured
- Automatic exception capturing
- Performance monitoring (10% sample rate)
- SQLAlchemy integration for database errors
- Error filtering (excludes validation errors, 404s)

### ✅ Frontend (React)
- Sentry error tracking configured
- React Error Boundary integration
- Browser performance monitoring
- Session replay (10% of sessions, 100% of errors)
- Source maps support for better debugging

---

## 🚀 Quick Setup Steps

### Step 1: Create Sentry Account (5 minutes)

1. Go to [sentry.io](https://sentry.io) and sign up (free)
2. Create a new **Organization** (or use existing)
3. Create **two projects**:
   - **Backend Project**: Select "Python" → "FastAPI"
   - **Frontend Project**: Select "JavaScript" → "React"

### Step 2: Get Your DSNs (2 minutes)

For each project:
1. Go to **Settings** → **Projects** → Your Project
2. Click **Client Keys (DSN)**
3. Copy the DSN (looks like: `https://xxx@sentry.io/xxx`)

**You'll need:**
- Backend DSN (for `SENTRY_DSN`)
- Frontend DSN (for `VITE_SENTRY_DSN`)

### Step 3: Configure Backend (5 minutes)

1. **Add to `production.env`:**
   ```env
   SENTRY_DSN=https://xxx@sentry.io/xxx
   ENVIRONMENT=production
   ```

2. **Install dependencies** (if not already done):
   ```bash
   cd backend_v2
   pip install -r requirements.txt
   ```

3. **Test it works:**
   - Sentry is automatically initialized when `SENTRY_DSN` is set
   - No code changes needed - already configured in `app/main.py`

### Step 4: Configure Frontend (5 minutes)

1. **Create `.env.production` file** (or add to your environment):
   ```env
   VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
   ```

2. **For source maps (optional but recommended):**
   ```env
   VITE_SENTRY_ORG=your-org-slug
   VITE_SENTRY_PROJECT=your-project-slug
   VITE_SENTRY_AUTH_TOKEN=your-auth-token
   ```
   
   To get auth token:
   - Go to Sentry → Settings → Account → Auth Tokens
   - Create new token with `project:releases` scope

3. **Build and test:**
   ```bash
   npm run build
   ```

### Step 5: Test Error Tracking (5 minutes)

**Backend Test:**
```python
# Add this temporarily to test
@app.get("/test-error")
async def test_error():
    raise Exception("Test error for Sentry")
```

Visit: `http://localhost:8000/test-error`  
Check Sentry dashboard - you should see the error!

**Frontend Test:**
```javascript
// Add this temporarily to test
throw new Error("Test error for Sentry");
```

Check Sentry dashboard - you should see the error!

---

## 📧 Setting Up Alerts

### Email Alerts (Default)

1. Go to Sentry → **Settings** → **Alerts**
2. Click **Create Alert Rule**
3. Configure:
   - **Trigger**: When an issue is created
   - **Action**: Send email to your email address
4. Save

### Slack Alerts (Optional)

1. Go to Sentry → **Settings** → **Integrations**
2. Click **Slack**
3. Connect your Slack workspace
4. Configure alert rules to send to Slack channel

### Custom Alert Rules

**High Priority Errors:**
- Trigger: When error rate > 10 errors/minute
- Action: Send email + Slack notification

**Critical Errors:**
- Trigger: When specific error types occur (e.g., payment failures)
- Action: Immediate notification

---

## 🔍 What Gets Tracked

### Backend (FastAPI)
- ✅ Unhandled exceptions
- ✅ HTTP errors (500, etc.)
- ✅ Database errors (SQLAlchemy)
- ✅ Performance metrics (slow endpoints)
- ✅ Request context (user, IP, headers)

### Frontend (React)
- ✅ JavaScript errors
- ✅ React component errors (via ErrorBoundary)
- ✅ Unhandled promise rejections
- ✅ Performance metrics (page load, API calls)
- ✅ Session replay (for debugging)
- ✅ User context (if authenticated)

---

## 🎯 Error Filtering

### Already Filtered Out (No Noise)
- ✅ Validation errors (Pydantic)
- ✅ 404 Not Found errors
- ✅ Expected HTTP exceptions

### What Gets Tracked
- ❌ Unhandled exceptions
- ❌ Database connection errors
- ❌ API failures
- ❌ Payment errors
- ❌ Authentication errors

---

## 📊 Monitoring Dashboard

Once set up, you'll see:

1. **Issues**: All errors grouped by type
2. **Performance**: Slow endpoints, database queries
3. **Releases**: Track deployments
4. **Users**: See which users are affected
5. **Alerts**: Configure notifications

---

## 🔧 Advanced Configuration

### Add User Context (Backend)

```python
from sentry_sdk import set_user

# In your auth middleware
set_user({
    "id": user.user_id,
    "email": user.email,
    "username": user.username
})
```

### Add Custom Tags

```python
from sentry_sdk import set_tag

set_tag("feature", "payment")
set_tag("subscription_tier", "pro")
```

### Track Performance

```python
from sentry_sdk import start_transaction

transaction = start_transaction(op="http.request", name="/api/discovery/run")
# ... your code ...
transaction.finish()
```

---

## 🆓 Free Tier Limits

**Sentry Free Tier:**
- 5,000 events/month
- 1 project (you can create 2 projects = 10,000 events total)
- 10,000 performance units/month
- 1-hour session replay retention

**When to Upgrade:**
- If you exceed 5,000 events/month
- If you need more projects
- If you need longer session replay retention

**Pricing:** $26/month for Team plan (50k events/month)

---

## 🚨 Uptime Monitoring (External)

Sentry tracks errors, but you also need **uptime monitoring** to know when your site is down.

### Recommended: UptimeRobot (Free)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up (free)
3. Click **"Add New Monitor"**
4. Configure:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://yourdomain.com/health`
   - **Interval**: 5 minutes
   - **Alert Contacts**: Your email
5. Click **"Create Monitor"**

**What This Does:**
- Checks your site every 5 minutes
- Sends email if site is down
- Free tier: 50 monitors, 5-minute checks

**Alternative:** Pingdom ($10/month for 1-minute checks)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend errors appear in Sentry dashboard
- [ ] Frontend errors appear in Sentry dashboard
- [ ] Email alerts are configured
- [ ] Uptime monitoring is set up (UptimeRobot)
- [ ] Test error was successfully captured
- [ ] Performance monitoring is working
- [ ] User context is being captured (if implemented)

---

## 📝 Environment Variables Summary

### Backend (`production.env`)
```env
SENTRY_DSN=https://xxx@sentry.io/xxx
ENVIRONMENT=production
```

### Frontend (`.env.production` or build environment)
```env
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
# Optional for source maps:
VITE_SENTRY_ORG=your-org-slug
VITE_SENTRY_PROJECT=your-project-slug
VITE_SENTRY_AUTH_TOKEN=your-auth-token
```

---

## 🎉 You're Done!

Your monitoring is now set up. You'll receive:
- ✅ Email alerts when errors occur
- ✅ Performance insights
- ✅ User impact visibility
- ✅ Uptime notifications (if UptimeRobot configured)

**Next Steps:**
1. Monitor for a few days to see baseline
2. Set up custom alert rules for critical errors
3. Review performance metrics weekly
4. Consider upgrading if you exceed free tier

---

## 🔗 Related Documentation

- Production Readiness: `docs/PRODUCTION_READINESS.md`
- Deployment Guide: `docs/SIMPLE_PRODUCTION_DEPLOYMENT_GUIDE.md`
- Pre-Launch Tasks: `docs/PRE_LAUNCH_TASKS_SUMMARY.md`

