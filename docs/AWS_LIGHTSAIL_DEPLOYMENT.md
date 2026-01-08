# AWS Lightsail Deployment Guide

**Simplest AWS hosting option** - Single instance running everything with Docker Compose.

## Why Lightsail?

- ✅ **Simplest AWS option** - Just one instance, no complex services
- ✅ **Fixed pricing** - $10-20/month (predictable costs)
- ✅ **Works with your existing Docker setup** - Run `docker-compose` as-is
- ✅ **Easy management** - Simple web UI + SSH access
- ✅ **Perfect for small-medium apps** - Handles your stack easily

## Cost Breakdown

- **Lightsail $10/month**: 1 vCPU, 2GB RAM, 40GB SSD (good for low traffic)
- **Lightsail $20/month**: 2 vCPU, 4GB RAM, 60GB SSD (recommended for production)
- **Database**: $0 (Docker PostgreSQL) or $15/month (Lightsail Database - optional)
- **Domain (optional)**: $12/year via Route 53 or use your existing domain

**Total: ~$10-20/month** (with Docker PostgreSQL)  
**Total: ~$35/month** (with Lightsail Database)  
**vs $25-40/month for Railway+Vercel**

> 📖 **Database Options:** See `docs/DATABASE_OPTIONS_AWS.md` for detailed comparison

## Prerequisites

1. AWS account (free tier eligible)
2. Domain name (optional, can use Lightsail's free domain)
3. Your `.env` file with production secrets

## Step 1: Create Lightsail Instance

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click **"Create instance"**
3. Choose:
   - **Platform**: Linux/Unix
   - **Blueprint**: Ubuntu 22.04 LTS (or latest)
   - **Instance plan**: $20/month (2 vCPU, 4GB RAM) - recommended
4. Name it: `idea3-production`
5. Click **"Create instance"**

Wait 2-3 minutes for instance to start.

## Step 2: Connect to Instance

1. In Lightsail console, click your instance
2. Click **"Connect using SSH"** (opens browser terminal)
   - OR use SSH key: Click **"Account"** → **"SSH keys"** → Download

### Using SSH from your computer:

```bash
# Download SSH key from Lightsail console first
# Then connect:
ssh -i ~/Downloads/LightsailDefaultKey-us-east-1.pem ubuntu@YOUR_INSTANCE_IP
```

## Step 3: Install Docker & Docker Compose

Run these commands on your Lightsail instance:

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt-get install -y git

# Log out and back in for docker group to take effect
exit
```

Reconnect via SSH, then verify:

```bash
docker --version
docker-compose --version
```

## Step 4: Clone Your Repository

```bash
# Create app directory
mkdir -p ~/app
cd ~/app

# Clone your repo (replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/idea3.git .

# OR if you prefer, upload files via SCP:
# From your local machine:
# scp -i ~/Downloads/LightsailDefaultKey-us-east-1.pem -r backend_v2 frontend ubuntu@YOUR_INSTANCE_IP:~/app/
```

## Step 5: Build Frontend

```bash
# Install Node.js (for building frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Build frontend
cd ~/app/frontend
npm install
npm run build

# The built files will be in ~/app/frontend/dist
```

## Step 6: Configure Environment

```bash
cd ~/app/backend_v2

# Copy production env template
cp production.env.example production.env

# Edit with your production values
nano production.env
```

**Required settings in `production.env`:**

```env
# Database (will use Docker postgres, but set strong password)
POSTGRES_USER=startup_discovery
POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_HERE
POSTGRES_DB=startup_discovery

# Redis (will use Docker redis)
REDIS_PASSWORD=YOUR_STRONG_REDIS_PASSWORD_HERE

# API Keys
OPENAI_API_KEY=sk-...  # or ANTHROPIC_API_KEY
SECRET_KEY=YOUR_32_CHAR_SECRET_KEY_HERE

# CORS - Your domain
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]

# Environment
ENVIRONMENT=production
DEBUG=false
```

Generate SECRET_KEY:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Step 7: Run Database Migrations

```bash
cd ~/app/backend_v2

# Start only PostgreSQL first
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait 10 seconds for DB to be ready
sleep 10

# Run migrations
docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head
```

## Step 8: Start All Services

```bash
cd ~/app/backend_v2

# Start everything
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

Wait 30 seconds, then verify:

```bash
# Check all containers are running
docker-compose -f docker-compose.prod.yml ps

# Test health endpoint
curl http://localhost:8000/health
```

