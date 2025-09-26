"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Copy, CheckCircle, Smartphone, Home, Building2, Wifi, Shield, Activity } from 'lucide-react';

interface QRDisplayScreenProps {
  qrValue: string;
  onRefresh?: () => void;
  onQRAccessed?: () => void;
  isQRAccessed?: boolean;
  transactionId?: string;
}

export default function QRDisplayScreen({
  qrValue,
  onRefresh,
  onQRAccessed,
  isQRAccessed = false,
  transactionId
}: QRDisplayScreenProps) {
  const [accessCount, setAccessCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastAccessed, setLastAccessed] = useState<Date | null>(null);

  // Monitor QR access status
  useEffect(() => {
    if (!transactionId) return;

    const checkAccess = async () => {
      try {
        const response = await fetch(`/api/qr/check-access/${transactionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.accessed && !isQRAccessed) {
            setAccessCount(prev => prev + 1);
            setLastAccessed(new Date());
            onQRAccessed?.();
          }
        }
      } catch (error) {
        console.error('Error checking QR access:', error);
      }
    };

    const interval = setInterval(checkAccess, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, [transactionId, isQRAccessed, onQRAccessed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
      setAccessCount(0); // Reset access count after refresh
    } catch (error) {
      console.error('Error refreshing QR:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header with Bank Logo */}
        <div className="bg-white rounded-t-2xl p-6 flex items-center justify-between shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BANK TERDEPAN</h1>
              <p className="text-sm text-gray-600">QR Tunai Drive-Thru</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>LOKET 1 - BUKA</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>LOKET 2 - TUTUP</span>
            </div>
          </div>
        </div>

        {/* Main QR Display Area */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 rounded-b-2xl p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* QR Code Section */}
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                {/* QR Code Container */}
                <div className={`bg-white p-8 rounded-3xl shadow-2xl transition-all duration-500 ${
                  isQRAccessed ? 'opacity-70 scale-95' : 'scale-100'
                }`}>
                  <div className="relative">
                    <QRCodeSVG
                      value={qrValue}
                      size={280}
                      bgColor="transparent"
                      fgColor="#1e40af"
                      level="H"
                      includeMargin={true}
                      className="drop-shadow-lg"
                    />
                    
                    {/* Center Logo Overlay */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Access Status Overlay */}
                    {isQRAccessed && (
                      <div className="absolute inset-0 bg-green-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
                          SEDANG DIPROSES
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Display */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className={`px-6 py-2 rounded-full shadow-lg flex items-center space-x-2 ${
                    isQRAccessed ? 'bg-green-500' : 'bg-blue-500'
                  } text-white font-mono text-lg font-bold`}>
                    {isQRAccessed ? <CheckCircle className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                    <span>{isQRAccessed ? 'Pelanggan Mengakses Form' : 'Siap Dipindai'}</span>
                  </div>
                </div>
              </div>

              {/* Access Counter */}
              <div className="text-center">
                <div className={`text-6xl font-mono font-bold mb-2 ${
                  accessCount > 0 ? 'text-green-400' : 'text-blue-400'
                }`}>
                  {accessCount.toString().padStart(2, '0')}
                </div>
                <div className="text-blue-200 text-sm">
                  {accessCount > 0 ? 'Total Akses Pelanggan' : 'Menunggu Pelanggan'}
                </div>
                {lastAccessed && (
                  <div className="text-xs text-gray-400 mt-2">
                    Terakhir diakses: {lastAccessed.toLocaleTimeString('id-ID')}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleRefresh}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Ganti Kode
                </Button>
                
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Salin Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="text-white space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-4 leading-tight">
                  Scan QR untuk
                  <br />
                  <span className="text-orange-400">anngkram nomor</span>
                  <br />
                  <span className="text-orange-400">antrian Anda</span>
                </h2>
              </div>

              {/* Instructions Steps */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Scan QR Code</h3>
                    <p className="text-blue-100 leading-relaxed">
                      Gunakan aplikasi kamera atau scanner QR di smartphone Anda untuk memindai kode QR di sebelah kiri.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Isi Form Transaksi</h3>
                    <p className="text-blue-100 leading-relaxed">
                      Lengkapi form transaksi yang muncul dengan detail yang diperlukan sesuai jenis layanan yang Anda pilih.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Menuju Loket</h3>
                    <p className="text-blue-100 leading-relaxed">
                      Tunggu konfirmasi dan tunjukkan bukti transaksi Anda ke petugas loket yang tersedia.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Status */}
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Home className="w-6 h-6 mr-2" />
                  Status Layanan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                    <span>Loket 1</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="font-semibold">BUKA</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
                    <span>Loket 2</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <span className="font-semibold">TUTUP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Information */}
          <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between text-blue-100 text-sm">
            <div className="flex items-center space-x-6 mb-4 sm:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Sistem Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Layanan 24/7</span>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p>Bank Terdepan - Melayani dengan Teknologi Terdepan</p>
              <p className="text-xs text-blue-200 mt-1">QR Tunai Drive-Thru v2.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}