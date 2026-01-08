#!/bin/bash
# Initial Setup Script for AWS Lightsail
# Run this ONCE when you first connect to a fresh Lightsail instance

set -e

echo "🔧 Setting up AWS Lightsail instance for deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Please don't run as root. Use your ubuntu user.${NC}"
   exit 1
fi

echo -e "${GREEN}📦 Installing system dependencies...${NC}"

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    echo -e "${YELLOW}⚠️  Added you to docker group. You may need to log out and back in.${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

# Install Git
if ! command -v git &> /dev/null; then
    sudo apt-get install -y git
else
    echo -e "${GREEN}✅ Git already installed${NC}"
fi

# Install Node.js (for building frontend)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo -e "${GREEN}✅ Node.js already installed${NC}"
fi

# Install certbot (for SSL certificates)
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt-get install -y certbot
else
    echo -e "${GREEN}✅ Certbot already installed${NC}"
fi

# Create app directory
mkdir -p ~/app
echo -e "${GREEN}✅ Created ~/app directory${NC}"

# Verify installations
echo ""
echo -e "${GREEN}📊 Installation Summary:${NC}"
echo "Docker: $(docker --version 2>/dev/null || echo 'Not installed')"
echo "Docker Compose: $(docker-compose --version 2>/dev/null || echo 'Not installed')"
echo "Git: $(git --version 2>/dev/null || echo 'Not installed')"
echo "Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
echo "NPM: $(npm --version 2>/dev/null || echo 'Not installed')"
echo "Certbot: $(certbot --version 2>/dev/null || echo 'Not installed')"

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. If Docker was just installed, log out and back in (or run: newgrp docker)"
echo "2. Clone your repository to ~/app"
echo "3. Configure production.env file"
echo "4. Run deploy-lightsail.sh to deploy"

