'use client';

import { useState, useEffect } from 'react';
import { Loader2, Timer, Zap } from 'lucide-react';
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
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Generate QR code automatically when page loads
  useEffect(() => {
    generateQR();
  }, []);

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
          setTimeout(() => generateQR(), 1000);
        } else if (response.ok) {
          const data = await response.json();
          
          if (data.status && data.status !== tokenStatus) {
            console.log(`🔄 Status changed from ${tokenStatus} to ${data.status}`);
            setTokenStatus(data.status as 'available' | 'accessed' | 'used');
            
            // Generate new QR when customer accesses the form or completes transaction
            if (data.status === 'accessed') {
              console.log('👤 Customer accessed form, generating new QR in 3 seconds...');
              setTimeout(() => generateQR(), 3000);
            } else if (data.status === 'completed' || data.status === 'used') {
              console.log('✅ Transaction completed, generating new QR in 2 seconds...');
              setTimeout(() => generateQR(), 2000);
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
  }, [qrData?.id, tokenStatus]);

  // Countdown timer - using seconds directly
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
        
        // Log remaining time for debugging
        if (timeRemaining % 10 === 0) {
          console.log(`⏰ Time remaining: ${timeRemaining}s`);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && qrData) {
      console.log('⏰ Timer expired, generating new QR');
      generateQR();
    }
  }, [timeRemaining, qrData]);

  const generateQR = async () => {
    setLoading(true);
    setError('');
    
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
      setTimeRemaining(Math.floor(data.expiresIn || 120)); // Default 2 minutes if not provided
      setQrKey(prev => prev + 1);
      setTokenStatus('available');
      
      console.log('✅ QR code generated successfully');
    } catch (error) {
      console.error('❌ Error generating QR:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to generate QR code: ${errorMessage}`);
      
      // Retry automatically after 5 seconds
      setTimeout(() => {
        console.log('🔄 Retrying QR generation...');
        generateQR();
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Function to get status display
  const getStatusDisplay = () => {
    switch (tokenStatus) {
      case 'accessed':
        return { text: 'Processing', color: 'bg-amber-100 text-amber-700 border-amber-200', pulse: true };
      case 'used':
        return { text: 'Completed', color: 'bg-green-100 text-green-700 border-green-200', pulse: false };
      default:
        return { text: 'Ready to Scan', color: 'bg-blue-100 text-blue-700 border-blue-200', pulse: false };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const statusDisplay = getStatusDisplay();
  const isExpiring = timeRemaining < 30;
  const isCritical = timeRemaining < 10;

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-sm mx-auto w-full">
        <Card className="bg-white border-0 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white pb-6">
            <CardTitle className="text-xl font-light text-center flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              QR Drive-Thru
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Status Indicator */}
            <div className="flex items-center justify-center">
              <div className={`py-2 px-4 rounded-full text-sm font-medium border ${statusDisplay.color} ${statusDisplay.pulse ? 'animate-pulse' : ''}`}>
                {statusDisplay.text}
              </div>
            </div>

            {/* QR Code Display */}
            <div className="flex justify-center">
              {loading ? (
                <div className="w-64 h-64 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Connecting to server...</p>
                    <p className="text-xs text-slate-400 mt-1">Please wait</p>
                  </div>
                </div>
              ) : qrData ? (
                <div className="text-center space-y-4">
                  <div className={`p-4 bg-gradient-to-br from-slate-50 to-white border-2 rounded-xl shadow-sm transition-all duration-500 ${
                    isCritical ? 'border-red-300 bg-red-50 animate-pulse' : 
                    isExpiring ? 'border-amber-300 bg-amber-50' : 'border-slate-200'
                  }`}>
                    <img 
                      key={qrKey}
                      src={qrData.qrCodeDataUrl} 
                      alt="QR Code" 
                      className={`w-56 h-56 mx-auto transition-all duration-500 ${
                        isCritical ? 'opacity-70' : 'opacity-100'
                      }`}
                    />
                  </div>
                  
                  {/* Timer Display */}
                  <div className="flex items-center justify-center gap-4">
                    <div className={`inline-flex items-center gap-2 text-sm font-mono px-4 py-2 rounded-full ${
                      isCritical ? 'bg-red-100 text-red-700' : 
                      isExpiring ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    } ${isCritical ? 'animate-pulse' : ''}`}>
                      <Timer className="w-4 h-4" />
                      {formatTime(timeRemaining)}
                    </div>
                  </div>

                  {/* ID Display */}
                  <div className="text-xs text-slate-400 font-mono">
                    ID: {qrData.id.slice(0, 8)}
                  </div>
                </div>
              ) : (
                <div className="w-64 h-64 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                  <span className="text-slate-400 text-sm">Generating...</span>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="text-center bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm mb-3">{error}</p>
                <div className="text-xs text-red-500 mb-3 font-mono">
                  Debug: Check browser console for details
                </div>
                <Button 
                  onClick={generateQR} 
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      Retrying...
                    </>
                  ) : (
                    'Retry Now'
                  )}
                </Button>
              </div>
            )}

            {/* Manual Refresh */}
            <div className="text-center">
              <Button 
                onClick={generateQR} 
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900"
                disabled={loading}
              >
                Generate New QR
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}