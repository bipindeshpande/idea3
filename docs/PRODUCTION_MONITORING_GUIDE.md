# Production Monitoring, Testing & Disaster Recovery Guide

**Items 6-9 from Production Readiness Checklist**

---

## 6. Monitoring & Alerting 📊

### Overview
Monitoring ensures you can detect issues before users do. You need to track system health, performance metrics, and application behavior.

### What to Monitor

#### Infrastructure Metrics
- **CPU Usage**: Alert if > 80% for > 5 minutes
- **Memory Usage**: Alert if > 85%
- **Disk Space**: Alert if < 20% free
- **Network**: Bandwidth usage, connection errors
- **Container Health**: Container restarts, crashes

#### Application Metrics
- **Response Times**: P50, P95, P99 latencies
- **Error Rates**: HTTP 4xx/5xx response rates
- **Request Throughput**: Requests per second
- **Database Performance**: Query times, connection pool usage
- **Redis Performance**: Cache hit rates, latency
- **Queue Depth**: RQ job queue length

#### Business Metrics
- **Active Users**: Concurrent users, daily active users
- **API Usage**: Endpoint call frequency
- **Feature Adoption**: Which features are being used
- **Payment Transactions**: Success/failure rates

### Monitoring Solutions

#### Option 1: Prometheus + Grafana (Open Source, Self-Hosted)
**Best for**: Full control, no ongoing costs, flexible dashboards

**Setup Steps:**
1. **Install Prometheus**:
   ```bash
   # Create prometheus.yml
   global:
     scrape_interval: 15s
   
   scrape_configs:
     - job_name: 'backend'
       static_configs:
         - targets: ['backend:8000']
   
     - job_name: 'postgres'
       static_configs:
         - targets: ['postgres-exporter:9187']
   
     - job_name: 'redis'
       static_configs:
         - targets: ['redis-exporter:9121']
   ```

2. **Add Prometheus to docker-compose.prod.yml**:
   ```yaml
   prometheus:
     image: prom/prometheus
     volumes:
       - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
     ports:
       - "9090:9090"
   
   grafana:
     image: grafana/grafana
     ports:
       - "3000:3000"
     environment:
       - GF_SECURITY_ADMIN_PASSWORD=your_secure_password
   ```

3. **Add metrics endpoint to FastAPI**:
   ```python
   # Install: pip install prometheus-fastapi-instrumentator
   from prometheus_fastapi_instrumentator import Instrumentator
   
   instrumentator = Instrumentator()
   instrumentator.instrument(app).expose(app)
   ```

4. **Configure Alertmanager** for alerts via email/Slack

**Pros**: Free, flexible, powerful  
**Cons**: Requires maintenance, more setup

---

#### Option 2: Datadog (SaaS, Paid)
**Best for**: Easy setup, comprehensive, managed service

**Setup Steps:**
1. Sign up for Datadog account (14-day trial)
2. Install Datadog agent:
   ```bash
   docker run -d --name datadog-agent \
     -v /var/run/docker.sock:/var/run/docker.sock:ro \
     -v /proc/:/host/proc/:ro \
     -v /sys/fs/cgroup/:/host/sys/fs/cgroup:ro \
     -e DD_API_KEY=your_api_key \
     -e DD_SITE="datadoghq.com" \
     datadog/agent:latest
   ```

3. Add to docker-compose.prod.yml:
   ```yaml
   datadog:
     image: datadog/agent:latest
     environment:
       - DD_API_KEY=${DATADOG_API_KEY}
       - DD_SITE=datadoghq.com
       - DD_TAGS=env:production
     volumes:
       - /var/run/docker.sock:/var/run/docker.sock:ro
       - /proc/:/host/proc/:ro
       - /sys/fs/cgroup/:/host/sys/fs/cgroup:ro
   ```

**Pros**: Easy, comprehensive, excellent UI  
**Cons**: Paid (starts ~$15/host/month), vendor lock-in

---

#### Option 3: New Relic (SaaS, Paid)
**Best for**: Application Performance Monitoring (APM)

**Setup Steps:**
1. Sign up for New Relic account
2. Install New Relic agent:
   ```bash
   pip install newrelic
   ```

