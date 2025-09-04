'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  QrCode,
  ArrowLeft,
  Copy,
  Expand,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateQrCode, GenerateQrCodeOutput } from '@/ai/flows/qr-code-flow';
import { useToast } from '@/hooks/use-toast';

const QR_ROTATION_TTL = 120; // in seconds

export default function QrPage() {
  const [qrData, setQrData] = useState<GenerateQrCodeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timer, setTimer] = useState(QR_ROTATION_TTL);
  const { toast } = useToast();

  const fetchQrCode = useCallback(async () => {
    setIsLoading(true);
    setTimer(QR_ROTATION_TTL);
    try {
      const baseUrl = window.location.origin;
      const response = await generateQrCode({ baseUrl });
      setQrData(response);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQrData(null);
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat QR Code',
        description: 'Terjadi kesalahan saat mencoba membuat QR code baru.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQrCode();
  }, [fetchQrCode]);

  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          fetchQrCode();
          return QR_ROTATION_TTL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading, fetchQrCode]);

  const handleCopy = () => {
    if (qrData?.transactionUrl) {
      navigator.clipboard
        .writeText(qrData.transactionUrl)
        .then(() => {
          toast({
            title: 'Disalin!',
            description: 'Link transaksi telah disalin ke clipboard.',
          });
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
          toast({
            variant: 'destructive',
            title: 'Gagal menyalin',
            description: 'Gagal menyalin link ke clipboard.',
          });
        });
    }
  };
  
  const handleFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };


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

      <div className="text-center mb-8 max-w-xl">
        <QrCode className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold">Pindai Untuk Memulai</h1>
        <p className="text-lg text-muted-foreground mt-3">
          Arahkan kamera ke QR code di bawah ini. Kode ini unik dan hanya untuk
          satu kali transaksi.
        </p>
      </div>

      <div className="relative bg-white p-6 rounded-2xl shadow-2xl ring-4 ring-offset-4 ring-primary ring-offset-background">
        {isLoading || !qrData ? (
          <div className="w-64 h-64 md:w-80 md:h-80 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Membuat QR Code...
            </p>
          </div>
        ) : (
          <Link
            href={qrData.transactionUrl}
            aria-label="Mulai Transaksi"
            target="_blank"
          >
            <Image
              src={qrData.qrCodeDataUrl}
              alt="Dynamic QR Code for transaction"
              width={320}
              height={320}
              className="rounded-lg"
              priority
            />
          </Link>
        )}
      </div>

      <div className="mt-8 text-sm text-muted-foreground text-center max-w-md">
        <p className="font-mono break-all p-2 bg-muted rounded-md">{qrData?.transactionUrl || 'Memuat link...'}</p>
        <p className="mt-4">
          QR code akan diperbarui dalam{' '}
          <span className="font-bold text-primary">{timer}</span> detik.
          <br />
          Jika kamera gagal memindai, salin link di atas.
        </p>
      </div>
      
      <div className="mt-6 flex items-center gap-4">
        <Button variant="outline" onClick={fetchQrCode} disabled={isLoading}>
          <RefreshCw className={isLoading ? 'animate-spin' : ''} />
          Ganti Kode
        </Button>
        <Button variant="outline" onClick={handleCopy} disabled={!qrData}>
          <Copy />
          Salin Link
        </Button>
        <Button variant="outline" onClick={handleFullScreen}>
          <Expand />
          Layar Penuh
        </Button>
      </div>
    </div>
  );
}
