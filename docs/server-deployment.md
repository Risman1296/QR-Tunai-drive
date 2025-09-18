# 🚀 Server Deployment Guide - QR Tunai WiFi System

## 📋 Prerequisites Server
- Ubuntu/Debian Linux Server
- Node.js 18+ LTS
- PM2 Process Manager
- Git
- Domain/IP public
- Port 80/443 terbuka

## 🔧 1. Environment Setup di Server

### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git jika belum ada
sudo apt install git -y

# Verify installations
node --version   # Should show v18.x.x
npm --version    # Should show 9.x.x
pm2 --version    # Should show 5.x.x
```

### Create Application Directory
```bash
# Create app directory
sudo mkdir -p /opt/qr-tunai
sudo chown $USER:$USER /opt/qr-tunai
cd /opt/qr-tunai
```

## 📥 2. Clone dan Setup Repository

```bash
# Clone dari GitHub
git clone https://github.com/Risman1296/QR-Tunai-drive.git .

# Switch ke branch dengan WiFi system
git checkout copilot/vscode1758013875916

# Install dependencies
npm install

# Install additional production dependencies
npm install pm2 dotenv-cli
```

## ⚙️ 3. Environment Configuration

### Create Production Environment File
```bash
# Create .env.production file
cat > .env.production << 'EOF'
# Application Settings
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com
PORT=3000

# Database (jika diperlukan)
DATABASE_URL=your-database-url

# WiFi Router Settings - Orbit H2
ORBIT_H2_IP=192.168.8.1
ORBIT_H2_USERNAME=admin
ORBIT_H2_PASSWORD=QaWsEdRf1@

# WiFi Automation
ENABLE_WIFI_AUTOMATION=true
START_WIFI_AUTOMATION=true

# Security
JWT_SECRET=your-super-secure-jwt-secret-here
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.com

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-admin-password

# Email Settings (untuk alerts)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring & Alerts
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PHONE=+628123456789
EOF
```

### Set File Permissions
```bash
chmod 600 .env.production
```

## 🏗️ 4. Build Production

```bash
# Build production version
npm run build

# Verify build success
ls -la .next/
```

## 🎯 5. PM2 Configuration

### Create PM2 Ecosystem File
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'qr-tunai-wifi',
    script: 'npm',
    args: 'start',
    cwd: '/opt/qr-tunai',
    instances: 'max',
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
```

### Create Log Directory
```bash
sudo mkdir -p /var/log/qr-tunai
sudo chown $USER:$USER /var/log/qr-tunai
```

## 🚀 6. Deploy Application

### Start with PM2
```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup (auto-start on server reboot)
pm2 startup
# Follow the command output instructions

# Check status
pm2 status
pm2 logs qr-tunai-wifi --lines 50
```

## 🌐 7. Nginx Reverse Proxy (Recommended)

### Install Nginx
```bash
sudo apt install nginx -y
```

### Create Nginx Configuration
```bash
sudo tee /etc/nginx/sites-available/qr-tunai << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Main proxy
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
}
EOF
```

### Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/qr-tunai /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 8. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install snapd -y
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔍 9. Monitoring & Health Checks

### Create Health Check Script
```bash
cat > /opt/qr-tunai/health-check.sh << 'EOF'
#!/bin/bash

# Health check script for QR Tunai WiFi System
HEALTH_URL="http://localhost:3000/api/wifi/status"
ROUTER_IP="192.168.8.1"
LOG_FILE="/var/log/qr-tunai/health-check.log"

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> $LOG_FILE
}

# Check application health
if curl -f -s $HEALTH_URL > /dev/null; then
    log "✅ Application health: OK"
else
    log "❌ Application health: FAILED"
    # Restart PM2 if unhealthy
    pm2 restart qr-tunai-wifi
    log "🔄 Restarted application"
fi

# Check router connectivity
if ping -c 1 $ROUTER_IP > /dev/null; then
    log "✅ Router connectivity: OK"
else
    log "❌ Router connectivity: FAILED"
fi

# Check WiFi automation status
WIFI_STATUS=$(curl -s http://localhost:3000/api/wifi/status | jq -r '.data.automation.status' 2>/dev/null)
if [ "$WIFI_STATUS" = "active" ]; then
    log "✅ WiFi automation: ACTIVE"
else
    log "⚠️ WiFi automation: $WIFI_STATUS"
fi
EOF

chmod +x /opt/qr-tunai/health-check.sh
```

