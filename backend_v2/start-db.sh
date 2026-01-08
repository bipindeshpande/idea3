#!/bin/bash
# Bash script to start PostgreSQL Docker container
# Checks port availability and sets POSTGRES_PORT accordingly

echo "Checking port availability..."

if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null 2>&1 || nc -z localhost 5432 2>/dev/null; then
    echo "Port 5432 is occupied. Using port 5433 instead."
    export POSTGRES_PORT=5433
else
    echo "Port 5432 is available."
    export POSTGRES_PORT=5432
fi

echo "Starting PostgreSQL container on port $POSTGRES_PORT..."
docker-compose up -d postgres

echo "Waiting for database to be ready..."
sleep 5

# Check if container is running
if docker ps --filter "name=idea3_postgres" --format "{{.Status}}" | grep -q "Up"; then
    echo "✓ PostgreSQL container is running"
    echo "✓ Database URL: postgresql://startup_discovery:startup_discovery_dev@localhost:$POSTGRES_PORT/startup_discovery"
else
    echo "✗ Container failed to start. Check logs with: docker-compose logs idea3_postgres"
    exit 1
fi

