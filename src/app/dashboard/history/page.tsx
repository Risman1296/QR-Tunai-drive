'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Loader2, Search, XCircle, CheckCircle, Clock, Ban } from 'lucide-react';
import { Transaction, TransactionStatus } from '@/lib/transaction-store';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(date: string | Date) {
    return new Date(date).toLocaleString('id-ID', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
}

const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      label: "Selesai",
      className: "bg-green-100 text-green-800 border-green-300",
    },
    pending: {
      icon: Clock,
      label: "Tertunda",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    },
    cancelled: {
      icon: Ban,
      label: "Dibatalkan",
      className: "bg-red-100 text-red-800 border-red-300",
    },
  };

  const { icon: Icon, label, className } = statusConfig[status];

  return (
    <Badge variant="outline" className={`flex items-center gap-1.5 ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Badge>
  );
};

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransactionStatus[]>(['completed', 'cancelled', 'pending']);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/transactions', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Gagal memuat data transaksi.');
      }
      const data = await response.json();
      setTransactions(data.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => statusFilter.includes(tx.status))
      .filter(tx => 
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.accountNumber && tx.accountNumber.includes(searchTerm)) ||
        tx.amount.toString().includes(searchTerm)
      );
  }, [transactions, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Riwayat Transaksi</h1>
        <p className="text-muted-foreground">Lihat dan cari semua transaksi yang pernah terjadi.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Cari ID, nama, no. rek, atau jumlah..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto">Filter Status</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {(['completed', 'pending', 'cancelled'] as TransactionStatus[]).map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={statusFilter.includes(status)}
                    onCheckedChange={checked => {
                      setStatusFilter(prev => 
                        checked ? [...prev, status] : prev.filter(s => s !== status)
                      )
                    }}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
                {!isLoading && filteredTransactions.length === 0 && (
                    <TableCaption>Tidak ada data transaksi yang cocok dengan filter Anda.</TableCaption>
                )}
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                      <p className="mt-2">Memuat data...</p>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                     <TableRow>
                        <TableCell colSpan={5} className="h-48 text-center text-destructive">
                            <XCircle className="mx-auto h-8 w-8" />
                            <p className="mt-2">{error}</p>
                            <Button variant="outline" size="sm" onClick={fetchTransactions} className="mt-4">Coba Lagi</Button>
                        </TableCell>
                    </TableRow>
                ) : filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium whitespace-nowrap">{formatDateTime(tx.date)}</TableCell>
                    <TableCell>{tx.customerName}</TableCell>
                    <TableCell>
                        <div className="text-sm font-semibold">{tx.type}</div>
                        {tx.bank && tx.accountNumber && 
                          <div className="text-xs text-muted-foreground">{tx.bank} - {tx.accountNumber}</div>
                        }
                        <div className="text-xs text-muted-foreground">ID: {tx.id}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{formatCurrency(tx.amount)}</TableCell>
                    <TableCell className="text-center"><StatusBadge status={tx.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
