#!/bin/bash
# AWS Lightsail Deployment Script
# Run this script on your Lightsail instance after initial setup

set -e  # Exit on error

echo "🚀 Starting deployment to AWS Lightsail..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please don't run as root. Use your ubuntu user.${NC}"
   exit 1
fi

# Navigate to app directory
APP_DIR="$HOME/app"
BACKEND_DIR="$APP_DIR/backend_v2"
FRONTEND_DIR="$APP_DIR/frontend"

if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}⚠️  App directory not found. Creating...${NC}"
    mkdir -p "$APP_DIR"
fi

cd "$APP_DIR"

# Check if production.env exists
if [ ! -f "$BACKEND_DIR/production.env" ]; then
    echo -e "${RED}❌ production.env not found!${NC}"
    echo "Please create it from production.env.example first:"
    echo "  cd $BACKEND_DIR"
    echo "  cp production.env.example production.env"
    echo "  nano production.env"
    exit 1
fi

# Build frontend
echo -e "${GREEN}📦 Building frontend...${NC}"
if [ -d "$FRONTEND_DIR" ]; then
    cd "$FRONTEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing npm dependencies..."
        npm install
    fi
    
    echo "Building production bundle..."
    npm run build
    
    if [ ! -d "dist" ]; then
        echo -e "${RED}❌ Frontend build failed! dist/ directory not found.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend directory not found. Skipping frontend build.${NC}"
fi

# Navigate to backend
cd "$BACKEND_DIR"

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "Please start Docker or check your installation."
    exit 1
fi

# Stop existing containers
echo -e "${GREEN}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true

# Start PostgreSQL first
echo -e "${GREEN}🗄️  Starting PostgreSQL...${NC}"
docker-compose -f docker-compose.prod.yml up -d postgres

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is healthy
for i in {1..30}; do
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U startup_discovery > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ PostgreSQL failed to start${NC}"
        docker-compose -f docker-compose.prod.yml logs postgres
        exit 1
    fi
    sleep 2
done

# Run migrations
echo -e "${GREEN}🔄 Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head

# Start Redis
echo -e "${GREEN}📦 Starting Redis...${NC}"
docker-compose -f docker-compose.prod.yml up -d redis

# Wait for Redis
sleep 5

# Start all services
echo -e "${GREEN}🚀 Starting all services...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 15

# Check health
echo -e "${GREEN}🏥 Checking service health...${NC}"
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy!${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed. Check logs:${NC}"
    docker-compose -f docker-compose.prod.yml logs backend | tail -20
fi

# Show container status
echo -e "${GREEN}📊 Container status:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Check logs: cd $BACKEND_DIR && docker-compose -f docker-compose.prod.yml logs -f"
echo "2. Test API: curl http://localhost:8000/health"
echo "3. Configure firewall in Lightsail console (ports 80, 443)"
echo "4. Set up domain and SSL certificate"
echo "5. Set up database backups: crontab -e → add: 0 2 * * * $HOME/app/scripts/backup-db.sh"
echo ""
echo "📖 Database options: See docs/DATABASE_OPTIONS_AWS.md"

