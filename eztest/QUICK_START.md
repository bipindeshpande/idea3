# EZTest Quick Start Guide

Get EZTest up and running in 5 minutes!

## Prerequisites

- ✅ Docker Desktop running
- ✅ Git installed
- ✅ Port 3000 available

## Windows (PowerShell)

```powershell
cd eztest
.\setup.ps1
```

## Linux/Mac (Bash)

```bash
cd eztest
chmod +x setup.sh
./setup.sh
```

## Manual Setup

If the automated script doesn't work:

### 1. Clone EZTest Repository

```bash
cd eztest
git clone https://github.com/houseoffoss/eztest.git source
```

### 2. Prepare Environment

```bash
# Copy environment template
cp .env.example .env

# Generate secret (Windows PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Generate secret (Linux/Mac):
openssl rand -base64 32
```

Edit `.env` and add the generated secret as `NEXTAUTH_SECRET`.

### 3. Copy Source Files

```bash
# Copy necessary files to root for Docker build
cp source/package.json .
cp source/package-lock.json . 2>/dev/null || true
cp -r source/src .
cp -r source/public . 2>/dev/null || true
```

### 4. Start EZTest

```bash
docker-compose up -d --build
```

### 5. Access EZTest

Open your browser: **http://localhost:3000**

## First Steps After Setup

1. **Create an Account**: Register your first user account
2. **Create a Project**: Set up a project for your LLM tests
3. **Create Test Suites**: 
   - "OpenAI Tests"
   - "Anthropic Tests" 
   - "Prompt Versioning"
4. **Add Test Cases**: Start tracking your LLM test scenarios

## Troubleshooting

### Port 3000 Already in Use

Edit `docker-compose.yml` and change:
```yaml
ports:
  - "3000:3000"  # Change 3000 to another port like 3001
```

Update `NEXTAUTH_URL` in `.env` accordingly.

### Build Fails

Check if source files are present:
```bash
ls -la source/
```

If missing, clone again:
```bash
git clone https://github.com/houseoffoss/eztest.git source
```

### Database Issues

Reset the database:
```bash
docker-compose down -v
docker-compose up -d --build
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Set up test projects for your LLM workflows
- Integrate with your existing test automation

## Support

- **GitHub**: https://github.com/houseoffoss/eztest
- **Documentation**: https://www.houseoffoss.com/post/eztest-a-simple-open-source-test-management-platform-built-for-real-teams

