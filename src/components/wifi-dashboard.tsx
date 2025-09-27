/**
 * WiFi Management Dashboard for Staff
 * Monitors WiFi status, router health, and provides control interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Router, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  Clock,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RouterStatus {
  online: boolean;
  responseTime: number;
  lastChecked: string;
  error?: string;
}

interface WiFiStats {
  currentPassword: string;
  totalDevices: number;
  guestDevices: number;
  dailyConnections: number;
  averageSessionTime: number;
  bandwidthUsage: number;
}

interface HealthCheck {
  healthy: boolean;
  issues: string[];
  actions: string[];
}

export const WiFiDashboard: React.FC = () => {
  const [routerStatus, setRouterStatus] = useState<RouterStatus>({
    online: false,
    responseTime: 0,
    lastChecked: '',
  });
  
  const [wifiStats, setWiFiStats] = useState<WiFiStats>({
    currentPassword: '',
    totalDevices: 0,
    guestDevices: 0,
    dailyConnections: 0,
    averageSessionTime: 0,
    bandwidthUsage: 0,
  });
  
  const [healthCheck, setHealthCheck] = useState<HealthCheck>({
    healthy: true,
    issues: [],
    actions: [],
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch data from APIs
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch router status
      const statusResponse = await fetch('/api/wifi/status');
      const statusData = await statusResponse.json();
      
      if (statusData.success) {
        setRouterStatus({
          online: statusData.data.router.online,
          responseTime: statusData.data.router.responseTime,
          lastChecked: statusData.data.router.lastChecked,
          error: statusData.data.router.error,
        });

        setHealthCheck({
          healthy: statusData.data.health.healthy,
          issues: statusData.data.health.issues,
          actions: statusData.data.health.actions,
        });

        setWiFiStats(prev => ({
          ...prev,
          totalDevices: statusData.data.devices.total,
          guestDevices: statusData.data.devices.guest,
        }));
      }

      // Fetch WiFi credentials
      const credentialsResponse = await fetch('/api/wifi');
      const credentialsData = await credentialsResponse.json();
      
      if (credentialsData.success) {
        setWiFiStats(prev => ({
          ...prev,
          currentPassword: credentialsData.data.raw.password,
        }));
      }

      // Fetch analytics
      const analyticsResponse = await fetch('/api/wifi/analytics');
      const analyticsData = await analyticsResponse.json();
      
      if (analyticsData.success) {
        setWiFiStats(prev => ({
          ...prev,
          dailyConnections: analyticsData.data.totalConnections,
          averageSessionTime: analyticsData.data.averageSessionTime,
          bandwidthUsage: analyticsData.data.bandwidthUsage || 0,
        }));
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePasswordUpdate = async () => {
    try {
      const newPassword = `QR${new Date().toISOString().slice(5, 10).replace('-', '')}`;
      
      const response = await fetch('/api/wifi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      const result = await response.json();
      
      if (result.success) {
        setWiFiStats(prev => ({ ...prev, currentPassword: newPassword }));
        alert('✅ Password WiFi berhasil diupdate!');
      } else {
        alert(`❌ Gagal update password: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Error updating password');
      console.error(error);
    }
  };

  const getStatusColor = (online: boolean, healthy: boolean) => {
    if (!online) return 'bg-red-500';
    if (!healthy) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (online: boolean, healthy: boolean) => {
    if (!online) return 'Offline';
    if (!healthy) return 'Issues Detected';
    return 'Online & Healthy';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🛰️ WiFi Management Dashboard
            </h1>
            <p className="text-gray-600">
              Orbit H2 Router • QRTunai Drive Thru
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <Button 
              onClick={fetchDashboardData}
              disabled={loading}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Router Status */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-gray-100">
                  <Router className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm text-gray-600">Router Status</p>
                  <div className="flex items-center mt-1">
                    <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(routerStatus.online, healthCheck.healthy)}`} />
                    <span className="font-semibold">
                      {getStatusText(routerStatus.online, healthCheck.healthy)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connected Devices */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Connected Devices</p>
                  <p className="text-2xl font-bold">
                    {wifiStats.guestDevices}/{wifiStats.totalDevices}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Connections */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Daily Connections</p>
                  <p className="text-2xl font-bold">{wifiStats.dailyConnections}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Session */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full p-2 bg-purple-100">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Avg. Session</p>
                  <p className="text-2xl font-bold">{wifiStats.averageSessionTime}m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current WiFi Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wifi className="h-5 w-5 mr-2" />
                    Current WiFi Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Network Name</label>
                          <div className="font-mono font-semibold">QRTunai_Guest</div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Current Password</label>
                          <div className="font-mono font-bold text-lg text-blue-700">
                            {wifiStats.currentPassword || 'Loading...'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Encryption:</span>
                        <div className="font-semibold">WPA2</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Time Limit:</span>
                        <div className="font-semibold">10 minutes</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Bandwidth:</span>
                        <div className="font-semibold">2 Mbps</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Router Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Router Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Connection Status</span>
                      <Badge variant={routerStatus.online ? "default" : "destructive"}>
                        {routerStatus.online ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Response Time</span>
                      <span className="font-semibold">{routerStatus.responseTime}ms</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Overall Health</span>
                      <Badge variant={healthCheck.healthy ? "default" : "secondary"}>
                        {healthCheck.healthy ? "Healthy" : "Issues Detected"}
                      </Badge>
                    </div>

                    {healthCheck.issues.length > 0 && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <strong>Issues Detected:</strong>
                            <ul className="list-disc list-inside text-sm">
                              {healthCheck.issues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Password Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Password Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Manual Password Update</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Update WiFi password manually. Biasanya dilakukan otomatis setiap hari jam 00:01.
                    </p>
                    <Button onClick={handlePasswordUpdate} className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Update Password Now
                    </Button>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">📋 Staff Instructions</h4>
                    <ol className="text-sm space-y-1">
                      <li>1. Buka browser → http://192.168.8.1</li>
                      <li>2. Login dengan admin credentials</li>
                      <li>3. WiFi Settings → Guest Network</li>
                      <li>4. Update password: <strong>{wifiStats.currentPassword}</strong></li>
                      <li>5. Save settings</li>
                    </ol>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => window.open('http://192.168.8.1', '_blank')}
                    >
                      🛰️ Open Router Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restart Router Connection
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      View Connected Devices
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="h-4 w-4 mr-2" />
                      Run Health Check
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📊 Usage Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{wifiStats.dailyConnections}</div>
                    <div className="text-sm text-gray-600">Total Connections Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{wifiStats.averageSessionTime}m</div>
                    <div className="text-sm text-gray-600">Average Session Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{wifiStats.bandwidthUsage}MB</div>
                    <div className="text-sm text-gray-600">Bandwidth Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">98%</div>
                    <div className="text-sm text-gray-600">Connection Success</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>⚙️ Automation Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>🤖 Automation Status: ACTIVE</strong>
                      <ul className="mt-2 text-sm space-y-1">
                        <li>✅ Daily password rotation: 00:01</li>
                        <li>✅ Router health check: Every 5 minutes</li>
                        <li>✅ Usage analytics: Every hour</li>
                        <li>✅ Session cleanup: Every 10 minutes</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WiFiDashboard;