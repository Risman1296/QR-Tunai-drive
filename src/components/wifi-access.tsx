/**
 * WiFi Access Interface Component
 * Displays WiFi credentials and connection instructions to customers
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, Copy, CheckCircle, Clock, Zap, Signal, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { WiFiCredentials, ConnectionQuality, WiFiAnalytics } from '@/lib/wifi-manager';

interface WiFiAccessProps {
  credentials: WiFiCredentials;
  transactionId: string;
  onConnected?: () => void;
  onSkip?: () => void;
}

interface WiFiStatus {
  connected: boolean;
  quality: 'good' | 'slow' | 'poor' | 'no-internet';
  testing: boolean;
}

export const WiFiAccess: React.FC<WiFiAccessProps> = ({
  credentials,
  transactionId,
  onConnected,
  onSkip
}) => {
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [copied, setCopied] = useState<{ ssid: boolean; password: boolean }>({
    ssid: false,
    password: false
  });
  const [wifiStatus, setWiFiStatus] = useState<WiFiStatus>({
    connected: false,
    quality: 'no-internet',
    testing: false
  });
  const [showInstructions, setShowInstructions] = useState(true);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time expired
          onSkip?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onSkip]);

  // Connection status monitoring
  useEffect(() => {
    const checkConnection = async () => {
      setWiFiStatus(prev => ({ ...prev, testing: true }));
      
      try {
        const quality = await ConnectionQuality.assess();
        const connected = quality !== 'no-internet';
        
        setWiFiStatus({
          connected,
          quality,
          testing: false
        });

        if (connected && onConnected) {
          // Log successful connection
          await WiFiAnalytics.logConnection({
            transactionId,
            connectionTime: new Date(),
            deviceInfo: navigator.userAgent
          });
          
          setTimeout(() => onConnected(), 2000); // Small delay to show success
        }
      } catch (error) {
        setWiFiStatus({
          connected: false,
          quality: 'no-internet',
          testing: false
        });
      }
    };

    // Check immediately and then every 5 seconds
    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, [transactionId, onConnected]);

  const copyToClipboard = async (text: string, type: 'ssid' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSignalIcon = (quality: string) => {
    switch (quality) {
      case 'good': return <Signal className="h-4 w-4 text-green-600" />;
      case 'slow': return <Signal className="h-4 w-4 text-yellow-600" />;
      case 'poor': return <Signal className="h-4 w-4 text-orange-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'good': return 'bg-green-500';
      case 'slow': return 'bg-yellow-500';
      case 'poor': return 'bg-orange-500';
      default: return 'bg-red-500';
    }
  };

  const progressValue = ((600 - timeRemaining) / 600) * 100;

  // If already connected with good quality, show success state
  if (wifiStatus.connected && wifiStatus.quality === 'good') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Koneksi Internet Berhasil!
            </h3>
            <p className="text-sm text-green-700 mb-4">
              Anda telah terhubung ke internet dengan kualitas baik. 
              Silakan lanjutkan dengan transaksi Anda.
            </p>
            <Button 
              onClick={onConnected}
              className="bg-green-600 hover:bg-green-700"
            >
              Lanjut ke Form Transaksi →
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-blue-100 p-2">
              <Wifi className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-blue-800 text-lg">
                🛰️ Internet Gratis via Orbit H2
              </CardTitle>
              <p className="text-xs text-blue-600 mt-1">
                4G LTE Speed • Powered by QRTunai Drive Thru
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(timeRemaining)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="bg-white rounded-lg p-3 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Status Koneksi</span>
            {getSignalIcon(wifiStatus.quality)}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getQualityColor(wifiStatus.quality)} ${
                  wifiStatus.connected ? 'w-full' : 'w-1/4'
                }`}
              />
            </div>
            <span className="text-xs text-gray-500">
              {wifiStatus.testing ? 'Testing...' : ConnectionQuality.getRecommendation(wifiStatus.quality)}
            </span>
          </div>
        </div>

        {/* WiFi Credentials */}
        <div className="space-y-3">
          {/* SSID */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm text-gray-600">Nama WiFi Network</label>
                <div className="font-mono text-base font-semibold text-gray-800 mt-1">
                  {credentials.ssid}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(credentials.ssid, 'ssid')}
                className="ml-2"
              >
                {copied.ssid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="text-sm text-gray-600">Password WiFi</label>
                <div className="font-mono text-xl font-bold text-blue-700 mt-1 tracking-wider">
                  {credentials.password}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(credentials.password, 'password')}
                className="ml-2 border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                {copied.password ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Timer Progress */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-yellow-800">
              ⏱️ Waktu Akses Internet Gratis
            </span>
            <span className="text-lg font-bold text-yellow-700">
              {formatTime(timeRemaining)}
            </span>
          </div>
          <Progress 
            value={progressValue} 
            className="h-2 bg-yellow-200"
          />
          <p className="text-xs text-yellow-600 mt-1">
            Akses internet akan berakhir otomatis setelah 10 menit
          </p>
        </div>

        {/* Connection Instructions */}
        {showInstructions && (
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1 text-sm">
                <p className="font-medium mb-2">📱 Cara Connect WiFi:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Buka <strong>WiFi Settings</strong> di HP Anda</li>
                  <li>Pilih network <strong>"{credentials.ssid}"</strong></li>
                  <li>Masukkan password: <strong>{credentials.password}</strong></li>
                  <li>Tunggu status "Connected" ✅</li>
                  <li>Kembali ke halaman ini untuk lanjut</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <Button
            onClick={() => setShowInstructions(!showInstructions)}
            variant="outline"
            className="flex-1"
          >
            {showInstructions ? 'Sembunyikan Instruksi' : 'Tampilkan Instruksi'}
          </Button>
          
          {onSkip && (
            <Button
              onClick={onSkip}
              variant="ghost"
              className="flex-1 text-gray-600"
            >
              Lewati WiFi →
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>💡 Bandwidth: 2 Mbps • Cukup untuk banking dan browsing</p>
          <p>🔒 Koneksi aman dengan enkripsi WPA2</p>
          <p>🚫 Social media & streaming diblokir untuk performa optimal</p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * WiFi Quick Connect Component (for good connections that might need boost)
 */
export const WiFiQuickConnect: React.FC<{
  credentials: WiFiCredentials;
  onConnect: () => void;
  onSkip: () => void;
}> = ({ credentials, onConnect, onSkip }) => {
  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Wifi className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800">
              WiFi Gratis Tersedia
            </p>
            <p className="text-sm text-blue-600">
              Koneksi Anda lambat. Gunakan WiFi kami untuk pengalaman lebih baik.
            </p>
          </div>
          <div className="flex space-x-2 ml-4">
            <Button size="sm" onClick={onConnect}>
              Gunakan WiFi
            </Button>
            <Button size="sm" variant="ghost" onClick={onSkip}>
              Lanjut
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default WiFiAccess;