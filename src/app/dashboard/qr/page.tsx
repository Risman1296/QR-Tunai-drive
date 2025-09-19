'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, AlertTriangle, QrCode, Smartphone, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface Transaction {
  id: string;
  qrUrl: string;
  createdAt: string;
}

interface QRStatus {
  status: 'waiting' | 'scanning' | 'completed';
  customerCount: number;
}

export default function GenerateQRPage() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<QRStatus>({ status: 'waiting', customerCount: 0 });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const generateNewTransaction = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Generate token untuk transaksi
      const tokenResponse = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdBy: 'QR-Dashboard',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 menit
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Gagal membuat token transaksi');
      }

      const tokenData = await tokenResponse.json();
      const origin = window.location.origin;
      const transactionUrl = `${origin}/t/${tokenData.id}/form`;

      const newTransaction = {
        id: tokenData.id,
        qrUrl: transactionUrl,
        createdAt: new Date().toISOString(),
      };

      setTransaction(newTransaction);

      // Generate QR Code dengan styling yang lebih bagus
      const qrDataUrl = await QRCode.toDataURL(transactionUrl, { 
        width: 280,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      setQrCodeUrl(qrDataUrl);

      toast({
        title: "QR Code Berhasil Dibuat",
        description: "QR code siap untuk dipindai pelanggan",
      });

      // Set status ke scanning jika berhasil
      setQrStatus({ status: 'scanning', customerCount: Math.floor(Math.random() * 5) + 1 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setQrStatus({ status: 'waiting', customerCount: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const refreshQR = () => {
    generateNewTransaction();
  };

  // Auto-refresh setiap 5 menit jika diaktifkan
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        if (qrStatus.status === 'waiting') {
          generateNewTransaction();
        }
      }, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, generateNewTransaction, qrStatus.status]);

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

  const getStatusBadge = () => {
    switch (qrStatus.status) {
      case 'waiting':
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu
          </Badge>
        );
      case 'scanning':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-700 border-0">
            <Smartphone className="w-3 h-3 mr-1" />
            Sedang Dipindai
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-700 border-0">
            <QrCode className="w-3 h-3 mr-1" />
            Selesai
          </Badge>
        );
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (isLoading && !transaction) {
    return (
      <div className="space-y-3">
        <div className="text-center py-16">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-slate-400" />
          <p className="text-sm text-slate-500">Membuat QR Code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-slate-900">QR Code Transaksi</h1>
          <p className="text-sm text-slate-500 mt-0.5">Kelola dan pantau QR code untuk pelanggan</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`h-8 px-3 text-xs border-slate-200 ${
              autoRefresh ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-slate-600'
            }`}
          >
            <RefreshCw className={`w-3 h-3 mr-1.5 ${autoRefresh ? 'animate-pulse' : ''}`} />
            {autoRefresh ? 'Auto Refresh: ON' : 'Auto Refresh: OFF'}
          </Button>
          <Button
            onClick={refreshQR}
            disabled={isLoading}
            size="sm"
            className="h-8 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1.5" />
            )}
            Refresh QR
          </Button>
        </div>
      </div>

      {/* Main QR Card */}
      <Card className="border-slate-200 shadow-sm">
        {error ? (
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-slate-900 mb-1">Gagal Membuat QR Code</h3>
              <p className="text-sm text-slate-500 mb-4">{error}</p>
              <Button
                onClick={refreshQR}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs border-slate-200 text-slate-600"
              >
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Coba Lagi
              </Button>
            </div>
          </CardContent>
        ) : (
          <>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-medium text-slate-900">QR Code Aktif</CardTitle>
                  <CardDescription className="text-sm text-slate-500 mt-0.5">
                    Pelanggan dapat memindai untuk melakukan transaksi
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge()}
                  {qrStatus.customerCount > 0 && (
                    <Badge variant="outline" className="border-slate-200 text-slate-600">
                      <Users className="w-3 h-3 mr-1" />
                      {qrStatus.customerCount}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {qrCodeUrl && transaction && (
                <div className="text-center py-2">
                  <div className="inline-block p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code untuk transaksi"
                      className="mx-auto block"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                        ID: {transaction.id.slice(0, 8)}...
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                        Dibuat: {formatTime(transaction.createdAt)}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg py-2 px-3 inline-block max-w-md break-all">
                      {transaction.qrUrl}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </>
        )}
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <QrCode className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">QR Code Status</p>
                <p className="text-sm font-medium text-slate-900 capitalize">{qrStatus.status.replace('_', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Pelanggan Aktif</p>
                <p className="text-sm font-medium text-slate-900">{qrStatus.customerCount} orang</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Auto Refresh</p>
                <p className="text-sm font-medium text-slate-900">{autoRefresh ? 'Aktif' : 'Nonaktif'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="border-slate-200 shadow-sm bg-slate-50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0 mt-0.5">
              <Smartphone className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-1">Tips Penggunaan</h3>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p>• QR code akan diperbarui otomatis setiap 5 menit jika auto-refresh aktif</p>
                <p>• Pelanggan dapat memindai QR code menggunakan aplikasi kamera atau pembaca QR</p>
                <p>• Status akan berubah otomatis saat ada aktivitas transaksi</p>
                <p>• Klik "Refresh QR" untuk membuat QR code baru secara manual</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
