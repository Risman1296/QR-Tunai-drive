
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MoreHorizontal, ShieldAlert, Lock, Save, Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import PaymentAccountSettings from '@/components/payment-account-settings';
import BankIntegrationManager from '@/components/bank-integration-manager';
import PinProtection from '@/components/pin-protection';
import { usePinStore } from '@/lib/pin-store';


import { useEffect } from 'react';
import type { TransactionFee } from '@/lib/system-config';

function generateId() {
  return 'FEE' + Math.random().toString(36).slice(2, 7).toUpperCase();
}

// Tarif logic moved below, only one export default allowed
export default function SettingsPage() {
  // Tarif/fee state and handlers
  const [feeSettings, setFeeSettings] = useState<TransactionFee[]>([]);
  const [feeLoading, setFeeLoading] = useState(false);
  const [feeChanged, setFeeChanged] = useState(false);
  const [feeError, setFeeError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setFeeLoading(true);
    fetch('/api/system/config')
      .then(res => res.json())
      .then(data => {
        setFeeSettings(data?.config?.transactionFees || []);
        setFeeLoading(false);
      })
      .catch(() => {
        setFeeError('Gagal memuat data tarif');
        setFeeLoading(false);
      });
  }, []);

  const handleFeeChange = (idx: number, key: keyof TransactionFee, value: string | boolean) => {
    setFeeSettings(fees => {
      const next = [...fees];
      next[idx] = { ...next[idx], [key]: value };
      return next;
    });
    setFeeChanged(true);
  };
  const handleAddFee = () => {
    setFeeSettings(fees => [
      ...fees,
      { id: generateId(), type: '', fee: '', status: true },
    ]);
    setFeeChanged(true);
  };
  const handleRemoveFee = (idx: number) => {
    setFeeSettings(fees => fees.filter((_, i) => i !== idx));
    setFeeChanged(true);
  };
  const handleSaveFees = async () => {
    setFeeLoading(true);
    setFeeError(null);
    try {
      const res = await fetch('/api/system/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionFees: feeSettings }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: 'Berhasil', description: 'Tarif berhasil disimpan.' });
        setFeeChanged(false);
      } else {
        setFeeError(data.error || 'Gagal menyimpan tarif');
        toast({ variant: 'destructive', title: 'Error', description: data.error });
      }
    } catch (e) {
      setFeeError('Gagal menyimpan tarif');
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menyimpan tarif' });
    } finally {
      setFeeLoading(false);
    }
  };

  // Password and PIN state/handlers
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // PIN-related state
  const { setAdminPin, verifyPin } = usePinStore();
  const [showPinField, setShowPinField] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [isChangingPin, setIsChangingPin] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Password change form submitted');
    setIsChangingPassword(true);

    try {
      console.log('Sending password change request');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();
      console.log('Password change response:', data);

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: data.message,
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error,
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat mengubah password',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('PIN change form submitted');
    setIsChangingPin(true);

    try {
      console.log('Current PIN data:', pinData);
      // Validate current PIN
      if (!verifyPin(pinData.currentPin)) {
        console.log('Current PIN verification failed');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'PIN lama tidak sesuai',
        });
        setIsChangingPin(false);
        return;
      }

      console.log('Current PIN verification passed');

      // Validate PIN requirements
      if (pinData.newPin.length < 4) {
        console.log('New PIN too short');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'PIN baru harus minimal 4 karakter',
        });
        setIsChangingPin(false);
        return;
      }

      if (pinData.newPin !== pinData.confirmPin) {
        console.log('PIN confirmation mismatch');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Konfirmasi PIN tidak cocok',
        });
        setIsChangingPin(false);
        return;
      }

      console.log('All PIN validations passed, updating PIN');
      // Update PIN
      setAdminPin(pinData.newPin);
      console.log('PIN updated successfully');
      
      toast({
        title: 'Berhasil',
        description: 'PIN akses berhasil diubah',
      });

      // Reset form
      setPinData({
        currentPin: '',
        newPin: '',
        confirmPin: ''
      });
    } catch (error) {
      console.error('PIN change error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Terjadi kesalahan saat mengubah PIN',
      });
    } finally {
      setIsChangingPin(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <PinProtection>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">
            Kelola tarif dan konfigurasi outlet Anda.
          </p>
        </div>

        <Alert variant="destructive" className="border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-600">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Halaman Terbatas</AlertTitle>
            <AlertDescription>
              Hanya pengguna dengan peran "Owner" yang dapat melihat dan mengubah pengaturan ini.
            </AlertDescription>
          </Alert>

        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="security">Keamanan</TabsTrigger>
            <TabsTrigger value="fees">Tarif</TabsTrigger>
            <TabsTrigger value="payment">Akun Pembayaran</TabsTrigger>
            <TabsTrigger value="outlet">Outlet</TabsTrigger>
          </TabsList>
        
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Ubah Password
                </CardTitle>
                <CardDescription>
                  Ubah password akun Anda untuk menjaga keamanan sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Password Saat Ini</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isChangingPassword}>
                      <Save className="mr-2 h-4 w-4" />
                      {isChangingPassword ? 'Mengubah...' : 'Ubah Password'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleLogout}>
                      Logout
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldAlert className="mr-2 h-5 w-5" />
                  Ubah PIN Akses
                </CardTitle>
                <CardDescription>
                  Ubah PIN untuk mengakses halaman pengaturan dan manajemen shift
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePinChange} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPin">PIN Saat Ini</Label>
                    <div className="relative">
                      <Input
                        id="currentPin"
                        type={showPinField.current ? "text" : "password"}
                        value={pinData.currentPin}
                        onChange={(e) => setPinData(prev => ({ ...prev, currentPin: e.target.value }))}
                        maxLength={10}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPinField(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPinField.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPin">PIN Baru</Label>
                    <div className="relative">
                      <Input
                        id="newPin"
                        type={showPinField.new ? "text" : "password"}
                        value={pinData.newPin}
                        onChange={(e) => setPinData(prev => ({ ...prev, newPin: e.target.value }))}
                        maxLength={10}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPinField(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPinField.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPin">Konfirmasi PIN Baru</Label>
                    <div className="relative">
                      <Input
                        id="confirmPin"
                        type={showPinField.confirm ? "text" : "password"}
                        value={pinData.confirmPin}
                        onChange={(e) => setPinData(prev => ({ ...prev, confirmPin: e.target.value }))}
                        maxLength={10}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPinField(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPinField.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isChangingPin}>
                      <Save className="mr-2 h-4 w-4" />
                      {isChangingPin ? 'Mengubah...' : 'Ubah PIN'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Informasi Keamanan</CardTitle>
                <CardDescription>
                  Informasi penting terkait keamanan akun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status Login</Label>
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Aktif
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sesi Login</Label>
                    <p className="text-sm text-muted-foreground">24 jam</p>
                  </div>
                </div>
                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Tips Keamanan</AlertTitle>
                  <AlertDescription>
                    • Gunakan password minimal 6 karakter<br/>
                    • Jangan bagikan password kepada orang lain<br/>
                    • Logout setelah selesai menggunakan sistem
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Tarif Transaksi</CardTitle>
              <CardDescription>
                Atur biaya administrasi untuk setiap jenis transaksi yang relevan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {feeError && <Alert variant="destructive">{feeError}</Alert>}
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis Transaksi</TableHead>
                      <TableHead>Tarif</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeSettings.map((fee, idx) => (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <Input
                            value={fee.type}
                            onChange={e => handleFeeChange(idx, 'type', e.target.value)}
                            placeholder="Jenis transaksi"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={fee.fee}
                            onChange={e => handleFeeChange(idx, 'fee', e.target.value)}
                            placeholder="Rp 0 / %"
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={fee.status}
                            onCheckedChange={v => handleFeeChange(idx, 'status', v)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveFee(idx)} title="Hapus">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 6l12 12M6 18L18 6"/></svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex gap-2 justify-between pt-2">
                <Button variant="outline" onClick={handleAddFee} disabled={feeLoading}>Tambah Tarif</Button>
                <Button onClick={handleSaveFees} disabled={!feeChanged || feeLoading}>
                  {feeLoading ? 'Menyimpan...' : 'Simpan Perubahan Tarif'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment">
          <div className="space-y-6">
            <PaymentAccountSettings />
            <BankIntegrationManager />
          </div>
        </TabsContent>

        <TabsContent value="outlet">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Konfigurasi Outlet</CardTitle>
                <CardDescription>
                  Pengaturan teknis untuk integrasi dan operasional outlet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-w-lg">
                  <div className="space-y-2">
                      <Label htmlFor="outletId">ID Outlet</Label>
                      <Input id="outletId" defaultValue="LC-PST" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="apiUrl">API Base URL</Label>
                      <Input id="apiUrl" defaultValue="https://api.qrtunaidrive.com/v1" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="adminToken">Token Admin</Label>
                      <Input id="adminToken" type="password" defaultValue="supersecrettoken" />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                      <Switch id="sound-notification" defaultChecked={true}/>
                      <Label htmlFor="sound-notification">Aktifkan Notifikasi Suara</Label>
                  </div>
                  <div className="flex justify-end pt-4">
                      <Button>Simpan Konfigurasi</Button>
                  </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Backup Data</CardTitle>
                <CardDescription>
                  Backup dan restore data transaksi dan pengaturan sistem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Backup Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Download backup data transaksi dan pengaturan dalam format JSON
                    </p>
                    <Button onClick={() => window.open('/api/admin/backup', '_blank')}>
                      <Save className="mr-2 h-4 w-4" />
                      Download Backup
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Informasi Sistem</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Versi:</span>
                        <span>v1.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Backup:</span>
                        <span>Belum pernah</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Environment:</span>
                        <span>Development</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Penting</AlertTitle>
                  <AlertDescription>
                    • Lakukan backup secara berkala untuk menjaga keamanan data<br/>
                    • Simpan file backup di tempat yang aman<br/>
                    • Hanya owner yang dapat melakukan backup data
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </PinProtection>
  )
}
