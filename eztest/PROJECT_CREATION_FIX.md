# EZTest Project Creation Fix

## Issue
EZTest is not creating projects - returns "Failed to create project" error.

## Root Cause
The issue was likely that RBAC (Role-Based Access Control) roles and permissions were not properly seeded, or the user doesn't have the required `projects:create` permission.

## Solution

### 1. Ensure RBAC is Seeded (Already Fixed ✅)
The RBAC seeding has been run. The following roles and permissions are now set up:
- **ADMIN**: Full access (all permissions including `projects:create`)
- **PROJECT_MANAGER**: Full access to test suites, test cases, test runs
- **TESTER**: Full access to test operations and defects
- **VIEWER**: Read-only access

### 2. Check Your User Role
1. **Login to EZTest**: http://localhost:3000
2. **Login with admin account**:
   - Email: `admin@eztest.local`
   - Password: `Admin@123456` (check your .env file for ADMIN_PASSWORD)
3. **Or register a new account** - new users should be assigned a default role

### 3. Verify User Has Required Permission
To create projects, your user needs the `projects:create` permission. This is typically assigned to:
- **ADMIN role** - Has all permissions
- **PROJECT_MANAGER role** - May have project creation permission

### 4. If Issue Persists

#### Option A: Restart Containers
```powershell
cd eztest
docker-compose restart
```

#### Option B: Re-run Seeding
```powershell
docker exec eztest-app npx tsx prisma/seed-rbac.ts
```

#### Option C: Check Application Logs
```powershell
docker logs eztest-app --tail=50
```

#### Option D: Verify Database Connection
```powershell
docker exec eztest-postgres psql -U eztest -d eztest -c "\dt"
```

## Default Admin User
- **Email**: `admin@eztest.local` (configurable via ADMIN_EMAIL in .env)
- **Password**: `Admin@123456` (configurable via ADMIN_PASSWORD in .env)

## Permissions Required for Project Creation
- Permission: `projects:create`
- Roles with this permission: **ADMIN**, potentially **PROJECT_MANAGER**

## Next Steps
1. Try logging in with the admin account
2. Try creating a project - it should work now
3. If it still fails, check the browser console for detailed error messages
4. Check Docker logs for more details: `docker logs eztest-app --tail=50`

## Common Issues

### Issue: "Permission denied" or 403 error
**Solution**: Your user doesn't have the `projects:create` permission. Log in as admin or assign the ADMIN role to your user.

### Issue: "Project key already exists"
**Solution**: Choose a different project key. Project keys must be unique.

### Issue: Database connection error
**Solution**: Ensure PostgreSQL container is running: `docker ps | Select-String postgres`

### Issue: Internal server error (500)
**Solution**: Check application logs for detailed error: `docker logs eztest-app --tail=50`


