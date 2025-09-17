'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Loader2, Search, XCircle, CheckCircle, Clock, Ban, CalendarIcon, Filter } from 'lucide-react';
import { Transaction, TransactionStatus } from '@/lib/transaction-store';
import { format, startOfDay, endOfDay, subDays, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

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
  
  // Date filtering state
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Date filtering functions
  const applyDateFilter = (mode: 'all' | 'today' | 'week' | 'month' | 'custom') => {
    setDateFilterMode(mode);
    const now = new Date();
    
    switch (mode) {
      case 'today':
        setStartDate(startOfDay(now));
        setEndDate(endOfDay(now));
        break;
      case 'week':
        setStartDate(startOfWeek(now, { weekStartsOn: 1 }));
        setEndDate(endOfWeek(now, { weekStartsOn: 1 }));
        break;
      case 'month':
        setStartDate(startOfMonth(now));
        setEndDate(endOfMonth(now));
        break;
      case 'all':
        setStartDate(undefined);
        setEndDate(undefined);
        break;
      case 'custom':
        // For custom, we keep existing dates or reset them
        if (!startDate || !endDate) {
          setStartDate(subDays(now, 7));
          setEndDate(now);
        }
        break;
    }
  };

  const isTransactionInDateRange = (transaction: Transaction) => {
    if (!startDate || !endDate || dateFilterMode === 'all') return true;
    
    const txDate = new Date(transaction.date);
    return txDate >= startDate && txDate <= endDate;
  };

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
      .filter(tx => isTransactionInDateRange(tx))
      .filter(tx => 
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.accountNumber && tx.accountNumber.includes(searchTerm)) ||
        tx.amount.toString().includes(searchTerm)
      );
  }, [transactions, searchTerm, statusFilter, startDate, endDate, dateFilterMode]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Riwayat Transaksi</h1>
        <p className="text-muted-foreground">Lihat dan cari semua transaksi yang pernah terjadi.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-4">
            {/* Date Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Semua Waktu' },
                { key: 'today', label: 'Hari Ini' },
                { key: 'week', label: '7 Hari' },
                { key: 'month', label: '30 Hari' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={dateFilterMode === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => applyDateFilter(key as any)}
                >
                  {label}
                </Button>
              ))}
              
              {/* Custom Date Range Picker */}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant={dateFilterMode === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (dateFilterMode !== 'custom') {
                        applyDateFilter('custom');
                      }
                      setCalendarOpen(true);
                    }}
                  >
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    Pilih Tanggal
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pilih Rentang Tanggal</Label>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Label className="w-16">Dari:</Label>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            onClick={() => setDateFilterMode('custom')}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "dd/MM/yyyy", { locale: id }) : "Pilih tanggal"}
                          </Button>
                        </div>
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            setStartDate(date);
                            setDateFilterMode('custom');
                          }}
                          locale={id}
                          initialFocus
                        />
                      </div>
                      
                      <div className="flex flex-col space-y-2 mt-4">
                        <div className="flex items-center space-x-2">
                          <Label className="w-16">Sampai:</Label>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            onClick={() => setDateFilterMode('custom')}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "dd/MM/yyyy", { locale: id }) : "Pilih tanggal"}
                          </Button>
                        </div>
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => {
                            setEndDate(date);
                            setDateFilterMode('custom');
                          }}
                          locale={id}
                          disabled={(date) => startDate ? date < startDate : false}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={() => setCalendarOpen(false)} 
                      className="w-full"
                      size="sm"
                    >
                      Terapkan
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Display active date range */}
            {(startDate && endDate && dateFilterMode !== 'all') && (
              <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-md border">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>
                    Menampilkan transaksi dari {format(startDate, "dd MMM yyyy", { locale: id })} 
                    {" "}hingga {format(endDate, "dd MMM yyyy", { locale: id })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyDateFilter('all')}
                    className="ml-auto h-auto p-1 text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

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
