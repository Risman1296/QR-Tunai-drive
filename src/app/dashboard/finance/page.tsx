'use client';

import { useState, useEffect } from 'react';
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
  Clock
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

export default function FinancialManagementPage() {
  const { 
    bankAccounts, 
    merchantAccounts, 
    cashAccounts,
    initializeAccounts,
    updateAccountBalance
  } = useFinancialStore();

  useEffect(() => {
    initializeAccounts();
  }, [initializeAccounts]);

  const allAccounts = [...bankAccounts, ...merchantAccounts, ...cashAccounts];
  const totalBalance = allAccounts.reduce((sum, acc) => sum + acc.balance, 0);

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
            {allAccounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onUpdate={updateAccountBalance}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bank" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bankAccounts.map(account => (
              <AccountCard
                key={account.id}
                account={account}
                onUpdate={updateAccountBalance}
              />
            ))}
          </div>
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