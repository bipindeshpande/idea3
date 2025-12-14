-- Clear all data from all tables (keeps schema and migrations)
-- Run this in your database tool (DBeaver, pgAdmin, etc.)

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Truncate all data tables (keeps table structure)
-- Note: alembic_version is kept to preserve migration state

TRUNCATE TABLE 
    runs,
    validations,
    actions,
    notes,
    psyche_profiles,
    founder_psychology,
    founder_profiles,
    founder_idea_listings,
    founder_connections,
    discovery_results,
    cache_entries,
    error_logs,
    rate_limit_logs,
    llm_usage,
    users
CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Verify all tables are empty (should all return 0)
SELECT 
    'runs' as table_name, COUNT(*) as count FROM runs
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'validations', COUNT(*) FROM validations
UNION ALL
SELECT 'actions', COUNT(*) FROM actions
UNION ALL
SELECT 'notes', COUNT(*) FROM notes
UNION ALL
SELECT 'psyche_profiles', COUNT(*) FROM psyche_profiles
UNION ALL
SELECT 'founder_psychology', COUNT(*) FROM founder_psychology
UNION ALL
SELECT 'founder_profiles', COUNT(*) FROM founder_profiles
UNION ALL
SELECT 'founder_idea_listings', COUNT(*) FROM founder_idea_listings
UNION ALL
SELECT 'founder_connections', COUNT(*) FROM founder_connections
UNION ALL
SELECT 'discovery_results', COUNT(*) FROM discovery_results
UNION ALL
SELECT 'cache_entries', COUNT(*) FROM cache_entries
UNION ALL
SELECT 'error_logs', COUNT(*) FROM error_logs
UNION ALL
SELECT 'rate_limit_logs', COUNT(*) FROM rate_limit_logs
UNION ALL
SELECT 'llm_usage', COUNT(*) FROM llm_usage
ORDER BY table_name;

-- Show alembic_version (should still exist)
SELECT * FROM alembic_version;

