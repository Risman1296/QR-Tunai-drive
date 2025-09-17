'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QRCodeData {
  qrCodeDataUrl: string;
  token: string;
  expiresAt: number;
  id: string;
  transactionUrl: string;
  expiresIn: number;
}

export default function QRPage() {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrKey, setQrKey] = useState(0);
  const [tokenStatus, setTokenStatus] = useState<'available' | 'accessed' | 'used'>('available');

  // Generate QR code automatically when page loads
  useEffect(() => {
    generateQR();
  }, []);

  // Poll token status and auto-refresh when accessed/used
  useEffect(() => {
    if (!qrData?.id) return;

    const checkTokenStatus = async () => {
      try {
        const response = await fetch(`/api/tokens/${qrData.id}/status`);
        const data = await response.json();
        
        if (data.status.accessed && tokenStatus === 'available') {
          setTokenStatus('accessed');
          // Generate new QR when token is accessed
          setTimeout(() => generateQR(), 1000);
        } else if (data.status.used && tokenStatus !== 'used') {
          setTokenStatus('used');
          // Generate new QR when token is used
          setTimeout(() => generateQR(), 2000);
        }
      } catch (error) {
        console.error('Error checking token status:', error);
      }
    };

    // Check every 2 seconds
    const interval = setInterval(checkTokenStatus, 2000);
    return () => clearInterval(interval);
  }, [qrData?.id, tokenStatus]);

  const generateQR = async () => {
    setLoading(true);
    setError('');
    
    try {
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

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      
      if (!data.qrCodeDataUrl) {
        console.error('API response missing qrCodeDataUrl:', data);
        throw new Error('Invalid QR code data received');
      }
      
      setQrData(data);
      setQrKey(prev => prev + 1);
      setTokenStatus('available');
    } catch (error) {
      console.error('Error generating QR:', error);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to get status display
  const getStatusDisplay = () => {
    switch (tokenStatus) {
      case 'accessed':
        return { text: 'Sedang digunakan', color: 'bg-yellow-50 text-yellow-700', icon: '👤' };
      case 'used':
        return { text: 'Transaksi selesai', color: 'bg-green-50 text-green-700', icon: '✅' };
      default:
        return { text: 'Menunggu pelanggan', color: 'bg-blue-50 text-blue-700', icon: '📱' };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">
              QR Tunai Drive-Thru
            </CardTitle>
            <p className="text-gray-600 mt-1">Scan QR dengan kamera HP</p>
          </CardHeader>

          <CardContent className="space-y-4 py-8">
            <div className="flex justify-center">
              {loading ? (
                <div className="w-72 h-72 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                </div>
              ) : qrData ? (
                <div className="text-center space-y-4">
                  <div className={`p-6 bg-white border-2 rounded-lg shadow-sm transition-all ${
                    tokenStatus === 'accessed' ? 'border-yellow-300 bg-yellow-50' : 
                    tokenStatus === 'used' ? 'border-green-300 bg-green-50' : 'border-blue-200'
                  }`}>
                    <img 
                      key={qrKey}
                      src={qrData.qrCodeDataUrl} 
                      alt="QR Code" 
                      className={`w-full h-auto max-w-72 mx-auto transition-opacity ${
                        tokenStatus === 'used' ? 'opacity-50' : 'opacity-100'
                      }`}
                    />
                    {tokenStatus !== 'available' && (
                      <div className={`mt-2 text-sm font-medium ${status.color.split(' ').slice(1).join(' ')}`}>
                        {status.icon} {status.text}
                      </div>
                    )}
                  </div>
                  
                  <div className={`text-sm font-medium py-2 px-4 rounded-full inline-block ${status.color}`}>
                    {status.icon} Status: {status.text}
                  </div>
                  
                  <Button 
                    onClick={generateQR} 
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    disabled={loading}
                  >
                    Generate QR Baru
                  </Button>
                </div>
              ) : (
                <div className="w-72 h-72 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">QR Code sedang dibuat...</span>
                </div>
              )}
            </div>

            {error && (
              <div className="text-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
                <Button 
                  onClick={generateQR} 
                  variant="link"
                  size="sm"
                  className="text-blue-600 ml-2"
                >
                  Coba Lagi
                </Button>
              </div>
            )}

            <div className="text-center text-sm text-gray-700 space-y-1 pt-4 border-t border-gray-100">
              <p>1 QR Code = 1 Pelanggan</p>
              <p>QR otomatis berganti ketika digunakan</p>
              {qrData && (
                <p className="text-xs text-gray-500 font-mono mt-2">
                  ID: {qrData.id.slice(0, 8)}...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}