import Link from 'next/link';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QrPlaceholder = () => (
  <svg
    role="img"
    aria-label="QR Code"
    className="rounded-lg"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M 10,10 H 40 V 40 H 10 Z M 20,20 H 30 V 30 H 20 Z M 60,10 H 90 V 40 H 60 Z M 70,20 H 80 V 30 H 70 Z M 10,60 H 40 V 90 H 10 Z M 20,70 H 30 V 80 H 20 Z M 60,60 H 70 V 70 H 60 Z M 70,60 H 80 V 70 H 70 Z M 60,70 H 70 V 80 H 60 Z M 70,70 H 80 V 80 H 70 Z M 80,70 H 90 V 80 H 80 Z M 60,80 H 70 V 90 H 60 Z M 70,80 H 80 V 90 H 70 Z M 80,80 H 90 V 90 H 80 Z M 10,40 H 20 V 50 H 10 Z M 40,10 H 50 V 20 H 40 Z M 40,40 H 50 V 50 H 40 Z M 50,40 H 60 V 50 H 50 Z M 40,50 H 50 V 60 H 40 Z M 50,50 H 60 V 60 H 50 Z"
    />
  </svg>
);

export default function QrPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary">Pindai Untuk Transaksi</h1>
        <p className="text-lg text-muted-foreground mt-2">Arahkan kamera Anda ke QR code di bawah ini.</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-2xl">
        <Link href="/transaction">
          <div className="w-64 h-64 md:w-80 md:h-80 text-gray-900">
            <QrPlaceholder />
          </div>
        </Link>
      </div>
      <p className="mt-8 text-sm text-muted-foreground animate-pulse">
        QR code dinamis, berlaku untuk satu kali transaksi.
      </p>
      <Button variant="link" className="mt-4 text-white" asChild>
        <Link href="/">Kembali ke Halaman Utama</Link>
      </Button>
    </div>
  );
}
