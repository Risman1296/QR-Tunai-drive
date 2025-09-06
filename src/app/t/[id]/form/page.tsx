'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/lib/transaction-store';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function TransactionFormPage() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      const fetchTransaction = async () => {
        try {
          const res = await fetch(`/api/transactions/${id}`);
          if (res.status === 404) {
            setError('Transaksi tidak ditemukan atau sudah kedaluwarsa.');
            return;
          }
          if (!res.ok) throw new Error('Gagal memuat detail transaksi.');
          const data = await res.json();
          if (data.status !== 'pending') {
            setError('Transaksi ini sudah tidak aktif lagi.');
          } else {
            setTransaction(data);
          }
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTransaction();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const numericAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast({ variant: 'destructive', title: 'Jumlah tidak valid', description: 'Masukkan jumlah pembayaran yang benar.' });
            return;
        }

        const res = await fetch(`/api/transactions/${id}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerName, amount: numericAmount }),
        });

        if (!res.ok) throw new Error('Gagal mengirim detail transaksi.');
        
        setIsCompleted(true);
        toast({ title: 'Sukses!', description: 'Detail transaksi berhasil dikirim. Mohon tunggu konfirmasi dari kasir.'});

    } catch (err: any) {
        setError(err.message);
        toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return (
        <div className="flex h-screen items-center justify-center text-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="items-center">
                    <AlertTriangle className="h-12 w-12 text-destructive"/>
                    <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{error}</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex h-screen items-center justify-center text-center p-4">
        <Card className="w-full max-w-sm">
            <CardHeader className="items-center">
                 <CheckCircle className="h-16 w-16 text-green-500"/>
                 <CardTitle>Pembayaran Terkirim</CardTitle>
                 <CardDescription>Mohon tunggu kasir untuk menyelesaikan transaksi ini.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-sm font-medium">Atas Nama: <span className="font-normal">{customerName}</span></p>
                <p className="text-lg font-bold">{formatCurrency(parseInt(amount.replace(/[^0-9]/g, ''), 10))}</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Detail Pembayaran</CardTitle>
          <CardDescription>Masukkan nama dan jumlah yang akan dibayarkan.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Anda</Label>
              <Input 
                id="name" 
                placeholder="Masukkan nama Anda" 
                required 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (IDR)</Label>
              <Input 
                id="amount" 
                placeholder="Contoh: 50000" 
                required 
                inputMode="numeric"
                value={amount}
                onChange={e => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setAmount(value ? new Intl.NumberFormat('id-ID').format(parseInt(value, 10)) : '');
                }}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Pembayaran
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
