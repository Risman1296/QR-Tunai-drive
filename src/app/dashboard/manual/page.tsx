'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, CheckCircle, AlertCircle, User, CreditCard, FileText, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Data options
const transactionTypes = [
  { value: "Tarik Tunai", label: "Tarik Tunai" },
  { value: "Setor Tunai", label: "Setor Tunai" },
  { value: "Transfer", label: "Transfer" },
  { value: "Pembayaran", label: "Pembayaran" },
  { value: "Top Up E Wallet", label: "Top Up E Wallet" },
];

const bankOptions = [
  { value: "Bank Central Asia", label: "Bank Central Asia (BCA)" },
  { value: "Bank Mandiri", label: "Bank Mandiri" },
  { value: "Bank Rakyat Indonesia", label: "Bank Rakyat Indonesia (BRI)" },
  { value: "Bank Syariah Indonesia", label: "Bank Syariah Indonesia (BSI)" },
  { value: "Bank Negara Indonesia", label: "Bank Negara Indonesia (BNI)" },
  { value: "Bank Tabungan Negara", label: "Bank Tabungan Negara (BTN)" },
  { value: "Lainnya", label: "Bank Lainnya" },
];

const eWallets = [
  { value: "Gopay", label: "Gopay" },
  { value: "OVO", label: "OVO" },
  { value: "DANA", label: "DANA" },
  { value: "ShopeePay", label: "ShopeePay" },
  { value: "LinkAja", label: "LinkAja" },
];

// Schema validasi form
const manualFormSchema = z.object({
  type: z.string().min(1, "Pilih jenis transaksi"),
  customerName: z.string().min(1, "Nama pelanggan wajib diisi"),
  amount: z.coerce.number().min(1000, "Minimal Rp1.000"),
  bank: z.string().optional(),
  accountNumber: z.string()
    .optional()
    .refine(val => !val || /^\d+$/.test(val), {
      message: "Nomor rekening hanya boleh berisi angka"
    }),
  ewallet: z.string().optional(),
  phone: z.string()
    .optional()
    .refine(val => !val || /^(08|\+628)[0-9]{8,11}$/.test(val), {
      message: "Format nomor HP tidak valid"
    }),
  notes: z.string().optional(),
});

type ManualFormValues = z.infer<typeof manualFormSchema>;

// Fungsi untuk memformat angka dengan format Rupiah
const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('IDR', 'Rp');
};

export default function ManualFormPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<ManualFormValues>({
    resolver: zodResolver(manualFormSchema),
    defaultValues: {
      type: "",
      customerName: "",
      amount: undefined,
      notes: "",
    },
  });

  const watchType = form.watch("type");

  // Field visibility logic
  const isEWallet = watchType === "Top Up E Wallet";
  const needsBank = ["Transfer", "Tarik Tunai", "Setor Tunai"].includes(watchType);
  const needsPhone = isEWallet;

  // Fetch recent transactions untuk tampilan
  useEffect(() => {
    const fetchRecentTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        if (response.ok) {
          const data = await response.json();
          setRecentTransactions(data.slice(-3)); // Last 3 transactions
        }
      } catch (error) {
        console.error('Failed to fetch recent transactions:', error);
      }
    };

    fetchRecentTransactions();
  }, [showSuccess]);

  async function onSubmit(values: ManualFormValues) {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          // Mark as manual entry by admin
          isManualEntry: true,
          entrySource: 'admin_dashboard',
          status: 'completed', // Auto complete for manual entries
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan transaksi');
      }

      const result = await response.json();
      
      toast({
        title: "Transaksi Berhasil Disimpan",
        description: `Transaksi untuk ${values.customerName} sebesar ${formatRupiah(values.amount)} telah dicatat.`,
      });

      // Reset form
      form.reset();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Menyimpan",
        description: error.message || "Terjadi kesalahan saat menyimpan transaksi",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <FileText className="mr-3 h-8 w-8 text-primary" />
          Form Manual Transaksi
        </h1>
        <p className="text-muted-foreground">
          Input transaksi untuk pelanggan yang tidak menggunakan handphone atau scan QR
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Input Transaksi Baru
              </CardTitle>
              <CardDescription>
                Isi form di bawah untuk mencatat transaksi pelanggan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Transaksi *</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis transaksi" />
                              </SelectTrigger>
                              <SelectContent>
                                {transactionTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Pelanggan *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama lengkap pelanggan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah (Rp) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {needsBank && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih bank" />
                                </SelectTrigger>
                                <SelectContent>
                                  {bankOptions.map((bank) => (
                                    <SelectItem key={bank.value} value={bank.value}>
                                      {bank.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nomor Rekening</FormLabel>
                            <FormControl>
                              <Input placeholder="1234567890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {isEWallet && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="ewallet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-Wallet</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih e-wallet" />
                                </SelectTrigger>
                                <SelectContent>
                                  {eWallets.map((wallet) => (
                                    <SelectItem key={wallet.value} value={wallet.value}>
                                      {wallet.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {needsPhone && (
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nomor HP</FormLabel>
                              <FormControl>
                                <Input placeholder="08xxxxxxxxx" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Catatan tambahan (opsional)"
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Simpan Transaksi
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Recent Transactions */}
        <div className="space-y-4">
          {showSuccess && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Transaksi berhasil disimpan!</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Transaksi Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((tx, index) => (
                    <div key={tx.id || index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{tx.customerName}</span>
                        <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>
                          {tx.status === 'completed' ? 'Selesai' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{tx.type}</div>
                      <div className="font-semibold text-green-600">
                        {formatRupiah(tx.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <User className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Belum ada transaksi</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips Penggunaan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">
                <p>• Form ini untuk pelanggan tanpa HP</p>
                <p>• Transaksi akan langsung tercatat selesai</p>
                <p>• Pastikan data pelanggan benar</p>
                <p>• Gunakan catatan untuk detail tambahan</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}