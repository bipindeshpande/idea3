# Redis Setup for Railway Deployment

**Understanding Redis Requirements and Options for Railway**

---

## What Redis Is Used For

Your application uses Redis for **3 purposes**:

### 1. **Caching** (Optional - Has Fallback) ✅
- **Purpose**: Cache discovery results, profile analysis, and other expensive operations
- **Fallback**: If Redis unavailable, uses PostgreSQL database for caching
- **Impact**: Without Redis = slower response times (still works)

### 2. **Rate Limiting** (Optional - Has Fallback) ✅
- **Purpose**: Limit API requests per IP address to prevent abuse
- **Fallback**: If Redis unavailable, allows all requests (logs warning)
- **Impact**: Without Redis = no rate limiting protection (still works)

### 3. **Background Job Queue** (REQUIRED for Background Jobs) ⚠️
- **Purpose**: Queue discovery runs for async processing using RQ (Redis Queue)
- **Endpoint**: `POST /api/discovery/run` (returns 202 Accepted, processes in background)
- **Fallback**: **NONE** - This endpoint will fail if Redis unavailable
- **Impact**: Without Redis = background job endpoint doesn't work

---

## Do You Need Redis?

### Scenario 1: You Use Background Jobs
**You NEED Redis if:**
- You use the `/api/discovery/run` endpoint (background processing)
- You want async processing (better user experience for long-running operations)

**Options:**
1. Use Railway Redis service (~$5-10/month)
2. Use external Redis (Upstash, Redis Cloud)
3. Deploy Redis in Railway as a service

### Scenario 2: You Use Synchronous Processing Only
**You DON'T need Redis if:**
- You process discovery runs synchronously (user waits for response)
- You're okay with slower caching (database fallback)
- You don't need rate limiting

**Note**: Your app can work without Redis - caching and rate limiting have fallbacks.

---

## Redis Options on Railway

### Option 1: Railway Redis Service (Recommended) ⭐

Railway offers managed Redis as a service.

**Setup Steps:**

1. **In Railway Dashboard**:
   - Click "New" → "Database" → "Add Redis"
   - Railway automatically provisions Redis instance

2. **Railway automatically provides**:
   - `REDIS_URL` environment variable (automatically set)
   - Automatic backups
   - Health monitoring
   - Scaling options

3. **Connect to your backend service**:
   - In your backend service settings, add Redis as a dependency
   - Railway automatically injects `REDIS_URL`

4. **No code changes needed** - just use the `REDIS_URL` env var

**Cost**: ~$5-10/month (pay-as-you-go pricing)

**Pros**: 
- Easiest setup
- Managed by Railway
- Automatic backups
- No maintenance

**Cons**: 
- More expensive than self-hosted
- Railway-specific (vendor lock-in)

---

### Option 2: Upstash Redis (Serverless) ⭐

Upstash provides serverless Redis with generous free tier.

**Setup Steps:**

1. **Sign up** at upstash.com (free tier available)

2. **Create Redis database**:
   - Choose region close to Railway servers
   - Copy the `UPSTASH_REDIS_REST_URL` or `REDIS_URL`

3. **Add to Railway environment variables**:
   ```
   REDIS_URL=redis://default:your-password@your-upstash-redis-host:port
   ```
   
   Or if using REST API:
   ```
   UPSTASH_REDIS_REST_URL=https://your-upstash-redis-host.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-token
   ```

4. **Update code** (if using REST API):
   - Install: `pip install upstash-redis`
   - Modify `redis_client.py` to use Upstash client if needed

**Cost**: 
- **Free tier**: 10,000 commands/day, 256MB storage
- **Paid**: $0.20 per 100K commands

**Pros**: 
- Generous free tier
- Serverless (pay per use)
- Global replication available
- Works with any provider

**Cons**: 
- REST API has latency overhead (use direct Redis connection for better performance)
- May need code changes for REST API

---

### Option 3: Redis Cloud (Managed by Redis)

Another managed Redis option.

**Setup Steps:**

1. **Sign up** at redis.com/cloud (free tier available)

2. **Create database**:
   - Free tier: 30MB, single region
   - Copy connection URL

3. **Add to Railway**:
   ```
   REDIS_URL=redis://default:password@host:port
   ```

**Cost**: 
- **Free tier**: 30MB, 30 connections
- **Paid**: Starts at $10/month

**Pros**: 
- Managed by Redis (the company)
- Good performance
- Free tier available

**Cons**: 
- Free tier is small
- More expensive than Upstash for small apps

---

### Option 4: Deploy Redis as Railway Service

Deploy Redis container yourself in Railway.

**Setup Steps:**

1. **Create new service** in Railway
2. **Use Redis Docker image**:
   ```yaml
   # In railway.json or nixpacks.toml
   # Railway auto-detects Dockerfile
   ```
   
   Or use Railway's one-click deploy from Redis Docker image

3. **Add Redis service**:
   - Use `redis:alpine` image
   - Set environment variables if needed
   - Expose port 6379 internally

4. **Connect services**:
   - In backend service, link Redis service
   - Use service name in `REDIS_URL`: `redis://redis-service:6379`

**Cost**: Uses Railway compute credits (~$5/month)

**Pros**: 
- Full control
- No external dependency
- Consistent with Docker setup

**Cons**: 
- You manage backups
- You manage updates
- More complex setup

---

