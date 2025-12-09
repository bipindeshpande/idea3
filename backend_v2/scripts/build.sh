#!/bin/bash
# Build script for Docker image building, pushing, and deployment

set -e

# Configuration
IMAGE_NAME="${IMAGE_NAME:-idea2-backend}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-docker.io}"
REGISTRY_USER="${REGISTRY_USER:-}"
FULL_IMAGE_NAME="${REGISTRY}/${REGISTRY_USER}/${IMAGE_NAME}:${IMAGE_TAG}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Parse command line arguments
COMMAND="${1:-build}"

case "$COMMAND" in
    build)
        log_info "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
        docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .
        log_info "Build completed successfully!"
        ;;
    
    push)
        if [ -z "$REGISTRY_USER" ]; then
            log_error "REGISTRY_USER is not set. Set it as environment variable or export it."
            exit 1
        fi
        
        log_info "Tagging image: ${FULL_IMAGE_NAME}"
        docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${FULL_IMAGE_NAME}"
        
        log_info "Pushing image to registry: ${FULL_IMAGE_NAME}"
        docker push "${FULL_IMAGE_NAME}"
        log_info "Push completed successfully!"
        ;;
    
    deploy)
        if [ -z "$REGISTRY_USER" ]; then
            log_error "REGISTRY_USER is not set. Set it as environment variable or export it."
            exit 1
        fi
        
        log_info "Deploying to server..."
        
        # Pull latest image
        log_info "Pulling latest image: ${FULL_IMAGE_NAME}"
        docker pull "${FULL_IMAGE_NAME}" || log_warn "Failed to pull image, using local build"
        
        # Stop existing container if running
        if docker ps -a --format '{{.Names}}' | grep -q "^idea2_backend$"; then
            log_info "Stopping existing container..."
            docker stop idea2_backend || true
            docker rm idea2_backend || true
        fi
        
        # Start new container
        log_info "Starting new container..."
        # Note: Network name should match docker-compose network name
        # Docker Compose creates network as: <project>_app_network
        # Default: app_network (standalone) or use docker-compose network
        NETWORK_NAME="${NETWORK_NAME:-app_network}"
        docker network create "$NETWORK_NAME" 2>/dev/null || true
        docker run -d \
            --name idea2_backend \
            --network "$NETWORK_NAME" \
            --env-file .env \
            -p 8000:8000 \
            --restart unless-stopped \
            "${FULL_IMAGE_NAME}"
        
        log_info "Deployment completed successfully!"
        log_info "Container is running. Check logs with: docker logs -f idea2_backend"
        ;;
    
    build-push)
        log_info "Building and pushing image..."
        "$0" build
        "$0" push
        ;;
    
    build-push-deploy)
        log_info "Building, pushing, and deploying..."
        "$0" build
        "$0" push
        "$0" deploy
        ;;
    
    *)
        echo "Usage: $0 {build|push|deploy|build-push|build-push-deploy}"
        echo ""
        echo "Commands:"
        echo "  build              - Build Docker image locally"
        echo "  push               - Push image to registry (requires REGISTRY_USER)"
        echo "  deploy             - Deploy container on server (requires REGISTRY_USER)"
        echo "  build-push         - Build and push image"
        echo "  build-push-deploy  - Build, push, and deploy"
        echo ""
        echo "Environment variables:"
        echo "  IMAGE_NAME         - Docker image name (default: idea2-backend)"
        echo "  IMAGE_TAG          - Docker image tag (default: latest)"
        echo "  REGISTRY           - Docker registry URL (default: docker.io)"
        echo "  REGISTRY_USER      - Docker registry username (required for push/deploy)"
        exit 1
        ;;
esac

