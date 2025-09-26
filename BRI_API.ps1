# BRI API PowerShell Script untuk Saldo dan Mutasi
# Author: Assistant
# Date: 2025

# ========== KONFIGURASI ==========
param(
    [Parameter(Mandatory=$true)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$true)]
    [string]$ClientSecret,
    
    [Parameter(Mandatory=$true)]
    [string]$AccountNumber,
    
    [string]$FromDate = (Get-Date).AddDays(-30).ToString("yyyy-MM-ddT00:00:00"),
    [string]$ToDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
)

# Consumer Key dan Secret (sudah disediakan)
$ConsumerKey = "pQE47pgdC8KVQvV7Y4ai8Olc2AUQXa8k"
$ConsumerSecret = "ZW4sKgc4GkbcvjYx"

# URL Base (Sandbox)
$BaseUrl = "https://sandbox.partner.api.bri.co.id"
$InstitutionCode = "J104408"

# ========== FUNGSI HELPER ==========

function Get-Timestamp {
    return [DateTimeOffset]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

function Generate-Signature {
    param(
        [string]$HttpMethod,
        [string]$RelativeUrl,
        [string]$AccessToken,
        [string]$RequestBody,
        [string]$Timestamp
    )
    
    $StringToSign = "$HttpMethod$RelativeUrl$AccessToken$RequestBody$Timestamp"
    
    $hmacsha256 = New-Object System.Security.Cryptography.HMACSHA256
    $hmacsha256.Key = [System.Text.Encoding]::UTF8.GetBytes($ConsumerSecret)
    $signature = $hmacsha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($StringToSign))
    
    return [System.Convert]::ToBase64String($signature)
}

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# ========== STEP 1: DAPATKAN ACCESS TOKEN ==========

Write-ColorOutput "🔐 Mendapatkan Access Token..." "Yellow"

try {
    $tokenUrl = $BaseUrl + "/oauth/client_credential/accesstoken?grant_type=client_credentials"
    $tokenBody = @{
        client_id = $ClientId
        client_secret = $ClientSecret
    }
    
    $tokenResponse = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $tokenBody -ContentType "application/x-www-form-urlencoded"
    
    $accessToken = $tokenResponse.access_token
    Write-ColorOutput "✅ Access Token berhasil didapat" "Green"
    Write-ColorOutput ("Token: " + $accessToken.Substring(0,20) + "...") "Gray"
    
} catch {
    Write-ColorOutput ("❌ Error mendapatkan access token: " + $_.Exception.Message) "Red"
    exit 1
}

# ========== STEP 2: CEK SALDO ==========

Write-ColorOutput "`n💰 Mengecek Saldo Rekening..." "Yellow"

try {
    $timestamp = Get-Timestamp
    $relativeUrl = "/v1/account/inquiry"
    $requestBody = @{
        institutionCode = $InstitutionCode
        beneficiaryAccountNo = $AccountNumber
    } | ConvertTo-Json -Compress
    
    $signature = Generate-Signature -HttpMethod "POST" -RelativeUrl $relativeUrl -AccessToken $accessToken -RequestBody $requestBody -Timestamp $timestamp
    
    $headers = @{
        "Authorization" = "Bearer " + $accessToken
        "BRI-Timestamp" = $timestamp
        "BRI-Signature" = $signature
        "Content-Type" = "application/json"
    }
    
    $balanceResponse = Invoke-RestMethod -Uri ($BaseUrl + $relativeUrl) -Method Post -Headers $headers -Body $requestBody
    
    Write-ColorOutput "✅ Saldo berhasil diambil" "Green"
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    Write-ColorOutput "📊 INFORMASI SALDO" "Cyan"
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    
    if ($balanceResponse.data) {
        Write-ColorOutput ("Nomor Rekening  : " + $balanceResponse.data.beneficiaryAccountNo) "White"
        Write-ColorOutput ("Nama Nasabah    : " + $balanceResponse.data.beneficiaryAccountName) "White"
        Write-ColorOutput ("Saldo           : Rp " + $balanceResponse.data.accountBalance) "Green"
    }
    Write-ColorOutput ("Status          : " + $balanceResponse.responseCode + " - " + $balanceResponse.responseMessage) "White"
    
} catch {
    Write-ColorOutput ("❌ Error mengecek saldo: " + $_.Exception.Message) "Red"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-ColorOutput ("Response: " + $responseBody) "Gray"
    }
}

