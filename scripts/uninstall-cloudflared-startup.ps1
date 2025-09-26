Param(
    [string]$ShortcutName = 'cloudflared-start-drive.lnk'
)

$startup = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startup $ShortcutName

if (Test-Path $shortcutPath) {
    Remove-Item $shortcutPath -Force
    Write-Output "Shortcut removed: $shortcutPath"
}
else {
    Write-Output "Shortcut not found at: $shortcutPath"
}
