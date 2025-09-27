#!/bin/bash

# QR-Tunai Drive - Ubuntu Server Deployment Script
# This script handles complete deployment on Ubuntu 24.04 LTS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="qr-tunai-drive"
APP_USER="qrt"
APP_DIR="/home/$APP_USER/$APP_NAME"
LOG_DIR="/var/log/$APP_NAME"
SERVICE_FILE="/etc/systemd/system/$APP_NAME.service"
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"
NGINX_ENABLED="/etc/nginx/sites-enabled/$APP_NAME"

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root!"
        print_warning "Run as the deployment user ($APP_USER) instead"
        exit 1
    fi
}

# Create log directory
setup_logging() {
    print_header "Setting Up Logging"
    
    if [ ! -d "$LOG_DIR" ]; then
        sudo mkdir -p "$LOG_DIR"
        sudo chown $APP_USER:$APP_USER "$LOG_DIR"
        print_success "Created log directory: $LOG_DIR"
    fi
    
    # Log deployment
    echo "[$(date)] Starting deployment..." >> "$LOG_DIR/deployment.log"
}

# Install system dependencies
install_dependencies() {
    print_header "Installing System Dependencies"
    
    # Update package list
    print_success "Updating package list..."
    sudo apt update
    
    # Install Node.js (using NodeSource repository)
    if ! command -v node &> /dev/null; then
        print_success "Installing Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        print_success "Node.js already installed: $(node -v)"
    fi
    
    # Install PM2 globally
    if ! command -v pm2 &> /dev/null; then
        print_success "Installing PM2..."
        sudo npm install -g pm2
        
        # Configure PM2 startup
        sudo pm2 startup systemd -u $APP_USER --hp /home/$APP_USER
        pm2 startup systemd
    else
        print_success "PM2 already installed: $(pm2 -v)"
    fi
    
    # Install Nginx
    if ! command -v nginx &> /dev/null; then
        print_success "Installing Nginx..."
        sudo apt install -y nginx
        sudo systemctl enable nginx
    else
        print_success "Nginx already installed"
    fi
    
    # Install other dependencies
    print_success "Installing additional dependencies..."
    sudo apt install -y curl git ufw fail2ban htop certbot python3-certbot-nginx
}

# Setup firewall
setup_firewall() {
    print_header "Configuring Firewall"
    
    # Enable UFW
    sudo ufw --force enable
    
    # Allow SSH, HTTP, HTTPS
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    sudo ufw allow 80
    sudo ufw allow 443
    
    # Allow app port (in case direct access needed)
    sudo ufw allow 4000
    
    print_success "Firewall configured"
    sudo ufw status
}

# Setup application directory
setup_app_directory() {
    print_header "Setting Up Application Directory"
    
    if [ ! -d "$APP_DIR" ]; then
        mkdir -p "$APP_DIR"
        print_success "Created application directory: $APP_DIR"
    fi
    
    cd "$APP_DIR"
    print_success "Changed to application directory"
}

# Deploy application files
deploy_application() {
    print_header "Deploying Application"
    
    # Copy application files (assuming they're in current directory)
    if [ -f "package.json" ]; then
        print_success "Found package.json, deploying application..."
        
        # Install dependencies
        npm ci --production
        print_success "Installed npm dependencies"
        
        # Build application
        npm run build
        print_success "Built application"
        
    else
        print_error "package.json not found! Make sure you're in the correct directory."
        exit 1
    fi
}

# Configure environment
setup_environment() {
    print_header "Configuring Environment"
    
    # Create production environment file
    if [ ! -f ".env.production" ]; then
        cat > .env.production << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=4000

# Domain Configuration
DOMAIN=https://your-domain.com
BASE_URL=https://your-domain.com

# Security
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# Database (adjust as needed)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qr_tunai_db
DB_USER=qr_tunai_user
DB_PASSWORD=$(openssl rand -hex 16)

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=90

# Notifications
NOTIFICATION_ENABLED=true

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=$LOG_DIR/app.log

# Cache
CACHE_TTL=3600

# Performance
COMPRESSION_ENABLED=true
GZIP_THRESHOLD=1024

# Security Headers
SECURITY_HEADERS_ENABLED=true
CORS_ORIGIN=https://your-domain.com

# Backup
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION=7
EOF
        print_success "Created .env.production file"
        print_warning "Please update the configuration values in .env.production"
    else
        print_success ".env.production already exists"
    fi
}

