'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QRCodeData {
  qrCode: string;
  token: string;
  expiresAt: number;
}

export default function QRPage() {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Generate QR code automatically when page loads
  useEffect(() => {
    generateQR();
  }, []);

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
      setQrData(data);
      setTimeRemaining(300); // 5 minutes
    } catch (error) {
      console.error('Error generating QR:', error);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && qrData) {
      // Auto-refresh QR when expired
      generateQR();
    }
  }, [timeRemaining, qrData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return mins.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto w-full">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b pb-4">
            <div className="flex justify-center mb-3">
              <img 
                src="/logo.png" 
                alt="QR Tunai Logo" 
                className="h-16 w-16" 
              />
            </div>
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
                  <div className="p-6 bg-white border-2 border-blue-200 rounded-lg shadow-sm">
                    <img 
                      src={qrData.qrCode} 
                      alt="QR Code" 
                      className="w-full h-auto max-w-72 mx-auto"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-700 bg-blue-50 py-2 px-4 rounded-full inline-block">
                    <span className="font-mono text-blue-700">{formatTime(timeRemaining)}</span> menit
                  </div>
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
              <p>QR ini digunakan untuk transaksi Drive-Thru</p>
              <p>Scan menggunakan kamera HP di loket</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
