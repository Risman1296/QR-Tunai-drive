'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFinancialStore } from '@/lib/financial-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { BankAccount as ConfigBankAccount, BankIntegration as ConfigBankIntegration } from '@/lib/payment-config';
import { 
  Wallet, 
  CreditCard, 
  Banknote, 
  TrendingUp, 
  TrendingDown,
  ArrowRightLeft,
  Settings,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Loader2
} from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}


function maskAccountNumber(value?: string) {
  if (!value) return '-'
  const digits = value.replace(/[^0-9]/g, '')
  if (digits.length <= 4) return digits
  const masked = digits
    .slice(0, Math.max(0, digits.length - 4))
    .replace(/\d/g, '•')
  return `${masked}${digits.slice(-4)}`
}

function extractBalance(provider: string, payload: any): number | undefined {
  if (!payload) return undefined
  const candidates: Array<any> = [
    payload.balance,
    payload.Balance,
    payload.currentBalance,
    payload.CurrentBalance,
    payload.availableBalance,
    payload.available_balance,
    payload.data?.balance,
    payload.data?.currentBalance,
    payload.data?.CurrentBalance,
    payload.data?.availableBalance,
    payload.data?.available_balance,
    payload?.Data?.[0]?.availableBalance,
    payload?.BalanceAmount,
    payload?.BalanceInfo?.availableBalance,
    payload?.balanceInfo?.availableBalance,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate
    }
    if (typeof candidate === 'string') {
      const normalized = Number(candidate.replace(/[^0-9.-]/g, ''))
      if (!Number.isNaN(normalized)) {
        return normalized
      }
    }
  }

  if (provider === 'bca_snap_qris' && Array.isArray(payload?.Data)) {
    const first = payload.Data[0]?.Balance || payload.Data[0]?.balance
    if (first && Number.isFinite(Number(first))) {
      return Number(first)
    }
  }

  if (provider === 'bri_realtime') {
    const direct = payload?.data?.saldo || payload?.data?.balance || payload?.data?.availableBalance
    if (typeof direct === 'number') return direct
    if (typeof direct === 'string') {
      const normalized = Number(direct.replace(/[^0-9.-]/g, ''))
      if (!Number.isNaN(normalized)) return normalized
    }
  }

  return undefined
}

type BalanceState = {
  loading?: boolean
  value?: number
  fetchedAt?: string
  error?: string
  raw?: any
}

