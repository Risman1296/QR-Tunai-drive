# QR-Tunai Deployment Snapshot

## Status

- ✅ Build verified with `npm run build`
- ⚠️ Static export to Cloudflare Pages still blocked by dynamic API routes
- 🚀 Ready for manual deploy via Cloudflare Pages dashboard (Git-connected)

## Project Settings

- **Cloudflare Pages project**: `qr-tunai-app`
- **Repository**: `Risman1296/QR-Tunai-drive`
- **Branch**: `copilot/vscode1758013875916`
- **Build command**: `npm run build`
- **Output directory**: `.next`

## Required Environment Variables

```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
ENABLE_WIFI_AUTOMATION=false
START_WIFI_AUTOMATION=false
```

## Deploy Steps (Cloudflare Pages)

1. Buka <https://dash.cloudflare.com/pages> dan login.
2. Pilih **Create a project → Connect to Git**.
3. Pilih repo **QR-Tunai-drive** dan branch `copilot/vscode1758013875916`.
4. Isi build command dan output directory seperti di atas.
5. Tambahkan environment variables.
6. Klik **Save and Deploy**, tunggu ±5 menit sampai live di `https://qr-tunai-app.pages.dev`.

## Notes

- Build standar Next.js (standalone) sukses, cocok untuk deployment server tradisional.
- Static export (`output: export`) gagal untuk beberapa API dinamis (`/api/banks/[integrationId]/transactions`, dll); perlu refactor jika ingin pure static.
- Script bantu: `setup-cloudflare.ps1` dan `go-live.ps1` menampilkan data & membuka dashboard otomatis.

## Next Actions

- [ ] Lanjutkan integrasi Workers/Pages Functions untuk API dinamis (opsional).
- [ ] Tambah domain custom jika diperlukan.
- [ ] Pantau build pertama; jika gagal, periksa log di Cloudflare dashboard.
