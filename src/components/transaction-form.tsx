
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

import { submitTransactionAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CopyButton } from "./copy-button"
import { Suspense } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const formSchema = z.object({
  transactionType: z.enum(["Tarik Tunai", "Setor Tunai", "Transfer", "Pembayaran"]),
  paymentMethod: z.enum(["Transfer", "QRIS", "EDC"]).optional(),
  bankName: z.string().min(2, "Nama bank minimal 2 karakter."),
  accountNumber: z.string().min(5, "Nomor rekening minimal 5 digit.").regex(/^\d+$/, "Nomor rekening hanya boleh berisi angka."),
  accountHolderName: z.string().min(2, "Nama pemilik rekening minimal 2 karakter."),
  amount: z.coerce.number().min(10000, "Jumlah minimal Rp 10.000."),
  notes: z.string().max(100, "Catatan maksimal 100 karakter.").optional(),
  verification: z.literal(true, {
    errorMap: () => ({ message: "Anda harus menyetujui verifikasi ini." }),
  }),
  reference: z.string().min(1, "Nomor referensi tidak valid."),
}).refine(data => !(data.transactionType === "Tarik Tunai" && !data.paymentMethod), {
    message: "Silakan pilih metode pembayaran.",
    path: ["paymentMethod"],
});

type TransactionType = "Tarik Tunai" | "Setor Tunai" | "Transfer" | "Pembayaran" | ""
type PaymentMethod = "Transfer" | "QRIS" | "EDC" | ""
type FormValues = z.infer<typeof formSchema>;


function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Kirim Formulir
    </Button>
  )
}

