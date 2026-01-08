# AWS Lightsail Quick Start

**5-minute setup guide** for deploying to AWS Lightsail.

## Why Lightsail? 

✅ Simplest AWS option  
✅ $10-20/month (cheaper than Railway+Vercel)  
✅ Works with your existing Docker setup  
✅ No complex AWS services to learn  

## Quick Setup (5 Steps)

### 1. Create Instance (2 minutes)

1. Go to [AWS Lightsail](https://lightsail.aws.amazon.com/)
2. Click **"Create instance"**
3. Choose: **Ubuntu 22.04**, **$20/month plan** (2 vCPU, 4GB RAM)
4. Name: `idea3-production`
5. Click **"Create"**

### 2. Connect & Setup (2 minutes)

Click **"Connect using SSH"** in Lightsail console, then run:

```bash
# Run setup script
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/scripts/setup-lightsail.sh | bash

# OR download and run locally:
wget https://raw.githubusercontent.com/YOUR_REPO/scripts/setup-lightsail.sh
chmod +x setup-lightsail.sh
./setup-lightsail.sh
```

**If Docker was just installed, log out and back in:**
```bash
exit
# Reconnect via SSH, then continue
```

### 3. Clone Your Code (1 minute)

```bash
cd ~/app
git clone https://github.com/YOUR_USERNAME/idea3.git .
```

### 4. Configure Environment (2 minutes)

```bash
cd ~/app/backend_v2
cp production.env.example production.env
nano production.env
```

**Minimum required settings:**
```env
POSTGRES_PASSWORD=your_strong_password_here
REDIS_PASSWORD=your_strong_redis_password_here
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
OPENAI_API_KEY=sk-...  # or ANTHROPIC_API_KEY
CORS_ORIGINS=["https://yourdomain.com"]
```

### 5. Deploy (1 minute)

```bash
# Build frontend and deploy everything
cd ~/app
./scripts/deploy-lightsail.sh
```

**Done!** Your app should be running at `http://YOUR_INSTANCE_IP`

## Configure Domain & SSL (Optional)

### Get SSL Certificate (Free)

```bash
# Stop nginx temporarily
cd ~/app/backend_v2
docker-compose -f docker-compose.prod.yml stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ~/app/backend_v2/nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ~/app/backend_v2/nginx/ssl/

# Update nginx config to use SSL, then restart
docker-compose -f docker-compose.prod.yml up -d nginx
```

### Point Domain to Lightsail

1. In Lightsail console → **Networking** → **Create static IP**
2. Attach static IP to your instance
3. Point your domain's A record to the static IP

## Open Firewall Ports

1. Lightsail console → Your instance → **Networking** tab
2. Add rules for ports **80** (HTTP) and **443** (HTTPS)

## Daily Commands

```bash
# View logs
cd ~/app/backend_v2
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update app
cd ~/app
git pull
cd frontend && npm run build
cd ../backend_v2
docker-compose -f docker-compose.prod.yml up -d --build
```

## Troubleshooting

**Can't access from browser?**
- Check Lightsail firewall (ports 80, 443)
- Check containers: `docker-compose -f docker-compose.prod.yml ps`

**Out of memory?**
- Upgrade to $20/month plan (4GB RAM)
- Or reduce workers in Dockerfile.prod

**Need help?**
- Full guide: `docs/AWS_LIGHTSAIL_DEPLOYMENT.md`
- Check logs: `docker-compose -f docker-compose.prod.yml logs`

## Cost

- **Lightsail $20/month**: Instance (2 vCPU, 4GB RAM)
- **Total: ~$20/month** (vs $25-40/month for Railway+Vercel)

## Next Steps

- Set up automated backups
- Configure monitoring
- Set up CI/CD pipeline

