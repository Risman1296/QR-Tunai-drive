# Cloudflared Windows Quickstart

Gunakan panduan ini untuk menghubungkan layanan QR-Tunai Drive ke Cloudflare Tunnel di Windows 11.

## 1. Prasyarat
- Sudah memiliki tunnel di Cloudflare (mis. `qr-tunai-drive`).
- File kredensial JSON tersimpan di `C:\Users\<USERNAME>\.cloudflared\qr-tunai-drive.json`.
- `cloudflared.exe` terpasang di `C:\Program Files\Cloudflare\cloudflared.exe` atau `C:\cloudflared\cloudflared.exe`.

## 2. Konfigurasi
Edit file `.cloudflared\config.yml` (disediakan di repo) agar hostname dan path kredensial sesuai. Contoh:

```
tunnel: qr-tunai-drive
credentials-file: C:\Users\<USERNAME>\.cloudflared\qr-tunai-drive.json

ingress:
  - hostname: app.adikaraproperti.site
    service: http://localhost:4000
  - hostname: drive.adikaraproperti.site
    service: http://localhost:3000
  - service: http_status:404
```

## 3. Menjalankan Tunnel
Gunakan batch `cloudflared-start-drive.bat`:

```powershell
& "C:\Projects\QR-Tunai-drive\cloudflared-start-drive.bat"
```

Script akan:
1. Mencari `cloudflared.exe` di `Program Files`, fallback ke `C:\cloudflared`.
2. Memakai config `.cloudflared\config.yml`.
3. Menjalankan perintah `cloudflared tunnel --config <path> run` secara minimised.

## 4. Otomatis Saat Startup
- Tekan `Win + R`, ketik `shell:startup`, tekan Enter.
- Buat shortcut ke `cloudflared-start-drive.bat` di folder Startup.

## 5. Troubleshooting
- Jika hostname belum resolve, pastikan DNS record di dashboard Cloudflare diarahkan ke tunnel.
- Jika port lokal berubah, update `service: http://localhost:<port>` pada config.
- Gunakan `cloudflared tunnel info qr-tunai-drive` untuk memeriksa status tunnel.

Dokumentasi tambahan: lihat `server-docs/CLOUDFLARE-PAGES.md` untuk skenario Pages.
