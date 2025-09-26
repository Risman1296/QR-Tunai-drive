'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Users,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  Store,
  Globe,
  Award,
  Lightbulb,
  Wallet,
  Building2,
  Link2,
  Rocket,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { TabNavigation } from '@/components/tab-navigation';

const heroStats = [
  { value: '10,000+', label: 'Transaksi Harian' },
  { value: '500+', label: 'Outlet Tersebar' },
  { value: '98.9%', label: 'Tingkat Kepuasan' },
  { value: '15 Detik', label: 'Rata-rata Waktu Transaksi' },
];

const services = [
  { icon: Banknote, title: 'Tarik Tunai', description: 'Ambil uang tunai cepat tanpa keluar dari kendaraan.' },
  { icon: Landmark, title: 'Setor Tunai', description: 'Setor dana ke rekening dengan proses aman dan terpantau.' },
  { icon: ArrowRightLeft, title: 'Transfer Dana', description: 'Kirim uang ke rekening lain melalui alur yang disederhanakan.' },
  { icon: CreditCard, title: 'Pembayaran & Top Up', description: 'Bayar tagihan dan isi ulang e-wallet langsung di outlet.' },
];

const serviceValueProps = [
  {
    title: 'Ubah titik sibuk jadi layanan keuangan',
    description: 'Form QR, token unik, dan pemrosesan real-time mengubah drive-thru biasa menjadi titik layanan finansial lengkap.',
  },
  {
    title: 'Drive-thru cepat & aman',
    description: 'Transaksi selesai dalam 15 detik, tanpa turun kendaraan, dengan standar keamanan setara perbankan.',
  },
  {
    title: 'Kemitraan outlet terhubung pusat',
    description: 'Waralaba digital yang terhubung ke dashboard pusat untuk monitoring, settlement, dan laporan otomatis.',
  },
];

const partnershipTracks = [
  {
    icon: Store,
    title: 'Mitra Outlet / Agen',
    description:
      'Jalankan QR-Tunai Drive-Thru di wilayah Anda. Kami sediakan sistem, pelatihan, dan support end-to-end untuk UMKM, SPBU mini, warung modern, koperasi, serta komunitas.',
  },
  {
    icon: Building2,
    title: 'Mitra Lembaga Keuangan / Koperasi',
    description:
      'Perluas jangkauan layanan tanpa membuka cabang baru. Integrasi API & dashboard siap pakai untuk monitoring transaksi lintas outlet.',
  },
  {
    icon: Rocket,
    title: 'Investor & Partner Teknologi',
    description:
      'Kolaborasi strategis untuk membangun jaringan outlet fintech drive-thru terbesar di Indonesia dengan model investasi berkelanjutan.',
  },
];

const howItWorksSteps = [
  {
    icon: ScanLine,
    title: 'Scan QR Khusus',
    description: 'Pelanggan memindai QR unik di loket drive-thru untuk membuka form digital.',
  },
  {
    icon: FileText,
    title: 'Isi Form & Verifikasi',
    description: 'Data transaksi diisi langsung pada perangkat pelanggan, diverifikasi otomatis oleh sistem.',
  },
  {
    icon: Car,
    title: 'Transaksi Selesai',
    description: 'Petugas memproses permintaan secara real-time. Pelanggan tinggal melanjutkan perjalanan.',
  },
];

const advantageCards = [
  {
    icon: Zap,
    title: 'Teknologi Terdepan',
    description: 'Framework headless dengan orkestrasi API, enkripsi menyeluruh, dan audit log real-time.',
  },
  {
    icon: Clock,
    title: 'Operasional 24/7',
    description: 'Automasi scheduler, dashboard monitoring, dan notifikasi insiden menjaga outlet aktif sepanjang waktu.',
  },
  {
    icon: Shield,
    title: 'Keamanan Setara Perbankan',
    description: 'Standar keamanan multi-layer: tokenisasi QR, OTP, dan kontrol akses berbasis peran.',
  },
  {
    icon: Award,
    title: 'Skalabilitas Outlet',
    description: 'Blueprint kemitraan digital yang siap digandakan di berbagai kota tanpa friksi operasional.',
  },
];

