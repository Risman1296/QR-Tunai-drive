#!/bin/bash

# 🚀 QR Tunai WiFi System - Server Deployment Script
# Auto deployment script untuk production server

set -e

echo "🚀 Starting QR Tunai WiFi System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="qr-tunai-wifi"
APP_DIR="/opt/qr-tunai"
REPO_URL="https://github.com/Risman1296/QR-Tunai-drive.git"
BRANCH="copilot/vscode1758013875916"
NODE_VERSION="18"

# Functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
fi

# 1. System Updates and Dependencies
log "📦 Installing system dependencies..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# 2. Install Node.js
log "📦 Installing Node.js ${NODE_VERSION}..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    log "Node.js already installed: $(node --version)"
fi

# 3. Install PM2
log "📦 Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    pm2 install pm2-logrotate
else
    log "PM2 already installed: $(pm2 --version)"
fi

# 4. Create application directory
log "📁 Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
cd $APP_DIR

# 5. Clone repository
log "📥 Cloning repository..."
if [ -d ".git" ]; then
    log "Repository exists, pulling latest changes..."
    git pull origin $BRANCH
else
    git clone $REPO_URL .
    git checkout $BRANCH
fi

# 6. Install dependencies
log "📦 Installing application dependencies..."
npm install --production
npm install pm2 dotenv-cli

# 7. Create environment file
log "⚙️ Creating environment configuration..."
if [ ! -f ".env.production" ]; then
    cat > .env.production << 'EOF'
# Application Settings
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://localhost
PORT=3000

# WiFi Router Settings - Orbit H2
ORBIT_H2_IP=192.168.8.1
ORBIT_H2_USERNAME=admin
ORBIT_H2_PASSWORD=QaWsEdRf1@

# WiFi Automation
ENABLE_WIFI_AUTOMATION=true
START_WIFI_AUTOMATION=true

# Security
JWT_SECRET=your-super-secure-jwt-secret-change-this
NEXTAUTH_SECRET=your-nextauth-secret-change-this
NEXTAUTH_URL=https://localhost

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-secure-password
EOF
    chmod 600 .env.production
    warn "Please edit .env.production with your actual configuration!"
fi

# 8. Build application
log "🏗️ Building production version..."
npm run build

# 9. Create PM2 ecosystem
log "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'qr-tunai-wifi',
    script: 'npm',
    args: 'start',
    cwd: '/opt/qr-tunai',
    instances: 1,
    exec_mode: 'cluster',
    env_file: '.env.production',
    
    // Auto-restart settings
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // Logging
    log_file: '/var/log/qr-tunai/combined.log',
    out_file: '/var/log/qr-tunai/out.log',
    error_file: '/var/log/qr-tunai/error.log',
    time: true,
    
    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# 10. Create log directory
log "📝 Creating log directory..."
sudo mkdir -p /var/log/qr-tunai
sudo chown $USER:$USER /var/log/qr-tunai

# 11. Start application with PM2
log "🚀 Starting application with PM2..."
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | bash

# 12. Create Nginx configuration
log "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/qr-tunai > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/qr-tunai /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 13. Create health check script
log "🔍 Creating health check script..."
cat > health-check.sh << 'EOF'
#!/bin/bash

# Health check for QR Tunai WiFi System
APP_URL="http://localhost:3000"
ROUTER_IP="192.168.8.1"
LOG_FILE="/var/log/qr-tunai/health-check.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check application
if curl -f -s "$APP_URL/api/wifi/status" > /dev/null; then
    log_message "✅ Application: OK"
else
    log_message "❌ Application: FAILED - Restarting..."
    pm2 restart qr-tunai-wifi
fi

# Check router
if ping -c 1 $ROUTER_IP > /dev/null 2>&1; then
    log_message "✅ Router: OK"
else
    log_message "⚠️ Router: Unreachable"
fi
EOF

chmod +x health-check.sh

# 14. Setup cron jobs
log "⏰ Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "*/5 * * * * $APP_DIR/health-check.sh") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * pm2 restart qr-tunai-wifi") | crontab -

# 15. Final checks
log "🔍 Running final checks..."
sleep 5

# Check PM2 status
PM2_STATUS=$(pm2 list | grep $APP_NAME | grep online || true)
if [ -n "$PM2_STATUS" ]; then
    log "✅ PM2 application is running"
else
    warn "❌ PM2 application may not be running properly"
fi

# Check Nginx status
if sudo systemctl is-active nginx > /dev/null; then
    log "✅ Nginx is running"
else
    warn "❌ Nginx is not running"
fi

# Check application response
if curl -f -s http://localhost:3000 > /dev/null; then
    log "✅ Application responding on port 3000"
else
    warn "❌ Application not responding on port 3000"
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

log "🎉 Deployment completed!"
echo
echo "=============================================="
echo -e "${GREEN}🚀 QR Tunai WiFi System is now live!${NC}"
echo "=============================================="
echo -e "🌐 Local URL:     ${BLUE}http://localhost:3000${NC}"
echo -e "🌐 Server URL:    ${BLUE}http://$SERVER_IP${NC}"
echo -e "📊 WiFi Dashboard: ${BLUE}http://$SERVER_IP/dashboard/wifi${NC}"
echo -e "🔧 Admin Panel:   ${BLUE}http://$SERVER_IP/dashboard${NC}"
echo
echo "Next Steps:"
echo "1. Edit .env.production with your domain and settings"
echo "2. Setup SSL certificate with certbot"
echo "3. Configure your router IP and credentials"
echo "4. Test WiFi automation functionality"
echo
echo "Monitoring Commands:"
echo "  pm2 status              - Check application status"
echo "  pm2 logs qr-tunai-wifi  - View application logs"
echo "  pm2 restart qr-tunai-wifi - Restart application"
echo "  sudo systemctl status nginx - Check Nginx status"
echo
echo "Log files:"
echo "  Application: /var/log/qr-tunai/"
echo "  Health check: /var/log/qr-tunai/health-check.log"
echo "  Nginx: /var/log/nginx/"
echo "=============================================="