import Link from 'next/link';
import { QrCode, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RealQrCode = () => (
    <svg
        role="img"
        aria-label="QR Code"
        className="rounded-lg"
        viewBox="0 0 108 108"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
    >
        <path d="M0 0h36v36H0zM12 12h12v12H12zM72 0h36v36H72zM84 12h12v12H84zM0 72h36v36H0zM12 84h12v12H12zM80 76h4v4h-4zM92 76h4v4h-4zM76 80h4v4h-4zM84 80h4v4h-4zM100 80h4v4h-4zM76 84h4v4h-4zM96 84h4v4h-4zM80 88h4v4h-4zM92 88h4v4h-4zM80 92h4v4h-4zM88 92h4v4h-4zM76 96h4v4h-4zM84 96h4v4h-4zM100 96h4v4h-4zM40 0h8v4h-8zM52 0h4v4h-4zM60 0h8v4h-8zM40 4h4v4h-4zM48 4h4v4h-4zM56 4h4v4h-4zM68 4h4v4h-4zM44 8h8v4h-8zM60 8h4v4h-4zM40 12h4v4h-4zM48 12h4v4h-4zM56 12h4v4h-4zM64 12h4v4h-4zM44 16h4v4h-4zM52 16h8v4h-8zM40 20h8v4h-8zM52 20h4v4h-4zM60 20h8v4h-8zM40 24h4v4h-4zM48 24h4v4h-4zM56 24h4v4h-4zM64 24h4v4h-4zM44 28h8v4h-8zM60 28h4v4h-4zM40 32h4v4h-4zM48 32h4v4h-4zM56 32h4v4h-4zM64 32h4v4h-4zM0 40h4v4H0zM8 40h4v4H8zM16 40h4v4h-4zM24 40h4v4h-4zM32 40h4v4h-4zM40 40h4v4h-4zM48 40h4v4h-4zM52 44h4v4h-4zM40 48h4v4h-4zM44 52h4v4h-4zM52 52h4v4h-4zM60 52h4v4h-4zM68 52h4v4h-4zM72 52h4v4h-4zM80 52h4v4h-4zM88 52h4v4h-4zM96 52h4v4h-4zM104 52h4v4h-4zM40 56h4v4h-4zM72 56h4v4h-4zM76 60h4v4h-4zM84 60h4v4h-4zM92 60h4v4h-4zM100 60h4v4h-4zM0 68h4v4H0zM8 68h4v4H8zM16 68h4v4h-4zM24 68h4v4h-4zM32 68h4v4h-4zM72 40h4v4h-4zM80 40h4v4h-4zM88 40h4v4h-4zM96 40h4v4h-4zM104 40h4v4h-4zM72 44h8v4h-8zM84 44h4v4h-4zM92 44h4v4h-4zM100 44h4v4h-4zM72 48h4v4h-4zM80 48h4v4h-4zM88 48h4v4h-4zM96 48h4v4h-4zM104 48h4v4h-4z" />
    </svg>
);


export default function QrPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="absolute top-4 left-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2" />
              Kembali
            </Link>
          </Button>
        </div>
      <div className="text-center mb-8 max-w-lg">
        <QrCode className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold">Pindai Untuk Memulai Transaksi</h1>
        <p className="text-lg text-muted-foreground mt-3">
          Arahkan kamera ponsel Anda ke QR code di bawah ini untuk mengisi formulir transaksi secara digital sebelum tiba di loket.
        </p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-2xl ring-4 ring-offset-4 ring-primary ring-offset-background">
        <Link href="/transaction" aria-label="Mulai Transaksi">
          <div className="w-64 h-64 md:w-80 md:h-80 text-gray-900">
            <RealQrCode />
          </div>
        </Link>
      </div>
      <p className="mt-8 text-sm text-muted-foreground animate-pulse">
        QR code ini akan mengarahkan Anda ke formulir transaksi.
      </p>
    </div>
  );
}
