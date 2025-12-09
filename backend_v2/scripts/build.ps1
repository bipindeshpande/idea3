# Build script for Docker image building, pushing, and deployment (PowerShell)

param(
    [Parameter(Position=0)]
    [ValidateSet("build", "push", "deploy", "build-push", "build-push-deploy")]
    [string]$Command = "build"
)

# Configuration
$ImageName = if ($env:IMAGE_NAME) { $env:IMAGE_NAME } else { "idea2-backend" }
$ImageTag = if ($env:IMAGE_TAG) { $env:IMAGE_TAG } else { "latest" }
$Registry = if ($env:REGISTRY) { $env:REGISTRY } else { "docker.io" }
$RegistryUser = $env:REGISTRY_USER
$FullImageName = if ($RegistryUser) { "$Registry/$RegistryUser/${ImageName}:${ImageTag}" } else { "${ImageName}:${ImageTag}" }

# Functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Error "Docker is not running. Please start Docker and try again."
    exit 1
}

switch ($Command) {
    "build" {
        Write-Info "Building Docker image: ${ImageName}:${ImageTag}"
        docker build -t "${ImageName}:${ImageTag}" .
        if ($LASTEXITCODE -eq 0) {
            Write-Info "Build completed successfully!"
        } else {
            Write-Error "Build failed!"
            exit 1
        }
    }
    
    "push" {
        if (-not $RegistryUser) {
            Write-Error "REGISTRY_USER is not set. Set it as environment variable: `$env:REGISTRY_USER = 'your-username'"
            exit 1
        }
        
        Write-Info "Tagging image: $FullImageName"
        docker tag "${ImageName}:${ImageTag}" "$FullImageName"
        
        Write-Info "Pushing image to registry: $FullImageName"
        docker push "$FullImageName"
        if ($LASTEXITCODE -eq 0) {
            Write-Info "Push completed successfully!"
        } else {
            Write-Error "Push failed!"
            exit 1
        }
    }
    
    "deploy" {
        if (-not $RegistryUser) {
            Write-Error "REGISTRY_USER is not set. Set it as environment variable: `$env:REGISTRY_USER = 'your-username'"
            exit 1
        }
        
        Write-Info "Deploying to server..."
        
        # Pull latest image
        Write-Info "Pulling latest image: $FullImageName"
        docker pull "$FullImageName"
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Failed to pull image, using local build"
        }
        
        # Stop existing container if running
        $existingContainer = docker ps -a --format '{{.Names}}' | Select-String -Pattern "^idea2_backend$"
        if ($existingContainer) {
            Write-Info "Stopping existing container..."
            docker stop idea2_backend 2>$null
            docker rm idea2_backend 2>$null
        }
        
        # Start new container
        Write-Info "Starting new container..."
        # Note: Network name should match docker-compose network name
        # Docker Compose creates network as: <project>_app_network
        # Default: app_network (standalone) or use docker-compose network
        $NetworkName = if ($env:NETWORK_NAME) { $env:NETWORK_NAME } else { "app_network" }
        docker network create $NetworkName 2>$null
        docker run -d `
            --name idea2_backend `
            --network $NetworkName `
            --env-file .env `
            -p 8000:8000 `
            --restart unless-stopped `
            "$FullImageName"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Info "Deployment completed successfully!"
            Write-Info "Container is running. Check logs with: docker logs -f idea2_backend"
        } else {
            Write-Error "Deployment failed!"
            exit 1
        }
    }
    
    "build-push" {
        Write-Info "Building and pushing image..."
        & $PSCommandPath -Command "build"
        & $PSCommandPath -Command "push"
    }
    
    "build-push-deploy" {
        Write-Info "Building, pushing, and deploying..."
        & $PSCommandPath -Command "build"
        & $PSCommandPath -Command "push"
        & $PSCommandPath -Command "deploy"
    }
    
    default {
        Write-Host "Usage: .\scripts\build.ps1 {build|push|deploy|build-push|build-push-deploy}"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  build              - Build Docker image locally"
        Write-Host "  push               - Push image to registry (requires REGISTRY_USER)"
        Write-Host "  deploy             - Deploy container on server (requires REGISTRY_USER)"
        Write-Host "  build-push         - Build and push image"
        Write-Host "  build-push-deploy  - Build, push, and deploy"
        Write-Host ""
        Write-Host "Environment variables:"
        Write-Host "  IMAGE_NAME         - Docker image name (default: idea2-backend)"
        Write-Host "  IMAGE_TAG          - Docker image tag (default: latest)"
        Write-Host "  REGISTRY           - Docker registry URL (default: docker.io)"
        Write-Host "  REGISTRY_USER      - Docker registry username (required for push/deploy)"
        exit 1
    }
}

