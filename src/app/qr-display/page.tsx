"use client";

import { useState, useEffect } from 'react';
import QRDisplayScreen from '@/components/qr-display-screen';
import QRDominantDisplay from '@/components/qr-dominant-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, RefreshCw, Settings, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QRData {
  id: string;
  url: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

export default function QRDisplayPage() {
  const [currentQR, setCurrentQR] = useState<QRData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [displayMode, setDisplayMode] = useState<'fullscreen' | 'dominant' | 'dashboard'>('dominant');
  const [stats, setStats] = useState({
    todayScans: 0,
    activeQRs: 0,
    successfulTransactions: 0
  });
  const router = useRouter();

  // Generate new QR code
  const generateNewQR = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'display',
          displayMode: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentQR({
          id: data.id,
          url: data.url,
          token: data.token,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 60000) // 1 minute expiry
        });
      } else {
        console.error('Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const response = await fetch('/api/qr/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Initialize
  useEffect(() => {
    generateNewQR();
    loadStats();
    
    // Refresh stats every 30 seconds
    const statsInterval = setInterval(loadStats, 30000);
    return () => clearInterval(statsInterval);
  }, []);

  // Remove auto-refresh by time - now QR refreshes only when accessed

  const [isQRAccessed, setIsQRAccessed] = useState(false);

  // Handle QR access event
  const handleQRAccessed = () => {
    setIsQRAccessed(true);
    // Auto-generate new QR after 5 seconds when accessed
    setTimeout(() => {
      generateNewQR();
      setIsQRAccessed(false);
    }, 5000);
  };

  if (displayMode === 'dominant' && currentQR) {
    return (
      <QRDominantDisplay
        qrValue={currentQR.url}
        onRefresh={generateNewQR}
        onQRAccessed={handleQRAccessed}
        isQRAccessed={isQRAccessed}
        transactionId={currentQR.token}
        onSettingsClick={() => router.push('/qr-settings')}
      />
    );
  }

  if (displayMode === 'fullscreen' && currentQR) {
    return (
      <div className="relative">
        <QRDisplayScreen
          qrValue={currentQR.url}
          onRefresh={generateNewQR}
          onQRAccessed={handleQRAccessed}
          isQRAccessed={isQRAccessed}
          transactionId={currentQR.token}
        />
        
        {/* Settings Button - Top Right */}
        <Button
          onClick={() => router.push('/qr-settings')}
          className="fixed top-4 right-4 z-50 bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20"
          size="sm"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Display Control Panel</h1>
            <p className="text-gray-600">Kelola tampilan QR code untuk layar monitor/TV</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setDisplayMode('dominant')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
            >
              <Monitor className="w-4 h-4 mr-2" />
              QR Dominan (Landscape)
            </Button>
            <Button
              onClick={() => setDisplayMode('fullscreen')}
              className="bg-blue-500 hover:bg-blue-600 border border-blue-300"
              variant="outline"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Mode Klasik
            </Button>
            <Button
              onClick={() => router.push('/qr-settings')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Pengaturan
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
            >
              Dashboard Utama
            </Button>
          </div>
        </div>

        {/* Display Mode Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-900 mb-3">Mode Tampilan QR Tersedia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2">🎯 QR Dominan (Recommended)</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• QR Code berukuran 480x480px (Super Besar)</li>
                    <li>• Layout landscape untuk monitor/TV</li>
                    <li>• Info lengkap di samping QR</li>
                    <li>• Optimized untuk drive-thru</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-2">📱 Mode Klasik</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• QR Code standar 280x280px</li>
                    <li>• Layout vertikal tradisional</li>
                    <li>• Tampilan kompak</li>
                    <li>• Compatible dengan semua perangkat</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scan Hari Ini</CardTitle>
              <Smartphone className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.todayScans}</div>
              <p className="text-xs text-gray-600 mt-1">QR code yang dipindai</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Aktif</CardTitle>
              <RefreshCw className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeQRs}</div>
              <p className="text-xs text-gray-600 mt-1">Kode yang sedang aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transaksi Berhasil</CardTitle>
              <BarChart3 className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.successfulTransactions}</div>
              <p className="text-xs text-gray-600 mt-1">Transaksi selesai hari ini</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current QR Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="w-5 h-5 mr-2" />
                Preview QR Display
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentQR ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl p-6 text-white relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">Bank Terdepan</h3>
                        <p className="text-blue-200 text-sm">QR Tunai Drive-Thru</p>
                        <p className="text-xs text-blue-300 mt-1">Mode: QR Dominan (Landscape)</p>
                      </div>
                      <Badge className="bg-green-500 text-white">AKTIF</Badge>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 inline-block">
                      <div className="w-32 h-32 bg-blue-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">QR Code 400px</div>
                          <div className="text-3xl">🎯</div>
                          <div className="text-xs text-gray-500 mt-1">Dominan</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-blue-200">ID: {currentQR.id.substring(0, 8)}...</p>
                      <p className="text-sm text-blue-200">
                        Dibuat: {currentQR.createdAt.toLocaleTimeString('id-ID')}
                      </p>
                      <p className="text-sm text-blue-300">Layout: Landscape Optimized</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={generateNewQR}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Generate Baru
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setDisplayMode('dominant')}
                      variant="outline"
                      className="flex-1"
                    >
                      <Monitor className="w-4 h-4 mr-2" />
                      QR Dominan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada QR code aktif</p>
                  <Button
                    onClick={generateNewQR}
                    className="mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Generating...' : 'Generate QR Code'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Pengaturan Display
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Mode Baru: Event-Driven Refresh</h4>
                <p className="text-sm text-blue-700 mb-2">
                  QR code sekarang akan refresh otomatis ketika pelanggan mengakses form transaksi, bukan berdasarkan waktu.
                </p>
                <div className="text-xs text-blue-600">
                  ✓ QR refresh setelah pelanggan scan<br/>
                  ✓ Tidak ada auto-refresh berdasarkan waktu<br/>
                  ✓ Lebih efisien dan user-friendly
                </div>
              </div>

              <div>
                <label htmlFor="access-monitoring" className="text-sm font-medium mb-2 block">Monitoring Akses Pelanggan</label>
                <select id="access-monitoring" className="w-full p-2 border rounded-lg" title="Pilih interval monitoring akses" defaultValue="2000">
                  <option value="1000">Setiap 1 detik (Cepat)</option>
                  <option value="2000">Setiap 2 detik (Recommended)</option>
                  <option value="3000">Setiap 3 detik (Hemat Bandwidth)</option>
                  <option value="5000">Setiap 5 detik (Minimum)</option>
                </select>
              </div>

              <div>
                <label htmlFor="auto-refresh-delay" className="text-sm font-medium mb-2 block">Delay Refresh Setelah Akses</label>
                <select id="auto-refresh-delay" className="w-full p-2 border rounded-lg" title="Pilih delay refresh setelah pelanggan akses" defaultValue="5000">
                  <option value="3000">3 detik</option>
                  <option value="5000">5 detik (Recommended)</option>
                  <option value="10000">10 detik</option>
                  <option value="15000">15 detik</option>
                </select>
              </div>

              <div>
                <label htmlFor="display-theme" className="text-sm font-medium mb-2 block">Display Theme</label>
                <select id="display-theme" className="w-full p-2 border rounded-lg" title="Pilih tema tampilan" defaultValue="bank">
                  <option value="bank">Bank Terdepan</option>
                  <option value="modern">Modern Blue</option>
                  <option value="classic">Classic</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Sound Effects</p>
                  <p className="text-xs text-gray-600">Suara notifikasi scan</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    aria-label="Toggle sound effects"
                    title="Aktifkan/nonaktifkan efek suara"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700">
                <Settings className="w-4 h-4 mr-2" />
                Simpan Pengaturan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">QR Code Scan</p>
                      <p className="text-xs text-gray-600">Customer memindai QR - ID: TXN-{Date.now().toString().slice(-6)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date().toLocaleTimeString('id-ID')}</p>
                    <Badge variant="outline" className="mt-1">Success</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}