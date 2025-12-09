# Login Troubleshooting Guide

## Common Login Issues

### Issue: "Incorrect email or password" (401 Unauthorized)

**Cause:** User doesn't exist or password is wrong

**Solution:**
1. **Register first** if user doesn't exist:
   ```bash
   POST /api/auth/register
   Body: {
     "email": "user@example.com",
     "password": "yourpassword"
   }
   ```

2. **Then login:**
   ```bash
   POST /api/auth/login
   Body: {
     "email": "user@example.com",
     "password": "yourpassword"
   }
   ```

### Issue: Login returns 401 even with correct credentials

**Possible causes:**

1. **User account is inactive**
   - Check `is_active = true` in database
   - Fix: Update user in database or reactivate account

2. **Password hash mismatch**
   - Old users might have different password hashing
   - Fix: Reset password or re-register

3. **Database connection issue**
   - Check PostgreSQL is running
   - Verify `DATABASE_URL` in `.env`

4. **Backend not restarted**
   - New code changes require restart
   - Fix: Restart uvicorn server

### Issue: "User with this email already exists"

**Cause:** User is already registered

**Solution:**
- Use existing credentials to login
- Or reset password if forgotten

## Testing Login

### 1. Register a new user:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

### 2. Login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

### 3. Use the access token:
```bash
# Save token from login response
TOKEN="your_access_token_here"

# Test protected endpoint
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## Frontend Login

If login fails in frontend:

1. **Check network tab** in browser DevTools
   - Look for 401 status code
   - Check request/response payloads

2. **Verify credentials**
   - Make sure user exists (register first)
   - Check password is correct

3. **Check CORS**
   - Verify backend allows frontend origin
   - Check `CORS_ORIGINS` in `config.py`

4. **Check authentication headers**
   - Frontend should send: `Authorization: Bearer {token}`
   - Token should be from login response

## Database Check

To check users in database:

```bash
# Connect to PostgreSQL
docker exec -it idea2_postgres psql -U startup_discovery -d startup_discovery

# List users
SELECT user_id, email, is_active, created_at FROM users;

# Check specific user
SELECT * FROM users WHERE email = 'test@example.com';
```

## Quick Test Credentials

**Test User (already created):**
- Email: `test@example.com`
- Password: `test123`

Use these to test login functionality.


