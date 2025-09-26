# Cloudflare Pages deployment script yang optimal untuk Windows
# Menggunakan static export untuk kompatibilitas penuh

param(
    [string]$ProjectName = "qr-tunai-app"
)

Write-Host "=== QR-Tunai Static Export ke Cloudflare Pages ===" -ForegroundColor Cyan

# Set environment untuk static export
$env:CLOUDFLARE_PAGES = 'true'
$env:ENABLE_WIFI_AUTOMATION = 'false'
$env:START_WIFI_AUTOMATION = 'false'
$env:NODE_ENV = 'production'

Write-Host "1. Building sebagai static export..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "2. Deploying static files ke Cloudflare Pages..." -ForegroundColor Green
npx wrangler pages deploy "out" --project-name $ProjectName --commit-dirty=true

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment berhasil!" -ForegroundColor Green
    Write-Host "App tersedia di: https://$ProjectName.pages.dev" -ForegroundColor Yellow
    Write-Host "Deployed static files dari folder: out/" -ForegroundColor Cyan
}
else {
    Write-Host "Deployment gagal!" -ForegroundColor Red
    exit $LASTEXITCODE
}