3. Add configuration:
   ```python
   # In your FastAPI app
   import newrelic.agent
   newrelic.agent.initialize('newrelic.ini')
   ```

**Pros**: Excellent APM, good dashboards  
**Cons**: Expensive, complex pricing

---

#### Option 4: CloudWatch (AWS Only)
**Best for**: If deploying on AWS

**Setup Steps:**
1. Install CloudWatch agent on EC2
2. Configure metrics collection
3. Set up CloudWatch alarms

**Pros**: Native AWS integration  
**Cons**: AWS-only, can be expensive

---

### Uptime Monitoring

#### Free Options:
- **UptimeRobot** (free tier: 50 monitors, 5-min intervals)
- **Pingdom** (free trial, then paid)
- **StatusCake** (free tier available)

**Setup** (Example with UptimeRobot):
1. Sign up at uptimerobot.com
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://yourdomain.com/health`
   - Interval: 5 minutes
   - Alert contacts: Email/SMS

---

### Alert Configuration

#### Critical Alerts (Immediate Response):
- Service down (health check fails)
- Error rate > 5% for > 2 minutes
- Response time P95 > 5 seconds
- Database connection failures
- Disk space < 10%
- CPU > 90% for > 5 minutes

#### Warning Alerts (Monitor):
- Error rate > 1% for > 5 minutes
- Response time P95 > 2 seconds
- Memory usage > 80%
- Queue depth > 1000 jobs

#### Alert Channels:
- **Email**: For non-urgent alerts
- **SMS/PagerDuty**: For critical alerts
- **Slack**: For team notifications
- **Discord**: Alternative team chat option

---

### Quick Start: Minimal Monitoring (Free)

**For immediate setup with minimal cost:**

1. **Prometheus + Grafana** (self-hosted, free)
2. **UptimeRobot** (free tier)
3. **Log aggregation**: Use Docker logs + `docker logs` commands

**Estimated Setup Time**: 2-4 hours

---

## 7. Error Tracking 🔴

### Overview
Error tracking captures exceptions and errors in real-time, providing stack traces, user context, and error frequency.

### Why You Need It
- **Proactive Issue Detection**: Know about errors before users report them
- **Context**: See exactly what happened, where, and when
- **Prioritization**: See which errors affect most users
- **Performance**: Identify slow queries or operations

### Recommended Solutions

#### Option 1: Sentry (Recommended)
**Best for**: Most developers, excellent free tier, great features

**Free Tier**: 5,000 events/month, 1 project

**Setup Steps:**

1. **Sign up** at sentry.io

2. **Install SDK**:
   ```bash
   pip install sentry-sdk[fastapi]
   ```

3. **Configure in FastAPI**:
   ```python
   # In app/main.py or app/__init__.py
   import sentry_sdk
   from sentry_sdk.integrations.fastapi import FastApiIntegration
   from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
   
   sentry_sdk.init(
       dsn="https://your-dsn@sentry.io/project-id",
       integrations=[
           FastApiIntegration(transaction_style='endpoint'),
           SqlalchemyIntegration(),
       ],
       traces_sample_rate=0.1,  # 10% of transactions
       environment="production",
   )
   ```

4. **Add to requirements.txt**:
   ```
   sentry-sdk[fastapi]==1.40.0
   ```

5. **Environment Variable**:
   ```bash
   # In production.env
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

6. **Configure in code** (optional, more secure):
   ```python
   import os
   sentry_sdk.init(
       dsn=os.getenv("SENTRY_DSN"),
       environment=os.getenv("ENVIRONMENT", "production"),
       traces_sample_rate=0.1,
   )
   ```

**Features:**
- Automatic error capturing
- Performance monitoring
- Release tracking
- User context
- Breadcrumbs (event trail)
- Email alerts

**Pricing**: Free tier → $26/month for 50k events

---

#### Option 2: Rollbar
**Alternative to Sentry**, similar features

**Setup**:
```bash
pip install rollbar
```

```python
import rollbar
rollbar.init('your_access_token', 'production')
```

**Pros**: Good alternative, good UI  
**Cons**: Slightly less popular than Sentry

---

#### Option 3: LogRocket
**Best for**: Session replay + error tracking

**Pros**: See exactly what users did  
**Cons**: More expensive, privacy considerations

---

#### Option 4: Self-Hosted: GlitchTip
**Best for**: Free, self-hosted Sentry clone

**Setup**: Deploy GlitchTip using Docker

**Pros**: Free, full control  
**Cons**: Maintenance required

---

### Error Tracking Best Practices

#### 1. Filter Noise
```python
# Don't track 404s or expected errors
from sentry_sdk import configure_scope

