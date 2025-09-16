# QRTunai Drive-Thru Backend

## Struktur Direktori

- `/public` — file statis (logo, foto, dsb)
- `/src/routes` — routing Express
- `/src/services` — logika bisnis, DB, dsb
- `/src/lib` — helper/utilitas
- `/src/views` — template (jika perlu)
- `/data` — upload/file bukti

## Setup

1. Copy `.env` dan sesuaikan kredensial
2. Jalankan migrasi DB: import `src/db_init.sql` ke MySQL/SQLite
3. Install dependensi: `npm install`
4. Jalankan server: `npm start`


## Endpoint Utama

### Publik
- `POST /api/qr` — generate QR token
- `POST /api/t/:id/notify-view` — bind session
- `GET /api/t/:id` — meta form transaksi
- `POST /api/t/:id/submit` — submit transaksi
- `GET /api/rt/:channel` — SSE status transaksi real-time
- `GET /status/:id` — status transaksi
- `GET /lokasi`, `/faq`, `/syarat-ketentuan` — info publik
- `POST /api/upload/evidence` — upload bukti transaksi

### Admin (wajib JWT)
- `GET /admin` — dashboard
- `GET /admin/transactions` — list transaksi
- `PATCH /admin/transactions/:txId` — update status transaksi
- `POST /admin/transactions/cancel-bulk` — bulk cancel
- `GET /admin/qr` — monitor QR
- `POST /admin/qr/force-rotate` — rotasi QR
- `GET /admin/settings`, `/admin/wifi`, `/admin/users`, `/admin/outlets`, `/admin/logs`, `/admin/reports`

### Autentikasi
- JWT di header `Authorization: Bearer <token>` untuk semua endpoint admin

## ENV Contoh

PORT=4000
DB_URL=mysql://user:pass@localhost:3306/qrtunai
JWT_SECRET=ubah_ini
QR_TTL_SECONDS=120
CSP_ORIGIN=https://app.domainkamu

## Deploy & Operasional

1. Import `src/db_init.sql` ke database (MySQL/SQLite)
2. Copy `.env` dan sesuaikan kredensial
3. Install dependensi: `npm install`
4. Jalankan server: `npm start`
5. Reverse proxy: gunakan Nginx sesuai contoh di blueprint
6. Backup DB & folder upload `/data` secara berkala

## Fitur MVP
- QR dinamis, form transaksi, status real-time (SSE)
- Dashboard admin, login, audit log
- Export CSV laporan harian (bisa dikembangkan)

## Catatan
- Untuk pengembangan lokal, gunakan SQLite atau MySQL lokal
- Pastikan variabel `.env` sesuai kebutuhan
