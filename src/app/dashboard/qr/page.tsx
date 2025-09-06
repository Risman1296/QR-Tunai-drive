'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface Transaction {
  id: string;
  qrUrl: string;
}

export default function GenerateQRPage() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateNewTransaction = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Static data for QR creation
          type: 'Pembayaran Digital',
          customerName: 'Pelanggan', // Placeholder name
          amount: 0, // Amount will be filled by the customer
          notes: 'Scan QR untuk membayar',
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal membuat transaksi baru.');
      }

      const newTransaction = await response.json();
      const origin = window.location.origin;
      const transactionUrl = `${origin}/t/${newTransaction.id}`;
      newTransaction.qrUrl = transactionUrl;

      setTransaction(newTransaction);

      const qrDataUrl = await QRCode.toDataURL(transactionUrl, { 
        width: 300, 
        margin: 2,
        errorCorrectionLevel: 'H'
      });
      setQrCodeUrl(qrDataUrl);

    } catch (err: any) {
      setError(err.message);
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial generation
  useEffect(() => {
    generateNewTransaction();
  }, [generateNewTransaction]);

  // Listen for Server-Sent Events
  useEffect(() => {
    const eventSource = new EventSource('/api/qr/events');

    eventSource.addEventListener('qrScanned', (event) => {
      const data = JSON.parse(event.data);
      console.log('QR Scanned Event Received:', data);
      
      // Check if the scanned QR belongs to the current transaction
      if (transaction && data.transactionId === transaction.id) {
        toast({
          title: 'QR Telah Dipindai!',
          description: 'Membuat kode QR baru...',
        });
        // Generate a new QR code immediately
        generateNewTransaction();
      }
    });

    eventSource.onerror = (err) => {
        console.error('SSE Error:', err);
        setError('Koneksi real-time terputus. Coba muat ulang halaman.');
        eventSource.close();
    };

    // Cleanup on component unmount
    return () => {
      eventSource.close();
    };
  }, [generateNewTransaction, toast, transaction]);

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Kode QR Pembayaran</CardTitle>
          <CardDescription>
            Pindai kode ini untuk melakukan pembayaran. Kode akan otomatis berganti setelah dipindai.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8">
          {isLoading ? (
            <div className="h-[300px] w-[300px] flex flex-col justify-center items-center bg-gray-100 rounded-lg">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Membuat QR Code...</p>
            </div>
          ) : error ? (
            <div className="h-[300px] w-[300px] flex flex-col justify-center items-center bg-red-50 rounded-lg text-destructive text-center p-4">
                <AlertTriangle className="h-12 w-12" />
                <p className="mt-4 font-semibold">Terjadi Kesalahan</p>
                <p className="text-sm">{error}</p>
                <Button variant="destructive" onClick={generateNewTransaction} className="mt-4">
                    <RefreshCw className="mr-2 h-4 w-4"/>
                    Coba Lagi
                </Button>
            </div>
          ) : qrCodeUrl && (
            <img src={qrCodeUrl} alt={`QR Code untuk transaksi ${transaction?.id}`} className="rounded-lg" />
          )}
          <Button onClick={generateNewTransaction} disabled={isLoading} className="mt-6">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Buat Kode Baru Manual
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
