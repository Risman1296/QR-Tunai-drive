# QR-Tunai Drive Auto Deploy Script
# Password: QaWsEdRf1@

Write-Host "🚀 Starting QR-Tunai Drive Auto Deployment..." -ForegroundColor Green

# Function to execute SSH commands with password
function Execute-SSHCommand {
    param(
        [string]$Command
    )
    
    Write-Host "Executing: $Command" -ForegroundColor Yellow
    
    # Using plink (if available) or direct SSH
    $password = "QaWsEdRf1@"
    $sshCommand = "echo '$password' | ssh qrt@192.168.8.141 '$Command'"
    
    try {
        Invoke-Expression $sshCommand
        Write-Host "✅ Command completed successfully" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Command failed: $_" -ForegroundColor Red
        return $false
    }
}

Write-Host "📂 Step 1: Checking project directory..." -ForegroundColor Cyan
Execute-SSHCommand "cd ~/QR-Tunai-drive && pwd && ls -la | head -10"

Write-Host "⚙️ Step 2: Creating production environment..." -ForegroundColor Cyan
$envContent = @"
NODE_ENV=production
PORT=4000
DOMAIN=http://192.168.8.141:4000
BASE_URL=http://192.168.8.141:4000
JWT_SECRET=qr-tunai-super-secret-jwt-key-2025-production-secure
SESSION_SECRET=qr-tunai-session-secret-key-2025-secure
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=90
LOG_LEVEL=info
COMPRESSION_ENABLED=true
GZIP_THRESHOLD=1024
SECURITY_HEADERS_ENABLED=true
CORS_ORIGIN=http://192.168.8.141:4000
"@

Execute-SSHCommand "cd ~/QR-Tunai-drive && echo '$envContent' > .env.production && echo 'Environment created!'"

Write-Host "📦 Step 3: Installing dependencies..." -ForegroundColor Cyan
Execute-SSHCommand "cd ~/QR-Tunai-drive && rm -rf node_modules && npm ci --production"

Write-Host "🔨 Step 4: Building application..." -ForegroundColor Cyan
Execute-SSHCommand "cd ~/QR-Tunai-drive && npm run build"

Write-Host "📁 Step 5: Creating log directory..." -ForegroundColor Cyan
Execute-SSHCommand "mkdir -p ~/logs"

Write-Host "⚙️ Step 6: Creating PM2 ecosystem config..." -ForegroundColor Cyan
$pm2Config = @"
module.exports = {
  apps: [{
    name: 'qr-tunai-drive',
    script: 'npm',
    args: 'start',
    cwd: '/home/qrt/QR-Tunai-drive',
    instances: 2,
    exec_mode: 'cluster',
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
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    min_uptime: '10s',
    max_restarts: 10
  }]
};
"@

Execute-SSHCommand "cd ~/QR-Tunai-drive && echo '$pm2Config' > ecosystem.config.js && echo 'PM2 config created!'"

Write-Host "🚀 Step 7: Starting application with PM2..." -ForegroundColor Cyan
Execute-SSHCommand "cd ~/QR-Tunai-drive && pm2 delete qr-tunai-drive 2>/dev/null || true"
Execute-SSHCommand "cd ~/QR-Tunai-drive && pm2 start ecosystem.config.js"
Execute-SSHCommand "pm2 save"

Write-Host "📊 Step 8: Checking application status..." -ForegroundColor Cyan
Execute-SSHCommand "pm2 status"
Execute-SSHCommand "pm2 logs qr-tunai-drive --lines 20"

Write-Host "🔍 Step 9: Testing application..." -ForegroundColor Cyan
Execute-SSHCommand "curl -s http://localhost:4000 && echo 'App is responding!'"

Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
Write-Host "Your application is now running at:" -ForegroundColor Yellow
Write-Host "• Homepage: http://192.168.8.141:4000" -ForegroundColor White
Write-Host "• Login: http://192.168.8.141:4000/login" -ForegroundColor White
Write-Host "• Dashboard: http://192.168.8.141:4000/dashboard" -ForegroundColor White

Write-Host "📋 Useful Commands:" -ForegroundColor Yellow
Write-Host "• Check status: ssh qrt@192.168.8.141 'pm2 status'" -ForegroundColor Gray
Write-Host "• View logs: ssh qrt@192.168.8.141 'pm2 logs qr-tunai-drive'" -ForegroundColor Gray
Write-Host "• Restart app: ssh qrt@192.168.8.141 'pm2 restart qr-tunai-drive'" -ForegroundColor Gray