#!/bin/bash
# Reset Database Script - Clears all data and optionally seeds with test data
# Usage: ./reset-db.sh [--seed]

set -e

SEED=false

# Parse arguments
if [[ "$1" == "--seed" ]]; then
    SEED=true
fi

echo ""
echo "🔄 Database Reset Script"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install Docker first."
    exit 1
fi

# Check if containers are running
if docker ps --format "{{.Names}}" | grep -qE "postgres|redis|backend"; then
    echo "⚠️  WARNING: This will delete ALL database data!"
    echo "Press Enter to continue, or Ctrl+C to cancel..."
    read
else
    echo "ℹ️  No running containers detected. Starting fresh..."
fi

echo ""
echo "📦 Step 1: Stopping containers..."
docker-compose down 2>/dev/null || true

echo "🗑️  Step 2: Removing database volumes..."
for volume in idea3_postgres_data backend_v2_postgres_data idea3_redis_data backend_v2_redis_data; do
    docker volume rm "$volume" 2>/dev/null || true
done

echo "🚀 Step 3: Starting database..."
docker-compose up -d postgres redis

echo "⏳ Step 4: Waiting for database to be ready..."
max_attempts=30
attempt=0
db_ready=false

while [ $attempt -lt $max_attempts ] && [ "$db_ready" = false ]; do
    sleep 1
    attempt=$((attempt + 1))
    if docker-compose exec -T postgres pg_isready -U startup_discovery >/dev/null 2>&1; then
        db_ready=true
    fi
done

if [ "$db_ready" = false ]; then
    echo "❌ Database failed to start. Please check logs: docker-compose logs postgres"
    exit 1
fi

echo "✅ Database is ready!"

echo "📊 Step 5: Running migrations..."
docker-compose run --rm backend alembic upgrade head

if [ $? -ne 0 ]; then
    echo "❌ Migrations failed. Please check logs."
    exit 1
fi

echo "✅ Migrations completed!"

if [ "$SEED" = true ]; then
    echo ""
    echo "🌱 Step 6: Seeding database with test data..."
    
    # Check if seed script exists
    if [ -f "scripts/seed-db.sh" ]; then
        bash scripts/seed-db.sh
    else
        echo "⚠️  Seed script not found. Creating basic test user..."
        
        # Create test user via Python
        docker-compose run --rm backend python -c "
from app.core.database import SessionLocal
from app.models.user import User
from app.services.auth_service import AuthService
import uuid

db = SessionLocal()
try:
    test_user = db.query(User).filter(User.email == 'test@example.com').first()
    if not test_user:
        user = User(
            user_id=str(uuid.uuid4()),
            email='test@example.com',
            hashed_password=AuthService.get_password_hash('test123'),
            full_name='Test User',
            is_active=True,
            is_verified=True,
            subscription_type='premium',
            role='user'
        )
        db.add(user)
        db.commit()
        print('✅ Test user created: test@example.com / test123')
    else:
        print('ℹ️  Test user already exists')
finally:
    db.close()
"
    fi
fi

echo ""
echo "✅ Database reset complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Start backend: docker-compose up -d backend"
echo "  2. View logs: docker-compose logs -f backend"
if [ "$SEED" = true ]; then
    echo "  3. Test login: test@example.com / test123"
fi
echo ""

