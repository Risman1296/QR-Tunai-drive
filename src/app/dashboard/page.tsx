'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, XCircle, TrendingUp, DollarSign, ReceiptText, Ban, User, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CopyButton } from '@/components/copy-button';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/lib/transaction-store';

// --- Utility Functions ---
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(date: string | Date) {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit'
    });
}

// --- Main Components ---
interface SummaryData {
  totalRevenue: number;
  totalTransactions: number;
  completedTransactions: number;
  cancelledTransactions: number;
  pendingTransactions: number;
  completionRate: number;
}

function SummaryCard({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

function TransactionCard({ transaction, onUpdate }: { transaction: Transaction, onUpdate: (id: string, status: 'completed' | 'cancelled') => void }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async (status: 'completed' | 'cancelled') => {
    setIsUpdating(true);
    try {
      await onUpdate(transaction.id, status);
      toast({
        title: `Transaksi ${status === 'completed' ? 'Selesai' : 'Dibatalkan'}`,
        description: `Transaksi ${transaction.id} telah ditandai sebagai ${status === 'completed' ? 'selesai' : 'dibatalkan'}.`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal Memperbarui Transaksi',
        description: 'Terjadi kesalahan saat mencoba memperbarui status transaksi.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className={`shadow-md hover:shadow-lg transition-shadow flex flex-col ${isUpdating ? 'opacity-50' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground">{transaction.type}</CardTitle>
                <CardDescription>ID: {transaction.id}</CardDescription>
            </div>
            <div className="text-xs text-muted-foreground">{formatDateTime(transaction.date)}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
         <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Pelanggan</span>
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{transaction.customerName}</span>
            </div>
        </div>
        {transaction.bank && transaction.accountNumber && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{transaction.bank}</span>
            <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{transaction.accountNumber}</span>
                <CopyButton textToCopy={transaction.accountNumber} />
            </div>
        </div>
        )}
        <div className="flex justify-between items-center text-lg">
            <span className="text-sm text-muted-foreground">Jumlah</span>
            <div className="flex items-center gap-2">
                <span className="font-semibold text-primary">{formatCurrency(transaction.amount)}</span>
                <CopyButton textToCopy={String(transaction.amount)} />
            </div>
        </div>
        {transaction.notes && (
          <div>
            <span className="text-sm text-muted-foreground">Catatan</span>
            <p className="text-sm border-l-2 pl-2 mt-1 italic">{transaction.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50" onClick={() => handleUpdate('cancelled')} disabled={isUpdating}>
          {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />} 
          Batalkan
        </Button>
        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleUpdate('completed')} disabled={isUpdating}>
          {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />} 
          Selesaikan
        </Button>
      </CardFooter>
    </Card>
  );
}

// --- Main Page Component ---
export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [transRes, summaryRes] = await Promise.all([
        fetch('/api/transactions', { cache: 'no-store' }),
        fetch('/api/transactions/summary', { cache: 'no-store' })
      ]);

      if (!transRes.ok || !summaryRes.ok) {
        throw new Error('Gagal mengambil data dari server');
      }

      const transData = await transRes.json();
      const summaryData = await summaryRes.json();
      
      setTransactions(transData.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setSummary(summaryData);

    } catch (err: any) {
      setError(err.message);
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleUpdateTransaction = async (id: string, status: 'completed' | 'cancelled') => {
      const response = await fetch(`/api/transactions/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error('Gagal memperbarui transaksi');
      }

      fetchData(); // Refresh data after update
  };

  const pendingTransactions = transactions.filter(tx => tx.status === 'pending');

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-destructive">
        <XCircle className="mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold">Terjadi Kesalahan</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button onClick={fetchData} className="mt-4">Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Kasir</h1>
        <p className="text-muted-foreground">Data transaksi real-time. Diperbarui setiap 5 detik.</p>
      </div>

       <div className="space-y-4">
          <h2 className="text-2xl font-semibold flex items-center">
              <TrendingUp className="mr-3 h-6 w-6 text-accent" />
              Kinerja Hari Ini
          </h2>
           {summary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SummaryCard title="Total Pendapatan" value={formatCurrency(summary.totalRevenue)} icon={DollarSign} description="Hanya dari transaksi selesai" />
              <SummaryCard title="Transaksi Selesai" value={summary.completedTransactions} icon={CheckCircle} description={`Total: ${summary.totalTransactions} transaksi`} />
              <SummaryCard title="Menunggu Konfirmasi" value={summary.pendingTransactions} icon={Bell} />
              <SummaryCard title="Transaksi Dibatalkan" value={summary.cancelledTransactions} icon={Ban} description={`Tingkat sukses: ${summary.completionRate.toFixed(1)}%`} />
            </div>
           )}
      </div>
      
      <Separator />

      <div>
          <h2 className="text-2xl font-semibold flex items-center mb-4">
            {pendingTransactions.length > 0 ? 
                <Bell className="mr-3 h-6 w-6 text-accent animate-pulse" /> 
                : <Info className="mr-3 h-6 w-6 text-muted-foreground" />
            }
            Transaksi Tertunda ({pendingTransactions.length})
          </h2>
          {pendingTransactions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pendingTransactions.map(tx => (
                  <TransactionCard key={tx.id} transaction={tx} onUpdate={handleUpdateTransaction} />
                ))}
              </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="mt-4 text-xl font-semibold">Tidak Ada Transaksi Tertunda</h2>
                <p className="mt-2 text-muted-foreground">Semua transaksi sudah dikonfirmasi. Menunggu pelanggan berikutnya.</p>
            </div>
          )}
      </div>
    </div>
  );
}
