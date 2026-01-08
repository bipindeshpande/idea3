#!/bin/bash
# Database Backup Script for Docker PostgreSQL
# Run this daily via cron for automated backups

set -e

# Configuration
BACKEND_DIR="${BACKEND_DIR:-$HOME/app/backend_v2}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
S3_BUCKET="${S3_BUCKET:-}"  # Optional: S3 bucket for off-site backups

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🗄️  Starting database backup..."

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found: $BACKEND_DIR${NC}"
    exit 1
fi

cd "$BACKEND_DIR"

# Check if PostgreSQL container is running
if ! docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
    echo -e "${RED}❌ PostgreSQL container is not running!${NC}"
    exit 1
fi

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"

echo "Creating backup: $BACKUP_FILE"

# Create backup
if docker-compose -f docker-compose.prod.yml exec -T postgres \
    pg_dump -U startup_discovery startup_discovery \
    | gzip > "$BACKUP_FILE"; then
    
    # Get backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup created successfully: $BACKUP_SIZE${NC}"
    
    # Upload to S3 if configured
    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        echo "Uploading to S3: s3://$S3_BUCKET/backups/"
        if aws s3 cp "$BACKUP_FILE" "s3://$S3_BUCKET/backups/"; then
            echo -e "${GREEN}✅ Uploaded to S3${NC}"
        else
            echo -e "${YELLOW}⚠️  S3 upload failed (backup still saved locally)${NC}"
        fi
    fi
    
    # Clean up old backups (keep last N days)
    echo "Cleaning up backups older than $RETENTION_DAYS days..."
    DELETED=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
    if [ "$DELETED" -gt 0 ]; then
        echo -e "${GREEN}✅ Deleted $DELETED old backup(s)${NC}"
    else
        echo "No old backups to delete"
    fi
    
    # List current backups
    echo ""
    echo "Current backups:"
    ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | tail -5 || echo "No backups found"
    
else
    echo -e "${RED}❌ Backup failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Backup complete!${NC}"

