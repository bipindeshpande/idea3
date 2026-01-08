#!/bin/bash
# Bash script to create test database
# This script connects to PostgreSQL and creates the test database

DB_NAME="startup_discovery_test"
DB_USER="startup_discovery"
DB_PASSWORD="startup_discovery_dev"
DB_HOST="localhost"
DB_PORT="5432"

echo "Creating test database: $DB_NAME"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Try to create database as postgres superuser, fall back to application user
if psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null; then
    echo "Database created successfully!"
    
    # Grant privileges
    echo "Granting privileges to $DB_USER..."
    psql -h $DB_HOST -p $DB_PORT -U postgres -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    psql -h $DB_HOST -p $DB_PORT -U postgres -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;"
    
    echo "Test database setup complete!"
    echo "Database URL: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
else
    # Try with application user
    echo "Trying with application user..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "Database created successfully!"
        echo "Database URL: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    else
        echo "Error: Could not create database. It may already exist or you need superuser privileges."
        echo "To create manually, run:"
        echo "  psql -U postgres -f scripts/create_test_db.sql"
    fi
fi

