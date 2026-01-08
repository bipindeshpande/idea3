# Simple Production Deployment Guide
## For Non-Technical Managers - Step-by-Step Plan

**Last Updated:** January 2025  
**Recommended Option:** AWS Lightsail (Simplest & Most Cost-Effective)

---

## 🎯 Quick Decision: Which Option Should I Choose?

### ✅ **RECOMMENDED: AWS Lightsail** (Best for You)

**Why This is Best for You:**
- ✅ **Simplest** - One place for everything, easy web interface
- ✅ **Cheapest** - $20/month (vs $25-40/month for other options)
- ✅ **Fixed Price** - No surprises, predictable monthly cost
- ✅ **Works for 1+ Years** - Can handle growth, easy to upgrade
- ✅ **No Technical Knowledge Needed** - Follow step-by-step guide below
- ✅ **Everything in One Place** - Backend, frontend, database all together

**Monthly Cost:** $20/month (everything included)

**Alternative Option:** Railway + Vercel ($25-40/month, slightly more complex)

---

## 📋 What You'll Need Before Starting

1. **AWS Account** (free to create at aws.amazon.com)
2. **Domain Name** (optional - you can use Lightsail's free domain initially)
3. **Your API Keys** (OpenAI or Anthropic API key)
4. **30-60 minutes** of your time for initial setup

---

## 🚀 Step-by-Step Deployment Plan

### **Phase 1: Initial Setup (30-45 minutes)**

#### Step 1: Create AWS Account (5 minutes)

1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click **"Create an AWS Account"**
3. Follow the signup process (you'll need a credit card, but won't be charged until you use services)
4. Verify your email and phone number

**Note:** AWS has a free tier, but Lightsail is not included. You'll pay $20/month starting from day 1.

---

#### Step 2: Create Lightsail Instance (10 minutes)

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click **"Create instance"** (big orange button)
3. Choose these settings:
   - **Platform**: Linux/Unix
   - **Blueprint**: Ubuntu 22.04 LTS (or latest available)
   - **Instance plan**: **$20/month** (2 vCPU, 4GB RAM) ← **Choose this one**
   - **Name**: `idea3-production` (or any name you like)
4. Click **"Create instance"**
5. **Wait 2-3 minutes** for it to start (you'll see a green checkmark when ready)

**What This Does:** Creates a virtual server where your app will run.

---

#### Step 3: Connect to Your Server (5 minutes)

1. In Lightsail console, click on your instance name
2. Click the **"Connect using SSH"** button (blue button)
3. A browser window will open - this is your server terminal
4. **Keep this window open** - you'll use it in the next steps

**What This Does:** Gives you access to your server to install and configure your app.

---

#### Step 4: Install Required Software (10 minutes)

**In the browser terminal window, copy and paste these commands one by one:**

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker (this runs your app)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git (to download your code)
sudo apt-get install -y git

# Install Node.js (to build frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Wait for each command to finish before running the next one.**

**Then close and reopen the terminal** (click "Connect using SSH" again) so Docker permissions work.

**What This Does:** Installs all the software needed to run your app.

---

#### Step 5: Download Your Code (5 minutes)

**In the terminal, run:**

```bash
# Create app directory
mkdir -p ~/app
cd ~/app

# Download your code (replace with your actual GitHub repo URL)
git clone https://github.com/YOUR_USERNAME/idea3.git .
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

**What This Does:** Downloads your application code to the server.

---

### **Phase 2: Configuration (15-20 minutes)**

#### Step 6: Configure Environment Variables (10 minutes)

1. In the terminal, run:
   ```bash
   cd ~/app/backend_v2
   cp production.env.example production.env
   nano production.env
   ```

2. **A text editor will open.** You need to fill in these values:

   ```env
   # Database Password (create a strong password - at least 16 characters)
   POSTGRES_PASSWORD=YourStrongPassword123!
   
   # Redis Password (create another strong password)
   REDIS_PASSWORD=AnotherStrongPassword123!
   
   # Secret Key (generate this - see below)
   SECRET_KEY=your-secret-key-here
   
   # Your API Key (OpenAI or Anthropic)
   OPENAI_API_KEY=sk-your-actual-api-key-here
   # OR
   ANTHROPIC_API_KEY=your-anthropic-key-here
   
   # Your Domain (replace with your actual domain, or use the IP for now)
   CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]
   
   # Environment
   ENVIRONMENT=production
   DEBUG=false
   ```

3. **To generate SECRET_KEY**, open a new terminal and run:
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   Copy the output and paste it as your SECRET_KEY.

4. **To save and exit** the editor:
   - Press `Ctrl + X`
   - Press `Y` (to confirm)
   - Press `Enter`

**What This Does:** Sets up all the passwords and API keys your app needs.

---

#### Step 7: Build Frontend (5 minutes)

**In the terminal, run:**

```bash
cd ~/app/frontend
npm install
npm run build
```

**Wait for this to finish** (may take 2-3 minutes).

**What This Does:** Prepares your frontend for production.

---

### **Phase 3: Start Your App (10 minutes)**

#### Step 8: Start Database and Run Migrations (5 minutes)

**In the terminal, run:**

```bash
cd ~/app/backend_v2

# Start only the database first
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait 10 seconds for database to be ready
sleep 10

# Run database migrations (sets up tables)
docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head
```

**What This Does:** Sets up your database with all the required tables.

---

#### Step 9: Start Everything (5 minutes)

**In the terminal, run:**

```bash
cd ~/app/backend_v2

# Start all services (backend, frontend, database, redis, nginx)
docker-compose -f docker-compose.prod.yml up -d

# Check that everything is running
docker-compose -f docker-compose.prod.yml ps
```

**You should see all services showing "Up" status.**

**What This Does:** Starts your entire application.

---

#### Step 10: Open Firewall Ports (5 minutes)

1. Go back to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click on your instance
3. Go to **"Networking"** tab
4. Click **"Add rule"**:
   - **Application**: Custom
   - **Protocol**: TCP
   - **Port**: 80
   - Click **"Create"**
5. Add another rule for port **443** (HTTPS)

**What This Does:** Allows internet traffic to reach your app.

---

#### Step 11: Test Your App (2 minutes)

1. In Lightsail console, find your instance's **public IP address**
2. Open a browser and go to: `http://YOUR_IP_ADDRESS`
3. **Your app should load!** 🎉

**What This Does:** Verifies everything is working.

---

### **Phase 4: Set Up Domain & SSL (Optional - 15 minutes)**

#### Step 12: Point Your Domain to Lightsail

1. In Lightsail console → **Networking** → **Create static IP**
2. Attach the static IP to your instance
3. In your domain registrar (where you bought your domain):
   - Add an **A record** pointing to the static IP
   - Add a **CNAME record** for `www` pointing to your domain

**What This Does:** Makes your app accessible via your domain name.

---

#### Step 13: Set Up SSL Certificate (Free HTTPS)

**In the terminal, run:**

```bash
# Install certbot
sudo apt-get install -y certbot

# Stop nginx temporarily
cd ~/app/backend_v2
docker-compose -f docker-compose.prod.yml stop nginx

# Get SSL certificate (replace with your domain)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ~/app/backend_v2/nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ~/app/backend_v2/nginx/ssl/

# Restart nginx
docker-compose -f docker-compose.prod.yml up -d nginx
```

**What This Does:** Enables HTTPS (secure connection) for your app.

---

## 🔧 Daily Operations (Simple Commands)

### View Logs (If Something Goes Wrong)

```bash
cd ~/app/backend_v2
docker-compose -f docker-compose.prod.yml logs -f
```

Press `Ctrl + C` to stop viewing logs.

---

### Restart Your App

```bash
cd ~/app/backend_v2
docker-compose -f docker-compose.prod.yml restart
```

---

### Update Your App (When You Make Changes)

```bash
cd ~/app
git pull  # Get latest code

# Rebuild frontend if you changed it
cd frontend
npm run build

# Restart backend
cd ../backend_v2
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 💾 Set Up Backups (IMPORTANT - 10 minutes)

### Step 14: Automated Daily Backups

**In the terminal, run:**

```bash
# Create backup script
cat > ~/app/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
cd ~/app/backend_v2
docker-compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U startup_discovery startup_discovery \
  | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

# Make it executable
chmod +x ~/app/backup-db.sh

# Set up to run daily at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * ~/app/backup-db.sh") | crontab -
```

**What This Does:** Automatically backs up your database every day at 2 AM.

---

## 📊 Monitoring (Set Up in 15 minutes)

### Step 15: Error Tracking (Sentry - Free)

1. Go to [sentry.io](https://sentry.io) and sign up (free)
2. Create a new project (Python/FastAPI)
3. Copy the DSN (looks like: `https://xxx@sentry.io/xxx`)
4. Add to your `production.env`:
   ```env
   SENTRY_DSN=https://xxx@sentry.io/xxx
   ```
5. Install Sentry in your app (ask your developer to add this)

**What This Does:** Tracks errors so you know when something breaks.

---

### Step 16: Uptime Monitoring (UptimeRobot - Free)

1. Go to [uptimerobot.com](https://uptimerobot.com) and sign up (free)
2. Click **"Add New Monitor"**
3. Set:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://yourdomain.com/health`
   - **Interval**: 5 minutes
   - **Alert Contacts**: Your email
4. Click **"Create Monitor"**

**What This Does:** Sends you an email if your app goes down.

---

## 💰 Cost Breakdown

### Monthly Costs:

- **AWS Lightsail Instance**: $20/month
- **Domain** (if you buy one): ~$12/year (~$1/month)
- **Sentry** (error tracking): **FREE** (up to 5,000 errors/month)
- **UptimeRobot** (monitoring): **FREE**
- **SSL Certificate**: **FREE** (Let's Encrypt)

**Total: ~$20-21/month**

### When You Grow:

- If you need more power: Upgrade to $40/month plan (4 vCPU, 8GB RAM)
- If you need managed database: Add Lightsail Database ($15/month)
- If you exceed Sentry free tier: $26/month

**Total at scale: ~$60-80/month** (still cheaper than Railway+Vercel)

---

## ✅ Maintenance Checklist (Monthly)

**Once a month, do these:**

1. ✅ Check backups are working: `ls ~/backups` (should see recent files)
2. ✅ Check Sentry dashboard for errors
3. ✅ Check UptimeRobot for any downtime alerts
4. ✅ Update your app: `cd ~/app && git pull && cd frontend && npm run build && cd ../backend_v2 && docker-compose -f docker-compose.prod.yml up -d --build`
5. ✅ Check Lightsail console for any alerts

**Time needed: 10-15 minutes/month**

---

## 🆘 Troubleshooting

### App Won't Start

1. Check logs: `cd ~/app/backend_v2 && docker-compose -f docker-compose.prod.yml logs`
2. Check if containers are running: `docker-compose -f docker-compose.prod.yml ps`
3. Restart everything: `docker-compose -f docker-compose.prod.yml restart`

### Can't Access from Browser

1. Check firewall: Lightsail console → Networking → Make sure ports 80 and 443 are open
2. Check if nginx is running: `docker-compose -f docker-compose.prod.yml ps nginx`
3. Check instance is running: Lightsail console → Should show green status

### Out of Memory

- Upgrade to $40/month plan (4 vCPU, 8GB RAM) in Lightsail console

### Need Help?

- AWS Lightsail Support: [lightsail.aws.amazon.com/ls/docs/](https://lightsail.aws.amazon.com/ls/docs/)
- Check logs first: `docker-compose -f docker-compose.prod.yml logs`

---

## 📈 Growth Path (1 Year Plan)

### Month 1-3: Start Here
- ✅ AWS Lightsail $20/month
- ✅ Docker PostgreSQL (included)
- ✅ Free monitoring tools
- **Total: $20/month**

### Month 4-6: As You Grow
- ✅ Keep Lightsail $20/month
- ✅ Add Lightsail Database $15/month (if you need automatic backups)
- ✅ Upgrade Sentry if needed $26/month
- **Total: $35-60/month**

### Month 7-12: Scaling
- ✅ Upgrade Lightsail to $40/month (if needed)
- ✅ Keep managed database
- ✅ Add more monitoring if needed
- **Total: $60-80/month**

**This setup can easily handle:**
- 100-500 daily active users
- 1,000-5,000 API requests/day
- Small to medium traffic websites

---

## 🎯 Summary: Why This is the Best Option for You

### ✅ **Simplest**
- One place for everything
- Simple web interface
- No complex configurations

### ✅ **Cheapest**
- $20/month vs $25-40/month for alternatives
- Fixed pricing, no surprises
- Free monitoring tools

### ✅ **Good for 1+ Years**
- Can handle growth
- Easy to upgrade
- No need to migrate later

### ✅ **Non-Technical Friendly**
- Step-by-step instructions
- Simple commands to copy/paste
- Clear explanations of what each step does

### ✅ **Reliable**
- AWS infrastructure
- Automatic backups (once set up)
- Free monitoring included

---

## 📝 Quick Reference Card

**Save this for quick access:**

```
Server: AWS Lightsail $20/month
Domain: Your domain name
SSL: Free (Let's Encrypt)
Backups: Daily at 2 AM (automatic)
Monitoring: Sentry (free) + UptimeRobot (free)

Common Commands:
- View logs: cd ~/app/backend_v2 && docker-compose -f docker-compose.prod.yml logs -f
- Restart: cd ~/app/backend_v2 && docker-compose -f docker-compose.prod.yml restart
- Update: cd ~/app && git pull && cd frontend && npm run build && cd ../backend_v2 && docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🚀 Next Steps

1. **Today**: Follow Phase 1-3 (get your app running)
2. **This Week**: Set up domain and SSL (Phase 4)
3. **This Week**: Set up backups and monitoring (Steps 14-16)
4. **Monthly**: Run maintenance checklist

**Total Setup Time: 1-2 hours**  
**Monthly Maintenance: 10-15 minutes**  
**Monthly Cost: $20-21**

---

## 📚 Additional Resources

- **Full AWS Lightsail Guide**: See `docs/AWS_LIGHTSAIL_DEPLOYMENT.md`
- **Database Options**: See `docs/DATABASE_OPTIONS_AWS.md`
- **Monitoring Guide**: See `docs/PRODUCTION_MONITORING_GUIDE.md`
- **Quick Start**: See `docs/LIGHTSAIL_QUICK_START.md`

---

**You're all set!** Follow the steps above, and you'll have your app running in production within 1-2 hours. If you get stuck, refer to the troubleshooting section or check the detailed guides in the `docs/` folder.

Good luck! 🎉

