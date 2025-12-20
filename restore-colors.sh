#!/bin/bash
# Color Restore Script (Linux/Mac)
# This script restores original color values from backup files

echo "========================================"
echo "Color Restore Script"
echo "========================================"
echo ""

BACKUP_DIR="frontend/src/styles/backup"
STYLES_DIR="frontend/src/styles"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "ERROR: Backup directory not found!"
    echo "Location: $BACKUP_DIR"
    exit 1
fi

# Restore files
echo "Restoring color files..."
echo ""

# Restore theme.css
if [ -f "$BACKUP_DIR/theme.css.backup" ]; then
    cp "$BACKUP_DIR/theme.css.backup" "$STYLES_DIR/theme.css"
    echo "✓ Restored: theme.css"
else
    echo "✗ Backup not found: theme.css.backup"
fi

# Restore marketing-tokens.css
if [ -f "$BACKUP_DIR/marketing-tokens.css.backup" ]; then
    cp "$BACKUP_DIR/marketing-tokens.css.backup" "$STYLES_DIR/marketing-tokens.css"
    echo "✓ Restored: marketing-tokens.css"
else
    echo "✗ Backup not found: marketing-tokens.css.backup"
fi

# Restore marketing.css
if [ -f "$BACKUP_DIR/marketing.css.backup" ]; then
    cp "$BACKUP_DIR/marketing.css.backup" "$STYLES_DIR/marketing.css"
    echo "✓ Restored: marketing.css"
else
    echo "✗ Backup not found: marketing.css.backup"
fi

echo ""
echo "========================================"
echo "Restore Complete!"
echo "========================================"
echo ""
echo "Note: If you're on a git branch, you can also use:"
echo "  git checkout master"
echo ""

