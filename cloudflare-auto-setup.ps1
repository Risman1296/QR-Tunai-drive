# Auto-setup Cloudflare Pages - Buka dashboard untuk deployment manual

param(
    [string]$ProjectName = "qr-tunai-app"
)

Write-Host "=== QR-Tunai Auto Setup Cloudflare Pages ===" -ForegroundColor Cyan

# Tampilkan informasi untuk copy-paste
Write-Host "`n📋 COPY INFORMASI INI UNTUK SETUP:" -ForegroundColor Yellow
Write-Host "Project Name: $ProjectName" -ForegroundColor Green
Write-Host "Repository: QR-Tunai-drive" -ForegroundColor Green
Write-Host "Branch: copilot/vscode1758013875916" -ForegroundColor Green
Write-Host "Build Command: npm run build" -ForegroundColor Green
Write-Host "Output Directory: .next" -ForegroundColor Green
Write-Host "`nEnvironment Variables:" -ForegroundColor Yellow
Write-Host "NODE_ENV=production" -ForegroundColor Cyan
Write-Host "NEXT_TELEMETRY_DISABLED=1" -ForegroundColor Cyan
Write-Host "ENABLE_WIFI_AUTOMATION=false" -ForegroundColor Cyan
Write-Host "START_WIFI_AUTOMATION=false" -ForegroundColor Cyan

Write-Host "`n🚀 Membuka Cloudflare Dashboard..." -ForegroundColor Green

# Buka Cloudflare Pages dashboard
Start-Process "https://dash.cloudflare.com/pages"

Write-Host "`n✨ LANGKAH SELANJUTNYA:" -ForegroundColor Yellow
Write-Host "1. Login ke Cloudflare jika belum" -ForegroundColor White
Write-Host "2. Klik 'Create a project'" -ForegroundColor White
Write-Host "3. Pilih 'Connect to Git'" -ForegroundColor White
Write-Host "4. Authorize GitHub dan pilih repo QR-Tunai-drive" -ForegroundColor White
Write-Host "5. Copy-paste informasi di atas ke form setup" -ForegroundColor White
Write-Host "6. Klik 'Save and Deploy'" -ForegroundColor White

Write-Host "`n🎯 Setelah deploy berhasil:" -ForegroundColor Green
Write-Host "App akan tersedia di: https://$ProjectName.pages.dev" -ForegroundColor Cyan

Write-Host "`nSetup documentation tersedia di: CLOUDFLARE-SETUP.md" -ForegroundColor Gray