def before_send(event, hint):
    if 'exc_info' in hint:
        exc_type, exc_value, tb = hint['exc_info']
        # Skip validation errors
        if isinstance(exc_value, ValidationError):
            return None
    return event

sentry_sdk.init(before_send=before_send)
```

#### 2. Add User Context
```python
from sentry_sdk import set_user

# In your auth middleware
set_user({
    "id": user.user_id,
    "email": user.email,
    "username": user.username
})
```

#### 3. Add Custom Tags
```python
from sentry_sdk import set_tag

set_tag("feature", "payment")
set_tag("subscription_tier", "pro")
```

#### 4. Track Performance
```python
from sentry_sdk import start_transaction

transaction = start_transaction(op="http.request", name="/api/discovery/run")
# ... your code ...
transaction.finish()
```

---

### Quick Start: Sentry (Recommended)

**Time to Setup**: 15-30 minutes

1. Sign up at sentry.io (free)
2. Create new project (Python/FastAPI)
3. Install SDK: `pip install sentry-sdk[fastapi]`
4. Add 5 lines of code to your app
5. Deploy and test

**Cost**: Free for 5,000 events/month

---

## 8. Load Testing ⚡

### Overview
Load testing simulates real user traffic to find bottlenecks, determine capacity, and ensure your application can handle expected load.

### What to Test

#### Key Scenarios
1. **Normal Load**: Expected daily traffic
2. **Peak Load**: Maximum expected concurrent users
3. **Stress Test**: Push beyond normal to find breaking point
4. **Spike Test**: Sudden traffic increase
5. **Endurance Test**: Sustained load over time

#### Critical Endpoints to Test
- `POST /api/auth/login` - Authentication
- `POST /api/discovery/run` - Discovery generation (resource-intensive)
- `GET /api/discovery/stream/{run_id}` - SSE streaming
- `GET /api/user/dashboard` - Dashboard loading
- `POST /api/payment/create-intent` - Payment processing

### Load Testing Tools

#### Option 1: Locust (Recommended - Python)
**Best for**: Programmable, flexible, free

**Setup**:

1. **Install**:
   ```bash
   pip install locust
   ```

2. **Create test file** (`locustfile.py`):
   ```python
   from locust import HttpUser, task, between
   import random
   
   class StartupDiscoveryUser(HttpUser):
       wait_time = between(1, 3)
       
       def on_start(self):
           # Login once per user
           self.client.post("/api/auth/login", json={
               "email": f"user{random.randint(1,100)}@test.com",
               "password": "testpassword"
           })
       
       @task(3)
       def view_dashboard(self):
           self.client.get("/api/user/dashboard")
       
       @task(2)
       def view_run_history(self):
           self.client.get("/api/user/runs")
       
       @task(1)
       def create_discovery_run(self):
           # This is heavy, weight it less
           self.client.post("/api/discovery/run", json={
               "idea": "A new startup idea for testing",
               "industry": "Technology"
           })
   ```

3. **Run Locust**:
   ```bash
   locust -f locustfile.py --host=https://yourdomain.com
   ```

4. **Access UI**: http://localhost:8089
   - Set number of users
   - Set spawn rate (users/second)
   - Start test

**Pros**: Free, Python-based, flexible, great UI  
**Cons**: Single machine limits (use distributed mode for large tests)

---

#### Option 2: k6 (Recommended - Modern)
**Best for**: Modern, powerful, JavaScript-based

**Setup**:

1. **Install**:
   ```bash
   # macOS
   brew install k6
   
   # Linux
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

