# BRIAPI Realtime Configuration

Panduan ini menjelaskan cara mengaktifkan integrasi saldo & mutasi realtime Bank BRI di QR-Tunai Drive.

## 1. Kredensial yang Dibutuhkan
- **Client ID** dan **Client Secret** dari portal BRIAPI.
- **Signature Key / API Secret** (kunci HMAC) untuk header `X-Signature`.
- **Partner ID** (umumnya sama dengan Client ID, atau kode institusi yang diberikan BRI).
- Whitelisting IP untuk server produksi dan URL callback jika diperlukan.

## 2. Variabel Lingkungan
Set nilai berikut di `.env.local` atau `.env.production`:
```
BRI_BASE_URL=https://sandbox.partner.api.bri.co.id
BRI_CLIENT_ID=<client_id>
BRI_CLIENT_SECRET=<client_secret>
BRI_API_SECRET=<signature_key>
BRI_PARTNER_ID=<partner_or_institution_id>
BRI_TOKEN_PATH=/oauth/client_credential/accesstoken
BRI_BALANCE_PATH=/v2/inquiry/{accountNumber}
BRI_TRANSACTIONS_PATH=/v2/accounts/{accountNumber}/transactions
```
> Untuk lingkungan produksi ganti `sandbox.partner.api.bri.co.id` dengan base URL production dari BRIAPI.

## 3. Konfigurasi Dashboard
1. Masuk ke *Dashboard → Pengaturan Pembayaran → Integrasi Bank*.
2. Tambah integrasi baru dengan penyedia **"BRIAPI Realtime (Saldo & Mutasi)"**.
3. Isi kredensial sesuai variabel di atas. Path dapat disesuaikan bila BRI mengubah versi endpoint.
4. Hubungkan rekening BRI di *Konfigurasi Pembayaran → Rekening Bank* dengan `integrationId` `bri-realtime`.

## 4. Alur Permintaan API
1. Server mengambil akses token menggunakan OAuth Client Credentials ke `BRI_TOKEN_PATH`.
2. Header yang umum untuk produk Informasi Rekening v2 (BRI-style):
   - `Authorization: Bearer <access_token>`
   - `BRI-Timestamp: <ISO8601 UTC>`
   - `BRI-Signature: <HMAC-SHA256>` (encoding biasanya hex 64 karakter)
   - `X-Partner-Id: <BRI_PARTNER_ID>` dan `X-External-Id: <UUID>` dapat tetap dikirim bila diminta oleh kanal Anda.
3. String to sign (mode 'payload'):
   - `path=<PATH_TANPA_QUERY>&verb=<METHOD>&token=Bearer <TOKEN>&timestamp=<ISO8601Z>&body=<RAW_BODY>`
   - Untuk request `GET` tanpa body, `body` dikosongkan.

## 5. Response & Parsing
- Response saldo akan dicari pada field `data.balance`, `data.availableBalance`, atau `balance`.
- Response mutasi diteruskan apa adanya; parsing tambahan dapat dilakukan di UI sesuai kebutuhan payload terbaru BRIAPI.

## 6. Sandbox vs Production Checklist
- Update base URL serta partner IP whitelist.
- Pastikan timestamp server sinkron (gunakan NTP).
- Lakukan uji coba token kadaluwarsa, request dengan signature salah, dan batas waktu (timeout) sebelum go-live.

## 7. Kompatibilitas Header & Signature (Opsional)
Aplikasi ini mendukung beberapa variasi melalui metadata pada integrasi (Dashboard atau `payment-configuration.json`):
- `tokenAuth`: `basic` atau `form`
- `signatureFormat`: `colon` atau `payload`
- `headersStyle`: `x` (X-*) atau `bri` (BRI-*)
- `signatureEncoding`: `base64` atau `hex`

Contoh metadata rekomendasi untuk Informasi Rekening v2:
```
"metadata": {
  "timestampSkewSeconds": 300,
  "useUtcTimestamp": true,
  "tokenAuth": "form",
  "signatureFormat": "payload",
  "headersStyle": "bri",
  "signatureEncoding": "hex"
}
```

Dokumen ini melengkapi konfigurasi default `payment-configuration.json` yang sudah menambahkan template rekening & integrasi BRI.
