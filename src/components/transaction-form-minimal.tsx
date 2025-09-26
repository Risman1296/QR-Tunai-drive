"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Loader2, ArrowLeft, CheckCircle, User, CreditCard, Banknote, Smartphone, Building2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// Fungsi untuk memformat angka dengan format Rupiah
const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Fungsi untuk parse value dari input rupiah
const parseRupiahValue = (value: string): number => {
  if (!value) return 0;
  // Remove "Rp", dots, and spaces, keep only numbers
  const numericValue = value.replace(/[^\d]/g, '');
  return parseInt(numericValue) || 0;
};

// Enhanced schema with proper validation
const formSchema = z.object({
  type: z.string().min(1, "Pilih jenis transaksi"),
  method: z.string().optional(),
  customerName: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
  amount: z.string().min(1, "Jumlah harus diisi").transform((val, ctx) => {
    if (!val || val.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Jumlah transaksi wajib diisi"
      });
      return z.NEVER;
    }
    const numericValue = parseRupiahValue(val);
    if (isNaN(numericValue) || numericValue <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Jumlah harus berupa angka yang valid"
      });
      return z.NEVER;
    }
    if (numericValue < 10000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Jumlah transaksi minimum Rp 10.000"
      });
      return z.NEVER;
    }
    if (numericValue > 10000000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Jumlah transaksi maksimum Rp 10.000.000"
      });
      return z.NEVER;
    }
    return numericValue;
  }),
  phone: z.string()
    .optional()
    .refine(val => !val || /^(08|\+628)[0-9]{8,11}$/.test(val), {
      message: "Format nomor HP tidak valid (contoh: 08123456789)"
    }),
  notes: z.string().optional(),
  // Dynamic fields based on transaction type and method
  bank: z.string().optional(),
  manualBankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ewallet: z.string().optional(),
  paymentType: z.string().optional(),
  paymentInstitution: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Transaction types dengan metode pembayaran
const transactionTypes = [
  { 
    value: 'Tarik Tunai', 
    label: 'Tarik Tunai', 
    icon: '💸', 
    color: 'bg-green-50 border-green-200 text-green-800',
    description: 'Ambil uang tunai'
  },
  { 
    value: 'Setor Tunai', 
    label: 'Setor Tunai', 
    icon: '💰', 
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    description: 'Setor uang tunai'
  },
  { 
    value: 'Transfer', 
    label: 'Transfer', 
    icon: '💳', 
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    description: 'Transfer antar rekening'
  },
  { 
    value: 'Pembayaran', 
    label: 'Pembayaran', 
    icon: '🧾', 
    color: 'bg-orange-50 border-orange-200 text-orange-800',
    description: 'Bayar tagihan & angsuran'
  },
  { 
    value: 'Top Up E Wallet', 
    label: 'Top Up E Wallet', 
    icon: '📱', 
    color: 'bg-pink-50 border-pink-200 text-pink-800',
    description: 'Isi saldo dompet digital'
  },
];

// Metode pembayaran untuk setiap jenis transaksi
const transactionMethods = {
  'Tarik Tunai': [
    { value: 'transfer_outlet', label: 'Transfer Outlet' },
    { value: 'qris', label: 'QRIS (Max. 1 Juta)' },
    { value: 'edc', label: 'ATM - Mesin EDC' },
  ],
  'Transfer': [
    { value: 'tunai', label: 'Tunai' },
    { value: 'transfer_atm_edc', label: 'Transfer ATM (Mesin EDC)' },
  ],
  'Pembayaran': [
    { value: 'angsuran', label: 'Bayar Angsuran' },
    { value: 'virtual_account', label: 'Bayar Virtual Account' },
    { value: 'tagihan_bulanan', label: 'Bayar Tagihan Bulanan' },
    { value: 'lainnya', label: 'Lainnya' },
  ],
  'Setor Tunai': [],
  'Top Up E Wallet': [],
};

