# PowerShell helper to build and deploy to Cloudflare Pages on Windows 11
# Requires: Node 18/20, npm, Git for Windows (for bash), Wrangler CLI (installed via npx)

param(
  [switch]$Deploy = $false,
  [string]$ProjectName = "",
  [switch]$Preview = $false
)

Write-Host "=== QR-Tunai → Cloudflare Pages (Windows 11) ===" -ForegroundColor Cyan

# 1) Check 'bash' availability (required by next-on-pages / vercel build on Windows)
$bashCmd = Get-Command bash -ErrorAction SilentlyContinue
if (-not $bashCmd) {
  Write-Host "'bash' not found. Install Git for Windows (includes Git Bash) from https://git-scm.com/download/win" -ForegroundColor Yellow
  Write-Host "After install, reopen PowerShell and re-run this script." -ForegroundColor Yellow
  exit 1
}

# 2) Ensure WiFi automation disabled for Workers runtime
$env:ENABLE_WIFI_AUTOMATION = 'false'
$env:START_WIFI_AUTOMATION = 'false'

Write-Host "Installing dependencies (npm ci)..." -ForegroundColor Cyan
npm ci
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Building with Next on Pages..." -ForegroundColor Cyan
npx @cloudflare/next-on-pages@latest
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($Deploy) {
  if (-not $ProjectName) {
    Write-Host "--ProjectName is required with -Deploy. Example: -ProjectName my-qrtunai" -ForegroundColor Yellow
    exit 2
  }
  Write-Host "Logging into Cloudflare (one-time) ..." -ForegroundColor Cyan
  npx wrangler login
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  Write-Host "Deploying to Cloudflare Pages → $ProjectName" -ForegroundColor Cyan
  npx wrangler pages deploy .vercel/output/static --project-name $ProjectName
  exit $LASTEXITCODE
}
else {
  Write-Host "Starting local preview (Pages dev) ..." -ForegroundColor Cyan
  $flags = @('--compatibility-flag=nodejs_compat')
  if ($Preview) { $flags += '--preview' }
  npx wrangler pages dev .vercel/output/static @flags
  exit $LASTEXITCODE
}