# Configure PM2
setup_pm2() {
    print_header "Configuring PM2"
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '$LOG_DIR/err.log',
    out_file: '$LOG_DIR/out.log',
    log_file: '$LOG_DIR/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    
    // Auto-restart on crash
    autorestart: true,
    watch: false,
    
    // Advanced PM2 features
    ignore_watch: ['node_modules', 'logs', '.git'],
    merge_logs: true,
    
    // Health monitoring
    min_uptime: '10s',
    max_restarts: 10,
    
    // Performance monitoring
    pmx: true,
    
    // Log rotation
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    
    // Environment specific settings
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000,
      INSTANCE_ID: process.env.NODE_APP_INSTANCE || 0
    }
  }],

  deploy: {
    production: {
      user: '$APP_USER',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/qr-tunai-drive.git',
      path: '$APP_DIR',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
EOF
    
    print_success "Created PM2 ecosystem configuration"
}

# Configure Nginx
setup_nginx() {
    print_header "Configuring Nginx"
    
    # Create Nginx configuration
    sudo tee "$NGINX_CONFIG" > /dev/null << EOF
upstream qr_tunai_backend {
    least_conn;
    server 127.0.0.1:4000;
    # Add more backend servers here for load balancing
    # server 127.0.0.1:4001;
    # server 127.0.0.1:4002;
}

# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/m;
limit_req_zone \$binary_remote_addr zone=web:10m rate=30r/m;

server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Client max body size (for file uploads)
    client_max_body_size 10M;
    
    # Timeout settings
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Buffer settings
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
    proxy_busy_buffers_size 8k;
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
        
        # Try static files first, then proxy to app
        try_files \$uri @app;
    }
    
    # API routes with rate limiting
    location /api/ {
        limit_req zone=api burst=5 nodelay;
        limit_req_status 429;
        
        proxy_pass http://qr_tunai_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Main application
    location / {
        limit_req zone=web burst=10 nodelay;
        limit_req_status 429;
        
        # Try static files first, then proxy to app
        try_files \$uri \$uri/ @app;
    }
    
    # Proxy to Node.js application
    location @app {
        proxy_pass http://qr_tunai_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://qr_tunai_backend/api/health;
    }
    
    # Deny access to sensitive files
    location ~ /\.(ht|git|env) {
        deny all;
        return 404;
    }
    
    # Block common attack patterns
    location ~* (eval\(|base64_decode|gzinflate|scandir|system\(|shell_exec) {
        deny all;
        return 403;
    }
    
    # Custom error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    # Logging
    access_log $LOG_DIR/nginx_access.log;
    error_log $LOG_DIR/nginx_error.log;
}
EOF
    
    # Enable the site
    sudo ln -sf "$NGINX_CONFIG" "$NGINX_ENABLED"
    
    # Test Nginx configuration
    if sudo nginx -t; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration has errors!"
        exit 1
    fi
    
    # Restart Nginx
    sudo systemctl restart nginx
    print_success "Nginx configured and restarted"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    print_header "Setting Up SSL Certificate"
    
    print_warning "SSL setup requires a valid domain name"
    print_warning "Update your domain in the Nginx config before running:"
    print_warning "sudo certbot --nginx -d your-domain.com -d www.your-domain.com"
    
    # Create SSL renewal cron job
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    print_success "Added SSL certificate renewal cron job"
}

# Setup monitoring and backup
setup_monitoring() {
    print_header "Setting Up Monitoring & Backup"
    
    # Create backup script
    cat > backup.sh << 'EOF'
#!/bin/bash

# QR-Tunai Drive Backup Script
BACKUP_DIR="/home/qrt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/qrt/qr-tunai-drive"
LOG_DIR="/var/log/qr-tunai-drive"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup application files
echo "Backing up application files..."
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" \
    --exclude="node_modules" \
    --exclude=".next" \
    --exclude="*.log" \
    "$APP_DIR"

# Backup logs
echo "Backing up logs..."
tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" "$LOG_DIR"

# Backup environment files
echo "Backing up configuration..."
cp "$APP_DIR/.env.production" "$BACKUP_DIR/env_$DATE.backup"

# Clean old backups (keep only last 7 days)
find "$BACKUP_DIR" -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF
    
    chmod +x backup.sh
    print_success "Created backup script"
    
    # Add backup to cron
    (crontab -l 2>/dev/null; echo "0 2 * * * /home/$APP_USER/$APP_NAME/backup.sh >> $LOG_DIR/backup.log 2>&1") | crontab -
    print_success "Added daily backup cron job"
    
    # Create health check script
    cat > health-check.sh << 'EOF'
#!/bin/bash

# Health check script
LOG_FILE="/var/log/qr-tunai-drive/health.log"
APP_URL="http://localhost:4000/api/health"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check if app is responding
if curl -f -s "$APP_URL" > /dev/null; then
    echo "[$DATE] App is healthy" >> "$LOG_FILE"
else
    echo "[$DATE] App is down - restarting..." >> "$LOG_FILE"
    pm2 restart qr-tunai-drive
    echo "[$DATE] Restart attempted" >> "$LOG_FILE"
fi
EOF
    
    chmod +x health-check.sh
    print_success "Created health check script"
    
    # Add health check to cron (every 5 minutes)
    (crontab -l 2>/dev/null; echo "*/5 * * * * /home/$APP_USER/$APP_NAME/health-check.sh") | crontab -
    print_success "Added health check cron job"
}

# Setup Cloudflare Tunnel
setup_cloudflare() {
    print_header "Cloudflare Tunnel Setup Instructions"
    
    print_warning "To set up Cloudflare Tunnel:"
    echo "1. Install cloudflared:"
    echo "   wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
    echo "   sudo dpkg -i cloudflared-linux-amd64.deb"
    echo ""
    echo "2. Authenticate with Cloudflare:"
    echo "   cloudflared tunnel login"
    echo ""
    echo "3. Create a tunnel:"
    echo "   cloudflared tunnel create $APP_NAME"
    echo ""
    echo "4. Configure the tunnel:"
    echo "   Create config.yml with your tunnel settings"
    echo ""
    echo "5. Start the tunnel:"
    echo "   cloudflared tunnel run $APP_NAME"
    echo ""
    print_warning "Run these commands after deployment is complete"
}

# Start the application
start_application() {
    print_header "Starting Application"
    
    # Start with PM2
    pm2 start ecosystem.config.js --env production
    print_success "Started application with PM2"
    
    # Save PM2 configuration
    pm2 save
    print_success "Saved PM2 configuration"
    
    # Show PM2 status
    pm2 status
    
    # Check if app is responding
    sleep 5
    if curl -f http://localhost:4000/api/health 2>/dev/null; then
        print_success "Application is responding on port 4000"
    else
        print_warning "Application might not be fully started yet"
        print_warning "Check logs: pm2 logs $APP_NAME"
    fi
}

# Cleanup function
cleanup() {
    print_header "Post-Deployment Cleanup"
    
    # Set correct permissions
    find "$APP_DIR" -type f -name "*.sh" -exec chmod +x {} \;
    
    # Clear npm cache
    npm cache clean --force
    
    print_success "Cleanup completed"
}

# Main deployment function
main() {
    print_header "QR-Tunai Drive Production Deployment"
    echo "Starting deployment at $(date)"
    
    # Pre-deployment checks
    check_root
    setup_logging
    
    # System setup
    install_dependencies
    setup_firewall
    
    # Application deployment
    setup_app_directory
    deploy_application
    setup_environment
    setup_pm2
    
    # Web server setup
    setup_nginx
    setup_ssl
    
    # Monitoring and maintenance
    setup_monitoring
    
    # Additional services
    setup_cloudflare
    
    # Start application
    start_application
    cleanup
    
    print_header "Deployment Complete!"
    print_success "QR-Tunai Drive has been deployed successfully"
    echo ""
    echo "📋 Next Steps:"
    echo "• Update domain name in Nginx configuration"
    echo "• Configure SSL certificate with certbot"
    echo "• Set up Cloudflare tunnel"
    echo "• Update .env.production with your settings"
    echo "• Test the application thoroughly"
    echo ""
    echo "📊 Application Status:"
    pm2 status
    echo ""
    echo "🔗 Access Your App:"
    echo "• Local: http://localhost:4000"
    echo "• Web: http://your-domain.com (after DNS setup)"
    echo ""
    echo "📁 Important Files:"
    echo "• App directory: $APP_DIR"
    echo "• Logs: $LOG_DIR"
    echo "• Nginx config: $NGINX_CONFIG"
    echo "• Environment: $APP_DIR/.env.production"
    echo ""
    echo "🛠 Useful Commands:"
    echo "• Check app status: pm2 status"
    echo "• View logs: pm2 logs $APP_NAME"
    echo "• Restart app: pm2 restart $APP_NAME"
    echo "• Reload app: pm2 reload $APP_NAME"
    echo "• Stop app: pm2 stop $APP_NAME"
    echo ""
    echo "📞 Support: Check logs if you encounter issues"
    
    # Log completion
    echo "[$(date)] Deployment completed successfully" >> "$LOG_DIR/deployment.log"
}

# Execute main function
main "$@"