# ========== STEP 3: AMBIL MUTASI ==========

Write-ColorOutput "`n📋 Mengambil Mutasi Rekening..." "Yellow"
Write-ColorOutput ("Periode: " + $FromDate + " s/d " + $ToDate) "Gray"

try {
    $timestamp = Get-Timestamp
    $relativeUrl = "/v1/account/statement"
    $requestBody = @{
        institutionCode = $InstitutionCode
        beneficiaryAccountNo = $AccountNumber
        fromDateTime = $FromDate
        toDateTime = $ToDate
    } | ConvertTo-Json -Compress
    
    $signature = Generate-Signature -HttpMethod "POST" -RelativeUrl $relativeUrl -AccessToken $accessToken -RequestBody $requestBody -Timestamp $timestamp
    
    $headers = @{
        "Authorization" = "Bearer " + $accessToken
        "BRI-Timestamp" = $timestamp
        "BRI-Signature" = $signature
        "Content-Type" = "application/json"
    }
    
    $statementResponse = Invoke-RestMethod -Uri ($BaseUrl + $relativeUrl) -Method Post -Headers $headers -Body $requestBody
    
    Write-ColorOutput "✅ Mutasi berhasil diambil" "Green"
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    Write-ColorOutput "📋 MUTASI REKENING" "Cyan"
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" "Cyan"
    
    if ($statementResponse.data -and $statementResponse.data.Length -gt 0) {
        foreach ($transaction in $statementResponse.data) {
            Write-ColorOutput ("`nTanggal    : " + $transaction.transactionDate) "White"
            Write-ColorOutput ("Deskripsi  : " + $transaction.transactionDescription) "White"
            Write-ColorOutput ("Referensi  : " + $transaction.referenceNo) "White"
            Write-ColorOutput ("Debet      : Rp " + $transaction.debitAmount) "Red"
            Write-ColorOutput ("Kredit     : Rp " + $transaction.creditAmount) "Green"
            Write-ColorOutput ("Saldo      : Rp " + $transaction.balance) "Yellow"
            Write-ColorOutput "────────────────────────────────────────" "Gray"
        }
        
        Write-ColorOutput ("`n📊 Total Transaksi: " + $statementResponse.data.Length) "Cyan"
    } else {
        Write-ColorOutput "Tidak ada transaksi dalam periode tersebut" "Gray"
    }
    
} catch {
    Write-ColorOutput ("❌ Error mengambil mutasi: " + $_.Exception.Message) "Red"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-ColorOutput ("Response: " + $responseBody) "Gray"
    }
}

Write-ColorOutput "`n✅ Script selesai dijalankan" "Green"

# ========== EXPORT KE FILE (OPSIONAL) ==========

$exportChoice = Read-Host "`nApakah Anda ingin export hasil ke file JSON? (y/n)"
if ($exportChoice -eq "y" -or $exportChoice -eq "Y") {
    $exportData = @{
        timestamp = Get-Date
        account = $AccountNumber
        balance = $balanceResponse
        statement = $statementResponse
    }
    
    $dateStr = Get-Date -Format "yyyyMMdd_HHmmss"
    $filename = "BRI_Statement_" + $dateStr + ".json"
    $exportData | ConvertTo-Json -Depth 10 | Out-File $filename -Encoding UTF8
    Write-ColorOutput ("📄 Data berhasil di-export ke: " + $filename) "Green"
}