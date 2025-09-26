# QR Display System - Dokumentasi

## Overview
Sistem QR Display adalah komponen yang dirancang khusus untuk menampilkan QR code pada monitor/TV besar di drive-thru Bank Terdepan. Sistem ini menyediakan tampilan profesional dengan auto-refresh, countdown timer, dan kontrol panel yang lengkap.

## Fitur Utama

### 1. QR Display Screen (`/src/components/qr-display-screen.tsx`)
- **Auto-refresh QR code** dengan interval yang dapat dikustomisasi
- **Countdown timer** yang menunjukkan sisa waktu sebelum QR expired
- **Branding Bank Terdepan** dengan gradient biru profesional
- **Service status indicators** (WiFi, System, Security)
- **Responsive design** untuk berbagai ukuran layar
- **Auto-refresh functionality** dengan interval 60 detik default

#### Key Features:
```tsx
- QR Code rendering dengan QRCodeSVG
- Countdown timer dengan update setiap detik
- Gradient background profesional
- Service status badges
- Tombol manual refresh
```

### 2. QR Display Control Panel (`/src/app/qr-display/page.tsx`)
Halaman kontrol untuk mengelola tampilan QR display:

#### Dashboard Mode Features:
- **Real-time statistics** (scans hari ini, QR aktif, transaksi berhasil)
- **QR Preview** dengan informasi detail
- **Settings panel** untuk konfigurasi display
- **Recent activity** monitoring
- **Switch ke fullscreen mode**

#### Settings yang tersedia:
- Auto Refresh Interval (30s, 60s, 2m, 5m)
- QR Expiration Time (1m, 2m, 5m)
- Display Theme (Bank Terdepan, Modern Blue, Classic)
- Sound Effects toggle

### 3. API Endpoints

#### `/api/qr/stats` - Statistics API
```typescript
GET /api/qr/stats
Response: {
  todayScans: number,
  activeQRs: number,
  successfulTransactions: number
}
```

## Cara Penggunaan

### 1. Akses Control Panel
- Buka: `http://localhost:3000/qr-display`
- Dashboard menampilkan statistik dan kontrol

### 2. Mode Fullscreen Display
- Klik "Tampilan Layar Penuh" atau langsung akses mode fullscreen
- QR akan auto-refresh setiap 60 detik
- Countdown timer menunjukkan sisa waktu
- Tombol Settings di pojok kanan atas untuk kembali ke dashboard

### 3. Generate QR Baru
- Klik "Generate Baru" untuk membuat QR code baru
- QR otomatis ter-refresh setiap interval yang ditentukan
- QR memiliki expiration time default 1 menit

## Struktur File

```
src/
├── app/
│   ├── qr-display/
│   │   └── page.tsx                 # Control panel utama
│   └── api/
│       └── qr/
│           └── stats/
│               └── route.ts         # API statistics
└── components/
    └── qr-display-screen.tsx        # Komponen tampilan QR fullscreen
```

## Teknologi

### Frontend:
- **Next.js 15.5.3** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Lucide Icons** - Icon system
- **qrcode.react** - QR code generation

### Features:
- **Server-side rendering** untuk performa optimal
- **Real-time updates** dengan useEffect hooks
- **Responsive design** untuk berbagai device
- **Professional branding** sesuai Bank Terdepan

## Konfigurasi

### Default Settings:
```typescript
const defaultConfig = {
  autoRefresh: true,
  refreshInterval: 60000,    // 60 seconds
  expirationTime: 60,        // 1 minute
  theme: 'bank',            // Bank Terdepan theme
  soundEffects: false
};
```

### Customization:
Pengaturan dapat diubah melalui control panel atau dengan modifikasi langsung di komponen.

## API Integration

### QR Generation:
```typescript
const response = await fetch('/api/qr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    type: 'display',
    displayMode: true
  })
});
```

### Stats Fetching:
```typescript
const response = await fetch('/api/qr/stats');
const stats = await response.json();
```

## Deployment

### Development:
```bash
npm run dev
# Server akan berjalan di http://localhost:3000
# Akses QR Display di http://localhost:3000/qr-display
```

### Production:
```bash
npm run build
npm start
```

## Use Cases

### 1. Drive-Thru Banking
- Tampilkan QR pada monitor besar untuk customer
- Auto-refresh memastikan QR selalu fresh
- Countdown timer memberikan urgensi untuk customer

### 2. Branch Display
- Tampilkan di lobby atau counter
- Statistics real-time untuk monitoring
- Professional branding meningkatkan trust

### 3. Mobile Integration
- QR dapat dipindai dari aplikasi mobile banking
- Link ke form transaksi yang sudah dioptimasi
- Seamless user experience

## Security Features

1. **QR Expiration** - QR otomatis expired setelah waktu yang ditentukan
2. **Token-based** - Setiap QR menggunakan unique token
3. **Auto-refresh** - Mengurangi risiko QR yang lama dipindai
4. **Service monitoring** - Status indicators untuk keamanan sistem

## Monitoring & Analytics

### Real-time Statistics:
- Jumlah scan hari ini
- QR code yang sedang aktif
- Transaksi berhasil
- Recent activity log

### Performance Monitoring:
- Auto-refresh status
- System health indicators
- Connection status (WiFi, System, Security)

## Troubleshooting

### Common Issues:

1. **QR tidak muncul**
   - Check API endpoint `/api/qr`
   - Verify qrcode.react dependency
   - Check browser console for errors

2. **Auto-refresh tidak berfungsi**
   - Check interval settings
   - Verify useEffect dependencies
   - Check network connectivity

3. **Countdown timer tidak akurat**
   - Check system clock
   - Verify expiration time calculation
   - Check setInterval implementation

### Debug Mode:
Gunakan browser developer tools untuk monitoring:
- Network tab untuk API calls
- Console untuk error messages
- Elements tab untuk styling issues

## Future Enhancements

### Planned Features:
1. **Multi-theme support** - Lebih banyak pilihan tema
2. **Sound notifications** - Audio feedback untuk scan
3. **Analytics dashboard** - Detailed usage statistics
4. **Remote management** - Control dari dashboard admin
5. **Multi-display support** - Manage beberapa display sekaligus
6. **Offline mode** - Fallback ketika koneksi terputus

### Integration Possibilities:
1. **Payment gateway** - Integrasi dengan sistem payment
2. **CRM system** - Link dengan customer management
3. **Branch management** - Integrasi dengan sistem cabang
4. **Mobile app** - Deep integration dengan mobile banking

## Kesimpulan

Sistem QR Display telah dirancang dengan fokus pada:
- **User Experience** - Interface yang intuitif dan professional
- **Reliability** - Auto-refresh dan error handling
- **Scalability** - Dapat diperluas untuk multiple displays
- **Maintainability** - Code yang terstruktur dan terdokumentasi
- **Security** - Token-based dengan expiration time
- **Performance** - Optimasi untuk tampilan real-time

Sistem ini siap untuk deployment di lingkungan production dan dapat disesuaikan dengan kebutuhan spesifik Bank Terdepan.