## Recommended Setup for Railway

### For Production: **Railway Redis Service** ⭐

**Why:**
- Easiest setup (one click)
- Automatic backups
- No maintenance
- Best integration with Railway

**Cost**: ~$5-10/month

**Steps:**
1. Click "New" → "Database" → "Add Redis" in Railway
2. Link to your backend service
3. Use `REDIS_URL` environment variable (auto-provided)
4. Done!

---

### For Development/Testing: **Upstash Free Tier** ⭐

**Why:**
- Free tier is generous
- Good for testing
- Easy to set up
- Can use in production too if traffic is low

**Cost**: Free (up to 10K commands/day)

**Steps:**
1. Sign up at upstash.com
2. Create Redis database
3. Copy connection URL
4. Add to Railway env vars

---

## Configuration

### Environment Variables

**Required:**
```bash
REDIS_URL=redis://default:password@host:port
REDIS_ENABLED=true
```

**Optional:**
```bash
REDIS_PASSWORD=your-password  # If Redis requires auth
```

### Update Your Code (If Needed)

Your code already handles Redis gracefully:

```python
# In redis_client.py - already implemented
def get_redis():
    if not settings.REDIS_ENABLED or not REDIS_AVAILABLE:
        return None  # Falls back gracefully
    
    # Connection logic...
```

**For Upstash REST API** (if you want to use REST instead of direct connection):

```python
# Only if using Upstash REST API
from upstash_redis import Redis

def get_redis():
    if settings.UPSTASH_REDIS_REST_URL:
        return Redis(
            url=settings.UPSTASH_REDIS_REST_URL,
            token=settings.UPSTASH_REDIS_REST_TOKEN
        )
    # ... existing code
```

---

## Testing Redis Connection

### Quick Test Script

Create `test_redis.py`:

```python
from app.core.redis_client import get_redis

redis_client = get_redis()
if redis_client:
    print("✅ Redis connected!")
    redis_client.ping()
    print("✅ Redis ping successful!")
else:
    print("❌ Redis not available")
```

Run in Railway:
```bash
railway run python test_redis.py
```

---

## Without Redis (Optional)

If you want to run **without Redis**:

### 1. Disable Redis in Environment
```bash
REDIS_ENABLED=false
```

### 2. What Still Works:
- ✅ All API endpoints (except background jobs)
- ✅ Caching (falls back to PostgreSQL)
- ✅ Rate limiting (disabled, all requests allowed)

### 3. What Doesn't Work:
- ❌ Background job endpoint (`POST /api/discovery/run`)
- ❌ Async processing
- ❌ Optimal caching performance

### 4. Use Synchronous Endpoint Instead:

Instead of:
```javascript
// Background job endpoint
POST /api/discovery/run  // Returns 202, processes async
```

Use:
```javascript
// Synchronous endpoint (if available)
POST /api/discovery/stream  // Streams results, processes sync
```

Or process discovery runs synchronously in the main endpoint.

---

## Worker Service on Railway

If using background jobs, you also need to run the **worker service**:

### Option 1: Separate Railway Service

1. **Create new service** in Railway
2. **Point to same repo** (backend_v2)
3. **Set start command**:
   ```bash
   python -m worker.worker
   ```
4. **Set working directory**: `backend_v2`
5. **Link to Redis service** (same as backend)

### Option 2: Background Process in Main Service

Railway doesn't support multiple processes well, so separate service is recommended.

---

## Cost Comparison

| Option | Free Tier | Paid Tier | Best For |
|--------|-----------|-----------|----------|
| **Railway Redis** | No | $5-10/month | Production, easy setup |
| **Upstash** | Yes (10K/day) | $0.20/100K | Development, low traffic |
| **Redis Cloud** | Yes (30MB) | $10+/month | Production, managed |
| **Self-hosted** | No | ~$5/month | Full control |

---

## Quick Start: Railway Redis

**Time**: 5 minutes

1. In Railway dashboard → Click "New" → "Database"
2. Select "Redis"
3. Railway automatically provisions and sets `REDIS_URL`
4. In your backend service → Settings → Variables
5. Verify `REDIS_URL` is set (Railway auto-injects it)
6. Redeploy backend service
7. Done! ✅

**Cost**: ~$5-10/month

---

## Troubleshooting

### Redis Connection Fails

**Check:**
1. `REDIS_URL` environment variable is set correctly
2. Redis service is running (check Railway dashboard)
3. Network connectivity between services

**Test:**
```bash
railway run python -c "from app.core.redis_client import get_redis; print(get_redis())"
```

### Worker Not Processing Jobs

**Check:**
1. Worker service is running
2. Worker service has `REDIS_URL` set
3. Worker service is linked to Redis
4. Queue name matches (`default`)

**View queue:**
```bash
railway run python -c "from app.core.redis_client import get_redis; from rq import Queue; q = Queue('default', connection=get_redis()); print(f'Jobs: {len(q)}')"
```

---

## Summary

### Recommended Setup:
- **Production**: Railway Redis Service ($5-10/month)
- **Development**: Upstash Free Tier (free)
- **Workers**: Separate Railway service for background jobs

### Minimum Setup (Without Redis):
- Set `REDIS_ENABLED=false`
- Use synchronous processing
- Accept slower caching (database fallback)

**Bottom Line**: For production with background jobs, use Railway Redis Service. It's the easiest and most reliable option.


