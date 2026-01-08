-- Create test database for automated tests
-- Run this script as a PostgreSQL superuser (e.g., postgres user)

-- Create the test database
CREATE DATABASE startup_discovery_test;

-- Grant privileges to the application user
GRANT ALL PRIVILEGES ON DATABASE startup_discovery_test TO startup_discovery;

-- Connect to the test database and grant schema privileges
\c startup_discovery_test
GRANT ALL ON SCHEMA public TO startup_discovery;

