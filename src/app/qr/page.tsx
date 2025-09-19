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
import { useToast } from '@/hooks/use-toast';

interface QRCodeData {
  qrCodeDataUrl: string;
  token: string;
  expiresAt: number;
  id: string;
  transactionUrl: string;
  expiresIn: number;
}

export default function QrPage() {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenStatus, setTokenStatus] = useState<'available' | 'accessed' | 'used'>('available');
  const { toast } = useToast();

  const fetchQrCode = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Generating new QR code (triggered by customer access)...');
      
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 50000,
          description: 'Drive-Thru Payment'
        })
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API Error:', errorData);
        throw new Error(`Server error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ API Response data:', {
        id: data.id,
        hasQrCode: !!data.qrCodeDataUrl,
        qrCodeLength: data.qrCodeDataUrl?.length,
        expiresIn: data.expiresIn
      });
      
      if (!data.qrCodeDataUrl) {
        console.error('❌ Missing qrCodeDataUrl in response:', data);
        throw new Error('QR code data not received from server');
      }

      if (!data.id) {
        console.error('❌ Missing ID in response:', data);
        throw new Error('Transaction ID not received from server');
      }
      
      setQrData(data);
      setTokenStatus('available');
      
      console.log('✅ QR code generated successfully');
    } catch (error) {
      console.error('❌ Error generating QR:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setQrData(null);
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat QR Code',
        description: `Terjadi kesalahan: ${errorMessage}`,
      });
      
      // Retry automatically after 5 seconds
      setTimeout(() => {
        console.log('🔄 Retrying QR generation...');
        fetchQrCode();
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Generate QR code automatically when page loads
  useEffect(() => {
    fetchQrCode();
  }, [fetchQrCode]);

  // Poll token status and generate new QR when customer accesses form
  useEffect(() => {
    if (!qrData?.id) return;

    const checkTokenStatus = async () => {
      try {
        // Check if QR is still valid by trying to fetch transaction status
        const response = await fetch(`/api/transactions/${qrData.id}`);
        
        if (response.status === 404) {
          // Transaction not found, generate new QR
          console.log('🔄 Transaction not found, generating new QR');
          setTimeout(() => fetchQrCode(), 1000);
        } else if (response.ok) {
          const data = await response.json();
          
          if (data.status && data.status !== tokenStatus) {
            console.log(`🔄 Status changed from ${tokenStatus} to ${data.status}`);
            setTokenStatus(data.status as 'available' | 'accessed' | 'used');
            
            // Generate new QR when customer accesses the form or completes transaction
            if (data.status === 'accessed') {
              console.log('👤 Customer accessed form, generating new QR in 3 seconds...');
              setTimeout(() => fetchQrCode(), 3000);
            } else if (data.status === 'completed' || data.status === 'used') {
              console.log('✅ Transaction completed, generating new QR in 2 seconds...');
              setTimeout(() => fetchQrCode(), 2000);
            }
          }
        }
      } catch (error) {
        console.error('Error checking token status:', error);
        // If there's an error, just continue with current status
      }
    };

    const interval = setInterval(checkTokenStatus, 2000); // Check every 2 seconds for faster response
    return () => clearInterval(interval);
  }, [qrData?.id, tokenStatus, fetchQrCode]);

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
          QR akan berubah ketika pelanggan mengakses form transaksi.
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