2. **Create test file** (`loadtest.js`):
   ```javascript
   import http from 'k6/http';
   import { check, sleep } from 'k6';
   
   export const options = {
     stages: [
       { duration: '2m', target: 100 }, // Ramp up to 100 users
       { duration: '5m', target: 100 }, // Stay at 100 users
       { duration: '2m', target: 0 },   // Ramp down
     ],
     thresholds: {
       http_req_duration: ['p(95)<2000'], // 95% of requests < 2s
       http_req_failed: ['rate<0.01'],    // < 1% errors
     },
   };
   
   export default function () {
     // Login
     const loginRes = http.post('https://yourdomain.com/api/auth/login', 
       JSON.stringify({
         email: `user${__VU}@test.com`,
         password: 'testpassword'
       }),
       { headers: { 'Content-Type': 'application/json' } }
     );
     
     check(loginRes, { 'login status 200': (r) => r.status === 200 });
     
     // Get dashboard
     const dashboardRes = http.get('https://yourdomain.com/api/user/dashboard');
     check(dashboardRes, { 'dashboard status 200': (r) => r.status === 200 });
     
     sleep(1);
   }
   ```

3. **Run**:
   ```bash
   k6 run loadtest.js
   ```

**Pros**: Modern, powerful, great performance, free  
**Cons**: JavaScript syntax (if you prefer Python)

---

#### Option 3: Apache JMeter (Java-based)
**Best for**: GUI-based testing, very mature

**Setup**: Download from jmeter.apache.org

**Pros**: Mature, GUI, extensive plugins  
**Cons**: Heavy, Java-based, complex

---

#### Option 4: Artillery (Node.js)
**Best for**: YAML-based, easy to write

**Pros**: Simple YAML configs  
**Cons**: Less flexible than k6/Locust

---

### Load Testing Strategy

#### Phase 1: Baseline (Week 1)
- **Goal**: Establish baseline performance
- **Load**: 10-50 concurrent users
- **Duration**: 10-15 minutes
- **Metrics**: Response times, error rates

#### Phase 2: Normal Load (Week 2)
- **Goal**: Test expected daily traffic
- **Load**: Estimated concurrent users (e.g., 100-500)
- **Duration**: 30-60 minutes
- **Metrics**: All endpoints, database performance

#### Phase 3: Peak Load (Week 3)
- **Goal**: Test maximum expected load
- **Load**: 2-3x normal load
- **Duration**: 15-30 minutes
- **Metrics**: Identify bottlenecks

#### Phase 4: Stress Test (Week 4)
- **Goal**: Find breaking point
- **Load**: Gradually increase until failure
- **Duration**: Until system degrades
- **Metrics**: Maximum capacity, failure points

---

### Key Metrics to Monitor During Load Tests

#### Application Metrics
- **Response Time**: P50, P95, P99
- **Error Rate**: Percentage of failed requests
- **Throughput**: Requests per second
- **Concurrent Users**: How many simultaneous users

#### Infrastructure Metrics
- **CPU Usage**: Should stay < 80%
- **Memory Usage**: Watch for leaks
- **Database**: Connection pool, query times
- **Redis**: Cache hit rate, connection count
- **Network**: Bandwidth usage

#### Business Metrics
- **Successful Operations**: % of successful API calls
- **User Experience**: Time to first byte, page load

---

### Load Testing Best Practices

1. **Start Small**: Begin with low load, gradually increase
2. **Test Realistic Scenarios**: Mimic actual user behavior
3. **Monitor Everything**: Use monitoring during tests
4. **Test Incrementally**: Don't jump from 10 to 1000 users
5. **Test in Production-like Environment**: Similar hardware, data volumes
6. **Run Multiple Tests**: Validate consistency
7. **Document Results**: Track improvements over time

---

### Quick Start: Locust (Recommended)

**Time to Setup**: 1-2 hours

1. Install: `pip install locust`
2. Write simple test file (see example above)
3. Run: `locust -f locustfile.py --host=https://staging.yourdomain.com`
4. Use web UI to configure and run tests
5. Analyze results

**Cost**: Free

---

## 9. Disaster Recovery 💾

### Overview
Disaster recovery ensures you can restore your system after data loss, hardware failure, or other disasters.

### Backup Strategy

#### Database Backups

##### Automated Daily Backups

**Option 1: Cron Job (Simple)**

