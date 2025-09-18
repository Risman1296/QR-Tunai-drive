#!/bin/bash

# Fresh Server Installation - Complete Setup
# Usage: ./quick-deploy.sh <server_ip> <server_user> [git_repo]

echo "🚀 Fresh Server Installation - Complete Setup..."

# Check if we have SSH connection parameters
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "⚠️  Usage: ./quick-deploy.sh <server_ip> <server_user> [git_repo]"
    echo ""
    echo "Example:"
    echo "  ./quick-deploy.sh 192.168.1.100 root"
    echo "  ./quick-deploy.sh 192.168.1.100 ubuntu https://github.com/Risman1296/QR-Tunai-drive.git"
    exit 1
fi

SERVER_IP="${1}"
SERVER_USER="${2}"
GIT_REPO="${3:-https://github.com/Risman1296/QR-Tunai-drive.git}"
SERVER_PATH="/var/www/qr-tunai"

echo "📡 Fresh Installation to: ${SERVER_USER}@${SERVER_IP}"
echo "📦 Repository: ${GIT_REPO}"
echo "📁 Path: ${SERVER_PATH}"

# Fresh installation via Git Clone
echo "� Running fresh installation on server..."
ssh "${SERVER_USER}@${SERVER_IP}" << EOF
set -e

echo '� Creating directory structure...'
sudo mkdir -p /var/www
sudo chown -R \${USER}:\${USER} /var/www
cd /var/www

echo '📥 Cloning repository from GitHub...'
if [ -d "qr-tunai" ]; then
    echo '🗑️ Removing existing directory...'
    rm -rf qr-tunai
fi

git clone ${GIT_REPO} qr-tunai
cd qr-tunai

echo '🔄 Switching to main branch...'
git checkout main

echo '📋 Installing dependencies...'
npm install

echo '🏗️ Building application...'
npm run build

echo '� Installing PM2 if needed...'
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

echo '🔄 Managing PM2 processes...'
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ''
echo '✅ Fresh installation completed!'
echo '📊 PM2 Status:'
pm2 list
EOF

echo ""
echo "✅ Fresh installation completed!"
echo "🌐 QR-Tunai dengan WiFi Management sudah running!"
echo "📱 Semua fitur WiFi Orbit H2 sudah aktif!"
echo "🔄 PM2 auto-restart sudah dikonfigurasi!"