#!/bin/bash

# Quick Deployment Script - Push to Server
# Usage: ./quick-deploy.sh

echo "🚀 Quick Deployment - Pushing all files to server..."

# Check if we have SSH connection parameters
if [ -z "$QR_SERVER_IP" ] || [ -z "$QR_SERVER_USER" ]; then
    echo "⚠️  Please set environment variables:"
    echo "export QR_SERVER_IP=your_server_ip"
    echo "export QR_SERVER_USER=your_server_user"
    echo ""
    echo "Or provide them as arguments:"
    echo "./quick-deploy.sh <server_ip> <server_user>"
    exit 1
fi

SERVER_IP="${1:-$QR_SERVER_IP}"
SERVER_USER="${2:-$QR_SERVER_USER}"
SERVER_PATH="${3:-/var/www/qr-tunai}"

echo "📡 Deploying to: ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}"

# 1. Sync all files to server
echo "📦 Syncing files..."
rsync -avz --progress --exclude='.git' --exclude='node_modules' --exclude='.next' ./ "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"

# 2. Remote deployment
echo "🔧 Running deployment on server..."
ssh "${SERVER_USER}@${SERVER_IP}" << 'EOF'
cd /var/www/qr-tunai

echo "📋 Installing dependencies..."
npm install

echo "🏗️ Building application..."
npm run build

echo "🔄 Restarting PM2..."
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js

echo "✅ Deployment complete!"
pm2 list
EOF

echo ""
echo "✅ Quick deployment completed!"
echo "🌐 Application should be running on your server"