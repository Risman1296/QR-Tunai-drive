
"use client"

import { useState, useEffect } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowLeft, Loader2, Send } from "lucide-react"
import Link from "next/link"
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

const formSchema = z.object({
  transactionType: z.enum(["Tarik Tunai", "Setor Tunai", "Transfer", "Pembayaran"]),
  bankName: z.string().min(2, "Nama bank minimal 2 karakter."),
  accountNumber: z.string().min(5, "Nomor rekening minimal 5 digit.").regex(/^\d+$/, "Nomor rekening hanya boleh berisi angka."),
  amount: z.coerce.number().min(10000, "Jumlah minimal Rp 10.000."),
  notes: z.string().max(100, "Catatan maksimal 100 karakter.").optional(),
  verification: z.literal(true, {
    errorMap: () => ({ message: "Anda harus menyetujui verifikasi ini." }),
  }),
  reference: z.string().min(1, "Nomor referensi tidak valid."),
})

type TransactionType = "Tarik Tunai" | "Setor Tunai" | "Transfer" | "Pembayaran" | ""
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
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      amount: 0,
      notes: "",
      reference: transactionRef || "",
    },
  })

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
                <div className="space-y-2">
                    <Label>No. Rekening Outlet</Label>
                    <div className="flex items-center gap-2">
                        <Input readOnly value="123-456-7890 (Bank QR Tunai)" className="bg-muted flex-1"/>
                        <CopyButton textToCopy="123-456-7890" />
                    </div>
                    <p className="text-xs text-muted-foreground">Untuk transaksi Tarik Tunai, transfer ke rekening ini.</p>
                </div>
            )}
            
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Bank</FormLabel>
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
                  <FormLabel>No. Rekening</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="cth: 0123456789" {...field} />
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
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">Rp</span>
                      <Input type="number" placeholder="cth: 500000" className="pl-9" {...field} />
                    </div>
                  </FormControl>
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
        <React.Suspense fallback={<div>Loading...</div>}>
            <TransactionFormContent />
        </React.Suspense>
    )
}

    