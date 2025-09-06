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
    title: '1. Pindai QR di Loket',
    description: 'Saat tiba di loket kasir, akan ada QR code unik yang ditampilkan untuk transaksi Anda.',
  },
  {
    icon: FileText,
    title: '2. Isi Detail Transaksi',
    description: 'Pindai QR tersebut dengan ponsel Anda untuk membuka form, lalu isi nama dan nominal transaksi.',
  },
  {
    icon: Car,
    title: '3. Selesaikan Transaksi',
    description: 'Kasir akan mengkonfirmasi data Anda di layar mereka dan menyelesaikan proses transaksi tunai.',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white px-4">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1580921935312-d8a1b5a3f076?q=80&w=2070&auto=format&fit=crop"
              alt="Modern bank drive-thru"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Masa Depan Transaksi Drive-Thru
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
              Memperkenalkan QR Tunai Drive: Solusi transaksi tunai berbasis QR yang cepat, aman, dan tanpa kontak untuk bisnis Anda.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-card">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Bagaimana Cara Kerjanya?</h2>
              <p className="mt-4 text-muted-foreground">
                Tiga langkah mudah untuk merevolusi pengalaman transaksi pelanggan Anda.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
              {howItWorks.map((step) => (
                <div key={step.title} className="flex flex-col items-center">
                  <div className="mb-6 bg-primary/10 p-6 rounded-full ring-8 ring-primary/5">
                    <step.icon className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
             <div className="text-center mt-12">
                <Button asChild>
                    <Link href="/dashboard">
                        Lihat Dasbor Aplikasi
                    </Link>
                </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Fitur Unggulan</h2>
              <p className="mt-4 text-muted-foreground">
                Platform kami dirancang untuk efisiensi, keamanan, dan kemudahan penggunaan, baik untuk kasir maupun pelanggan.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border-border/60">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>
      <footer className="bg-card border-t">
        <div className="container py-6 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} QR Tunai Drive. Dibuat sebagai proyek demo. | <Link href="#" className="underline hover:text-primary">Syarat & Ketentuan</Link></p>
        </div>
      </footer>
    </div>
  );
}
