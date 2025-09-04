
import Image from 'next/image';
import { Bell, CheckCircle, ArrowUpRight, ArrowDownLeft, Wallet, User, XCircle, TrendingUp, DollarSign, ReceiptText, Ban, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { pendingTransactions, bankAccounts, type Transaction, type BankAccount, type BankAccountHistory } from '@/lib/data';
import { CopyButton } from '@/components/copy-button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function PendingTransactionCard({ transaction }: { transaction: Transaction }) {
  const { id, type, bank, accountNumber, customerName, amount, notes, date } = transaction;

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{type}</CardTitle>
                <CardDescription>ID Transaksi: {id}</CardDescription>
            </div>
            <div className="text-xs text-muted-foreground">{date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Bank</span>
            <span className="font-medium">{bank}</span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">No. Rekening</span>
            <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{accountNumber}</span>
                <CopyButton textToCopy={accountNumber} label="" />
            </div>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Atas Nama</span>
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{customerName}</span>
            </div>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Jumlah</span>
            <div className="flex items-center gap-2">
                <span className="font-semibold text-lg text-primary">{formatCurrency(amount)}</span>
                <CopyButton textToCopy={String(amount)} label="" />
            </div>
        </div>
        {notes && (
          <div>
            <span className="text-sm text-muted-foreground">Catatan</span>
            <p className="text-sm border-l-2 pl-2 mt-1">{notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50">
          <XCircle className="mr-2 h-4 w-4" />
          Batalkan
        </Button>
        <Button className="w-full bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-2 h-4 w-4" />
          Selesaikan
        </Button>
      </CardFooter>
    </Card>
  );
}

function BankAccountCard({ account }: { account: BankAccount }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{account.bankName}</CardTitle>
        <Image src={account.logo} alt={`${account.bankName} logo`} width={80} height={20} className="object-contain" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
        <p className="text-xs text-muted-foreground">{account.accountHolder} - {account.accountNumber}</p>
        <Separator className="my-4" />
        <div className="space-y-3">
            <h4 className="text-sm font-medium">Riwayat Terbaru</h4>
            {account.history.map((item: BankAccountHistory) => (
                <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {item.type === 'credit' ? <ArrowDownLeft className="h-4 w-4 text-green-500" /> : <ArrowUpRight className="h-4 w-4 text-red-500" />}
                        <div>
                            <p className="text-sm font-medium leading-none">{item.description}</p>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                    </div>
                    <div className={`text-sm font-medium ${item.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(item.amount)}
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const hasPendingTransactions = pendingTransactions.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Kasir</h1>
        <p className="text-muted-foreground">Selamat datang! Kelola transaksi drive-thru di sini.</p>
      </div>

       <div>
        <h2 className="text-2xl font-semibold flex items-center mb-4">
            <TrendingUp className="mr-3 h-6 w-6 text-accent" />
            Kinerja Hari Ini
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(260000)}</div>
                <p className="text-xs text-muted-foreground">+Rp 40.000 dari kemarin</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                <ReceiptText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">+52</div>
                <p className="text-xs text-muted-foreground">+8 dari kemarin</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transaksi Selesai</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">48</div>
                <p className="text-xs text-muted-foreground">Tingkat keberhasilan 92.3%</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transaksi Dibatalkan</CardTitle>
                <Ban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Tingkat pembatalan 7.7%</p>
                </CardContent>
            </Card>
        </div>
      </div>
      
       <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-2xl font-semibold flex items-center mb-4 [&[data-state=open]>svg]:text-primary">
            <div className="flex items-center">
              <Wallet className="mr-3 h-6 w-6 text-accent" />
              Status Rekening Outlet
            </div>
            <ChevronDown className="h-6 w-6 transition-transform duration-200" />
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {bankAccounts.map(account => (
                    <BankAccountCard key={account.accountNumber} account={account} />
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {hasPendingTransactions ? (
        <div>
          <h2 className="text-2xl font-semibold flex items-center mb-4">
            <Bell className="mr-3 h-6 w-6 text-accent animate-pulse" />
            Transaksi Tertunda ({pendingTransactions.length})
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {pendingTransactions.map(tx => (
              <PendingTransactionCard key={tx.id} transaction={tx} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-xl font-semibold">Semua Transaksi Selesai</h2>
            <p className="mt-2 text-muted-foreground">Tidak ada transaksi yang tertunda saat ini. Menunggu pelanggan berikutnya.</p>
        </div>
      )}
    </div>
  );
}
