# Simpan sebagai create-dns-cloudflare.ps1 lalu jalankan
param(
    [string]$ZoneName = 'qr-drive.uk',
    [string]$TunnelId = '2c225e53-b004-4d1c-8b58-db803ae3245f'
)

# Prompt for token (secure) and convert to trimmed plain string
$secureToken = Read-Host -Prompt 'Masukkan Cloudflare API Token (Zone:DNS edit)' -AsSecureString
$ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
$plainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
$plainToken = $plainToken.Trim()

$headers = @{ Authorization = "Bearer $plainToken"; 'Content-Type' = 'application/json' }

# Quick verify token so we fail early with a clear message
try {
    $verify = Invoke-RestMethod -Method Get -Uri "https://api.cloudflare.com/client/v4/user/tokens/verify" -Headers $headers -ErrorAction Stop
    if ($verify.success) {
        Write-Output "Token verification: OK"
    }
    else {
        Write-Error "Token verification failed: $($verify.errors | ConvertTo-Json -Depth 5)"
        exit 1
    }
}
catch {
    Write-Error "Token verification error: $($_.Exception.Message)"
    exit 1
}

# Get Zone ID
try {
    $zone = Invoke-RestMethod -Method Get -Uri "https://api.cloudflare.com/client/v4/zones?name=$ZoneName" -Headers $headers -ErrorAction Stop
    if (-not $zone.success -or $zone.result.Count -eq 0) { Write-Error "Zone not found or token lacks permission"; exit 1 }
    $zoneId = $zone.result[0].id
    Write-Output "Zone ID: $zoneId"
}
catch {
    Write-Error "Failed to retrieve zone ID: $($_.Exception.Message)"
    exit 1
}

# Target value used by Cloudflare for tunnels:
$target = "tunnel-$TunnelId.cfargotunnel.com"

# Create/Update helper
function Upsert-Cname($name) {
    # Check existing
    $existing = Invoke-RestMethod -Method Get -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records?name=$name&type=CNAME" -Headers $headers
    if ($existing.success -and $existing.result.Count -gt 0) {
        $recId = $existing.result[0].id
        $body = @{ type = 'CNAME'; name = $name; content = $target; proxied = $true } | ConvertTo-Json
        $resp = Invoke-RestMethod -Method Put -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records/$recId" -Headers $headers -Body $body
        if ($resp.success) { Write-Output "Updated CNAME $name -> $target" } else { Write-Error "Failed update ${name}: $($resp.errors | ConvertTo-Json)" }
    }
    else {
        $body = @{ type = 'CNAME'; name = $name; content = $target; proxied = $true } | ConvertTo-Json
        $resp = Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" -Headers $headers -Body $body
        if ($resp.success) { Write-Output "Created CNAME $name -> $target" } else { Write-Error "Failed create ${name}: $($resp.errors | ConvertTo-Json)" }
    }
}

Upsert-Cname $ZoneName
Upsert-Cname "app.$ZoneName"

# cleanup plain token in memory
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)