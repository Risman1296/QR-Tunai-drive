import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import BankLogo from '@/components/bank-logo';
import {
  Plus,
  Building2,
  CreditCard,
  Trash2,
  Edit,
  Download,
  Upload,
  QrCode,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  isActive: boolean;
  logo: string;
  swiftCode: string;
  branchName?: string;
  branchCode?: string;
  accountType: 'current' | 'savings' | 'escrow';
  dailyLimit: number;
  monthlyLimit: number;
  integrationId?: string;
}

interface QrisAccount {
  id: string;
  merchantId: string;
  merchantName: string;
  qrisCode: string;
  logoUrl: string;
  isActive: boolean;
  feePercentage: number;
  dailyLimit: number;
  monthlyLimit: number;
}

interface PaymentConfiguration {
  bankAccounts: BankAccount[];
  qrisAccounts: QrisAccount[];
  defaultPaymentMethod: 'bank' | 'qris';
  allowMultipleAccounts: boolean;
  enableTransactionFees: boolean;
  lastUpdated: string;
}

interface BankCodes {
  [key: string]: {
    name: string;
    code: string;
    swiftCode: string;
  };
}

interface BankIntegration {
  id: string;
  bankName: string;
  bankCode: string;
  provider: string;
  description?: string;
}

const PaymentAccountSettings = () => {
  const [config, setConfig] = useState<PaymentConfiguration | null>(null);
  const [bankCodes, setBankCodes] = useState<BankCodes>({});
  const [integrations, setIntegrations] = useState<BankIntegration[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [showAccountNumbers, setShowAccountNumbers] = useState(false);

  // Form states
  const [accountType, setAccountType] = useState<'bank' | 'qris'>('bank');
  const [formData, setFormData] = useState({
    // Bank fields
    bankCode: '',
    accountNumber: '',
    accountHolder: '',
    branchName: '',
    branchCode: '',
    accountTypeBank: 'savings' as 'current' | 'savings' | 'escrow',
    dailyLimit: 500000000,
    monthlyLimit: 10000000000,
    integrationId: '',
    // QRIS fields
    merchantId: '',
    merchantName: '',
    qrisCode: '',
    feePercentage: 0.7,
    dailyLimitQris: 20000000,
    monthlyLimitQris: 500000000,
    // Common
    isActive: true
  });

  useEffect(() => {
    fetchPaymentConfiguration();
  }, []);

  const fetchPaymentConfiguration = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-config');
      const result = await response.json();

      if (response.ok) {
        setConfig(result.data);
        setBankCodes(result.bankCodes);
        setIntegrations(result.data?.bankIntegrations ?? []);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal mengambil konfigurasi pembayaran',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching payment config:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengambil konfigurasi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (showAccountNumbers) return accountNumber;
    return accountNumber.replace(/(.{4})(.*)(.{4})/, '$1****$3');
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload = {
        type: accountType,
        ...(accountType === 'bank' ? {
          bankCode: formData.bankCode,
          accountNumber: formData.accountNumber,
          accountHolder: formData.accountHolder,
          branchName: formData.branchName || undefined,
          branchCode: formData.branchCode || undefined,
          accountType: formData.accountTypeBank,
          dailyLimit: formData.dailyLimit,
          monthlyLimit: formData.monthlyLimit,
          isActive: formData.isActive,
          integrationId: formData.integrationId || undefined
        } : {
          merchantId: formData.merchantId,
          merchantName: formData.merchantName,
          qrisCode: formData.qrisCode,
          feePercentage: formData.feePercentage,
          dailyLimit: formData.dailyLimitQris,
          monthlyLimit: formData.monthlyLimitQris,
          isActive: formData.isActive
        })
      };

      const response = await fetch('/api/payment-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: result.message
        });
        setShowAddDialog(false);
        resetForm();
        fetchPaymentConfiguration();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal menambahkan akun',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menambahkan akun',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (type: 'bank' | 'qris', id: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment-config', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: 'Akun berhasil dihapus'
        });
        fetchPaymentConfiguration();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal menghapus akun',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menghapus akun',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccountStatus = async (type: 'bank' | 'qris', id: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/payment-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateAccount',
          type,
          id,
          isActive: !currentStatus
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Berhasil',
          description: `Akun ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`
        });
        fetchPaymentConfiguration();
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Gagal mengubah status akun',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error toggling account status:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat mengubah status',
        variant: 'destructive'
      });
    }
  };

  const handleBackupConfiguration = async () => {
    try {
      const response = await fetch('/api/payment-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'backup' })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `payment-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: 'Berhasil',
          description: 'Backup konfigurasi berhasil diunduh'
        });
      } else {
        throw new Error('Backup failed');
      }
    } catch (error) {
      console.error('Error backing up configuration:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat backup konfigurasi',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      bankCode: '',
      accountNumber: '',
      accountHolder: '',
      branchName: '',
      branchCode: '',
      accountTypeBank: 'savings',
      integrationId: '',
      dailyLimit: 500000000,
      monthlyLimit: 10000000000,
      merchantId: '',
      merchantName: '',
      qrisCode: '',
      feePercentage: 0.7,
      dailyLimitQris: 20000000,
      monthlyLimitQris: 500000000,
      isActive: true
    });
    setAccountType('bank');
  };

  if (loading && !config) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Akun Pembayaran</h2>
          <p className="text-muted-foreground">
            Kelola rekening bank dan akun QRIS untuk outlet Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAccountNumbers(!showAccountNumbers)}
          >
            {showAccountNumbers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showAccountNumbers ? 'Sembunyikan' : 'Tampilkan'} Nomor
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackupConfiguration}
          >
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Akun
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Tambah Akun Pembayaran</DialogTitle>
                <DialogDescription>
                  Tambah rekening bank atau akun QRIS baru untuk outlet Anda
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleAddAccount} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={accountType === 'bank' ? 'default' : 'outline'}
                    onClick={() => setAccountType('bank')}
                    className="h-auto flex-col gap-2 p-4"
                  >
                    <Building2 className="h-6 w-6" />
                    Rekening Bank
                  </Button>
                  <Button
                    type="button"
                    variant={accountType === 'qris' ? 'default' : 'outline'}
                    onClick={() => setAccountType('qris')}
                    className="h-auto flex-col gap-2 p-4"
                  >
                    <QrCode className="h-6 w-6" />
                    Akun QRIS
                  </Button>
                </div>

                {accountType === 'bank' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankCode">Bank</Label>
                        <Select value={formData.bankCode} onValueChange={(value) => setFormData({...formData, bankCode: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(bankCodes).map(([code, bank]) => (
                              <SelectItem key={code} value={code}>
                                {bank.name} ({bank.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountTypeBank">Jenis Rekening</Label>
                        <Select value={formData.accountTypeBank} onValueChange={(value: any) => setFormData({...formData, accountTypeBank: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="savings">Tabungan</SelectItem>
                            <SelectItem value="current">Giro</SelectItem>
                            <SelectItem value="escrow">Escrow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="integrationId">Integrasi Realtime (Opsional)</Label>
                      <Select
                        value={formData.integrationId}
                        onValueChange={(value) => setFormData({...formData, integrationId: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={integrations.length ? 'Pilih integrasi' : 'Belum ada integrasi'} />
                        </SelectTrigger>
                        <SelectContent>
                          {integrations.length === 0 ? (
                            <SelectItem value="" disabled>Tambah integrasi di tab pengaturan</SelectItem>
                          ) : (
                            integrations.map((integration) => (
                              <SelectItem key={integration.id} value={integration.id}>
                                {integration.bankName} ({integration.provider})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Diwajibkan untuk saldo realtime. Kosongkan jika akun ini belum menggunakan API.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Nomor Rekening</Label>
                      <Input
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                        placeholder="1234567890"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountHolder">Nama Pemilik Rekening</Label>
                      <Input
                        id="accountHolder"
                        value={formData.accountHolder}
                        onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                        placeholder="PT. QR Tunai Drive"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="branchName">Nama Cabang (Opsional)</Label>
                        <Input
                          id="branchName"
                          value={formData.branchName}
                          onChange={(e) => setFormData({...formData, branchName: e.target.value})}
                          placeholder="Jakarta Pusat"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="branchCode">Kode Cabang (Opsional)</Label>
                        <Input
                          id="branchCode"
                          value={formData.branchCode}
                          onChange={(e) => setFormData({...formData, branchCode: e.target.value})}
                          placeholder="001"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dailyLimit">Limit Harian</Label>
                        <Input
                          id="dailyLimit"
                          type="number"
                          value={formData.dailyLimit}
                          onChange={(e) => setFormData({...formData, dailyLimit: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthlyLimit">Limit Bulanan</Label>
                        <Input
                          id="monthlyLimit"
                          type="number"
                          value={formData.monthlyLimit}
                          onChange={(e) => setFormData({...formData, monthlyLimit: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {accountType === 'qris' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="merchantId">Merchant ID</Label>
                        <Input
                          id="merchantId"
                          value={formData.merchantId}
                          onChange={(e) => setFormData({...formData, merchantId: e.target.value})}
                          placeholder="ID123456789"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="merchantName">Nama Merchant</Label>
                        <Input
                          id="merchantName"
                          value={formData.merchantName}
                          onChange={(e) => setFormData({...formData, merchantName: e.target.value})}
                          placeholder="QR Tunai Drive"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qrisCode">Kode QRIS</Label>
                      <Input
                        id="qrisCode"
                        value={formData.qrisCode}
                        onChange={(e) => setFormData({...formData, qrisCode: e.target.value})}
                        placeholder="00020101021126..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="feePercentage">Fee (%)</Label>
                        <Input
                          id="feePercentage"
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={formData.feePercentage}
                          onChange={(e) => setFormData({...formData, feePercentage: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dailyLimitQris">Limit Harian</Label>
                        <Input
                          id="dailyLimitQris"
                          type="number"
                          value={formData.dailyLimitQris}
                          onChange={(e) => setFormData({...formData, dailyLimitQris: parseInt(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthlyLimitQris">Limit Bulanan</Label>
                        <Input
                          id="monthlyLimitQris"
                          type="number"
                          value={formData.monthlyLimitQris}
                          onChange={(e) => setFormData({...formData, monthlyLimitQris: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Akun aktif</Label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => {setShowAddDialog(false); resetForm();}}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Akun'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Bank Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Rekening Bank ({config?.bankAccounts.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {config?.bankAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada rekening bank yang ditambahkan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {config?.bankAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <BankLogo 
                      bankCode={account.bankCode} 
                      bankName={account.bankName}
                      size="lg"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{account.bankName}</h4>
                        <Badge variant={account.isActive ? "default" : "secondary"}>
                          {account.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {maskAccountNumber(account.accountNumber)} • {account.accountHolder}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {account.accountType} • Limit: {formatCurrency(account.dailyLimit)}/hari
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={account.isActive}
                      onCheckedChange={() => handleToggleAccountStatus('bank', account.id, account.isActive)}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Rekening Bank</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus rekening {account.bankName} ({maskAccountNumber(account.accountNumber)})? Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAccount('bank', account.id)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QRIS Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Akun QRIS ({config?.qrisAccounts.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {config?.qrisAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada akun QRIS yang ditambahkan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {config?.qrisAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <QrCode className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{account.merchantName}</h4>
                        <Badge variant={account.isActive ? "default" : "secondary"}>
                          {account.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ID: {account.merchantId} • Fee: {account.feePercentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Limit: {formatCurrency(account.dailyLimit)}/hari
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={account.isActive}
                      onCheckedChange={() => handleToggleAccountStatus('qris', account.id, account.isActive)}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Akun QRIS</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus akun QRIS {account.merchantName}? Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAccount('qris', account.id)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentAccountSettings;