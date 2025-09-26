# Manual Cloudflare Pages deployment script untuk Windows
# Tidak memerlukan bash - pure PowerShell + Node.js

param(
    [string]$ProjectName = "qr-tunai-app",
    [switch]$Deploy
)

Write-Host "=== QR-Tunai Manual Deployment ke Cloudflare Pages ===" -ForegroundColor Cyan

# Set environment variables
$env:ENABLE_WIFI_AUTOMATION = 'false'
$env:START_WIFI_AUTOMATION = 'false'
$env:NODE_ENV = 'production'

Write-Host "1. Building Next.js application..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "2. Installing Wrangler CLI..." -ForegroundColor Green
npm install -g wrangler

Write-Host "3. Login ke Cloudflare (akan membuka browser)..." -ForegroundColor Green
npx wrangler login

if ($Deploy) {
    Write-Host "4. Deploying ke Cloudflare Pages: $ProjectName" -ForegroundColor Green
    
    # Deploy built files ke Cloudflare Pages
    npx wrangler pages deploy ".next" --project-name $ProjectName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment berhasil!" -ForegroundColor Green
        Write-Host "🌐 App tersedia di: https://$ProjectName.pages.dev" -ForegroundColor Yellow
    }
    else {
        Write-Host "❌ Deployment gagal!" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}
else {
    Write-Host "Build selesai. Gunakan -Deploy untuk deploy ke Cloudflare" -ForegroundColor Yellow
}