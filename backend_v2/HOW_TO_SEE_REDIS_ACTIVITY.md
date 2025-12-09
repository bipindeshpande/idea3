# How to See Redis Activity (Not Just Startup Logs)

You're seeing only startup logs because **Redis doesn't log commands by default**. Here are 3 ways to see actual activity:

## ✅ Method 1: Use MONITOR Command (Easiest - Real-time)

Open a new terminal and run:

```bash
docker exec -it idea2_redis redis-cli MONITOR
```

**Now use your app** - you'll see every Redis command in real-time:
- `GET discovery:...` 
- `SET discovery:...`
- `LLEN rq:queue:...`
- etc.

Press `Ctrl+C` to stop monitoring.

## ✅ Method 2: Enable Verbose Logging (See in Docker Logs)

I've updated your `docker-compose.yml` to enable verbose logging. Restart Redis:

```bash
docker-compose restart redis
```

Now Redis logs will include more detail. However, **MONITOR is still better** for seeing actual commands.

## ✅ Method 3: Check Application Backend Logs

Your app logs Redis operations in the backend. Check your backend container logs:

```bash
docker logs idea2_backend -f
```

Look for lines like:
- `[INFO] CacheService: [REDIS] Cache hit for key...`
- `[INFO] CacheService: [REDIS] Cache miss for key...`

## ✅ Method 4: Use Redis Stats/Info Commands

Quick check what's happening:

```bash
# See how many keys exist
docker exec -it idea2_redis redis-cli DBSIZE

# See all keys
docker exec -it idea2_redis redis-cli KEYS "*"

# See cache keys specifically
docker exec -it idea2_redis redis-cli KEYS "discovery:*"

# Get Redis statistics
docker exec -it idea2_redis redis-cli INFO stats
```

## 🎯 Recommended Workflow

1. **Start your app**: `docker-compose up`
2. **In another terminal**, run: `docker exec -it idea2_redis redis-cli MONITOR`
3. **Make API calls** to your backend
4. **Watch the MONITOR output** - you'll see all Redis activity!

## 💡 Why You See No Activity

Redis only logs:
- ✅ Server startup/shutdown
- ✅ Configuration warnings
- ✅ Connection events
- ❌ **NOT** individual commands (GET/SET) by default

To see commands, use **MONITOR** or check your **application logs** (which log cache hits/misses).