1. **Create backup script** (`backup-db.sh`):
   ```bash
   #!/bin/bash
   BACKUP_DIR="/backups/postgres"
   DATE=$(date +%Y%m%d_%H%M%S)
   FILENAME="backup_${DATE}.sql"
   
   # Create backup directory
   mkdir -p $BACKUP_DIR
   
   # Backup database
   docker exec idea2_postgres_prod pg_dump -U startup_discovery startup_discovery > "$BACKUP_DIR/$FILENAME"
   
   # Compress backup
   gzip "$BACKUP_DIR/$FILENAME"
   
   # Keep only last 30 days
   find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
   
   # Upload to cloud storage (optional)
   # aws s3 cp "$BACKUP_DIR/$FILENAME.gz" s3://your-bucket/backups/
   ```

2. **Make executable**:
   ```bash
   chmod +x backup-db.sh
   ```

3. **Add to crontab**:
   ```bash
   crontab -e
   # Add: 0 2 * * * /path/to/backup-db.sh
   # Runs daily at 2 AM
   ```

**Option 2: Docker Volume Backup**

```bash
#!/bin/bash
# Backup PostgreSQL volume
docker run --rm \
  -v idea2_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres_volume_$(date +%Y%m%d).tar.gz /data
```

**Option 3: Using pg_backup Docker Image**

```yaml
# Add to docker-compose.prod.yml
backup:
  image: prodrigestivill/postgres-backup-local
  environment:
    POSTGRES_HOST: postgres
    POSTGRES_DB: startup_discovery
    POSTGRES_USER: startup_discovery
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    SCHEDULE: "@daily"
    BACKUP_KEEP_DAYS: 30
    BACKUP_KEEP_WEEKS: 4
    BACKUP_KEEP_MONTHS: 6
  volumes:
    - ./backups:/backups
  depends_on:
    - postgres
```

---

#### Off-Site Backup Storage

**Option 1: AWS S3**
```bash
# Install AWS CLI
pip install awscli

# Configure
aws configure

# Upload backup
aws s3 cp backup.sql.gz s3://your-bucket/backups/postgres/
```

**Option 2: Google Cloud Storage**
```bash
# Install gsutil
# Upload
gsutil cp backup.sql.gz gs://your-bucket/backups/
```

**Option 3: Backblaze B2** (Cost-effective)
```bash
# Install b2 CLI
# Upload
b2 upload-file your-bucket backup.sql.gz backups/
```

**Option 4: rsync to Remote Server**
```bash
rsync -avz backups/ user@backup-server:/backups/production/
```

---

### Restore Procedures

#### Database Restore

**From SQL Dump**:
```bash
# Uncompress if needed
gunzip backup_20250102_020000.sql.gz

# Restore
docker exec -i idea2_postgres_prod psql -U startup_discovery startup_discovery < backup_20250102_020000.sql
```

**From Volume Backup**:
```bash
# Stop postgres
docker-compose -f docker-compose.prod.yml stop postgres

# Restore volume
docker run --rm \
  -v idea2_postgres_data:/data \
  -v $(pwd)/backups:/backup \
  alpine sh -c "cd /data && tar xzf /backup/postgres_volume_20250102.tar.gz"

# Start postgres
docker-compose -f docker-compose.prod.yml start postgres
```

---

### Recovery Time Objectives (RTO) & Recovery Point Objectives (RPO)

#### Define Your Requirements:

**RTO (Recovery Time Objective)**: Maximum acceptable downtime
- **Example**: 4 hours = Must be able to restore within 4 hours

**RPO (Recovery Point Objective)**: Maximum acceptable data loss
- **Example**: 24 hours = Can lose up to 24 hours of data

**Common Tiers**:
- **Tier 1 (Critical)**: RTO < 1 hour, RPO < 15 minutes (hourly backups)
- **Tier 2 (Important)**: RTO < 4 hours, RPO < 1 hour (hourly/daily backups)
- **Tier 3 (Standard)**: RTO < 24 hours, RPO < 24 hours (daily backups)

**For Most Startups**: Tier 2 or Tier 3 is sufficient

---

### Disaster Recovery Plan

#### Document Procedures

**Create a DR Runbook** with:

1. **Contact Information**
   - Team members
   - Hosting provider support
   - Database admin
   - Domain registrar

2. **Backup Locations**
   - Where backups are stored
   - How to access them
   - Encryption keys if applicable

3. **Restore Procedures**
   - Step-by-step restore instructions
   - Verification steps
   - Rollback procedures

