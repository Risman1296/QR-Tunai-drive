"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Building2, 
  RefreshCw, 
  CheckCircle, 
  Smartphone,
  Wifi,
  Shield,
  Activity,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QRDominantDisplayProps {
  qrValue: string;
  onRefresh?: () => void;
  onQRAccessed?: () => void;
  isQRAccessed?: boolean;
  transactionId?: string;
  onSettingsClick?: () => void;
}

export default function QRDominantDisplayFixed({
  qrValue,
  onRefresh,
  onQRAccessed,
  isQRAccessed = false,
  transactionId,
  onSettingsClick
}: QRDominantDisplayProps) {
  const [accessCount, setAccessCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

    const interval = setInterval(checkAccess, 2000);
    return () => clearInterval(interval);
  }, [transactionId, isQRAccessed, onQRAccessed]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh?.();
      setAccessCount(0);
    } catch (error) {
      console.error('Error refreshing QR:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative">
      {/* Settings Button - Fixed Position with Safe Zone */}
      {onSettingsClick && (
        <div className="fixed top-6 right-6 z-50">
          <Button
            onClick={onSettingsClick}
            className="bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20 text-white transition-all duration-200 shadow-lg"
            size="lg"
          >
            <Settings className="w-5 h-5 mr-2" />
            Pengaturan
          </Button>
        </div>
      )}

      {/* Main Content Container */}
      <div className="min-h-screen flex items-center justify-center p-4 lg:p-6 xl:p-8">
        <div className="w-full max-w-7xl mx-auto">
          
          {/* Responsive Layout - Stack on Mobile, Grid on Large Screens */}
          <div className="flex flex-col xl:grid xl:grid-cols-12 gap-6 xl:gap-8 items-center xl:items-stretch min-h-[80vh]">
            
            {/* Left Column - Bank Information */}
            <div className="xl:col-span-4 flex flex-col justify-center space-y-6 w-full max-w-lg xl:max-w-none">
              
              {/* Bank Header */}
              <div className="text-center xl:text-left space-y-4">
                <div className="flex justify-center xl:justify-start">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                    <Building2 className="w-10 h-10 lg:w-12 lg:h-12 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 leading-tight">
                    BANK<br className="xl:hidden" /> TERDEPAN
                  </h1>
                  <p className="text-lg lg:text-xl xl:text-2xl text-blue-200 font-medium">
                    QR Tunai Drive-Thru
                  </p>
                  <p className="text-sm lg:text-base text-blue-300 mt-2">
                    Layanan Perbankan Digital
                  </p>
                </div>
              </div>

              {/* Service Status Indicators */}
              <div className="space-y-3">
                <div className="flex items-center justify-center xl:justify-start space-x-3 text-green-300">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <Shield className="w-5 h-5" />
                  <span className="text-base lg:text-lg font-medium">System Secure</span>
                </div>
                <div className="flex items-center justify-center xl:justify-start space-x-3 text-green-300">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <Wifi className="w-5 h-5" />
                  <span className="text-base lg:text-lg font-medium">Network Online</span>
                </div>
                <div className="flex items-center justify-center xl:justify-start space-x-3 text-green-300">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <Activity className="w-5 h-5" />
                  <span className="text-base lg:text-lg font-medium">Service Active</span>
                </div>
              </div>

              {/* Access Counter */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center xl:text-left">
                <div className="flex flex-col xl:flex-row xl:items-center xl:space-x-6">
                  <div>
                    <div className={`text-4xl lg:text-5xl xl:text-6xl font-mono font-bold mb-2 ${
                      accessCount > 0 ? 'text-green-400' : 'text-blue-300'
                    }`}>
                      {accessCount.toString().padStart(2, '0')}
                    </div>
                    <div className="text-white text-base lg:text-lg font-medium">
                      {accessCount > 0 ? 'Total Akses' : 'Menunggu Scan'}
                    </div>
                  </div>
                  {lastAccessed && (
                    <div className="xl:flex-1 xl:text-right">
                      <div className="text-blue-300 text-sm lg:text-base">
                        Terakhir Akses:<br />
                        {lastAccessed.toLocaleTimeString('id-ID')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center Column - Dominant QR Code */}
            <div className="xl:col-span-4 flex items-center justify-center relative">
              <div className="relative group">
                
                {/* QR Code Main Container */}
                <div className={`bg-white p-6 lg:p-8 xl:p-10 rounded-3xl shadow-2xl border-4 border-blue-200 transition-all duration-500 ${
                  isQRAccessed ? 'scale-95 opacity-90' : 'scale-100 hover:scale-105'
                } ${isQRAccessed ? '' : 'hover:shadow-3xl'}`}>
                  
                  <div className="relative flex items-center justify-center">
                    {/* Responsive QR Code - Larger Size */}
                    <QRCodeSVG
                      value={qrValue}
                      size={480} // Increased from 300 to 480 for better visibility
                      bgColor="transparent"
                      fgColor="#1e40af"
                      level="H"
                      includeMargin={true}
                      className="w-full h-full max-w-[320px] max-h-[320px] sm:max-w-[380px] sm:max-h-[380px] lg:max-w-[420px] lg:max-h-[420px] xl:max-w-[480px] xl:max-h-[480px] drop-shadow-lg"
                    />
                    
                    {/* Center Logo - Scaled for larger QR */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-14 h-14 lg:w-18 lg:h-18 xl:w-24 xl:h-24 bg-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg border-2 lg:border-4 border-white">
                        <Building2 className="w-7 h-7 lg:w-9 lg:h-9 xl:w-12 xl:h-12 text-white" />
                      </div>
                    </div>

                    {/* Access Status Overlay */}
                    {isQRAccessed && (
                      <div className="absolute inset-0 bg-green-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-green-500 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-2xl font-bold shadow-2xl text-lg lg:text-xl">
                          <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 inline mr-2 lg:mr-3" />
                          SEDANG DIPROSES
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge - Below QR */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-max">
                  <div className={`px-4 py-2 lg:px-6 lg:py-3 rounded-xl shadow-lg flex items-center space-x-2 transition-all duration-300 ${
                    isQRAccessed ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    <Smartphone className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    <span className="text-white font-medium text-sm lg:text-base">
                      {isQRAccessed ? 'QR Terdeteksi' : 'Scan QR Code'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Instructions & Controls */}
            <div className="xl:col-span-4 flex flex-col justify-center space-y-6 w-full max-w-lg xl:max-w-none">
              
              {/* Instructions */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 text-center xl:text-left">
                  Cara Menggunakan
                </h3>
                <div className="space-y-3 text-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 lg:w-7 lg:h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">1</div>
                    <p className="text-sm lg:text-base">Scan QR code dengan aplikasi mobile banking atau e-wallet</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 lg:w-7 lg:h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">2</div>
                    <p className="text-sm lg:text-base">Isi data transaksi dengan lengkap dan benar</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 lg:w-7 lg:h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">3</div>
                    <p className="text-sm lg:text-base">Konfirmasi transaksi dan tunggu proses selesai</p>
                  </div>
                </div>
              </div>

              {/* Manual Refresh */}
              <div className="text-center xl:text-right space-y-4">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 w-full xl:w-auto"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Memperbarui...' : 'Refresh QR'}
                </Button>
                
                {/* System Info */}
                <div className="text-blue-300 text-sm lg:text-base">
                  <div className="flex items-center justify-center xl:justify-end space-x-2 mb-2">
                    <Activity className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Drive-Thru Ready</span>
                  </div>
                  <div className="font-semibold">Bank Terdepan - Teknologi Terdepan</div>
                  <div className="text-xs lg:text-sm opacity-80 mt-1">
                    QR Tunai System v2.0 - Landscape Mode
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}