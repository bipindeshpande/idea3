# Viewing Redis Activity in Docker Desktop 🐳

## 🎯 Quick Steps in Docker Desktop

### Method 1: Use the "Exec" Tab (Best for Real-time Monitoring)

1. **Open Docker Desktop**
2. **Go to Containers** → Find `idea2_redis`
3. **Click on the container** to open details
4. **Click the "Exec" tab** at the top
5. **Type this command** in the terminal:
   ```bash
   redis-cli MONITOR
   ```
6. **Now use your application** - you'll see all Redis commands appear in real-time!

### Method 2: View Current Keys (Stats)

1. **Open Docker Desktop**
2. **Go to Containers** → `idea2_redis`
3. **Click "Exec" tab**
4. **Run these commands**:

```bash
# See how many keys are stored
DBSIZE

# List all keys
KEYS *

# List only cache keys
KEYS discovery:*

# See Redis statistics
INFO stats
```

### Method 3: View Logs (Limited - Only Server Events)

1. **Go to Containers** → `idea2_redis`
2. **Click "Logs" tab**
3. **Note**: These logs only show server startup/errors, NOT individual commands

To see actual commands, use **Method 1** with `MONITOR`.

## 📊 Using Docker Desktop Stats

1. **Go to Containers** → `idea2_redis`
2. **Click "Stats" tab**
3. You'll see:
   - **CPU usage**
   - **Memory usage** (Redis stores data in memory)
   - **Network I/O** (shows activity)

Watch memory usage increase as cache entries are added!

## 🔍 Complete Monitoring Workflow

### Step 1: Open Two Windows

**Window 1 - Monitor Redis Commands:**
1. Docker Desktop → Containers → `idea2_redis` → **Exec** tab
2. Run: `redis-cli MONITOR`

**Window 2 - Check Keys:**
1. Docker Desktop → Containers → `idea2_redis` → **Exec** tab (new exec session)
2. Run: `redis-cli`
3. Then run: `KEYS *` or `DBSIZE`

### Step 2: Use Your Application

Make API calls to your backend, and watch Window 1 show Redis commands in real-time!

## 🎨 What You'll See in MONITOR

When your app uses Redis, you'll see output like:

```
172.18.0.1:52342 [0 172.18.0.1:52342] "GET" "discovery:discovery_user:abc123:def456..."
172.18.0.1:52342 [0 172.18.0.1:52342] "SETEX" "discovery:discovery_user:abc123:def456..." "3600" "{...json data...}"
172.18.0.1:52342 [0 172.18.0.1:52342] "PING"
172.18.0.1:52342 [0 172.18.0.1:52342] "LLEN" "rq:queue:default"
```

Each line shows:
- **IP:Port** of the client
- **Database number** (usually [0])
- **Command** (GET, SET, SETEX, etc.)
- **Key name**
- **Value** (if setting)

## 💡 Pro Tips

### Tip 1: Filter MONITOR Output
Unfortunately, Docker Desktop Exec doesn't support piping, but you can manually watch for patterns like:
- `GET discovery:*` - Cache reads
- `SETEX discovery:*` - Cache writes
- `rq:*` - Job queue operations

### Tip 2: Check Memory Usage
- **Stats tab** → Watch "Memory" increase when cache is populated
- If memory is growing, Redis is storing data!

### Tip 3: Multiple Exec Sessions
You can open multiple Exec tabs:
- One for `MONITOR`
- One for interactive `redis-cli` commands
- Switch between them as needed

### Tip 4: Copy Container Logs
If you want to save logs:
1. Go to **Logs** tab
2. Use the **Download** or **Copy** button
3. Search for Redis activity patterns

## 🚀 Quick Test

To verify Redis is working:

1. **Exec tab** → Run:
   ```bash
   redis-cli SET test:docker "Hello from Docker Desktop"
   redis-cli GET test:docker
   ```

2. You should see: `"Hello from Docker Desktop"`

3. **Stats tab** → Memory should show a small increase

## 📝 Common Commands Reference

In Docker Desktop Exec tab:

| What to Check | Command |
|---------------|---------|
| See all activity | `redis-cli MONITOR` |
| Count keys | `redis-cli DBSIZE` |
| List all keys | `redis-cli KEYS "*"` |
| List cache keys | `redis-cli KEYS "discovery:*"` |
| Get a key value | `redis-cli GET "discovery:keyname"` |
| Check TTL | `redis-cli TTL "discovery:keyname"` |
| See stats | `redis-cli INFO stats` |
| Test connection | `redis-cli PING` |

## ❓ Troubleshooting

**"Command not found" in Exec tab?**
- Make sure you're in the `idea2_redis` container
- Try: `/usr/local/bin/redis-cli` (full path)

**No activity in MONITOR?**
- Make sure your backend is actually using Redis
- Check if `REDIS_ENABLED=true` in your backend config
- Check backend logs for Redis connection errors

**Want to see historical data?**
- Docker Desktop logs only show recent entries
- Use the `INFO stats` command to see cumulative statistics