// Bank options untuk transfer outlet
const bankOptions = [
  { value: "Bank Central Asia", label: "Bank Central Asia (BCA)", code: "BCA" },
  { value: "Bank Mandiri", label: "Bank Mandiri", code: "MANDIRI" },
  { value: "Bank Rakyat Indonesia", label: "Bank Rakyat Indonesia (BRI)", code: "BRI" },
  { value: "Bank Negara Indonesia", label: "Bank Negara Indonesia (BNI)", code: "BNI" },
  { value: "Bank Syariah Indonesia", label: "Bank Syariah Indonesia (BSI)", code: "BSI" },
  { value: "Bank Tabungan Negara", label: "Bank Tabungan Negara (BTN)", code: "BTN" },
  { value: "CIMB Niaga", label: "CIMB Niaga", code: "CIMB" },
  { value: "Bank Danamon", label: "Bank Danamon", code: "DANAMON" },
  { value: "Bank Permata", label: "Bank Permata", code: "PERMATA" },
  { value: "Lainnya", label: "Bank Lainnya", code: "OTHER" },
];

// E-Wallet options
const eWallets = [
  { value: "Gopay", label: "Gopay" },
  { value: "OVO", label: "OVO" },
  { value: "DANA", label: "DANA" },
  { value: "ShopeePay", label: "ShopeePay" },
  { value: "LinkAja", label: "LinkAja" },
];

