#!/bin/bash
# EZTest Setup Script for Linux/Mac

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up EZTest...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creating .env file from template...${NC}"
    cp .env.example .env
    
    # Generate NEXTAUTH_SECRET
    SECRET=$(openssl rand -base64 32)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32|NEXTAUTH_SECRET=$SECRET|g" .env
    else
        # Linux
        sed -i "s|NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32|NEXTAUTH_SECRET=$SECRET|g" .env
    fi
    
    echo -e "${GREEN}✅ .env file created with generated secret${NC}"
    echo -e "${YELLOW}⚠️  Please review and update .env file with your settings${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Clone EZTest source if not exists
if [ ! -d "source" ]; then
    echo -e "${YELLOW}📥 Cloning EZTest repository...${NC}"
    git clone https://github.com/houseoffoss/eztest.git source
    echo -e "${GREEN}✅ Repository cloned${NC}"
else
    echo -e "${GREEN}✅ Source directory already exists${NC}"
fi

# Copy necessary files from source to root for Docker build
echo -e "${YELLOW}📋 Preparing files for Docker build...${NC}"
if [ -f "source/package.json" ]; then
    cp source/package.json .
    cp source/package-lock.json . 2>/dev/null || true
    cp source/next.config.js . 2>/dev/null || true
    cp source/tsconfig.json . 2>/dev/null || true
    cp source/tailwind.config.js . 2>/dev/null || true
    cp source/postcss.config.js . 2>/dev/null || true
    
    # Copy src and public directories
    rm -rf src public
    cp -r source/src .
    cp -r source/public . 2>/dev/null || true
    
    echo -e "${GREEN}✅ Files prepared${NC}"
else
    echo -e "${YELLOW}⚠️  Source files not found. You may need to clone the repository manually.${NC}"
fi

# Build and start containers
echo -e "${YELLOW}🔨 Building and starting EZTest containers...${NC}"
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ EZTest setup complete!${NC}"
    echo ""
    echo -e "${CYAN}📊 Container status:${NC}"
    docker-compose ps
    echo ""
    echo -e "${CYAN}🌐 Access EZTest at: http://localhost:3000${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Create your first test project"
    echo "3. Start adding test cases for your LLM workflows"
    echo ""
    echo -e "${YELLOW}📋 Useful commands:${NC}"
    echo "  View logs:    docker-compose logs -f"
    echo "  Stop:         docker-compose down"
    echo "  Restart:      docker-compose restart"
else
    echo -e "${RED}❌ Failed to start containers${NC}"
    echo -e "${YELLOW}Check logs with: docker-compose logs${NC}"
    exit 1
fi

