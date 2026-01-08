# Seed Database Script - Creates clean test data
# Usage: .\scripts\seed-db.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Seeding Database with Test Data" -ForegroundColor Cyan
Write-Host ""

# Check if database is running
$dbRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "postgres"
if (-not $dbRunning) {
    Write-Host "ERROR: Database is not running. Please start it first:" -ForegroundColor Red
    Write-Host "   docker-compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host "Creating test users and sample data..." -ForegroundColor Cyan

# Create Python seed script
$seedScript = @'
from app.core.database import SessionLocal
from app.models.user import User
from app.models.run import Run
from app.services.auth_service import AuthService
import uuid
from datetime import datetime, timedelta
import json

db = SessionLocal()
try:
    # Test User 1: Premium user with data
    test_user1 = db.query(User).filter(User.email == 'test@example.com').first()
    if not test_user1:
        user1 = User(
            user_id=str(uuid.uuid4()),
            email='test@example.com',
            hashed_password=AuthService.get_password_hash('test123'),
            full_name='Test User',
            is_active=True,
            is_verified=True,
            subscription_type='premium',
            role='user'
        )
        db.add(user1)
        db.commit()
        db.refresh(user1)
        print('Created test user: test@example.com / test123')
        
        # Create a sample run for this user
        sample_run = Run(
            run_id=str(uuid.uuid4()),
            user_id=user1.user_id,
            inputs={
                'problem': 'I want to build a SaaS product',
                'target_audience': 'Small businesses',
                'experience': 'intermediate',
                'resources': 'limited'
            },
            status='completed',
            created_at=datetime.utcnow() - timedelta(days=2),
            completed_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add(sample_run)
        db.commit()
        print('Created sample run for test user')
    else:
        print('Test user already exists: test@example.com')
    
    # Test User 2: Free user
    test_user2 = db.query(User).filter(User.email == 'demo@example.com').first()
    if not test_user2:
        user2 = User(
            user_id=str(uuid.uuid4()),
            email='demo@example.com',
            hashed_password=AuthService.get_password_hash('demo123'),
            full_name='Demo User',
            is_active=True,
            is_verified=False,
            subscription_type='free',
            role='user'
        )
        db.add(user2)
        db.commit()
        print('Created demo user: demo@example.com / demo123')
    else:
        print('Demo user already exists: demo@example.com')
    
    # Admin user (optional)
    admin_user = db.query(User).filter(User.email == 'admin@example.com').first()
    if not admin_user:
        admin = User(
            user_id=str(uuid.uuid4()),
            email='admin@example.com',
            hashed_password=AuthService.get_password_hash('admin123'),
            full_name='Admin User',
            is_active=True,
            is_verified=True,
            subscription_type='premium',
            role='admin'
        )
        db.add(admin)
        db.commit()
        print('Created admin user: admin@example.com / admin123')
    else:
        print('Admin user already exists: admin@example.com')
    
    db.commit()
    print('')
    print('Database seeded successfully!')
    print('')
    print('Test Accounts:')
    print('  - test@example.com / test123 (Premium, has sample data)')
    print('  - demo@example.com / demo123 (Free)')
    print('  - admin@example.com / admin123 (Admin)')
    
except Exception as e:
    db.rollback()
    print(f'Error seeding database: {e}')
    raise
finally:
    db.close()
'@

# Write and run via stdin to avoid volume mounts
$tempFile = Join-Path $PSScriptRoot "temp_seed_script.py"
$seedScript | Out-File -FilePath $tempFile -Encoding utf8

try {
    # Run seed script via stdin
    Get-Content $tempFile -Raw | docker-compose run --rm -T backend python -
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Seeding failed. Please check logs." -ForegroundColor Red
        exit 1
    }
} finally {
    # Clean up temp file
    if (Test-Path $tempFile) {
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
}

Write-Host ""

