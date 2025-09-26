"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const formatRupiah = (amount: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const parseRupiahValue = (value: string): number => {
  if (!value) return 0;
  const numericValue = value.replace(/[^\d]/g, "");
  return parseInt(numericValue, 10) || 0;
};

const formSchema = z
  .object({
    type: z.string().min(1, "Pilih jenis transaksi"),
    method: z.string().optional(),
    customerName: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
    amount: z.preprocess(
    (val) => {
      if (typeof val === 'number') return val.toString();
      if (typeof val === 'string') return val;
      return '';
    },
    z
      .string()
      .min(1, "Jumlah harus diisi")
      .transform((val, ctx) => {
        if (!val || val.trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Jumlah transaksi wajib diisi",
          });
          return z.NEVER;
        }
        const numericValue = parseRupiahValue(val);
        if (Number.isNaN(numericValue) || numericValue <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Jumlah harus berupa angka yang valid",
          });
          return z.NEVER;
        }
        if (numericValue < 10_000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Jumlah transaksi minimum Rp 10.000",
          });
          return z.NEVER;
        }
        if (numericValue > 10_000_000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Jumlah transaksi maksimum Rp 10.000.000",
          });
          return z.NEVER;
        }
        return numericValue;
      })
  ),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || /^(08|\+628)[0-9]{8,11}$/.test(val), {
        message: "Format nomor HP tidak valid (contoh: 08123456789)",
      }),
    notes: z.string().optional(),
    bank: z.string().optional(),
    manualBankName: z.string().optional(),
    accountNumber: z.string().optional(),
    ewallet: z.string().optional(),
    paymentInstitution: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "Tarik Tunai" && data.method === "qris" && data.amount && data.amount > 1_000_000) {
        return false;
      }
      return true;
    },
    {
      message: "Maksimum penarikan tunai melalui QRIS adalah Rp 1.000.000",
      path: ["amount"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

const transactionTypes = [
  { value: "Transfer", label: "Transfer" },
  { value: "Setor Tunai", label: "Setor Tunai" },
  { value: "Tarik Tunai", label: "Tarik Tunai" },
  { value: "Pembayaran", label: "Pembayaran Tagihan" },
  { value: "Top Up E Wallet", label: "Top Up E-Wallet" },
];

const transactionMethods: Record<string, { value: string; label: string }[]> = {
  "Tarik Tunai": [
    { value: "transfer_outlet", label: "Transfer Outlet" },
    { value: "qris", label: "QRIS (Maks 1 Juta)" },
    { value: "edc", label: "ATM / Mesin EDC" },
  ],
  Transfer: [
    { value: "tunai", label: "Tunai" },
    { value: "transfer_atm_edc", label: "Transfer ATM / EDC" },
  ],
  Pembayaran: [
    { value: "angsuran", label: "Bayar Angsuran" },
    { value: "virtual_account", label: "Virtual Account" },
    { value: "tagihan_bulanan", label: "Tagihan Bulanan" },
    { value: "lainnya", label: "Lainnya" },
  ],
  "Setor Tunai": [],
  "Top Up E Wallet": [],
};

const methodDescriptions: Record<string, string> = {
  transfer_outlet: "Dana ditransfer ke rekening outlet sebelum penarikan.",
  qris: "Scan QRIS outlet untuk proses cepat maksimal Rp1.000.000.",
  edc: "Gunakan kartu ATM pada mesin EDC outlet.",
  tunai: "Setor tunai ke teller untuk diteruskan ke rekening tujuan.",
  transfer_atm_edc: "Transaksi dilakukan melalui mesin ATM / EDC outlet.",
  angsuran: "Pembayaran cicilan leasing atau pembiayaan.",
  virtual_account: "Pembayaran melalui nomor virtual account bank.",
  tagihan_bulanan: "Pembayaran tagihan rutin seperti listrik atau internet.",
  lainnya: "Pembayaran tagihan dengan instruksi khusus.",
};

const FIELD_CONFIG: Record<string, { base?: string[]; byMethod?: Record<string, string[]> }> = {
  Transfer: {
    base: ['bank', 'accountNumber'],
  },
  'Setor Tunai': {
    base: ['bank', 'accountNumber'],
  },
  'Tarik Tunai': {
    byMethod: {
      transfer_outlet: ['bank', 'accountNumber'],
      qris: [],
      edc: [],
    },
  },
  Pembayaran: {
    byMethod: {
      angsuran: ['paymentInstitution', 'accountNumber'],
      virtual_account: ['paymentInstitution', 'accountNumber'],
      tagihan_bulanan: ['paymentInstitution', 'accountNumber'],
      lainnya: ['paymentInstitution', 'accountNumber', 'notes'],
    },
  },
  'Top Up E Wallet': {
    base: ['ewallet', 'phone'],
  },
};

const bankOptions = [
  { value: "Bank Central Asia", label: "Bank Central Asia (BCA)" },
  { value: "Bank Mandiri", label: "Bank Mandiri" },
  { value: "Bank Rakyat Indonesia", label: "Bank Rakyat Indonesia (BRI)" },
  { value: "Bank Negara Indonesia", label: "Bank Negara Indonesia (BNI)" },
  { value: "Bank Syariah Indonesia", label: "Bank Syariah Indonesia (BSI)" },
  { value: "Bank Tabungan Negara", label: "Bank Tabungan Negara (BTN)" },
  { value: "CIMB Niaga", label: "CIMB Niaga" },
  { value: "Bank Danamon", label: "Bank Danamon" },
  { value: "Bank Permata", label: "Bank Permata" },
  { value: "Lainnya", label: "Bank Lainnya" },
];

const eWallets = [
  { value: "Gopay", label: "GoPay" },
  { value: "OVO", label: "OVO" },
  { value: "DANA", label: "DANA" },
  { value: "ShopeePay", label: "ShopeePay" },
  { value: "LinkAja", label: "LinkAja" },
];

export default function TransactionFormEnhanced() {
  const params = useParams();
  const router = useRouter();
  const tokenId = params?.id as string;

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

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
      paymentInstitution: "",
    },
  });

  const formatRupiahForInput = (value: unknown) => {
    const raw = typeof value === "number" ? value : parseRupiahValue(String(value ?? ""));
    if (!raw) return "";
    return `Rp ${raw.toLocaleString("id-ID")}`;
  };

  const availableMethods = transactionMethods[selectedType] || [];

  const quickAmounts = [50_000, 100_000, 500_000];
  const watchedAmount = form.watch("amount");
  const numericAmount = typeof watchedAmount === "number" ? watchedAmount : parseRupiahValue(String(watchedAmount ?? ""));
  const selectedBank = form.watch("bank");

  const queueNumber = useMemo(() => (tokenId ? tokenId.toString().toUpperCase() : "—"), [tokenId]);

  const handleCopyQueueNumber = async () => {
    try {
      await navigator.clipboard.writeText(queueNumber);
    } catch (error) {
      console.error("Gagal menyalin nomor antrian", error);
    }
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setSelectedMethod("");
    form.setValue("type", type);
    form.setValue("method", "");

    if ((transactionMethods[type] || []).length === 0) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    form.setValue("method", method);
    setStep(3);
  };

  const getVisibleFields = () => {
    const fields = new Set<string>(["customerName", "amount"]);
    const config = FIELD_CONFIG[selectedType];

    if (config?.base) {
      config.base.forEach((field) => fields.add(field));
    }

    if (selectedMethod && config?.byMethod?.[selectedMethod]) {
      config.byMethod[selectedMethod].forEach((field) => fields.add(field));
    }

    if (fields.has("bank") && selectedBank === "Lainnya") {
      fields.add("manualBankName");
    }

    return Array.from(fields);
  };

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const visibleFields = new Set(getVisibleFields());
      const detailFields: Array<keyof FormValues> = ['bank', 'manualBankName', 'accountNumber', 'ewallet', 'paymentInstitution', 'phone', 'notes'];
      const detailPayload = detailFields.reduce<Record<string, unknown>>((acc, field) => {
        if (!visibleFields.has(field)) return acc;
        const value = values[field];
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed) acc[field] = trimmed;
        } else if (typeof value === 'number' && !Number.isNaN(value)) {
          acc[field] = value;
        }
        return acc;
      }, {});

      const payload = {
        customerName: values.customerName,
        amount: values.amount,
        type: selectedType,
        method: selectedMethod,
        tokenId,
        transactionId: `TXN-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        ...detailPayload,
      };

      const response = await fetch(`/api/transactions/${tokenId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: "success", message: "Transaksi berhasil diproses!" });
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setSubmitStatus({
          type: "error",
          message: result?.error || "Terjadi kesalahan saat memproses transaksi",
        });
      }
    } catch (error) {
      console.error("Submit error", error);
      setSubmitStatus({ type: "error", message: "Terjadi kesalahan jaringan" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedType("");
      setSelectedMethod("");
    } else if (step === 3) {
      if (availableMethods.length === 0) {
        setStep(1);
      } else {
        setStep(2);
      }
    }
  };

  const shouldShowMethodStep = availableMethods.length > 0 && step !== 1;

  return (
    <div className="min-h-screen bg-slate-100/80 py-8 px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-[32px] border border-blue-100 bg-white shadow-[0_20px_45px_-12px_rgba(30,64,175,0.35)]">
          <div className="space-y-5 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-6 pb-8 pt-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-blue-100">Bank Terdepan</p>
                <h1 className="text-[26px] font-semibold leading-tight">Formulir Antrian Anda</h1>
              </div>
              <div className="rounded-2xl bg-white/20 px-3 py-2 text-right shadow-inner">
                <p className="text-[10px] uppercase tracking-[0.35em] text-blue-100">Nomor Antrian</p>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold">{queueNumber}</span>
                  <button
                    type="button"
                    onClick={handleCopyQueueNumber}
                    className="rounded-full bg-white/20 p-1 transition hover:bg-white/40"
                    aria-label="Salin nomor antrian"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 text-sm leading-5 text-blue-50">
              <p className="font-medium">Lengkapi data transaksi dengan benar untuk mempercepat proses di loket.</p>
              <p className="text-xs text-blue-100/80">Petugas akan memverifikasi data sebelum transaksi dijalankan.</p>
            </div>
          </div>

          <div className="space-y-6 px-6 pb-8 pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </button>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">Pilih Jenis Transaksi</h2>
                <span className="text-xs uppercase tracking-wide text-slate-400">Langkah {step} dari 3</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {transactionTypes.map((type) => {
                  const isActive = selectedType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleTypeSelect(type.value)}
                      className={`rounded-2xl border px-3 py-2 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
                        isActive
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40"
                      }`}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {shouldShowMethodStep && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">Metode {selectedType}</h3>
                <div className="flex flex-wrap gap-2">
                  {availableMethods.map((method) => {
                    const isActive = selectedMethod === method.value;
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => handleMethodSelect(method.value)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          isActive
                            ? "border-blue-500 bg-blue-500 text-white shadow-lg"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                        }`}
                      >
                        {method.label}
                      </button>
                    );
                  })}
                </div>
                {selectedMethod && (
                  <p className="text-xs text-slate-500">{methodDescriptions[selectedMethod] || "Metode yang dipilih akan diproses oleh petugas."}</p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="rounded-[24px] border border-slate-100 bg-white/60 p-5 shadow-inner">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {getVisibleFields().includes("customerName") && (
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Nama Lengkap
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Masukkan nama lengkap"
                                className="h-12 rounded-xl border-slate-200 bg-white text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {getVisibleFields().includes("bank") && (
                      <FormField
                        control={form.control}
                        name="bank"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Bank Tujuan
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white text-sm">
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

                    {getVisibleFields().includes("manualBankName") && (
                      <FormField
                        control={form.control}
                        name="manualBankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Nama Bank Lainnya
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Tuliskan nama bank"
                                className="h-12 rounded-xl border-slate-200 bg-white text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {getVisibleFields().includes("accountNumber") && (
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Nomor Rekening
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Cek nama otomatis"
                                className="h-12 rounded-xl border-slate-200 bg-white text-sm"
                                inputMode="numeric"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {getVisibleFields().includes("ewallet") && (
                      <FormField
                        control={form.control}
                        name="ewallet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Pilih E-Wallet
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white text-sm">
                                  <SelectValue placeholder="Pilih e-wallet" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {eWallets.map((ew) => (
                                  <SelectItem key={ew.value} value={ew.value}>
                                    {ew.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {getVisibleFields().includes("paymentInstitution") && (
                      <FormField
                        control={form.control}
                        name="paymentInstitution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Nama Instansi / Perusahaan
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Contoh: PLN, PDAM, Leasing"
                                className="h-12 rounded-xl border-slate-200 bg-white text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {getVisibleFields().includes("phone") && (
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Nomor HP (Opsional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="08xxxxxxxxxx"
                                className="h-12 rounded-xl border-slate-200 bg-white text-sm"
                                inputMode="numeric"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {getVisibleFields().includes("amount") && (
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Nominal Transaksi
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Minimal Rp 10.000"
                                className="h-12 rounded-xl border-slate-200 bg-white text-sm"
                                value={formatRupiahForInput(field.value)}
                                onChange={(e) => {
                                const numeric = parseRupiahValue(e.target.value);
                                field.onChange(numeric ? numeric : "");
                              }}
                              />
                            </FormControl>
                            <div className="flex gap-2 pt-2">
                              {quickAmounts.map((amount) => (
                                <button
                                  key={amount}
                                  type="button"
                                  onClick={() => form.setValue("amount", amount)}
                                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                    numericAmount === amount
                                      ? "bg-orange-500 text-white shadow"
                                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                  }`}
                                >
                                  {formatRupiah(amount)}
                                </button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {getVisibleFields().includes("notes") && (
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Catatan Tambahan
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Catatan untuk petugas"
                                className="rounded-xl border-slate-200 bg-white text-sm"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-xs text-orange-700">
                      <p className="font-semibold uppercase tracking-wide">Informasi Outlet</p>
                      <p>No. rekening atau QRIS outlet akan diberikan oleh petugas setelah data terverifikasi.</p>
                    </div>

                    {submitStatus.type && (
                      <div
                        className={`flex items-center space-x-2 rounded-2xl border px-3 py-2 text-sm ${
                          submitStatus.type === "success"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {submitStatus.type === "success" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                        )}
                        <span>{submitStatus.message}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="h-12 w-full rounded-2xl bg-blue-600 text-sm font-semibold uppercase tracking-wide transition hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        "Submit Transaksi"
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
