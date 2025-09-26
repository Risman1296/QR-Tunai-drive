Param(
    [string]$BatchPath = "C:\Projects\QR-Tunai-drive\cloudflared-start-drive.bat"
)

if (-not (Test-Path $BatchPath)) {
    Write-Error "Batch file not found at: $BatchPath`nPlease create or adjust the path and try again."
    exit 1
}

try {
    $WshShell = New-Object -ComObject WScript.Shell
    $startup = [Environment]::GetFolderPath('Startup')
    $shortcutName = 'cloudflared-start-drive.lnk'
    $shortcutPath = Join-Path $startup $shortcutName

    $shortcut = $WshShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $BatchPath
    $shortcut.WorkingDirectory = Split-Path $BatchPath -Parent
    $shortcut.WindowStyle = 7 # minimized
    $shortcut.Description = 'Start Cloudflared tunnels for QR-Tunai-drive and ADK-apps'
    $shortcut.Save()

    Write-Output "Shortcut created at: $shortcutPath"
}
catch {
    Write-Error "Failed to create shortcut: $_"
    exit 1
}
