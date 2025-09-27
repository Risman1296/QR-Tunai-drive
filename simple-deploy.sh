#!/bin/bash

# QR-Tunai Drive - Simple Deployment Script
echo "🚀 QR-Tunai Drive Simple Deployment"
echo "===================================="

# Navigate to project directory
cd ~/QR-Tunai-drive
echo "✅ Changed to $(pwd)"

# Remove old node_modules if exists
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "✅ Cleaned old node_modules"
fi

# Create logs directory
mkdir -p ~/logs
echo "✅ Created logs directory"

# Create .env.production
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=4000
DOMAIN=http://192.168.8.141:4000
BASE_URL=http://192.168.8.141:4000
JWT_SECRET=qr-tunai-super-secret-jwt-key-2025
SESSION_SECRET=qr-tunai-session-secret-2025
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=90
LOG_LEVEL=info
COMPRESSION_ENABLED=true
GZIP_THRESHOLD=1024
SECURITY_HEADERS_ENABLED=true
CORS_ORIGIN=http://192.168.8.141:4000
EOF
echo "✅ Created .env.production"

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'qr-tunai-drive',
    script: 'npm',
    args: 'start',
    cwd: '/home/qrt/QR-Tunai-drive',
    instances: 1,
    exec_mode: 'fork',
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
    max_memory_restart: '1G'
  }]
};
EOF
echo "✅ Created PM2 ecosystem config"

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install
echo "✅ Dependencies installed"

# Build application
echo "🔨 Building application..."
npm run build
echo "✅ Application built"

# Stop existing PM2 processes
pm2 delete qr-tunai-drive 2>/dev/null || true
echo "✅ Cleaned existing processes"

# Start with PM2
echo "🚀 Starting with PM2..."
pm2 start ecosystem.config.js
echo "✅ Application started"

# Save PM2 config
pm2 save
echo "✅ PM2 config saved"

# Show status
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Access your app at: http://192.168.8.141:4000"
echo "Login page: http://192.168.8.141:4000/login"
echo "Dashboard: http://192.168.8.141:4000/dashboard"
echo ""
echo "Commands:"
echo "• pm2 status - Check status"
echo "• pm2 logs qr-tunai-drive - View logs"
echo "• pm2 restart qr-tunai-drive - Restart app"
echo "• pm2 monit - Monitor app"