# Automated Server Deployment Script for QR-Tunai-drive
param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$ServerUser,
    
    [string]$ServerPath = "/var/www/qr-tunai",
    [string]$Domain = "your-domain.com"
)

Write-Host "🚀 Starting Automated Server Deployment..." -ForegroundColor Green

# Step 1: Upload files via SCP
Write-Host "📦 Uploading files to server..." -ForegroundColor Yellow
scp -r * "${ServerUser}@${ServerIP}:${ServerPath}/"

# Step 2: Connect to server and run deployment commands
Write-Host "🔧 Configuring server..." -ForegroundColor Yellow
ssh "${ServerUser}@${ServerIP}" @"
    cd ${ServerPath}
    
    # Install dependencies
    echo '📋 Installing Node.js dependencies...'
    npm install
    
    # Build production
    echo '🏗️  Building for production...'
    npm run build
    
    # Install PM2 globally if not installed
    if ! command -v pm2 &> /dev/null; then
        echo '📦 Installing PM2...'
        npm install -g pm2
    fi
    
    # Stop existing processes
    echo '⏹️  Stopping existing processes...'
    pm2 stop ecosystem.config.js || true
    pm2 delete ecosystem.config.js || true
    
    # Start with PM2
    echo '🚀 Starting application with PM2...'
    pm2 start ecosystem.config.js
    pm2 save
    
    # Setup PM2 startup
    pm2 startup
    
    # Configure Nginx if needed
    if [ ! -f /etc/nginx/sites-available/qr-tunai ]; then
        echo '🌐 Configuring Nginx...'
        cat > /etc/nginx/sites-available/qr-tunai << 'EOF'
server {
    listen 80;
    server_name ${Domain};
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        
        ln -sf /etc/nginx/sites-available/qr-tunai /etc/nginx/sites-enabled/
        nginx -t && systemctl reload nginx
    fi
    
    echo '✅ Deployment completed successfully!'
    echo '🌐 Application running on: http://${Domain}'
    echo '📊 PM2 status:'
    pm2 list
"@

Write-Host "✅ Server deployment completed!" -ForegroundColor Green
Write-Host "🌐 Your QR-Tunai application is now running on the server" -ForegroundColor Cyan