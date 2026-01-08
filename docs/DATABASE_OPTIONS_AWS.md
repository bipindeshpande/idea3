# Database Options for AWS Deployment

You have **4 options** for hosting your PostgreSQL database. Here's the comparison:

## Option 1: Docker PostgreSQL (Current Setup) ⭐ **SIMPLEST & CHEAPEST**

**What it is:** PostgreSQL running in Docker on your Lightsail instance (same as now)

**Cost:** **$0 extra** (included in Lightsail instance)

**Pros:**
- ✅ **Simplest** - No additional setup, works with your current `docker-compose.prod.yml`
- ✅ **Cheapest** - No extra cost
- ✅ **Fast** - Local connection, no network latency
- ✅ **Easy backups** - Just backup Docker volume

**Cons:**
- ⚠️ **Single point of failure** - If instance goes down, DB goes down
- ⚠️ **No automatic backups** - You manage backups yourself
- ⚠️ **Limited scalability** - Tied to instance resources

**Best for:** Small-medium apps, MVP, development, low traffic

**Setup:** Already done! Your `docker-compose.prod.yml` handles it.

---

## Option 2: AWS Lightsail Database ⭐ **RECOMMENDED FOR PRODUCTION**

**What it is:** Managed PostgreSQL database (separate from your app instance)

**Cost:** **$15/month** (db.t3.micro - 1 vCPU, 1GB RAM, 40GB storage)

**Pros:**
- ✅ **Managed** - AWS handles backups, updates, monitoring
- ✅ **Automatic backups** - Daily backups, 7-day retention
- ✅ **High availability** - Can enable multi-AZ (extra cost)
- ✅ **Simple** - Easier than RDS, cheaper than RDS
- ✅ **Same region** - Low latency to Lightsail instance
- ✅ **Easy scaling** - Upgrade plan with one click

**Cons:**
- ⚠️ **Extra cost** - $15/month
- ⚠️ **Network latency** - Slight delay vs local Docker
- ⚠️ **Less control** - Can't customize PostgreSQL config as much

**Best for:** Production apps, when you need reliability and backups

**Setup:** ~10 minutes (see below)

---

## Option 3: AWS RDS PostgreSQL

**What it is:** Full-featured managed PostgreSQL (more features than Lightsail DB)

**Cost:** **$15-30/month** (db.t3.micro - similar to Lightsail DB)

**Pros:**
- ✅ **Most features** - Read replicas, automated backups, monitoring
- ✅ **Enterprise-grade** - Best for large-scale apps
- ✅ **Multi-AZ** - High availability built-in

**Cons:**
- ❌ **More complex** - More configuration options
- ❌ **More expensive** - Slightly more than Lightsail DB
- ❌ **Overkill** - For most apps, Lightsail DB is enough

**Best for:** Large-scale apps, enterprise requirements

---

## Option 4: External Managed PostgreSQL

**What it is:** Third-party services (Supabase, Neon, Railway, etc.)

**Cost:** **$0-25/month** (varies by provider)

**Examples:**
- **Supabase**: Free tier, then $25/month
- **Neon**: Free tier, then $19/month
- **Railway**: Pay-as-you-go

**Pros:**
- ✅ **Free tiers** - Good for development
- ✅ **Easy setup** - Often simpler than AWS
- ✅ **Good for small apps** - If you're already using Railway

**Cons:**
- ⚠️ **Vendor lock-in** - Harder to migrate
- ⚠️ **Network latency** - May be in different region
- ⚠️ **Less control** - Dependent on third party

**Best for:** If you're already using these services, or want free tier

---

## 💰 Cost Comparison

| Option | Monthly Cost | Setup Complexity | Reliability |
|--------|-------------|-------------------|-------------|
| **Docker PostgreSQL** | $0 | ⭐⭐⭐⭐⭐ (Already done) | ⭐⭐⭐ |
| **Lightsail Database** | $15 | ⭐⭐⭐⭐ (10 min) | ⭐⭐⭐⭐⭐ |
| **RDS PostgreSQL** | $15-30 | ⭐⭐⭐ (30 min) | ⭐⭐⭐⭐⭐ |
| **External (Supabase)** | $0-25 | ⭐⭐⭐⭐⭐ (5 min) | ⭐⭐⭐⭐ |

---

## 🎯 My Recommendation

### Start with: **Docker PostgreSQL** (Option 1)
- **Why:** You're already set up, zero extra cost, simplest
- **When to upgrade:** When you need automatic backups or higher reliability

