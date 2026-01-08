# Database Reset & Seed Scripts

Quick scripts to reset your development database and optionally seed it with clean test data.

## 🚀 Quick Usage

### Reset Database Only (Clears Everything)
```powershell
# Windows PowerShell
.\reset-db.ps1
```

```bash
# Linux/Mac
./reset-db.sh
```

### Reset + Seed with Test Data
```powershell
# Windows PowerShell
.\reset-db.ps1 --seed
```

```bash
# Linux/Mac
./reset-db.sh --seed
```

### Seed Only (If database already exists)
```powershell
# Windows PowerShell
.\scripts\seed-db.ps1
```

```bash
# Linux/Mac
./scripts/seed-db.sh
```

## 📋 What These Scripts Do

### Reset Script (`reset-db.ps1` / `reset-db.sh`)
1. Stops all containers
2. Removes database volumes (deletes all data)
3. Starts fresh database
4. Runs migrations
5. Optionally seeds with test data

### Seed Script (`scripts/seed-db.ps1` / `scripts/seed-db.sh`)
Creates clean test data:
- **test@example.com** / test123 (Premium user with sample data)
- **demo@example.com** / demo123 (Free user)
- **admin@example.com** / admin123 (Admin user)

## ⚠️ Warning

These scripts **DELETE ALL DATA** in your development database. Only use in development!

## 💡 When to Use

- **Weekly cleanup**: Keep dev database clean
- **After testing**: Remove test data
- **Fresh start**: Start with clean slate
- **Before demos**: Clean data for presentations

