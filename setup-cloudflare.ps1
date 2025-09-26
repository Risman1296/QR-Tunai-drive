Write-Host "=== QR-Tunai Cloudflare Setup ===" -ForegroundColor Cyan

Write-Host "Project Info untuk Setup:" -ForegroundColor Yellow
Write-Host "Name: qr-tunai-app" -ForegroundColor Green
Write-Host "Repo: QR-Tunai-drive" -ForegroundColor Green
Write-Host "Branch: copilot/vscode1758013875916" -ForegroundColor Green
Write-Host "Build: npm run build" -ForegroundColor Green
Write-Host "Output: .next" -ForegroundColor Green

Write-Host "Environment Variables:" -ForegroundColor Yellow
Write-Host "NODE_ENV=production" -ForegroundColor Cyan
Write-Host "NEXT_TELEMETRY_DISABLED=1" -ForegroundColor Cyan
Write-Host "ENABLE_WIFI_AUTOMATION=false" -ForegroundColor Cyan

Write-Host "Membuka Cloudflare Dashboard..." -ForegroundColor Green
Start-Process "https://dash.cloudflare.com/pages"

Write-Host "Setup manual di browser yang terbuka!" -ForegroundColor Yellow