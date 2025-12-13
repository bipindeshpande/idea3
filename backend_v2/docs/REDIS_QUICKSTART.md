# Redis Quick Start - See It In Action 🚀

## ⚡ Fastest Way to See Redis Working

### 1. Start Your Services
```bash
docker-compose up
```

### 2. In a New Terminal, Connect to Redis CLI
```bash
docker exec -it idea2_redis redis-cli
```

### 3. Try These Commands Immediately:

```redis
# Check if Redis is alive
PING

# See how many keys are stored
DBSIZE

# See all keys (or use pattern to filter)
KEYS *
KEYS discovery:*

# Watch commands happen in real-time (MOST USEFUL!)
MONITOR
```

**Tip**: Leave `MONITOR` running, then use your app - you'll see every Redis operation!

## 🎯 Common Scenarios

### "I want to watch cache operations"
```bash
docker exec -it idea2_redis redis-cli MONITOR | grep -i "discovery"
```

### "I want to see what's cached right now"
```bash
docker exec -it idea2_redis redis-cli
> KEYS discovery:*
> GET discovery:your_key_here
```

### "I want to see queue/job activity"
```bash
docker exec -it idea2_redis redis-cli
> KEYS rq:*
> LLEN rq:queue:default
```

### "I want to clear the cache for testing"
```bash
docker exec -it idea2_redis redis-cli FLUSHDB
```

## 🔧 Using the Python Monitoring Script

If you're in the `backend_v2` directory:

```bash
# Show statistics
python scripts/redis_monitor.py stats

# List discovery cache keys
python scripts/redis_monitor.py keys discovery:*

# Show a specific cached value
python scripts/redis_monitor.py show discovery:some_key_here

# Monitor in real-time
python scripts/redis_monitor.py monitor
```

## 🖥️ GUI Option (Visual Monitoring)

**RedisInsight** (Free, Official Redis Tool):
1. Download: https://redis.io/insight/
2. Connect to: `localhost:6379`
3. Browse keys, see stats, monitor live!

## 📝 What Your App Stores in Redis

- **Cache Keys**: `discovery:*`, `profile:*`, `tools:*`
- **Queue Keys**: `rq:*` (for background jobs)
- **TTL**: Cache expires after configured time (see config.py)

For more details, see `REDIS_MONITORING.md`