### Setup Cron Jobs
```bash
# Add to crontab
crontab -e

# Add these lines:
# Health check every 5 minutes
*/5 * * * * /opt/qr-tunai/health-check.sh

# Daily log rotation
0 0 * * * /usr/bin/logrotate /etc/logrotate.d/qr-tunai

# Weekly restart (optional)
0 3 * * 0 /usr/bin/pm2 restart qr-tunai-wifi
```

## 📊 10. Monitoring Commands

### PM2 Monitoring
```bash
# Check application status
pm2 status

# View logs
pm2 logs qr-tunai-wifi --lines 100

# Monitor real-time
pm2 monit

# Restart application
pm2 restart qr-tunai-wifi

# Reload (zero-downtime)
pm2 reload qr-tunai-wifi
```

### System Monitoring
```bash
# Check system resources
htop
df -h
free -h

# Check network
netstat -tlnp | grep 3000

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check SSL certificate
sudo certbot certificates
```

## 🚨 11. Troubleshooting

### Common Issues

**Application won't start:**
```bash
# Check logs
pm2 logs qr-tunai-wifi --err --lines 50

# Check environment
pm2 env 0

# Manual start for debugging
cd /opt/qr-tunai
npm start
```

**WiFi automation not working:**
```bash
# Check router connectivity
ping 192.168.8.1

# Test WiFi API
curl http://localhost:3000/api/wifi/status

# Check cron jobs
sudo systemctl status cron
```

**High memory usage:**
```bash
# Check memory usage
pm2 monit

# Restart if needed
pm2 restart qr-tunai-wifi
```

## 🔄 12. Updates & Maintenance

### Deploy Updates
```bash
cd /opt/qr-tunai

# Pull latest changes
git pull origin copilot/vscode1758013875916

# Install any new dependencies
npm install

# Rebuild if necessary
npm run build

# Reload application (zero-downtime)
pm2 reload qr-tunai-wifi

# Check status
pm2 status
pm2 logs qr-tunai-wifi --lines 20
```

### Backup Data
```bash
# Create backup script
cat > /opt/qr-tunai/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/qr-tunai"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup configuration
cp -r /opt/qr-tunai/.env.production $BACKUP_DIR/env_$DATE
cp -r /opt/qr-tunai/payment-configuration.json $BACKUP_DIR/config_$DATE

# Backup logs
cp -r /var/log/qr-tunai $BACKUP_DIR/logs_$DATE

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x /opt/qr-tunai/backup.sh

# Run backup
/opt/qr-tunai/backup.sh
```

## ✅ Deployment Checklist

- [ ] Server setup dengan Node.js 18+
- [ ] Repository cloned dan dependencies installed
- [ ] Environment variables configured
- [ ] Production build successful
- [ ] PM2 ecosystem configured
- [ ] Application started with PM2
- [ ] Nginx reverse proxy setup
- [ ] SSL certificate installed
- [ ] Health check script configured
- [ ] Cron jobs setup
- [ ] Monitoring enabled
- [ ] Backup strategy implemented

## 🎉 Post-Deployment Verification

1. **Test Application**: https://your-domain.com
2. **Test WiFi Dashboard**: https://your-domain.com/dashboard/wifi
3. **Test API Health**: https://your-domain.com/api/wifi/status
4. **Verify SSL**: Check certificate in browser
5. **Monitor Logs**: `pm2 logs qr-tunai-wifi`

---

**🚀 Your QR Tunai WiFi System is now live in production!**