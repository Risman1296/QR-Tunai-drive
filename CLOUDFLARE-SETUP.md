# QR-Tunai - Cloudflare Pages Setup Guide

## Setup Otomatis via Cloudflare Dashboard

### Langkah 1: Persiapan Repository
✅ Repository QR-Tunai-drive sudah ready
✅ Dependencies sudah terinstall
✅ Build script tersedia di package.json

### Langkah 2: Deploy ke Cloudflare Pages via Dashboard

1. **Login ke Cloudflare Dashboard**
   - Buka: https://dash.cloudflare.com/pages
   - Login dengan akun Cloudflare Anda

2. **Connect Repository**
   - Klik "Create a project"
   - Pilih "Connect to Git"
   - Authorize GitHub jika belum
   - Pilih repository: `QR-Tunai-drive`

3. **Build Settings**
   ```
   Project Name: qr-tunai-app
   Branch: copilot/vscode1758013875916
   Build Command: npm run build
   Output Directory: .next
   Root Directory: (leave blank)
   ```

4. **Environment Variables**
   ```
   NODE_ENV=production
   NEXT_TELEMETRY_DISABLED=1
   ENABLE_WIFI_AUTOMATION=false
   START_WIFI_AUTOMATION=false
   ```

5. **Deploy**
   - Klik "Save and Deploy"
   - Tunggu build process selesai (3-5 menit)

### Langkah 3: Custom Domain (Opsional)
- Bisa tambahkan custom domain di Pages settings
- Setup DNS record di Cloudflare

### Hasil:
- Frontend akan tersedia di: `https://qr-tunai-app.pages.dev`
- Auto-deploy tiap push ke branch
- Free SSL certificate
- Global CDN

### Catatan Penting:
- API routes mungkin perlu adjustment untuk serverless
- Database connections perlu environment variables
- File system operations tidak didukung
- Static files optimal untuk performance

### Troubleshooting:
Jika ada error, coba:
1. Set output: 'export' di next.config.ts untuk static site
2. Disable API routes yang complex
3. Gunakan environment variables untuk konfigurasi