// Account Balance Card Component
function AccountCard({ account, onUpdate }: { account: any, onUpdate: (id: string, balance: number) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBalance, setNewBalance] = useState(account.balance.toString());

  const handleUpdate = () => {
    const balance = parseFloat(newBalance);
    if (!isNaN(balance)) {
      onUpdate(account.id, balance);
      setIsEditing(false);
    }
  };

  const getIcon = () => {
    switch (account.type) {
      case 'bank': return <CreditCard className="h-5 w-5" />;
      case 'merchant': return <Wallet className="h-5 w-5" />;
      case 'cash': return <Banknote className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <div 
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: account.color }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getIcon()}
            {account.name}
          </CardTitle>
          <Badge variant={account.isActive ? 'default' : 'secondary'}>
            {account.isActive ? 'Aktif' : 'Nonaktif'}
          </Badge>
        </div>
        {account.type === 'bank' && account.accountNumber && (
          <CardDescription className="font-mono text-xs">
            {account.accountNumber}
          </CardDescription>
        )}
        {account.type === 'merchant' && account.merchantId && (
          <CardDescription className="text-xs">
            {account.provider} • {account.merchantId}
          </CardDescription>
        )}
        {account.location && (
          <CardDescription className="text-xs">
            📍 {account.location}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
              />
              <Button size="sm" onClick={handleUpdate}>✓</Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>✕</Button>
            </div>
          ) : (
            <>
              <div className="text-lg font-bold text-primary">
                {formatCurrency(account.balance)}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setNewBalance(account.balance.toString());
                  setIsEditing(true);
                }}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Financial Summary Component
function FinancialSummaryCard() {
  const { getFinancialSummary } = useFinancialStore();
  
  // Get today's summary
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  const summary = getFinancialSummary(startOfDay, endOfDay);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kas Masuk</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-green-600">{formatCurrency(summary.totalCashIn)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kas Keluar</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-red-600">{formatCurrency(summary.totalCashOut)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">QRIS Masuk</CardTitle>
          <Wallet className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-blue-600">{formatCurrency(summary.totalQrisIn)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Flow</CardTitle>
          <ArrowRightLeft className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-xl font-bold ${summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.netFlow)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Transfer Dialog Component
function TransferDialog() {
  const { getAllAccounts, processTransactionFlow } = useFinancialStore();
  const [isOpen, setIsOpen] = useState(false);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  
  const accounts = getAllAccounts();

  const handleTransfer = () => {
    if (fromAccount && toAccount && amount && parseFloat(amount) > 0) {
      processTransactionFlow('transfer', parseFloat(amount), {
        fromAccountId: fromAccount,
        toAccountId: toAccount,
        notes,
        shiftId: 'current' // You might want to get actual shift ID
      });
      
      setFromAccount('');
      setToAccount('');
      setAmount('');
      setNotes('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Dana</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fromAccount">Dari Akun</Label>
            <select
              id="fromAccount"
              value={fromAccount}
              onChange={(e) => setFromAccount(e.target.value)}
              className="w-full p-2 border rounded-md"
              title="Pilih akun sumber untuk transfer"
            >
              <option value="">Pilih akun sumber</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} - {formatCurrency(acc.balance)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="toAccount">Ke Akun</Label>
            <select
              id="toAccount"
              value={toAccount}
              onChange={(e) => setToAccount(e.target.value)}
              className="w-full p-2 border rounded-md"
              title="Pilih akun tujuan untuk transfer"
            >
              <option value="">Pilih akun tujuan</option>
              {accounts.filter(acc => acc.id !== fromAccount).map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} - {formatCurrency(acc.balance)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <Label htmlFor="amount">Jumlah</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Catatan</Label>
            <Textarea
              id="notes"
              placeholder="Catatan transfer (opsional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <Button onClick={handleTransfer} className="w-full">
            Transfer {amount && formatCurrency(parseFloat(amount))}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Transaction History Component
function TransactionHistory() {
  const { transactions } = useFinancialStore();
  const recentTransactions = transactions.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Riwayat Transaksi Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Akun</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="text-sm">
                  {formatDateTime(tx.date)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">{tx.description}</div>
                  <Badge variant="outline" className="text-xs">
                    {tx.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {tx.type === 'debit' ? (
                    <div className="flex items-center gap-1">
                      <span className="text-red-600">←</span>
                      {tx.fromAccount?.name}
                      {tx.toAccount && (
                        <>
                          <span>→</span>
                          {tx.toAccount.name}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-green-600">→</span>
                      {tx.toAccount?.name}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span className={tx.type === 'debit' ? 'text-red-600' : 'text-green-600'}>
                    {tx.type === 'debit' ? '-' : '+'}
                    {formatCurrency(tx.amount)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}


interface RealtimeBankCardProps {
  account: {
    id: string
    bankName: string
    bankCode: string
    accountNumber: string
    accountHolder: string
    balance: number
    isActive: boolean
    integrationId?: string
  }
  integration?: { id: string; provider: string; bankName: string }
  state?: BalanceState
  onRefresh: () => void
}

function RealtimeBankCard({ account, integration, state, onRefresh }: RealtimeBankCardProps) {
  const isLoading = Boolean(state?.loading)
  const error = state?.error
  const displayBalance = Number.isFinite(state?.value) ? Number(state?.value) : account.balance
  const lastUpdatedLabel = state?.fetchedAt ? formatDateTime(new Date(state.fetchedAt)) : null

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{account.bankName}</CardTitle>
          <Badge variant={account.isActive ? 'default' : 'secondary'}>{account.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
        </div>
        <CardDescription className="font-mono text-xs">{maskAccountNumber(account.accountNumber)}</CardDescription>
        <CardDescription className="text-xs">{account.accountHolder}</CardDescription>
        <CardDescription className="text-xs">
          Integrasi: {integration ? `${integration.bankName} (${integration.provider})` : 'Belum terhubung'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Saldo saat ini</p>
            <p className="text-xl font-semibold">{formatCurrency(displayBalance)}</p>
          </div>
          <Button size="sm" variant="outline" onClick={onRefresh} disabled={isLoading || !integration}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </>
            )}
          </Button>
        </div>
        {lastUpdatedLabel && (
          <p className="text-xs text-muted-foreground">Terakhir diperbarui: {lastUpdatedLabel}</p>
        )}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function FinancialManagementPage() {
  const { 
    bankAccounts, 
    merchantAccounts, 
    cashAccounts,
    initializeAccounts,
    updateAccountBalance
  } = useFinancialStore();
  const { toast } = useToast();
  const [bankAccountsConfig, setBankAccountsConfig] = useState<ConfigBankAccount[]>([]);
  const [bankIntegrations, setBankIntegrations] = useState<ConfigBankIntegration[]>([]);
  const [balanceState, setBalanceState] = useState<Record<string, BalanceState>>({});
  const [loadingConfig, setLoadingConfig] = useState(false);

  useEffect(() => {
    initializeAccounts();
  }, [initializeAccounts]);

  const fetchPaymentConfig = useCallback(async () => {
    try {
      setLoadingConfig(true);
      const response = await fetch('/api/payment-config', { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || 'Gagal mengambil konfigurasi pembayaran');
      }
      setBankAccountsConfig(json?.data?.bankAccounts ?? []);
      setBankIntegrations(json?.data?.bankIntegrations ?? []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal memuat konfigurasi bank',
        description: error?.message ?? 'Terjadi kesalahan tak terduga',
      });
    } finally {
      setLoadingConfig(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPaymentConfig();
  }, [fetchPaymentConfig]);

  const resolveIntegration = useCallback((account: { bankCode: string; integrationId?: string }) => {
    if (account.integrationId) {
      return bankIntegrations.find((integration) => integration.id === account.integrationId);
    }
    return bankIntegrations.find((integration) => integration.bankCode === account.bankCode);
  }, [bankIntegrations]);

  type DisplayBankAccount = {
    id: string;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
    balance: number;
    isActive: boolean;
    integrationId?: string;
    source: 'config' | 'store';
  };

  const resolvedBankAccounts = useMemo<DisplayBankAccount[]>(() => {
    const fromConfig = bankAccountsConfig.map<DisplayBankAccount>((account) => ({
      id: account.id,
      bankName: account.bankName || account.bankCode || 'Rekening',
      bankCode: account.bankCode || '',
      accountNumber: account.accountNumber || '',
      accountHolder: account.accountHolder || account.bankName || account.bankCode || 'Pemilik',
      balance: Number(balanceState[account.id]?.value ?? account.balance ?? 0),
      isActive: account.isActive ?? true,
      integrationId: account.integrationId,
      source: 'config',
    }));

    if (fromConfig.length > 0) {
      return fromConfig;
    }

    return bankAccounts.map<DisplayBankAccount>((account) => ({
      id: account.id,
      bankName: account.name,
      bankCode: account.code,
      accountNumber: account.accountNumber ?? '',
      accountHolder: account.name,
      balance: Number(balanceState[account.id]?.value ?? account.balance ?? 0),
      isActive: account.isActive,
      integrationId: undefined,
      source: 'store',
    }));
  }, [bankAccountsConfig, bankAccounts, balanceState]);

  const totalBalance = useMemo(() => {
    const bankTotal = resolvedBankAccounts.reduce((sum, acc) => sum + (Number.isFinite(acc.balance) ? Number(acc.balance) : 0), 0);
    const merchantTotal = merchantAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const cashTotal = cashAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    return bankTotal + merchantTotal + cashTotal;
  }, [resolvedBankAccounts, merchantAccounts, cashAccounts]);

  const handleRefreshBalance = useCallback(async (account: DisplayBankAccount) => {
    const integration = resolveIntegration(account);
    if (!integration) {
      setBalanceState((prev) => ({
        ...prev,
        [account.id]: { ...prev[account.id], error: 'Integrasi tidak ditemukan', loading: false },
      }));
      toast({
        variant: 'destructive',
        title: 'Integrasi tidak ditemukan',
        description: 'Hubungkan rekening dengan integrasi API terlebih dahulu.',
      });
      return;
    }

    const accountParam = (account.accountNumber || '').replace(/[^0-9]/g, '') || account.accountNumber;

    setBalanceState((prev) => ({
      ...prev,
      [account.id]: { ...prev[account.id], loading: true, error: undefined },
    }));

    try {
      const response = await fetch(`/api/banks/${encodeURIComponent(integration.id)}/balance?account=${encodeURIComponent(accountParam)}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error ? JSON.stringify(json.error) : 'Permintaan saldo gagal');
      }
      const balanceValue = extractBalance(integration.provider, json.data);
      setBalanceState((prev) => ({
        ...prev,
        [account.id]: {
          loading: false,
          value: typeof balanceValue === 'number' ? balanceValue : prev[account.id]?.value,
          fetchedAt: json.fetchedAt,
          raw: json.data,
          error: typeof balanceValue === 'number' ? undefined : 'Saldo tidak ditemukan pada respons',
        },
      }));
      if (typeof balanceValue === 'number') {
        updateAccountBalance(account.id, balanceValue);
      }
    } catch (error: any) {
      setBalanceState((prev) => ({
        ...prev,
        [account.id]: { ...prev[account.id], loading: false, error: error?.message ?? 'Gagal memuat saldo' },
      }));
      toast({
        variant: 'destructive',
        title: 'Gagal memuat saldo',
        description: error?.message ?? 'Terjadi kesalahan tak terduga',
      });
    }
  }, [resolveIntegration, toast, updateAccountBalance]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Keuangan</h1>
          <p className="text-muted-foreground">
            Kontrol dan monitoring saldo kas, rekening bank, dan merchant QRIS
          </p>
        </div>
        <div className="flex gap-2">
          <TransferDialog />
        </div>
      </div>

      {/* Total Balance Overview */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="text-white">Total Saldo Keseluruhan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-blue-100 text-sm">
            Gabungan seluruh akun yang aktif
          </p>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Ringkasan Hari Ini</h2>
        <FinancialSummaryCard />
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">Akun & Saldo</TabsTrigger>
          <TabsTrigger value="bank">Rekening Bank</TabsTrigger>
          <TabsTrigger value="merchant">Merchant QRIS</TabsTrigger>
          <TabsTrigger value="transactions">Transaksi</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resolvedBankAccounts.map((account) => {
              const integration = resolveIntegration(account)
              return (
                <RealtimeBankCard
                  key={`bank-${account.id}`}
                  account={{
                    id: account.id,
                    bankName: account.bankName,
                    bankCode: account.bankCode,
                    accountNumber: account.accountNumber,
                    accountHolder: account.accountHolder,
                    balance: account.balance,
                    isActive: account.isActive,
                    integrationId: account.integrationId,
                  }}
                  integration={integration ? { id: integration.id, provider: integration.provider, bankName: integration.bankName } : undefined}
                  state={balanceState[account.id]}
                  onRefresh={() => handleRefreshBalance(account)}
                />
              )
            })}
            {[...merchantAccounts, ...cashAccounts].map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onUpdate={updateAccountBalance}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bank" className="space-y-6">
          {loadingConfig && resolvedBankAccounts.length === 0 ? (
            <div className="text-sm text-muted-foreground">Memuat konfigurasi bank...</div>
          ) : resolvedBankAccounts.length === 0 ? (
            <div className="text-sm text-muted-foreground">Belum ada rekening bank yang dikonfigurasi.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resolvedBankAccounts.map((account) => {
                const integration = resolveIntegration(account)
                return (
                  <RealtimeBankCard
                    key={`bank-only-${account.id}`}
                    account={{
                      id: account.id,
                      bankName: account.bankName,
                      bankCode: account.bankCode,
                      accountNumber: account.accountNumber,
                      accountHolder: account.accountHolder,
                      balance: account.balance,
                      isActive: account.isActive,
                      integrationId: account.integrationId,
                    }}
                    integration={integration ? { id: integration.id, provider: integration.provider, bankName: integration.bankName } : undefined}
                    state={balanceState[account.id]}
                    onRefresh={() => handleRefreshBalance(account)}
                  />
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="merchant" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {merchantAccounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onUpdate={updateAccountBalance}
              />
            ))}
            {cashAccounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onUpdate={updateAccountBalance}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}