## Step 9: Configure Firewall (Open Ports)

1. In Lightsail console, click your instance
2. Go to **"Networking"** tab
3. Click **"Add rule"**:
   - **Application**: Custom
   - **Protocol**: TCP
   - **Port**: 80 (HTTP)
   - Click **"Create"**
4. Add another rule for port 443 (HTTPS)

## Step 10: Set Up Domain (Optional)

### Option A: Use Lightsail Static IP + Domain

1. In Lightsail console → **Networking** → **Create static IP**
2. Attach it to your instance
3. Point your domain's A record to the static IP

### Option B: Use Lightsail Load Balancer (for HTTPS)

1. Create Load Balancer ($18/month)
2. Attach to your instance
3. Add SSL certificate (free via AWS Certificate Manager)

### Option C: Use Nginx with Let's Encrypt (Free SSL)

Your `docker-compose.prod.yml` already includes nginx! Just need to configure SSL:

```bash
# Install certbot on the instance
sudo apt-get install -y certbot

# Get SSL certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ~/app/backend_v2/nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ~/app/backend_v2/nginx/ssl/

# Update nginx config to use SSL (see nginx/conf.d/default.conf)
# Then restart nginx container
docker-compose -f docker-compose.prod.yml restart nginx
```

## Step 11: Update Frontend API URL

If your backend is on a different domain, update frontend config:

```bash
# Edit frontend config to point to your backend
nano ~/app/frontend/src/config/api.js
# Or wherever your API base URL is configured
```

## Daily Operations

### View Logs
```bash
cd ~/app/backend_v2
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Restart Services
```bash
cd ~/app/backend_v2
docker-compose -f docker-compose.prod.yml restart
```

### Update Application
```bash
cd ~/app
git pull  # or upload new files

# Rebuild frontend if needed
cd frontend
npm run build

# Rebuild and restart backend
cd ../backend_v2
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup Database
```bash
cd ~/app/backend_v2
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U startup_discovery startup_discovery > backup_$(date +%Y%m%d).sql
```

## Troubleshooting

### Containers won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check memory
free -h
```

### Out of memory
- Upgrade to $20/month plan (4GB RAM)
- Or reduce Uvicorn workers in Dockerfile.prod

### Can't access from browser
- Check Lightsail firewall rules (ports 80/443)
- Check nginx is running: `docker-compose -f docker-compose.prod.yml ps nginx`
- Check instance is running in Lightsail console

## Monitoring

Lightsail provides basic monitoring in the console:
- CPU usage
- Network traffic
- Memory usage

For more advanced monitoring, consider:
- CloudWatch (AWS native)
- Sentry (error tracking)
- UptimeRobot (uptime monitoring)

## Security Checklist

- [ ] Strong passwords in `production.env`
- [ ] SECRET_KEY is 32+ characters
- [ ] CORS_ORIGINS only includes your domain
- [ ] SSL certificate installed (HTTPS)
- [ ] Firewall only allows ports 80, 443, 22
- [ ] Regular backups configured
- [ ] Keep Docker images updated

## Cost Optimization Tips

1. **Start with $10/month plan** - Upgrade if needed
2. **Use Lightsail snapshots** for backups (cheaper than EBS)
3. **Monitor usage** - Lightsail shows usage in console
4. **Set up billing alerts** in AWS Billing console

## Database Options

You have two options for PostgreSQL:

1. **Docker PostgreSQL** (default) - Included, $0 extra
   - Already configured in `docker-compose.prod.yml`
   - Set up automated backups: `crontab -e` → add `0 2 * * * ~/app/scripts/backup-db.sh`
   - See `scripts/backup-db.sh` for backup script

2. **Lightsail Database** - $15/month, managed with automatic backups
   - Better for production, automatic daily backups
   - See `docs/DATABASE_OPTIONS_AWS.md` for setup instructions

**Recommendation:** Start with Docker PostgreSQL, upgrade to Lightsail Database when you need automatic backups.

## Next Steps

1. Set up automated backups (cron job): `crontab -e` → `0 2 * * * ~/app/scripts/backup-db.sh`
2. Configure monitoring alerts
3. Set up CI/CD (GitHub Actions → deploy to Lightsail)
4. Add CDN (CloudFront) for frontend assets if needed

## Support

- AWS Lightsail Docs: https://lightsail.aws.amazon.com/ls/docs/
- Docker Compose Docs: https://docs.docker.com/compose/

