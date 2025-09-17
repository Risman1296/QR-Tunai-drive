#!/bin/bash

# QR-Tunai Drive - Auto Deployment Script for Server
# Run this script on your Ubuntu server after uploading files

echo "🚀 Starting QR-Tunai Drive Auto Deployment..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Navigate to project directory
print_info "Step 1: Setting up project directory..."
cd ~/QR-Tunai-drive || {
    print_error "QR-Tunai-drive directory not found!"
    exit 1
}
print_success "Changed to $(pwd)"

# Step 2: Create logs directory
print_info "Step 2: Creating logs directory..."
mkdir -p ~/logs
print_success "Created logs directory"

# Step 3: Create .env.production file
print_info "Step 3: Creating production environment file..."
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=4000
DOMAIN=http://192.168.8.141:4000
BASE_URL=http://192.168.8.141:4000

# Security
JWT_SECRET=qr-tunai-super-secret-jwt-key-2025-production-v1
SESSION_SECRET=qr-tunai-session-secret-key-2025-secure

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=90

# Logging
LOG_LEVEL=info

# Performance
COMPRESSION_ENABLED=true
GZIP_THRESHOLD=1024

# Security Headers
SECURITY_HEADERS_ENABLED=true
CORS_ORIGIN=http://192.168.8.141:4000

# App Configuration
APP_NAME=QR-Tunai Drive
APP_VERSION=1.0.0
EOF
print_success "Created .env.production file"

# Step 4: Create PM2 ecosystem configuration
print_info "Step 4: Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'qr-tunai-drive',
    script: 'npm',
    args: 'start',
    cwd: '/home/qrt/QR-Tunai-drive',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/home/qrt/logs/err.log',
    out_file: '/home/qrt/logs/out.log',
    log_file: '/home/qrt/logs/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    min_uptime: '10s',
    max_restarts: 10,
    
    // Health monitoring
    health_check_grace_period: 3000,
    health_check_interval: 30000
  }]
};
EOF
print_success "Created PM2 ecosystem configuration"

# Step 5: Install npm dependencies
print_info "Step 5: Installing npm dependencies..."
if npm ci --production; then
    print_success "npm dependencies installed successfully"
else
    print_error "Failed to install npm dependencies"
    exit 1
fi

# Step 6: Build the application
print_info "Step 6: Building the application..."
if npm run build; then
    print_success "Application built successfully"
else
    print_error "Failed to build application"
    exit 1
fi

# Step 7: Stop any existing PM2 processes
print_info "Step 7: Stopping existing PM2 processes..."
pm2 delete qr-tunai-drive 2>/dev/null || true
print_success "Cleaned up existing processes"

# Step 8: Start application with PM2
print_info "Step 8: Starting application with PM2..."
if pm2 start ecosystem.config.js; then
    print_success "Application started with PM2"
else
    print_error "Failed to start application with PM2"
    exit 1
fi

# Step 9: Save PM2 configuration
print_info "Step 9: Saving PM2 configuration..."
pm2 save
print_success "PM2 configuration saved"

# Step 10: Setup PM2 startup
print_info "Step 10: Setting up PM2 startup..."
print_warning "Run this command manually: pm2 startup"
print_warning "Then run the sudo command that appears"

# Step 11: Show application status
print_info "Step 11: Application Status"
echo ""
pm2 status
echo ""

# Step 12: Test the application
print_info "Step 12: Testing application..."
sleep 5

# Test if app is running
if curl -f -s http://localhost:4000 >/dev/null; then
    print_success "Application is responding on port 4000"
else
    print_warning "Application might not be fully started yet"
fi

# Test API endpoint
if curl -f -s http://localhost:4000/api/auth/login >/dev/null; then
    print_success "API endpoints are accessible"
else
    print_warning "API endpoints might not be ready yet"
fi

# Final status and instructions
echo ""
echo "🎉 DEPLOYMENT COMPLETED!"
echo "======================="
print_success "QR-Tunai Drive is now running on your server!"
echo ""
echo "📊 Application URLs:"
echo "• Homepage: http://192.168.8.141:4000"
echo "• Login: http://192.168.8.141:4000/login"
echo "• Dashboard: http://192.168.8.141:4000/dashboard"
echo ""
echo "🔧 Management Commands:"
echo "• Check status: pm2 status"
echo "• View logs: pm2 logs qr-tunai-drive"
echo "• Restart app: pm2 restart qr-tunai-drive"
echo "• Stop app: pm2 stop qr-tunai-drive"
echo "• Monitor app: pm2 monit"
echo ""
echo "📁 Log Files:"
echo "• Error logs: ~/logs/err.log"
echo "• Output logs: ~/logs/out.log"
echo "• Combined logs: ~/logs/combined.log"
echo ""
print_info "To complete setup, run: pm2 startup"
print_info "Then run the sudo command that appears to enable auto-start on boot"
echo ""
print_success "🚀 QR-Tunai Drive deployment successful!"