4. **Communication Plan**
   - Who to notify
   - Status page updates
   - Customer communication

---

### Testing Disaster Recovery

#### Quarterly DR Tests

**Test Scenarios**:

1. **Database Corruption**
   - Simulate: Drop a table or corrupt data
   - Test: Restore from backup
   - Time: Should complete within RTO

2. **Complete Server Failure**
   - Simulate: Spawn new server
   - Test: Restore entire system from backups
   - Time: Should complete within RTO

3. **Data Center Outage**
   - Simulate: Move to different region/server
   - Test: Full restore in new location

**Document Results**:
- Actual RTO achieved
- Issues encountered
- Improvements needed

---

### Backup Verification

#### Automated Backup Verification

```bash
#!/bin/bash
# Verify backup is valid and can be restored
BACKUP_FILE=$1

# Create test database
docker exec idea2_postgres_prod createdb -U startup_discovery test_restore

# Restore to test database
gunzip -c $BACKUP_FILE | docker exec -i idea2_postgres_prod psql -U startup_discovery test_restore

# Verify restore success
if [ $? -eq 0 ]; then
    echo "Backup verification SUCCESS"
    # Cleanup
    docker exec idea2_postgres_prod dropdb -U startup_discovery test_restore
else
    echo "Backup verification FAILED"
    exit 1
fi
```

---

### Monitoring Backups

#### Alert on Backup Failures

```bash
#!/bin/bash
# In backup script, send alert on failure
if [ $? -ne 0 ]; then
    # Send email/Slack notification
    echo "Backup failed!" | mail -s "Backup Alert" admin@yourdomain.com
    # Or use curl to send to Slack webhook
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"Database backup failed!"}' \
      https://hooks.slack.com/services/YOUR/WEBHOOK/URL
fi
```

---

### Quick Start: Basic Backup Strategy

**Time to Setup**: 2-3 hours

1. **Create backup script** (see example above)
2. **Set up cron job** for daily backups
3. **Configure off-site storage** (AWS S3, etc.)
4. **Test restore procedure**
5. **Document in runbook**
6. **Set up backup monitoring/alerts**

**Minimum Requirements**:
- Daily automated backups
- Off-site storage
- Tested restore procedure
- Documented in runbook

**Recommended**:
- Hourly backups for critical data
- Multiple backup locations
- Automated backup verification
- Quarterly DR tests

---

## Summary: Quick Implementation Guide

### Priority 1: Essential (Week 1)
1. **Error Tracking**: Set up Sentry (30 minutes)
2. **Uptime Monitoring**: Set up UptimeRobot (15 minutes)
3. **Basic Backups**: Daily database backups (2 hours)

### Priority 2: Important (Week 2-3)
4. **Application Monitoring**: Prometheus + Grafana (4 hours)
5. **Load Testing**: Create Locust tests (2-4 hours)
6. **Backup Verification**: Automated testing (1 hour)

### Priority 3: Advanced (Month 2+)
7. **Advanced Monitoring**: APM, custom dashboards
8. **Comprehensive Load Testing**: All endpoints, peak scenarios
9. **Disaster Recovery Drills**: Quarterly tests

---

## Estimated Costs

### Free Tier (Start Here)
- **Error Tracking**: Sentry (5k events/month free)
- **Monitoring**: Prometheus + Grafana (self-hosted, free)
- **Uptime**: UptimeRobot (free tier)
- **Load Testing**: Locust/k6 (free)
- **Backups**: Manual scripts + free cloud storage tier
- **Total**: $0/month

### Paid Tier (As You Grow)
- **Error Tracking**: Sentry ($26/month)
- **Monitoring**: Datadog ($15/host/month) or keep Prometheus
- **Uptime**: Pingdom ($10/month)
- **Backups**: Cloud storage (~$5-10/month)
- **Total**: ~$50-60/month

---

## Resources & Documentation

- **Sentry Docs**: https://docs.sentry.io/platforms/python/guides/fastapi/
- **Prometheus**: https://prometheus.io/docs/
- **Locust**: https://docs.locust.io/
- **k6**: https://k6.io/docs/
- **PostgreSQL Backup**: https://www.postgresql.org/docs/current/backup.html

---

*Last Updated: 2025-01-02*

