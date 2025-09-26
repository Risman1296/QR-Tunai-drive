# Deployment khusus untuk Cloudflare Pages (frontend only)
# API routes akan dihandle oleh backend terpisah

param(
    [string]$ProjectName = "qr-tunai-frontend"
)

Write-Host "=== QR-Tunai Frontend ke Cloudflare Pages ===" -ForegroundColor Cyan

# Backup next.config.ts original
if (Test-Path "next.config.ts") {
    Copy-Item "next.config.ts" "next.config.backup.ts" -Force
    Write-Host "Backup next.config.ts -> next.config.backup.ts" -ForegroundColor Yellow
}

# Gunakan konfigurasi khusus Cloudflare
Copy-Item "next.config.cloudflare.ts" "next.config.ts" -Force

# Set environment
$env:NODE_ENV = 'production'
$env:NEXT_TELEMETRY_DISABLED = '1'

Write-Host "1. Building frontend untuk Cloudflare Pages..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build gagal! Restoring config..." -ForegroundColor Red
    Copy-Item "next.config.backup.ts" "next.config.ts" -Force
    exit $LASTEXITCODE
}

Write-Host "2. Deploying ke Cloudflare Pages..." -ForegroundColor Green
npx wrangler pages deploy "out" --project-name $ProjectName --commit-dirty=true

# Restore original config
Copy-Item "next.config.backup.ts" "next.config.ts" -Force
Write-Host "Restored original next.config.ts" -ForegroundColor Yellow

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment berhasil!" -ForegroundColor Green
    Write-Host "Frontend tersedia di: https://$ProjectName.pages.dev" -ForegroundColor Yellow
    Write-Host "Catatan: API routes perlu di-deploy terpisah ke Cloudflare Workers" -ForegroundColor Cyan
}
else {
    Write-Host "Deployment gagal!" -ForegroundColor Red
    exit $LASTEXITCODE
}