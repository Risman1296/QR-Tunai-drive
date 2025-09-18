# Quick Deployment PowerShell Script
param(
    [string]$ServerIP = $env:QR_SERVER_IP,
    [string]$ServerUser = $env:QR_SERVER_USER,
    [string]$ServerPath = "/var/www/qr-tunai"
)

Write-Host "🚀 Quick Deployment - Push ke Server Otomatis" -ForegroundColor Green

if (-not $ServerIP -or -not $ServerUser) {
    Write-Host "⚠️  Parameter server diperlukan:" -ForegroundColor Yellow
    Write-Host "   - ServerIP: IP address server Anda"
    Write-Host "   - ServerUser: Username SSH server"
    Write-Host ""
    Write-Host "Contoh penggunaan:"
    Write-Host "   .\quick-deploy.ps1 -ServerIP 192.168.1.100 -ServerUser root"
    Write-Host ""
    Write-Host "Atau set environment variables:"
    Write-Host "   `$env:QR_SERVER_IP = 'your_server_ip'"
    Write-Host "   `$env:QR_SERVER_USER = 'your_server_user'"
    exit 1
}

Write-Host "📡 Deploying ke: $ServerUser@$ServerIP`:$ServerPath" -ForegroundColor Cyan

# 1. Upload semua file ke server
Write-Host "📦 Mengupload semua file ke server..." -ForegroundColor Yellow
try {
    # Menggunakan scp untuk upload files
    $excludeItems = @('.git', 'node_modules', '.next', '*.log')
    
    # Create temporary directory list
    $tempFile = [System.IO.Path]::GetTempFileName()
    Get-ChildItem -Recurse | Where-Object { 
        $item = $_
        -not ($excludeItems | Where-Object { $item.Name -like $_ -or $item.FullName -like "*\$_\*" })
    } | ForEach-Object { $_.FullName } | Out-File -FilePath $tempFile
    
    # Upload using SCP
    scp -r * "${ServerUser}@${ServerIP}:${ServerPath}/"
    
    if ($LASTEXITCODE -ne 0) {
        throw "SCP upload failed"
    }
    
    Write-Host "✅ File berhasil diupload" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error saat upload: $_" -ForegroundColor Red
    exit 1
}

# 2. Jalankan deployment di server
Write-Host "🔧 Menjalankan deployment di server..." -ForegroundColor Yellow
try {
    $deploymentScript = @"
cd $ServerPath

echo '📋 Installing dependencies...'
npm install

echo '🏗️ Building application...'
npm run build

echo '🔄 Managing PM2 processes...'
pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
pm2 save

echo '✅ Deployment selesai!'
echo '📊 Status PM2:'
pm2 list

echo ''
echo '🌐 Aplikasi QR-Tunai dengan sistem WiFi sudah running!'
echo '📱 Fitur WiFi Orbit H2 sudah aktif'
"@

    # Execute deployment script on server
    $deploymentScript | ssh "${ServerUser}@${ServerIP}" 'bash -s'
    
    if ($LASTEXITCODE -ne 0) {
        throw "Deployment script failed"
    }
    
    Write-Host "✅ Deployment berhasil!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error saat deployment: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 DEPLOYMENT SELESAI!" -ForegroundColor Green
Write-Host "🌐 Aplikasi QR-Tunai sudah running di server" -ForegroundColor Cyan
Write-Host "📱 Sistem WiFi Management sudah aktif" -ForegroundColor Cyan
Write-Host "🔄 PM2 auto-restart sudah dikonfigurasi" -ForegroundColor Cyan
Write-Host ""
Write-Host "Untuk mengecek status:" -ForegroundColor Yellow
Write-Host "ssh $ServerUser@$ServerIP 'pm2 list'" -ForegroundColor Gray