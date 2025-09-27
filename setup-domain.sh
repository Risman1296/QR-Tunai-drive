#!/bin/bash
# Complete setup script for qr-drive.uk domain
# Run this script on your server with: bash setup-domain.sh

echo "🚀 Setting up qr-drive.uk domain configuration..."

# Backup existing config
sudo cp /etc/nginx/sites-available/qr-tunai /etc/nginx/sites-available/qr-tunai.backup

# Create new config for qr-drive.uk
sudo tee /etc/nginx/sites-available/qr-drive > /dev/null << 'EOF'
server {
    listen 80;
    server_name qr-drive.uk www.qr-drive.uk 192.168.8.143;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the new site
sudo ln -sf /etc/nginx/sites-available/qr-drive /etc/nginx/sites-enabled/

# Test nginx configuration
echo "🔧 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid, reloading..."
    sudo systemctl reload nginx
    sudo systemctl status nginx --no-pager -l
    
    echo ""
    echo "🌐 Domain qr-drive.uk is now configured!"
    echo "📡 Server: qr-drive.uk -> localhost:3000"
    echo "🎯 You can access your app at:"
    echo "   http://qr-drive.uk"
    echo "   http://www.qr-drive.uk" 
    echo "   http://192.168.8.143:3000"
else
    echo "❌ Nginx config has errors. Please check the configuration."
    exit 1
fi

echo ""
echo "🔍 Checking PM2 status..."
pm2 list

echo ""
echo "✅ Setup completed! Your QR-Tunai app should now be accessible via qr-drive.uk"