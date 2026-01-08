#!/bin/bash
# Database Restore Script for Docker PostgreSQL
# Usage: ./restore-db.sh backup_20240101_120000.sql.gz

set -e

# Configuration
BACKEND_DIR="${BACKEND_DIR:-$HOME/app/backend_v2}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check argument
if [ -z "$1" ]; then
    echo -e "${RED}❌ Usage: $0 <backup_file>${NC}"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# If relative path, assume it's in backup directory
if [ ! -f "$BACKUP_FILE" ] && [ -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will replace your current database!${NC}"
echo "Backup file: $BACKUP_FILE"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found: $BACKEND_DIR${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

# Check if PostgreSQL container is running
if ! docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
    echo -e "${YELLOW}⚠️  PostgreSQL container is not running. Starting it...${NC}"
    docker-compose -f docker-compose.prod.yml up -d postgres
    sleep 5
fi

echo "Restoring database from: $BACKUP_FILE"

# Restore backup
if gunzip -c "$BACKUP_FILE" | docker-compose -f docker-compose.prod.yml exec -T postgres \
    psql -U startup_discovery startup_discovery; then
    echo -e "${GREEN}✅ Database restored successfully!${NC}"
else
    echo -e "${RED}❌ Restore failed!${NC}"
    exit 1
fi

