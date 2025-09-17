#!/bin/bash

# QR-Tunai Production Deployment Script
# For Ubuntu Server 24.04 with Cloudflare Tunnel

set -e

echo "🚀 Starting QR-Tunai production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/qrt/QR-Tunai-drive"
SERVICE_NAME="qr-tunai"
DOMAIN="qr-drive.uk"
APP_DOMAIN="app.qr-drive.uk"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as qrt user
if [ "$USER" != "qrt" ]; then
    print_error "This script must be run as qrt user"
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS if not installed
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2 process manager..."
    sudo npm install -g pm2
fi

# Install MySQL if not installed
if ! command -v mysql &> /dev/null; then
    print_status "Installing MySQL Server..."
    sudo apt install -y mysql-server
    sudo mysql_secure_installation
    
    print_warning "Please configure MySQL and create database 'qrtunai' with user 'qrt_user'"
    print_warning "CREATE DATABASE qrtunai;"
    print_warning "CREATE USER 'qrt_user'@'localhost' IDENTIFIED BY 'secure_password';"
    print_warning "GRANT ALL PRIVILEGES ON qrtunai.* TO 'qrt_user'@'localhost';"
    print_warning "FLUSH PRIVILEGES;"
fi

# Navigate to project directory
cd $PROJECT_DIR

# Install dependencies
print_status "Installing project dependencies..."
npm ci --production

# Build the application
print_status "Building the application..."
npm run build

# Copy production environment file
print_status "Setting up production environment..."
cp .env.production .env.local

# Setup PM2 ecosystem file
print_status "Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$PROJECT_DIR',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/var/log/qr-tunai/error.log',
    out_file: '/var/log/qr-tunai/out.log',
    log_file: '/var/log/qr-tunai/combined.log',
    time: true
  }]
}
EOF

# Create log directory
print_status "Creating log directory..."
sudo mkdir -p /var/log/qr-tunai
sudo chown qrt:qrt /var/log/qr-tunai

# Setup Cloudflared if not already installed
if ! command -v cloudflared &> /dev/null; then
    print_status "Installing Cloudflare Tunnel..."
    
    # Add cloudflare gpg key
    sudo mkdir -p --mode=0755 /usr/share/keyrings
    curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
    
    # Add this repo to your apt repositories
    echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
    
    # install cloudflared
    sudo apt-get update && sudo apt-get install cloudflared
fi

# Setup Cloudflare Tunnel service
print_status "Setting up Cloudflare Tunnel service..."
sudo tee /etc/systemd/system/cloudflared.service > /dev/null << EOF
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=qrt
WorkingDirectory=/home/qrt
ExecStart=/usr/bin/cloudflared tunnel run --token eyJhIjoiM2E3MjAyYzkxMTJkYzM2YTA0YWMzN2IyNDg4ZWY4Y2EiLCJ0IjoiMmMyMjVlNTMtYjAwNC00ZDFjLThiNTgtZGI4MDNhZTMyNDVmIiwicyI6IlltVXpNR0V4WVRndE5EZzNaUzAwTUdRMkxXSmlOMkV0TUdaak1EbGtORGt6TVRoayJ9
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Setup Nginx reverse proxy (optional, but recommended)
if ! command -v nginx &> /dev/null; then
    print_status "Installing and configuring Nginx..."
    sudo apt install -y nginx
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/qr-tunai > /dev/null << EOF
server {
    listen 80;
    server_name localhost;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/qr-tunai /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
fi

# Start services
print_status "Starting services..."

# Start the application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Enable and start Cloudflare tunnel
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared

# Setup firewall (UFW)
print_status "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

print_status "✅ Deployment completed successfully!"
print_status "🌐 Application should be accessible at:"
print_status "   - https://$DOMAIN"
print_status "   - https://$APP_DOMAIN"
print_status ""
print_status "📊 Monitor the application with:"
print_status "   - pm2 status"
print_status "   - pm2 logs $SERVICE_NAME"
print_status "   - sudo systemctl status cloudflared"
print_status ""
print_warning "⚠️  Don't forget to:"
print_warning "   1. Update .env.production with secure values"
print_warning "   2. Configure MySQL database"
print_warning "   3. Test all application functionality"
print_warning "   4. Setup SSL certificates if needed"