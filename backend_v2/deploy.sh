#!/bin/bash
# Production deployment script

set -e

echo "🚀 Starting production deployment..."

# Check if production.env exists
if [ ! -f "production.env" ]; then
    echo "❌ Error: production.env file not found!"
    echo "   Please copy production.env.example to production.env and fill in values."
    exit 1
fi

# Check if SSL certificates exist
if [ ! -f "nginx/ssl/fullchain.pem" ] || [ ! -f "nginx/ssl/privkey.pem" ]; then
    echo "⚠️  Warning: SSL certificates not found in nginx/ssl/"
    echo "   Using self-signed certificates for testing (NOT for production!)"
    echo "   For production, use Let's Encrypt certbot or place your certificates."
    
    # Create self-signed cert for testing (remove in production)
    if [ ! -f "nginx/ssl/fullchain.pem" ]; then
        mkdir -p nginx/ssl
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/privkey.pem \
            -out nginx/ssl/fullchain.pem \
            -subj "/C=US/ST=State/L=City/O=Org/CN=localhost"
        echo "   Created self-signed certificate (testing only)"
    fi
fi

# Build frontend (if frontend directory exists)
if [ -d "../frontend" ]; then
    echo "📦 Building frontend..."
    cd ../frontend
    npm run build
    cd ../backend_v2
    
    # Ensure dist directory exists
    mkdir -p frontend/dist
    cp -r ../frontend/dist/* frontend/dist/ 2>/dev/null || echo "   Frontend build copied"
else
    echo "⚠️  Frontend directory not found. Skipping frontend build."
    mkdir -p frontend/dist
fi

# Pull latest images
echo "📥 Pulling latest images..."
docker-compose -f docker-compose.prod.yml pull

# Build images
echo "🔨 Building images..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm backend alembic upgrade head

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Deployment complete!"
echo ""
echo "Services:"
echo "  - Backend: http://localhost/api/health"
echo "  - Frontend: https://localhost"
echo "  - Admin: https://localhost/api/admin/metrics"
echo ""
echo "To view logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"

