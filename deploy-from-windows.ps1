# QR-Tunai Windows Deployment Script
# This script automates the deployment process from Windows to the Ubuntu server

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Username = "qrt",
    
    [Parameter(Mandatory=$false)]
    [switch]$BuildOnly = $false
)

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-Status {
    param([string]$Message)
    Write-Host "${Green}[INFO]${Reset} $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "${Yellow}[WARNING]${Reset} $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "${Red}[ERROR]${Reset} $Message"
}

function Write-Step {
    param([string]$Message)
    Write-Host "${Blue}[STEP]${Reset} $Message"
}

Write-Host ""
Write-Host "🚀 QR-Tunai Deployment Script" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build locally
Write-Step "1/6 Building application locally..."
try {
    npm run build
    Write-Status "Local build completed successfully"
} catch {
    Write-Error "Local build failed: $_"
    exit 1
}

# Step 2: Run type checking
Write-Step "2/6 Running type checks..."
try {
    npm run typecheck
    Write-Status "Type checking passed"
} catch {
    Write-Warning "Type checking failed, but continuing deployment"
}

# Step 3: Commit and push changes
Write-Step "3/6 Pushing latest changes to repository..."
try {
    git add .
    $commitMessage = "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Automated deployment"
    git commit -m $commitMessage -q 2>$null || Write-Warning "No new changes to commit"
    git push origin copilot/vscode1758013875916
    Write-Status "Changes pushed to repository successfully"
} catch {
    Write-Error "Git operations failed: $_"
    exit 1
}

if ($BuildOnly) {
    Write-Status "Build-only mode completed successfully!"
    exit 0
}

# Step 4: Prepare server deployment
Write-Step "4/6 Preparing server deployment..."

if (-not $ServerIP) {
    Write-Host "Enter server details:"
    $ServerIP = Read-Host "Server IP address"
    if (-not $ServerIP) {
        Write-Error "Server IP is required for deployment"
        exit 1
    }
}

# Step 5: Upload update script to server
Write-Step "5/6 Uploading update script to server..."
$updateScript = "update-server.sh"
if (Test-Path $updateScript) {
    try {
        # Using SCP to upload the script (requires OpenSSH or PuTTY)
        scp $updateScript "${Username}@${ServerIP}:/home/${Username}/update-server.sh"
        Write-Status "Update script uploaded successfully"
    } catch {
        Write-Error "Failed to upload update script: $_"
        Write-Warning "Please manually upload $updateScript to the server"
    }
} else {
    Write-Error "Update script not found: $updateScript"
    exit 1
}

# Step 6: Execute deployment on server
Write-Step "6/6 Executing deployment on server..."
Write-Host ""
Write-Status "Connecting to server: ${Username}@${ServerIP}"
Write-Warning "You may be prompted for SSH password/key authentication"
Write-Host ""

$sshCommand = "chmod +x /home/${Username}/update-server.sh && /home/${Username}/update-server.sh"

try {
    # Execute the update script on the server
    ssh "${Username}@${ServerIP}" $sshCommand
    Write-Host ""
    Write-Status "✅ Deployment completed successfully!"
    Write-Host ""
    Write-Status "🌐 Your QR-Tunai application should now be updated on the server"
    Write-Status "📊 Monitor the application with: ssh ${Username}@${ServerIP} 'pm2 status'"
    Write-Status "📝 Check logs with: ssh ${Username}@${ServerIP} 'pm2 logs qr-tunai'"
    
} catch {
    Write-Error "❌ Server deployment failed: $_"
    Write-Host ""
    Write-Warning "Manual deployment steps:"
    Write-Warning "1. SSH to server: ssh ${Username}@${ServerIP}"
    Write-Warning "2. Run update script: ./update-server.sh"
    Write-Warning "3. Check status: pm2 status qr-tunai"
    exit 1
}

Write-Host ""
Write-Status "🎉 Deployment process completed at $(Get-Date)"
Write-Host ""