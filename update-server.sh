#!/bin/bash

# QR-Tunai Server Update Script
# Automated script to pull latest changes and update server

set -e

echo "🔄 QR-Tunai Server Update Starting..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/qrt/QR-Tunai-drive"
SERVICE_NAME="qr-tunai"
BRANCH_NAME="copilot/vscode1758013875916"

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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as qrt user
if [ "$USER" != "qrt" ]; then
    print_error "This script must be run as qrt user"
    print_warning "Please run: sudo su - qrt"
    exit 1
fi

# Navigate to project directory
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory $PROJECT_DIR not found!"
    exit 1
fi

cd $PROJECT_DIR
print_status "Working directory: $(pwd)"

# Step 1: Stop the current service
print_step "1/8 Stopping current service..."
pm2 stop $SERVICE_NAME 2>/dev/null || print_warning "Service was not running"

# Step 2: Backup current version
print_step "2/8 Creating backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="/home/qrt/backups/qr-tunai-$timestamp"
mkdir -p /home/qrt/backups
cp -r $PROJECT_DIR $backup_dir 2>/dev/null || print_warning "Backup creation failed (non-critical)"
print_status "Backup created at: $backup_dir"

# Step 3: Fetch latest changes
print_step "3/8 Fetching latest changes from GitHub..."
git fetch origin $BRANCH_NAME
print_status "Latest changes fetched"

# Step 4: Pull and merge changes
print_step "4/8 Pulling and merging changes..."
git checkout $BRANCH_NAME
git pull origin $BRANCH_NAME
print_status "Repository updated successfully"

# Step 5: Install/Update dependencies
print_step "5/8 Installing dependencies..."
npm install --production
print_status "Dependencies updated"

# Step 6: Build the application
print_step "6/8 Building application..."
npm run build
print_status "Build completed successfully"

# Step 7: Update environment and PM2 config
print_step "7/8 Updating configuration..."

# Ensure .env.local exists
if [ ! -f ".env.local" ]; then
    if [ -f ".env.production" ]; then
        cp .env.production .env.local
        print_status "Environment file created from production template"
    else
        print_warning "No environment file found. Please create .env.local manually"
    fi
fi

# Update PM2 configuration if it doesn't exist
if [ ! -f "ecosystem.config.js" ]; then
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
      PORT: 4000
    },
    log_file: '/var/log/qr-tunai-drive/app.log',
    error_file: '/var/log/qr-tunai-drive/error.log',
    out_file: '/var/log/qr-tunai-drive/out.log',
    time: true
  }]
}
EOF
    print_status "PM2 configuration created"
fi

# Step 8: Start the service
print_step "8/8 Starting service..."
pm2 start ecosystem.config.js
pm2 save
print_status "Service started successfully"

# Final status check
sleep 3
if pm2 show $SERVICE_NAME > /dev/null 2>&1; then
    print_status "✅ Server update completed successfully!"
    print_status ""
    print_status "📊 Service Status:"
    pm2 status $SERVICE_NAME
    print_status ""
    print_status "🌐 Application should be accessible on configured domain"
    print_status "📝 Check logs with: pm2 logs $SERVICE_NAME"
    print_status "🔄 Monitor with: pm2 monit"
    print_status ""
    print_status "Recent commits:"
    git log --oneline -5
else
    print_error "❌ Service failed to start properly!"
    print_warning "Check logs with: pm2 logs $SERVICE_NAME"
    print_warning "Restore backup from: $backup_dir"
    exit 1
fi

print_status "Update process completed at $(date)"