const advantageBullets = [
  'Real-time & Aman (Enkripsi & API resmi)',
  'Desain Sistem Fleksibel (menyesuaikan kebutuhan mitra)',
  'Model Bisnis Berkelanjutan (bagi hasil, biaya layanan, royalti)',
  'Akses Offline & Online (Drive-Thru, Wi-Fi QR, Captive Portal)',
];

// Component to handle search params
function TransactionStatus({ onTransactionCompleted }: { onTransactionCompleted: (id: string) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const transaction = searchParams.get('transaction');
    const status = searchParams.get('status');

    if (transaction && status === 'completed') {
      onTransactionCompleted(transaction);
    }
  }, [searchParams, onTransactionCompleted]);

  return null;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [transactionCompleted, setTransactionCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const handleTransactionCompleted = (id: string) => {
    setTransactionCompleted(true);
    setTransactionId(id);

    // Auto hide after 10 seconds
    setTimeout(() => {
      setTransactionCompleted(false);
    }, 10000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <Suspense fallback={null}>
        <TransactionStatus onTransactionCompleted={handleTransactionCompleted} />
      </Suspense>

      <Header />

      {transactionCompleted && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <Card className="w-full max-w-md bg-white text-slate-900 shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-lg font-semibold text-emerald-700">Transaksi Berhasil Diproses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-1 text-center">
                <p className="text-slate-500">ID Transaksi</p>
                <p className="rounded-lg bg-emerald-50 py-2 font-mono text-base font-semibold text-emerald-600">
                  {transactionId}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <span className="font-semibold text-emerald-600">Sedang Diproses</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimasi Selesai</span>
                  <span className="font-semibold text-blue-600">2-5 menit</span>
                </div>
              </div>
              <div className="rounded-lg bg-transparent p-3 text-white/90">
                Mohon menuju counter drive-thru untuk penyelesaian dan penyerahan bukti transaksi.
              </div>
              <Button onClick={() => setTransactionCompleted(false)} className="w-full bg-transparent border border-white/20 text-white hover:bg-white/10">
                Tutup
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1">
        {activeTab === 'overview' && (
          <div className="hero-background-full">
            <section className="section text-center md:text-left relative z-10">
              <div className="space-y-6 sm:space-y-8 text-center">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-500/20 px-4 py-1 text-xs font-medium uppercase tracking-wide text-blue-300 border border-blue-400/20">
                  Fintech Enabler Drive-Thru
                </span>
                <h1 className="h-section text-white text-center">
                  QR-Tunai Drive-Thru — Ekosistem transaksi 15 detik di titik kehidupan masyarakat
                </h1>
                <p className="lede mx-auto text-center">
                  Transaksi perbankan bisa dilakukan tanpa turun kendaraan. Kami menghadirkan jaringan outlet drive-thru dengan teknologi QR, automasi verifikasi, dan tim operasional yang siap mengeksekusi di lapangan.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all duration-200 transform hover:scale-105"
                  >
                    Mulai Partner Dashboard
                  </Link>
                  <Link
                    href="/kemitraan"
                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    Buka Kemitraan Outlet
                  </Link>
                </div>
              </div>

              <ul className="grid-4 mt-12 relative z-10">
                {heroStats.map((stat) => (
                  <li key={stat.label} className="stat">
                    <div className="stat-k">{stat.value}</div>
                    <div className="stat-v">{stat.label}</div>
                  </li>
                ))}
              </ul>

              <div className="grid-2 items-stretch mt-12 relative z-10">
                <div className="card">
                  <h3 className="card-title">Misi Kami</h3>
                  <p className="card-body">
                    Menghubungkan masyarakat dengan layanan keuangan yang mudah, cepat, dan terjangkau — langsung di titik kehidupan mereka: jalan raya, outlet, dan komunitas lokal.
                  </p>
                </div>
                <div className="card">
                  <h3 className="card-title">Siapa Kami</h3>
                  <p className="card-body">
                    QR-Tunai adalah Fintech Enabler Indonesia yang membantu UMKM, lembaga keuangan, koperasi, dan mitra bisnis menghadirkan layanan transaksi tunai dan non-tunai berbasis QR-Code langsung di lapangan.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="hero-background-full">
            <section className="section text-center md:text-left relative z-10">
              <h2 className="h-section text-white">Layanan QRIS Drive-Thru</h2>
              <p className="lede mx-auto md:mx-0 text-center md:text-left">
                Satu outlet drive-thru bisa memproses tarik setor tunai, transfer dana, dan pembayaran digital sekaligus dengan teknologi QRIS. Semua terhubung ke dashboard pusat untuk kontrol operasional real-time.
              </p>

            <div className="grid-4 mt-8">
              {services.map((service) => (
                <div key={service.title} className="card">
                  <service.icon className="h-8 w-8 text-blue-400" />
                  <h3 className="card-title mt-4">{service.title}</h3>
                  <p className="card-body">{service.description}</p>
                </div>
              ))}
            </div>

            <div className="grid-2 items-stretch mt-8">
              {serviceValueProps.slice(0, 2).map((item) => (
                <div key={item.title} className="card">
                  <h4 className="card-title">{item.title}</h4>
                  <p className="card-body">{item.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <div className="card max-w-2xl mx-auto">
                <h4 className="card-title">{serviceValueProps[2].title}</h4>
                <p className="card-body">{serviceValueProps[2].description}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link
                href="/layanan"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Lihat Paket Implementasi
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
              >
                Jadwalkan Demo
              </Link>
            </div>
            </section>
          </div>
        )}

        {activeTab === 'partnership' && (
          <div className="hero-background-full">
            <section className="section text-center md:text-left relative z-10">
              <h2 className="h-section text-white">Kemitraan QRIS & Kolaborasi</h2>
              <p className="lede mx-auto md:mx-0 text-center md:text-left">
                Dari outlet mandiri hingga jaringan perbankan, kami membuka kemitraan untuk menghadirkan layanan keuangan digital QRIS langsung di titik kehidupan masyarakat.
              </p>

            <div className="grid-2 items-stretch mt-8">
              {partnershipTracks.slice(0, 2).map((lane) => (
                <div key={lane.title} className="card">
                  <lane.icon className="h-7 w-7 text-qr-blue-600" />
                  <h3 className="card-title text-slate-800 mt-4">{lane.title}</h3>
                  <p className="card-body text-slate-600">{lane.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="card max-w-2xl mx-auto">
                {(() => {
                  const ThirdIcon = partnershipTracks[2].icon;
                  return <ThirdIcon className="h-7 w-7 text-qr-blue-600" />;
                })()}
                <h3 className="card-title text-slate-800 mt-4">{partnershipTracks[2].title}</h3>
                <p className="card-body text-slate-600">{partnershipTracks[2].description}</p>
              </div>
            </div>

            <div className="card mt-8 text-center">
              <h3 className="text-lg font-semibold text-slate-900">✨ Proof of Impact</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                98.9% mitra menyatakan peningkatan traffic outlet dan konversi transaksi digital setelah 3 bulan bermitra dengan QR-Tunai.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/kemitraan"
                  className="inline-flex items-center justify-center rounded-xl bg-qr-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-qr-blue-700"
                >
                  Ajukan Kemitraan Outlet
                </Link>
                <Link
                  href="/kemitraan/corporate"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Kolaborasi Corporate
                </Link>
              </div>
            </div>
            </section>
          </div>
        )}

        {activeTab === 'how-it-works' && (
          <section className="section text-center md:text-left">
            <h2 className="h-section text-slate-900">Cara Kerja Sistem Drive-Thru</h2>
            <p className="lede mx-auto md:mx-0 text-slate-600">
              Formula HVPEA kami: Hook pelanggan dengan layanan cepat, berikan Value nyata, tunjukkan Proof kinerja, Explain alur yang simpel, dan dorong Action di outlet.
            </p>

            <div className="grid-2 items-stretch mt-8">
              {howItWorksSteps.slice(0, 2).map((step) => (
                <div key={step.title} className="card text-center">
                  <step.icon className="mx-auto h-10 w-10 text-qr-blue-600" />
                  <h3 className="card-title text-slate-800 mt-4">{step.title}</h3>
                  <p className="card-body text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <div className="card max-w-2xl mx-auto text-center">
                {(() => {
                  const StepIcon = howItWorksSteps[2].icon;
                  return <StepIcon className="mx-auto h-10 w-10 text-qr-blue-600" />;
                })()}
                <h3 className="card-title text-slate-800 mt-4">{howItWorksSteps[2].title}</h3>
                <p className="card-body text-slate-600">{howItWorksSteps[2].description}</p>
              </div>
            </div>

            <p className="text-center text-sm text-slate-600 leading-relaxed max-w-3xl mx-auto mt-8">
              Misi Kami: Menghubungkan masyarakat dengan layanan keuangan digital yang mudah, cepat, dan terjangkau — langsung di titik kehidupan mereka.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/docs/operational-playbook.pdf"
                className="inline-flex items-center justify-center rounded-xl bg-qr-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-qr-blue-700"
              >
                Lihat Playbook Operasional
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Hubungi Tim Implementasi
              </Link>
            </div>
          </section>
        )}

        {activeTab === 'advantages' && (
          <section className="section text-center md:text-left">
            <h2 className="h-section text-slate-900">Mengapa Memilih QR-Tunai Drive?</h2>
            <p className="lede mx-auto md:mx-0 text-slate-600">
              Kami kombinasikan teknologi, jaringan outlet, dan model bisnis kemitraan agar Anda bisa menghadirkan layanan keuangan digital dengan cepat dan aman.
            </p>

            <div className="grid-4 mt-8">
              {advantageCards.map((item) => (
                <div key={item.title} className="card text-left">
                  <item.icon className="h-7 w-7 text-qr-blue-600" />
                  <h3 className="card-title text-slate-800 mt-4">{item.title}</h3>
                  <p className="card-body text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="card mt-8">
              <h3 className="text-lg font-semibold text-slate-900">Keunggulan yang Kami Tawarkan</h3>
              <div className="mt-4 grid-2">
                {advantageBullets.map((point) => (
                  <div key={point} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-qr-blue-600 flex-shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm font-medium text-slate-700">
                QR-Tunai: dari jalanan, untuk semua kalangan. Membawa inklusi keuangan ke tempat di mana masyarakat benar-benar hidup.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/kemitraan"
                  className="inline-flex items-center justify-center rounded-xl bg-qr-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-qr-blue-700"
                >
                  Konsultasi Strategi Pertumbuhan
                </Link>
                <Link
                  href="/success-stories"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Lihat Studi Kasus
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="gradient-footer w-full text-white">
        <div className="relative z-10 mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-white/70">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">QR-Tunai Drive</h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Fintech Enabler berbasis outlet drive-thru yang menghadirkan transaksi tunai dan non-tunai dalam hitungan detik.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Layanan</h4>
              <ul className="mt-3 space-y-2 text-white/70">
                <li>Drive-Thru Banking</li>
                <li>QR Payment System</li>
                <li>Kemitraan Outlet</li>
                <li>Implementasi API</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Kemitraan</h4>
              <ul className="mt-3 space-y-2 text-white/70">
                <li>Skema Franchise Digital</li>
                <li>Integrasi Bank & Koperasi</li>
                <li>Program Investor</li>
                <li>Support 24/7</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Kontak</h4>
              <ul className="mt-3 space-y-2 text-white/70">
                <li>📍 Jakarta, Indonesia</li>
                <li>📞 021-QRTUNAI</li>
                <li>✉️ hello@qrtunaidrive.co.id</li>
              </ul>
            </div>
          </div>
          <div className="h-px bg-white/20" />
          <p className="text-center text-xs text-white/60">
            © {new Date().getFullYear()} QR-Tunai Drive — Solusi Drive-Thru Banking Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}
