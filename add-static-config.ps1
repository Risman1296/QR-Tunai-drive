# Script untuk menambahkan force-static config ke semua API routes
# Ini akan memungkinkan static export untuk Cloudflare Pages

$apiDir = "C:\Projects\QR-Tunai-drive\src\app\api"
$forceStaticConfig = @"
// Force static export untuk Cloudflare Pages
export const dynamic = 'force-static';
export const revalidate = 0;

"@

Write-Host "Menambahkan force-static config ke API routes..." -ForegroundColor Green

Get-ChildItem -Path $apiDir -Recurse -Filter "route.ts" | ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content $filePath -Raw
    
    # Cek apakah sudah ada force-static config
    if ($content -notmatch "export const dynamic") {
        # Cari posisi setelah import statements
        $lines = Get-Content $filePath
        $insertIndex = 0
        
        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match "^import" -or $lines[$i] -match "^\/\*" -or $lines[$i] -match "^\s*$") {
                $insertIndex = $i + 1
            }
            else {
                break
            }
        }
        
        # Insert force-static config
        $newLines = @()
        $newLines += $lines[0..($insertIndex - 1)]
        $newLines += ""
        $newLines += "// Force static export untuk Cloudflare Pages"
        $newLines += "export const dynamic = 'force-static';"
        $newLines += "export const revalidate = 0;"
        $newLines += ""
        $newLines += $lines[$insertIndex..($lines.Length - 1)]
        
        $newLines | Out-File $filePath -Encoding UTF8
        Write-Host "Updated: $($_.Name)" -ForegroundColor Yellow
    }
}

Write-Host "Selesai! Semua API routes sudah dikonfigurasi untuk static export." -ForegroundColor Green