### Upgrade to: **Lightsail Database** (Option 2) when:
- ✅ You have paying customers
- ✅ You need automatic daily backups
- ✅ You want better reliability
- ✅ $15/month is worth the peace of mind

---

## How to Use Lightsail Database (If You Want)

### Step 1: Create Database

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click **"Databases"** → **"Create database"**
3. Choose:
   - **Engine**: PostgreSQL 16
   - **Plan**: $15/month (db.t3.micro - 1 vCPU, 1GB RAM)
   - **Database name**: `startup_discovery`
   - **Master username**: `startup_discovery` (or your choice)
   - **Master password**: Strong password (save it!)
4. Click **"Create database"**

Wait 5-10 minutes for database to be created.

### Step 2: Get Connection Details

1. Click your database in Lightsail console
2. Go to **"Connectivity & security"** tab
3. Note:
   - **Endpoint**: `xxxxx.xxxxx.us-east-1.rds.amazonaws.com`
   - **Port**: `5432`
   - **Database name**: `startup_discovery`
   - **Username**: `startup_discovery`

### Step 3: Update Your Environment

Edit `backend_v2/production.env`:

```env
# OLD (Docker PostgreSQL):
# DATABASE_URL=postgresql://startup_discovery:password@postgres:5432/startup_discovery

# NEW (Lightsail Database):
DATABASE_URL=postgresql://startup_discovery:YOUR_PASSWORD@xxxxx.xxxxx.us-east-1.rds.amazonaws.com:5432/startup_discovery
```

### Step 4: Allow Connection from Lightsail Instance

1. In database → **"Connectivity & security"** tab
2. Under **"Public mode"**: Enable it (or use VPC peering)
3. Under **"Database access"**: Add your Lightsail instance's IP
   - Or enable **"Allow access from Lightsail resources"** and select your instance

### Step 5: Update docker-compose.prod.yml

Comment out the PostgreSQL service (since you're using external DB):

```yaml
# postgres:
#   image: postgres:16-alpine
#   ... (comment out or remove)

backend:
  # ... existing config ...
  depends_on:
    # postgres:  # Remove this
    #   condition: service_healthy
    redis:
      condition: service_healthy
```

### Step 6: Run Migrations

```bash
cd ~/app/backend_v2

# Run migrations against Lightsail Database
docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head
```

### Step 7: Restart Services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Done!** Your app now uses Lightsail Database.

---

## Backup Strategy

### Docker PostgreSQL (Option 1)

**Manual backup script:**

```bash
#!/bin/bash
# backup-db.sh - Run this daily via cron

cd ~/app/backend_v2
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR

# Create backup
docker-compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U startup_discovery startup_discovery \
  | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

# Optional: Upload to S3
# aws s3 cp $BACKUP_DIR/backup_*.sql.gz s3://your-bucket/backups/
```

**Set up daily cron:**
```bash
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup-db.sh
```

### Lightsail Database (Option 2)

**Automatic backups:**
- ✅ Daily automated backups (7-day retention)
- ✅ Manual snapshots available
- ✅ Point-in-time recovery

**Manual snapshot:**
1. Lightsail console → Your database
2. Click **"Snapshots"** → **"Create snapshot"**

---

## Migration: Docker → Lightsail Database

If you want to migrate from Docker PostgreSQL to Lightsail Database:

```bash
# 1. Create backup from Docker PostgreSQL
cd ~/app/backend_v2
docker-compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U startup_discovery startup_discovery > backup.sql

# 2. Restore to Lightsail Database
psql -h YOUR_LIGHTSAIL_DB_ENDPOINT \
     -U startup_discovery \
     -d startup_discovery \
     -f backup.sql
```

---

## Redis Options

**Same question for Redis?** You have similar options:

1. **Docker Redis** (current) - $0, simplest
2. **Lightsail Database (Redis)** - $15/month, managed
3. **ElastiCache** - $12-15/month, more features

**Recommendation:** Start with Docker Redis, upgrade if needed.

---

## Summary

**For you right now:**
- ✅ **Start with Docker PostgreSQL** - Already set up, zero cost
- ✅ **Add automated backups** - Use the backup script above
- ✅ **Upgrade later** - Move to Lightsail Database when you need it

**Total cost with Docker PostgreSQL:** $20/month (just Lightsail instance)  
**Total cost with Lightsail Database:** $35/month ($20 instance + $15 database)

The choice is yours! Docker PostgreSQL is perfectly fine for most apps.

