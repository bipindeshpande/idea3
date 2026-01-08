# Test Database Setup

This project uses a **separate PostgreSQL test database** for running automated tests. This ensures test isolation and prevents tests from affecting production data.

## Quick Setup

### Option 1: Using PowerShell Script (Windows)
```powershell
cd backend_v2
.\scripts\create_test_db.ps1
```

### Option 2: Using Bash Script (Linux/Mac)
```bash
cd backend_v2
chmod +x scripts/create_test_db.sh
./scripts/create_test_db.sh
```

### Option 3: Manual SQL (Any Platform)
```bash
psql -U postgres -f scripts/create_test_db.sql
```

Or connect to PostgreSQL and run:
```sql
CREATE DATABASE startup_discovery_test;
GRANT ALL PRIVILEGES ON DATABASE startup_discovery_test TO startup_discovery;
\c startup_discovery_test
GRANT ALL ON SCHEMA public TO startup_discovery;
```

## Configuration

The test database URL is automatically configured as:
```
postgresql://startup_discovery:startup_discovery_dev@localhost:5432/startup_discovery_test
```

This is derived from your production database URL in `app/core/config.py`, but uses the `startup_discovery_test` database instead.

### Override Test Database URL

If you need to use a different test database, set the `TEST_DATABASE_URL` environment variable:

**Windows PowerShell:**
```powershell
$env:TEST_DATABASE_URL="postgresql://user:pass@host:port/dbname"
```

**Linux/Mac:**
```bash
export TEST_DATABASE_URL="postgresql://user:pass@host:port/dbname"
```

## Running Tests

Once the test database is created, run tests normally:

```bash
# Run all tests
pytest

# Run unit tests only
pytest tests/unit/

# Run integration tests only
pytest tests/integration/

# Run with coverage
pytest --cov=app
```

## Test Database Behavior

- **Isolation**: Each test runs in a transaction that is rolled back after completion
- **Clean State**: Tests don't affect each other or production data
- **Schema**: Tables are created automatically if they don't exist
- **No Cleanup**: Tables are NOT dropped after tests (preserves schema for faster subsequent runs)

## Troubleshooting

### Database doesn't exist
```
OperationalError: database "startup_discovery_test" does not exist
```
**Solution**: Run the database creation script above.

### Permission denied
```
ERROR: permission denied to create database
```
**Solution**: Run the script as a PostgreSQL superuser (postgres user) or grant CREATE DATABASE privilege to your user.

### Connection refused
```
OperationalError: connection to server failed
```
**Solution**: Ensure PostgreSQL is running and accessible at the configured host/port.

