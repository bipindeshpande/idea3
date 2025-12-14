#!/bin/bash
# Script to clear all database data and restart

echo "⚠️  WARNING: This will delete ALL database data!"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

echo "Stopping containers..."
docker-compose down

echo "Removing PostgreSQL volume..."
docker volume rm idea2_postgres_data 2>/dev/null || docker volume rm backend_v2_postgres_data 2>/dev/null || echo "Volume not found (may already be deleted)"

echo "Removing Redis volume (optional)..."
docker volume rm idea2_redis_data 2>/dev/null || docker volume rm backend_v2_redis_data 2>/dev/null || echo "Redis volume not found"

echo "Starting containers..."
docker-compose up -d postgres redis

echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo "Running migrations..."
cd backend_v2
alembic upgrade head

echo "✅ Database cleared and restarted!"
echo "You can now start the backend: uvicorn app.main:app --reload"