function TransactionFormContent() {
  const searchParams = useSearchParams()
  const transactionRef = searchParams.get('ref')

  const [formState, action] = useFormState(submitTransactionAction, { message: "", success: false })
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionType>("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>("");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountHolderName: "",
      amount: 0,
      notes: "",
      reference: transactionRef || "",
    },
  })
  
  const quickAmounts = [100000, 200000, 500000, 1000000];

  useEffect(() => {
    if (transactionRef) {
      form.setValue('reference', transactionRef)
      const savedData = sessionStorage.getItem(`transaction-${transactionRef}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        form.reset(parsedData);
        if(parsedData.transactionType) {
            setSelectedTransaction(parsedData.transactionType)
        }
        if(parsedData.paymentMethod) {
            setSelectedPaymentMethod(parsedData.paymentMethod)
        }
      }
    }
  }, [transactionRef, form])

  useEffect(() => {
    const subscription = form.watch((value) => {
        if(transactionRef) {
            sessionStorage.setItem(`transaction-${transactionRef}`, JSON.stringify(value));
        }
    });
    return () => subscription.unsubscribe();
  }, [form, transactionRef]);
  
  if (!transactionRef) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Link Tidak Valid</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Nomor referensi transaksi tidak ditemukan. Silakan pindai QR code yang valid.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                 <Button variant="outline" className="w-full" asChild>
                    <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Beranda
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
  }

  if (formState.success) {
    if (transactionRef) {
        sessionStorage.removeItem(`transaction-${transactionRef}`);
    }
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Transaksi Terkirim</CardTitle>
          <CardDescription>Formulir Anda telah berhasil dikirim.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className="bg-green-100 border-green-400 text-green-700">
            <AlertTitle>Berhasil!</AlertTitle>
            <AlertDescription>{formState.message}</AlertDescription>
          </Alert>
          <div className="mt-4 rounded-md border bg-muted p-3 text-sm">
            <p className="text-muted-foreground">Nomor Antrian Anda:</p>
            <p className="font-mono font-semibold text-primary">{transactionRef}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <Form {...form}>
        <form action={action}>
          <input type="hidden" {...form.register("reference")} />
          <CardHeader>
            <CardTitle>Formulir Transaksi</CardTitle>
            <CardDescription>
              Isi detail transaksi Anda. Pastikan semua data benar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 rounded-md border bg-muted p-3">
                <div className="flex justify-between items-center">
                    <div>
                        <Label>Nomor Antrian Anda</Label>
                        <p className="font-mono text-primary font-bold">{transactionRef}</p>
                    </div>
                    <CopyButton textToCopy={transactionRef} label="Salin" />
                </div>
            </div>

            <FormField
              control={form.control}
              name="transactionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Transaksi</FormLabel>
                  <Select
                    onValueChange={(value: TransactionType) => {
                      field.onChange(value)
                      setSelectedTransaction(value)
                      if (value !== 'Tarik Tunai') {
                        setSelectedPaymentMethod('');
                        form.setValue('paymentMethod', undefined);
                      }
                    }}
                    defaultValue={field.value}
                    name={field.name}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis transaksi" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Tarik Tunai">Tarik Tunai</SelectItem>
                      <SelectItem value="Setor Tunai">Setor Tunai</SelectItem>
                      <SelectItem value="Transfer">Transfer</SelectItem>
                      <SelectItem value="Pembayaran">Pembayaran</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedTransaction === "Tarik Tunai" && (
                <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3 rounded-md border border-accent p-4">
                    <FormLabel className="font-semibold">Pilih Metode Pembayaran</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value: PaymentMethod) => {
                            field.onChange(value)
                            setSelectedPaymentMethod(value)
                        }}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Transfer" />
                          </FormControl>
                          <FormLabel className="font-normal">Transfer Bank</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="QRIS" />
                          </FormControl>
                          <FormLabel className="font-normal">QRIS</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="EDC" />
                          </FormControl>
                          <FormLabel className="font-normal">Kartu Debit/Kredit (EDC)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />

                    {selectedPaymentMethod === 'Transfer' && (
                        <div className="space-y-2 pt-2">
                            <Label className="text-sm">Rekening Tujuan Transfer</Label>
                            <div className="flex items-center gap-2">
                                <Input readOnly value="123-456-7890 (Bank QR Tunai)" className="bg-muted flex-1 text-sm"/>
                                <CopyButton textToCopy="1234567890" />
                            </div>
                            <p className="text-xs text-muted-foreground">Silakan transfer jumlah yang Anda inginkan ke rekening di atas terlebih dahulu.</p>
                        </div>
                    )}
                     {selectedPaymentMethod === 'QRIS' && (
                        <div className="space-y-2 pt-2">
                            <Label className="text-sm">Pindai untuk Membayar</Label>
                            <div className="flex justify-center p-2 bg-white rounded-md">
                                <Image src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=example" data-ai-hint="QR code" alt="QRIS Code" width={150} height={150} />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">Pindai kode QRIS ini dengan aplikasi e-wallet atau mobile banking Anda.</p>
                        </div>
                    )}
                    {selectedPaymentMethod === 'EDC' && (
                         <div className="space-y-2 pt-2">
                             <Alert>
                                <AlertTitle>Siapkan Kartu Anda</AlertTitle>
                                <AlertDescription>
                                    Transaksi akan diproses menggunakan mesin EDC di loket. Mohon siapkan kartu Debit atau Kredit Anda.
                                </AlertDescription>
                            </Alert>
                         </div>
                    )}
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Bank Anda</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Bank Central Asia" {...field} />
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
                  <FormLabel>No. Rekening Anda</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="cth: 0123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="accountHolderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Pemilik Rekening</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Budi Setiawan" {...field} />
                  </FormControl>
                   <FormDescription>
                    Nama harus sesuai dengan yang tertera di rekening bank.
                  </FormDescription>
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
                   <div className="space-y-2">
                    <FormControl>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">Rp</span>
                        <Input type="number" placeholder="cth: 500000" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <div className="grid grid-cols-4 gap-2">
                      {quickAmounts.map(amount => (
                          <Button key={amount} type="button" variant="outline" size="sm" onClick={() => form.setValue('amount', amount, { shouldValidate: true })}>
                            {new Intl.NumberFormat('id-ID').format(amount / 1000)}k
                          </Button>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="cth: Pembayaran tagihan listrik" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="verification"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      name={field.name}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Verifikasi</FormLabel>
                    <FormDescription>
                      Saya menyatakan semua informasi yang dimasukkan valid. Adapun kesalahan penulisan adalah tanggung jawab saya.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

export function TransactionForm() {
    return (
        <Suspense fallback={<div className="w-full max-w-md text-center"><p>Memuat formulir...</p></div>}>
            <TransactionFormContent />
        </Suspense>
    )
}
