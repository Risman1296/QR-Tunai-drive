# Fresh Server Deployment - Complete Installation
param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    [Parameter(Mandatory=$true)]  
    [string]$ServerUser,
    [string]$ServerPath = "/var/www/qr-tunai",
    [string]$GitRepo = "https://github.com/Risman1296/QR-Tunai-drive.git"
)

Write-Host "🚀 Fresh Server Deployment - Complete Installation" -ForegroundColor Green
Write-Host "📡 Server: $ServerUser@$ServerIP" -ForegroundColor Cyan
Write-Host "📁 Path: $ServerPath" -ForegroundColor Cyan
Write-Host "📦 Repository: $GitRepo" -ForegroundColor Cyan
Write-Host ""

# Execute complete fresh installation
Write-Host "🔧 Setting up fresh installation on server..." -ForegroundColor Yellow

$setupScript = @"
#!/bin/bash
set -e

echo '📁 Creating directory structure...'
sudo mkdir -p /var/www
sudo chown -R \${USER}:\${USER} /var/www
cd /var/www

echo '📥 Cloning repository from GitHub...'
if [ -d "qr-tunai" ]; then
    echo '🗑️ Removing existing directory...'
    rm -rf qr-tunai
fi

git clone $GitRepo qr-tunai
cd qr-tunai

echo '🔄 Switching to main branch...'
git checkout main

echo '📋 Installing Node.js dependencies...'
npm install

echo '🏗️ Building application for production...'
npm run build

echo '📦 Installing PM2 globally if needed...'
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

echo '⏹️ Stopping any existing processes...'
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true

echo '🚀 Starting application with PM2...'
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ''
echo '✅ Fresh installation completed successfully!'
echo '🌐 QR-Tunai application is now running'
echo '📱 WiFi Management System is active'
echo '🔄 PM2 auto-restart configured'
echo ''
echo '📊 PM2 Status:'
pm2 list
echo ''
echo '🌍 Application should be accessible on port 3000'
"@

try {
    # Send and execute the setup script
    $setupScript | ssh "${ServerUser}@${ServerIP}" 'cat > /tmp/fresh-setup.sh && chmod +x /tmp/fresh-setup.sh && bash /tmp/fresh-setup.sh'
    
    if ($LASTEXITCODE -ne 0) {
        throw "Fresh installation failed"
    }
    
    Write-Host "✅ Fresh deployment completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error during fresh installation: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 FRESH INSTALLATION SELESAI!" -ForegroundColor Green
Write-Host "🌐 QR-Tunai dengan WiFi Management sudah running" -ForegroundColor Cyan  
Write-Host "📱 Semua fitur WiFi Orbit H2 sudah aktif" -ForegroundColor Cyan
Write-Host "🔄 PM2 auto-restart sudah dikonfigurasi" -ForegroundColor Cyan
Write-Host ""
Write-Host "Untuk mengecek status:" -ForegroundColor Yellow
Write-Host "ssh $ServerUser@$ServerIP 'pm2 list'" -ForegroundColor Gray