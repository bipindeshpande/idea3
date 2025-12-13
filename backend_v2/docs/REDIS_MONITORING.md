# How to See Redis in Action

This guide shows you multiple ways to monitor and inspect Redis usage in your application.

## Quick Start - Redis CLI

### Connect to Redis Container

```bash
# Connect to Redis CLI in the running container
docker exec -it idea2_redis redis-cli

# Or if Redis is running locally (not in Docker)
redis-cli
```

### Basic Commands to See What's Happening

Once connected to `redis-cli`, try these commands:

```redis
# 1. Check if Redis is working
PING
# Should return: PONG

# 2. See all keys currently in Redis
KEYS *

# 3. See cache keys (discovery cache)
KEYS discovery:*

# 4. See user-specific cache keys
KEYS discovery_user:*

# 5. See RQ (Redis Queue) job keys
KEYS rq:*

# 6. Check how many keys exist
DBSIZE

# 7. Get info about Redis
INFO

# 8. Monitor commands in real-time (press Ctrl+C to stop)
MONITOR

# 9. Check a specific cache key value
GET discovery:your_cache_key_here

# 10. Check TTL (Time To Live) of a key
TTL discovery:your_cache_key_here
```

## Real-Time Monitoring

### Option 1: Monitor All Commands (Best for Development)

```bash
docker exec -it idea2_redis redis-cli MONITOR
```

This shows every Redis command executed in real-time, perfect for seeing:
- Cache hits/misses
- Job queue operations
- Key creations/deletions

### Option 2: Monitor Specific Patterns

```bash
# Watch only cache operations
docker exec -it idea2_redis redis-cli --scan --pattern "discovery:*" | xargs -I {} docker exec idea2_redis redis-cli GET {}
```

### Option 3: Check Queue Status

```bash
# See RQ queue status
docker exec -it idea2_redis redis-cli
> LLEN rq:queue:default
> LRANGE rq:queue:default 0 -1
```

## Understanding Your Redis Keys

Based on your codebase, Redis stores:

### 1. **Cache Keys** (from `cache_service.py`)
- Format: `{cache_type}:{key}`
- Examples:
  - `discovery:discovery_user:{user_id}:{hash}` - User-specific discovery results
  - `discovery:discovery_global:{hash}` - Global discovery cache
  - `profile:{key}` - Profile analysis cache
  - `tools:{key}` - Tools cache

### 2. **RQ (Redis Queue) Keys** (from `discovery.py`)
- Format: `rq:queue:{queue_name}` - Job queues
- Format: `rq:job:{job_id}` - Job metadata
- Format: `rq:job:{job_id}:result` - Job results

## Useful Monitoring Scripts

### View All Cache Keys with TTL

```bash
docker exec -it idea2_redis redis-cli --scan --pattern "*" | while read key; do
  ttl=$(docker exec idea2_redis redis-cli TTL "$key")
  echo "Key: $key | TTL: $ttl seconds"
done
```

### Count Keys by Pattern

```bash
docker exec -it idea2_redis redis-cli --scan --pattern "discovery:*" | wc -l
docker exec -it idea2_redis redis-cli --scan --pattern "rq:*" | wc -l
```

### Clear Cache (Careful!)

```bash
# Clear all discovery cache
docker exec -it idea2_redis redis-cli --scan --pattern "discovery:*" | xargs docker exec idea2_redis redis-cli DEL

# Clear all keys (WARNING: This clears everything!)
docker exec -it idea2_redis redis-cli FLUSHDB
```

## GUI Tools (Visual Monitoring)

### Option 1: RedisInsight (Recommended)
1. Download from: https://redis.io/insight/
2. Connect to: `localhost:6379`
3. Browse keys, monitor commands, view stats visually

### Option 2: Redis Commander (Web-based)
```bash
docker run --rm --link idea2_redis:redis -p 8081:8081 rediscommander/redis-commander:latest --redis-host redis
```
Then open: http://localhost:8081

### Option 3: Redis Desktop Manager
- Download: https://resp.app/ (formerly Redis Desktop Manager)
- Connect to `localhost:6379`

## Testing Redis is Working

### 1. Check Connection Status
```bash
docker exec -it idea2_redis redis-cli PING
```

### 2. Create a Test Key
```bash
docker exec -it idea2_redis redis-cli SET test:key "Hello Redis"
docker exec -it idea2_redis redis-cli GET test:key
```

### 3. See Real-Time Activity
While your app is running, execute:
```bash
docker exec -it idea2_redis redis-cli MONITOR
```
Then make API calls to your backend and watch Redis commands appear!

## Common Scenarios

### Scenario 1: "I want to see cache hits/misses"
```bash
# Enable Redis CLI command monitoring
docker exec -it idea2_redis redis-cli MONITOR | grep -E "(GET|SET|discovery)"
```

### Scenario 2: "I want to see job queue activity"
```bash
# Watch queue operations
docker exec -it idea2_redis redis-cli MONITOR | grep -E "(rq|queue|job)"
```

### Scenario 3: "I want to inspect cached discovery results"
```bash
# List all discovery cache keys
docker exec -it idea2_redis redis-cli --scan --pattern "discovery:*"

# View a specific cached value (replace KEY with actual key)
docker exec -it idea2_redis redis-cli GET "discovery:KEY"
```

## Quick Reference

| What to do | Command |
|------------|---------|
| Connect to Redis | `docker exec -it idea2_redis redis-cli` |
| See all keys | `KEYS *` (in redis-cli) |
| Monitor live | `MONITOR` (in redis-cli) |
| Check info | `INFO` (in redis-cli) |
| Get key value | `GET keyname` (in redis-cli) |
| Check TTL | `TTL keyname` (in redis-cli) |
| Count keys | `DBSIZE` (in redis-cli) |

## Next Steps

1. Start your application: `docker-compose up`
2. In another terminal, connect: `docker exec -it idea2_redis redis-cli MONITOR`
3. Make API requests to your backend
4. Watch Redis commands appear in real-time!