export default function TransactionFormMinimal() {
  const params = useParams();
  const router = useRouter();
  const tokenId = params?.id as string;
  
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      method: "",
      customerName: "",
      amount: 0,
      phone: "",
      notes: "",
      bank: "",
      manualBankName: "",
      accountNumber: "",
      ewallet: "",
      paymentType: "",
      paymentInstitution: "",
    },
  });

  const formatRupiah = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    if (!number) return '';
    return 'Rp ' + parseInt(number).toLocaleString('id-ID');
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setSelectedMethod(''); // Reset method when type changes
    form.setValue('type', type);
    form.setValue('method', ''); // Reset method in form
    
    // If no methods available for this type, go straight to form
    const availableMethods = transactionMethods[type as keyof typeof transactionMethods] || [];
    if (availableMethods.length === 0) {
      setStep(3); // Skip method selection
    } else {
      setStep(2); // Go to method selection
    }
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    form.setValue('method', method);
    setStep(3); // Go to form input
  };

  const getVisibleFields = () => {
    const fields = [];
    
    // Always show basic fields
    fields.push('customerName', 'amount');

    // Add conditional fields based on transaction type and method
    if (selectedType === 'Tarik Tunai' || selectedType === 'Setor Tunai') {
      if (selectedMethod === 'transfer_outlet') {
        fields.push('bank', 'accountNumber');
      }
      if (selectedMethod === 'qris' || selectedMethod === 'edc') {
        // No additional fields needed for QRIS/EDC
      }
    }

    if (selectedType === 'Transfer') {
      if (selectedMethod === 'tunai') {
        fields.push('bank', 'accountNumber');
      }
      if (selectedMethod === 'transfer_atm_edc') {
        fields.push('bank', 'accountNumber');
      }
    }

    if (selectedType === 'Pembayaran') {
      if (selectedMethod === 'lainnya') {
        fields.push('paymentInstitution');
      }
    }

    if (selectedType === 'Top Up E Wallet') {
      fields.push('ewallet', 'phone');
    }

    // Always show optional fields
    fields.push('phone', 'notes');

    return fields;
  };

  const getRequiredFields = () => {
    // Return required fields based on selected type and method
    const fields = [];
    
    if (selectedType === 'Tarik Tunai' || selectedType === 'Setor Tunai') {
      if (selectedMethod === 'transfer_outlet') {
        fields.push('bank', 'accountNumber');
      }
    }
    
    if (selectedType === 'Transfer') {
      if (selectedMethod === 'tunai' || selectedMethod === 'transfer_atm_edc') {
        fields.push('bank', 'accountNumber');
      }
    }
    
    if (selectedType === 'Pembayaran') {
      if (selectedMethod === 'lainnya') {
        fields.push('paymentInstitution');
      }
    }
    
    if (selectedType === 'Top Up E Wallet') {
      fields.push('ewallet');
    }
    
    return fields;
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Amount is already a number from Zod transformation
      const amountNumber = values.amount;
      
      if (amountNumber <= 0) {
        throw new Error("Jumlah harus lebih dari 0");
      }

      // Update existing transaction created during QR generation
      const res = await fetch(`/api/transactions/${tokenId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: values.customerName,
          amount: amountNumber,
          type: values.type,
          phone: values.phone || "",
          notes: values.notes || "",
          bank: values.bank || "",
          accountNumber: values.accountNumber || "",
          ewallet: values.ewallet || "",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || res.statusText);
      }

      const data = await res.json();
      setSubmitStatus({
        type: 'success',
        message: `Transaksi berhasil diproses!`
      });

      // Reset form after success
      setTimeout(() => {
        router.push('/transaction');
      }, 2000);

    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Terjadi kesalahan'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitStatus.type === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Transaksi Berhasil!
            </h3>
            <p className="text-gray-600 mb-4">
              {submitStatus.message}
            </p>
            <p className="text-sm text-gray-500">
              Anda akan diarahkan dalam beberapa detik...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            QR Tunai Drive
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Layanan transaksi cepat dan mudah
          </p>
          {tokenId && (
            <Badge variant="outline" className="mt-2">
              ID: {tokenId.slice(-8).toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-sm ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-8 h-1 sm:w-12 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-sm ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
            <div className={`w-8 h-1 sm:w-12 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-sm ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              3
            </div>
          </div>
        </div>

        {/* Step 1: Transaction Type Selection */}
        {step === 1 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-center text-xl">
                Pilih Jenis Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {transactionTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeSelect(type.value)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${type.color} hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <span className="text-xl flex-shrink-0">{type.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{type.label}</h3>
                        <p className="text-xs sm:text-sm opacity-80 mt-1">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 & 3: Form Input */}
        {step >= 2 && (
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="p-2 flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <User className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Detail Transaksi</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {transactionTypes.find(t => t.value === selectedType)?.label}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Informasi Dasar</h3>
                    
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan nama lengkap"
                              {...field}
                              className="text-lg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah Transaksi</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Masukkan jumlah"
                              value={formatRupiah(String(field.value || ""))}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/[^\d]/g, '');
                                field.onChange(rawValue);
                              }}
                              className="text-lg font-semibold"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon (Opsional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="08xxxxxxxxxx"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dynamic Fields Based on Transaction Type */}
                  {getRequiredFields().length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Detail Tambahan</h3>
                      
                      {getRequiredFields().includes('bank') && (
                        <FormField
                          control={form.control}
                          name="bank"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih bank" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {bankOptions.map((bank) => (
                                    <SelectItem key={bank.value} value={bank.value}>
                                      {bank.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {getRequiredFields().includes('accountNumber') && (
                        <FormField
                          control={form.control}
                          name="accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nomor Rekening</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Masukkan nomor rekening"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {getRequiredFields().includes('ewallet') && (
                        <FormField
                          control={form.control}
                          name="ewallet"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-Wallet</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih e-wallet" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {eWallets.map((ewallet) => (
                                    <SelectItem key={ewallet.value} value={ewallet.value}>
                                      {ewallet.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan (Opsional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Catatan tambahan..."
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Error/Success Messages */}
                  {submitStatus.message && (
                    <div className={`p-4 rounded-lg ${
                      submitStatus.type === 'error' 
                        ? 'bg-red-50 text-red-800 border border-red-200' 
                        : 'bg-green-50 text-green-800 border border-green-200'
                    }`}>
                      {submitStatus.message}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Proses Transaksi'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
