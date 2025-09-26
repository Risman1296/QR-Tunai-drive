"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Monitor, 
  Database, 
  Shield, 
  Activity, 
  Smartphone,
  Globe,
  Save,
  RotateCcw,
  Power,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Building2,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SystemConfig {
  // QR Display Settings
  qrSize: number;
  qrRefreshInterval: number;
  autoRefresh: boolean;
  displayMode: 'dominant' | 'fullscreen' | 'dashboard';
  landscapeMode: boolean;
  
  // Production Settings
  productionMode: boolean;
  demoMode: boolean;
  debugMode: boolean;
  simulationEnabled: boolean;
  
  // System Settings
  serverPort: number;
  maxConnections: number;
  sessionTimeout: number;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  
  // Security Settings
  enableSSL: boolean;
  apiRateLimit: number;
  authTimeout: number;
  
  // Banking Integration
  bankName: string;
  branchCode: string;
  terminalId: string;
  merchantCode: string;
}

export default function QRSystemSettings() {
  const router = useRouter();
  const [config, setConfig] = useState<SystemConfig>({
    // QR Display Settings
    qrSize: 480,
    qrRefreshInterval: 60,
    autoRefresh: false,
    displayMode: 'dominant',
    landscapeMode: true,
    
    // Production Settings
    productionMode: true,
    demoMode: false,
    debugMode: false,
    simulationEnabled: false,
    
    // System Settings
    serverPort: 3000,
    maxConnections: 100,
    sessionTimeout: 30,
    logLevel: 'info',
    
    // Security Settings
    enableSSL: false,
    apiRateLimit: 100,
    authTimeout: 15,
    
    // Banking Integration
    bankName: 'Bank Terdepan',
    branchCode: 'BTD001',
    terminalId: 'QRT001',
    merchantCode: 'MRC001'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [systemStatus, setSystemStatus] = useState({
    database: 'connected',
    server: 'running',
    qrService: 'active',
    security: 'enabled'
  });

  // Load current configuration
  useEffect(() => {
    loadConfiguration();
    checkSystemStatus();
  }, []);

  const loadConfiguration = async () => {
    try {
      // Load from localStorage or API
      const savedConfig = localStorage.getItem('qr-system-config');
      if (savedConfig) {
        setConfig({ ...config, ...JSON.parse(savedConfig) });
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  const checkSystemStatus = async () => {
    try {
      // Check system components status
      const response = await fetch('/api/system/status');
      if (response.ok) {
        const status = await response.json();
        setSystemStatus(status);
      }
    } catch (error) {
      console.error('Error checking system status:', error);
    }
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage and API
      localStorage.setItem('qr-system-config', JSON.stringify(config));
      
      // Send to server
      const response = await fetch('/api/system/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const resetConfiguration = () => {
    const defaultConfig: SystemConfig = {
      qrSize: 480,
      qrRefreshInterval: 60,
      autoRefresh: false,
      displayMode: 'dominant',
      landscapeMode: true,
      productionMode: true,
      demoMode: false,
      debugMode: false,
      simulationEnabled: false,
      serverPort: 3000,
      maxConnections: 100,
      sessionTimeout: 30,
      logLevel: 'info',
      enableSSL: false,
      apiRateLimit: 100,
      authTimeout: 15,
      bankName: 'Bank Terdepan',
      branchCode: 'BTD001',
      terminalId: 'QRT001',
      merchantCode: 'MRC001'
    };
    setConfig(defaultConfig);
  };

  const updateConfig = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'running':
      case 'active':
      case 'enabled':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
      case 'disconnected':
      case 'stopped':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Pengaturan Sistem QR Tunai
              </h1>
              <p className="text-gray-600">
                Kelola konfigurasi lengkap sistem QR Tunai Drive-Thru
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant={config.productionMode ? "default" : "secondary"}>
              {config.productionMode ? 'PRODUCTION' : 'DEVELOPMENT'}
            </Badge>
            
            <Button
              onClick={resetConfiguration}
              variant="outline"
              className="text-gray-600"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            
            <Button
              onClick={saveConfiguration}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>

        {/* Save Status Alert */}
        {saveStatus !== 'idle' && (
          <Alert className={saveStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription className={saveStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
              {saveStatus === 'success' ? 
                '✅ Konfigurasi berhasil disimpan dan diterapkan!' : 
                '❌ Gagal menyimpan konfigurasi. Silakan coba lagi.'
              }
            </AlertDescription>
          </Alert>
        )}

        {/* System Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Status Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.database)}
                <span className="text-sm">Database: {systemStatus.database}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.server)}
                <span className="text-sm">Server: {systemStatus.server}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.qrService)}
                <span className="text-sm">QR Service: {systemStatus.qrService}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(systemStatus.security)}
                <span className="text-sm">Security: {systemStatus.security}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Tabs */}
        <Tabs defaultValue="display" className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="display">
              <Monitor className="w-4 h-4 mr-2" />
              Display
            </TabsTrigger>
            <TabsTrigger value="production">
              <Zap className="w-4 h-4 mr-2" />
              Production
            </TabsTrigger>
            <TabsTrigger value="system">
              <Settings className="w-4 h-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="banking">
              <Building2 className="w-4 h-4 mr-2" />
              Banking
            </TabsTrigger>
          </TabsList>

          {/* QR Display Settings */}
          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Tampilan QR</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="qrSize">Ukuran QR Code (px)</Label>
                    <Input
                      id="qrSize"
                      type="number"
                      value={config.qrSize}
                      onChange={(e) => updateConfig('qrSize', parseInt(e.target.value))}
                      min="200"
                      max="600"
                    />
                    <p className="text-sm text-gray-500">Ukuran saat ini: {config.qrSize}px</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="displayMode">Mode Tampilan</Label>
                    <Select 
                      value={config.displayMode} 
                      onValueChange={(value: any) => updateConfig('displayMode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dominant">QR Dominan (Landscape)</SelectItem>
                        <SelectItem value="fullscreen">Fullscreen</SelectItem>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refreshInterval">Interval Refresh (detik)</Label>
                    <Input
                      id="refreshInterval"
                      type="number"
                      value={config.qrRefreshInterval}
                      onChange={(e) => updateConfig('qrRefreshInterval', parseInt(e.target.value))}
                      min="10"
                      max="300"
                      disabled={!config.autoRefresh}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Refresh</Label>
                      <p className="text-sm text-gray-500">Refresh otomatis berdasarkan waktu</p>
                    </div>
                    <Switch
                      checked={config.autoRefresh}
                      onCheckedChange={(checked) => updateConfig('autoRefresh', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Landscape Mode</Label>
                      <p className="text-sm text-gray-500">Optimasi untuk monitor landscape</p>
                    </div>
                    <Switch
                      checked={config.landscapeMode}
                      onCheckedChange={(checked) => updateConfig('landscapeMode', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Production Settings */}
          <TabsContent value="production">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Production</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <div>
                      <Label className="font-semibold text-blue-900">Production Mode</Label>
                      <p className="text-sm text-blue-700">Aktifkan mode produksi untuk lingkungan live</p>
                    </div>
                    <Switch
                      checked={config.productionMode}
                      onCheckedChange={(checked) => updateConfig('productionMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                    <div>
                      <Label className="font-semibold text-red-900">Demo Mode</Label>
                      <p className="text-sm text-red-700">Mode demo untuk presentasi (nonaktifkan untuk production)</p>
                    </div>
                    <Switch
                      checked={config.demoMode}
                      onCheckedChange={(checked) => updateConfig('demoMode', checked)}
                      disabled={config.productionMode}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Debug Mode</Label>
                      <p className="text-sm text-gray-500">Aktifkan logging detail untuk debugging</p>
                    </div>
                    <Switch
                      checked={config.debugMode}
                      onCheckedChange={(checked) => updateConfig('debugMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                    <div>
                      <Label className="font-semibold text-yellow-900">Simulasi Data</Label>
                      <p className="text-sm text-yellow-700">Gunakan data simulasi (matikan untuk production)</p>
                    </div>
                    <Switch
                      checked={config.simulationEnabled}
                      onCheckedChange={(checked) => updateConfig('simulationEnabled', checked)}
                      disabled={config.productionMode}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logLevel">Level Logging</Label>
                  <Select 
                    value={config.logLevel} 
                    onValueChange={(value: any) => updateConfig('logLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error Only</SelectItem>
                      <SelectItem value="warn">Warning & Error</SelectItem>
                      <SelectItem value="info">Info, Warning & Error</SelectItem>
                      <SelectItem value="debug">All Logs (Debug)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {config.productionMode && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Mode Production aktif: Demo mode dan simulasi data otomatis dinonaktifkan.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Sistem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="serverPort">Server Port</Label>
                    <Input
                      id="serverPort"
                      type="number"
                      value={config.serverPort}
                      onChange={(e) => updateConfig('serverPort', parseInt(e.target.value))}
                      min="1000"
                      max="9999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxConnections">Max Connections</Label>
                    <Input
                      id="maxConnections"
                      type="number"
                      value={config.maxConnections}
                      onChange={(e) => updateConfig('maxConnections', parseInt(e.target.value))}
                      min="10"
                      max="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (menit)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={config.sessionTimeout}
                      onChange={(e) => updateConfig('sessionTimeout', parseInt(e.target.value))}
                      min="5"
                      max="120"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Keamanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="apiRateLimit">API Rate Limit (per menit)</Label>
                    <Input
                      id="apiRateLimit"
                      type="number"
                      value={config.apiRateLimit}
                      onChange={(e) => updateConfig('apiRateLimit', parseInt(e.target.value))}
                      min="10"
                      max="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="authTimeout">Auth Timeout (menit)</Label>
                    <Input
                      id="authTimeout"
                      type="number"
                      value={config.authTimeout}
                      onChange={(e) => updateConfig('authTimeout', parseInt(e.target.value))}
                      min="5"
                      max="60"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable SSL/HTTPS</Label>
                    <p className="text-sm text-gray-500">Aktifkan koneksi SSL untuk production</p>
                  </div>
                  <Switch
                    checked={config.enableSSL}
                    onCheckedChange={(checked) => updateConfig('enableSSL', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banking Integration */}
          <TabsContent value="banking">
            <Card>
              <CardHeader>
                <CardTitle>Integrasi Perbankan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Nama Bank</Label>
                    <Input
                      id="bankName"
                      value={config.bankName}
                      onChange={(e) => updateConfig('bankName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branchCode">Kode Cabang</Label>
                    <Input
                      id="branchCode"
                      value={config.branchCode}
                      onChange={(e) => updateConfig('branchCode', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terminalId">Terminal ID</Label>
                    <Input
                      id="terminalId"
                      value={config.terminalId}
                      onChange={(e) => updateConfig('terminalId', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="merchantCode">Merchant Code</Label>
                    <Input
                      id="merchantCode"
                      value={config.merchantCode}
                      onChange={(e) => updateConfig('merchantCode', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="text-sm text-gray-500">
            Terakhir diperbarui: {new Date().toLocaleString('id-ID')}
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={() => router.push('/qr-display')}
              variant="outline"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Lihat QR Display
            </Button>
            
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}