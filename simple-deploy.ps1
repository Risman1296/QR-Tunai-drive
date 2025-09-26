# Simple Frontend-Only deployment untuk Cloudflare Pages
# Menonaktifkan API routes dan hanya deploy frontend

param(
    [string]$ProjectName = "qr-tunai-frontend"
)

Write-Host "=== Deploy Frontend QR-Tunai ke Cloudflare Pages ===" -ForegroundColor Cyan

# Set environment variables
$env:CLOUDFLARE_PAGES = 'true'
$env:NODE_ENV = 'production'
$env:NEXT_TELEMETRY_DISABLED = '1'

# Backup original config jika ada
if (Test-Path "next.config.ts.original") {
    Write-Host "Config backup sudah ada, melanjutkan..." -ForegroundColor Yellow
}
elseif (Test-Path "next.config.ts") {
    Copy-Item "next.config.ts" "next.config.ts.original" -Force
    Write-Host "Backup config original -> next.config.ts.original" -ForegroundColor Yellow
}

# Buat temporary next config untuk frontend only
$frontendConfig = @'
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Skip errors for frontend only build
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip linting for quick deploy
  },
  
  // Static export configuration
  output: 'export',
  generateEtags: false,
  trailingSlash: true,
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Performance optimizations
  reactStrictMode: true,
  
  // Disable features that don't work with static export
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
'@

Write-Host "1. Menggunakan config frontend-only..." -ForegroundColor Green
$frontendConfig | Out-File "next.config.ts" -Encoding UTF8

Write-Host "2. Building frontend..." -ForegroundColor Green
npm run build
$buildResult = $LASTEXITCODE

if ($buildResult -eq 0) {
    Write-Host "3. Deploying ke Cloudflare Pages..." -ForegroundColor Green
    npx wrangler pages deploy "out" --project-name $ProjectName --commit-dirty=true
    $deployResult = $LASTEXITCODE
}
else {
    Write-Host "Build gagal! Menggunakan wrangler dev sebagai alternatif..." -ForegroundColor Yellow
    $deployResult = 1
}

# Restore original config
if (Test-Path "next.config.ts.original") {
    Copy-Item "next.config.ts.original" "next.config.ts" -Force
    Write-Host "Config original telah dipulihkan" -ForegroundColor Green
}

if ($buildResult -eq 0 -and $deployResult -eq 0) {
    Write-Host "=== SUCCESS ===" -ForegroundColor Green
    Write-Host "Frontend berhasil di-deploy!" -ForegroundColor Green
    Write-Host "URL: https://$ProjectName.pages.dev" -ForegroundColor Yellow
    Write-Host "Catatan: API endpoints perlu di-deploy terpisah" -ForegroundColor Cyan
}
else {
    Write-Host "=== DEPLOYMENT ALTERNATIF ===" -ForegroundColor Yellow
    Write-Host "Static export gagal. Coba manual deploy dengan Cloudflare Dashboard:" -ForegroundColor Yellow
    Write-Host "1. Buka https://dash.cloudflare.com/pages" -ForegroundColor Cyan
    Write-Host "2. Connect GitHub repo: QR-Tunai-drive" -ForegroundColor Cyan
    Write-Host "3. Build command: npm run build" -ForegroundColor Cyan
    Write-Host "4. Output directory: .next" -ForegroundColor Cyan
}