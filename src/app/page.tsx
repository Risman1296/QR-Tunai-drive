import Image from 'next/image';
import Link from 'next/link';
import {
  Banknote,
  Landmark,
  ArrowRightLeft,
  CreditCard,
  ScanLine,
  FileText,
  Car,
  MapPin,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';

const features = [
  {
    icon: Banknote,
    title: 'Tarik Tunai',
    description: 'Ambil uang tunai dengan cepat dan mudah tanpa perlu turun dari kendaraan Anda.',
  },
  {
    icon: Landmark,
    title: 'Setor Tunai',
    description: 'Setor uang tunai ke rekening Anda dengan aman dan efisien.',
  },
  {
    icon: ArrowRightLeft,
    title: 'Transfer Dana',
    description: 'Kirim uang ke rekening lain dengan proses yang disederhanakan.',
  },
  {
    icon: CreditCard,
    title: 'Pembayaran',
    description: 'Bayar berbagai tagihan Anda langsung dari outlet drive-thru kami.',
  },
];

const howItWorks = [
  {
    icon: ScanLine,
    title: '1. Pindai QR',
    description: 'Saat berada di antrian, pindai QR code yang ditampilkan untuk membuka formulir transaksi.',
  },
  {
    icon: FileText,
    title: '2. Isi Formulir',
    description: 'Lengkapi detail transaksi Anda pada formulir digital yang aman.',
  },
  {
    icon: Car,
    title: '3. Transaksi di Loket',
    description: 'Maju ke loket, di mana petugas kami sudah siap melayani transaksi Anda yang telah disiapkan.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white px-4">
          <div className="absolute inset-0">
            <Image
              src="https://picsum.photos/1600/900"
              alt="Drive thru banking"
              data-ai-hint="drive thru bank"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Transaksi Keuangan Generasi Berikutnya
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
              QR Tunai Drive: Cepat, Aman, dan Nyaman. Lakukan semua transaksi perbankan Anda tanpa meninggalkan kendaraan.
            </p>
            <Button size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/transaction">Mulai Transaksi</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Layanan Komprehensif Kami</h2>
              <p className="mt-4 text-muted-foreground">
                Dari penarikan tunai hingga pembayaran tagihan, kami menyediakan semua kebutuhan transaksi Anda dalam satu atap.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 md:py-24 bg-card">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Bagaimana Cara Kerjanya?</h2>
              <p className="mt-4 text-muted-foreground">
                Tiga langkah mudah untuk pengalaman perbankan drive-thru yang revolusioner.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorks.map((step) => (
                <div key={step.title} className="flex flex-col items-center text-center">
                  <div className="mb-4 bg-primary/10 p-6 rounded-full">
                    <step.icon className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="location" className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Kunjungi Outlet Kami</h2>
                <div className="flex items-start mt-6">
                  <MapPin className="h-6 w-6 text-primary mt-1 mr-4 shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold">QR Tunai Drive Thru - Pusat Kota</h3>
                    <p className="text-muted-foreground mt-1">
                      Jl. Jenderal Sudirman No. 123, Gerbang Masuk Kota, 12345
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground">
                  Buka 24 jam non-stop, kami selalu siap melayani Anda kapan pun. Temukan kami di jalan utama kota Anda.
                </p>
                <Button className="mt-6" variant="outline">Dapatkan Arah</Button>
              </div>
              <div className="rounded-lg overflow-hidden shadow-xl aspect-video">
                <Image
                  src="https://picsum.photos/600/400"
                  alt="Map location"
                  data-ai-hint="city map"
                  width={600}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-card border-t">
        <div className="container py-6 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} QR Tunai Drive. Semua hak dilindungi. | <Link href="/terms" className="underline hover:text-primary">Syarat & Ketentuan</Link></p>
        </div>
      </footer>
    </div>
  );
}
