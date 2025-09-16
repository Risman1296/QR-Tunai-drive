'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/header';
import { TabNavigation } from '@/components/tab-navigation';

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

const franchiseFeatures = [
  {
    icon: Store,
    title: 'Peluang Waralaba',
    description: 'Bergabunglah dengan jaringan QR Tunai Drive dan raih keuntungan dengan investasi yang terjangkau.',
  },
  {
    icon: TrendingUp,
    title: 'Potensi Keuntungan Tinggi',
    description: 'ROI hingga 200% dalam 12 bulan dengan model bisnis yang sudah terbukti.',
  },
  {
    icon: Users,
    title: 'Pelatihan & Support',
    description: 'Dapatkan pelatihan lengkap, sistem operasional, dan dukungan marketing berkelanjutan.',
  },
  {
    icon: Globe,
    title: 'Brand Nasional',
    description: 'Menjadi bagian dari revolusi fintech Indonesia dengan brand yang dipercaya masyarakat.',
  },
];

const whyChooseUs = [
  {
    icon: Zap,
    title: 'Teknologi Terdepan',
    description: 'Sistem QR berbasis blockchain dengan keamanan tingkat bank.',
  },
  {
    icon: Clock,
    title: 'Operasional 24/7',
    description: 'Layanan tersedia kapan saja untuk memaksimalkan potensi pendapatan.',
  },
  {
    icon: Shield,
    title: 'Keamanan Terjamin',
    description: 'Enkripsi end-to-end dan compliance dengan standar perbankan Indonesia.',
  },
  {
    icon: Award,
    title: 'Penghargaan Industri',
    description: 'Diakui sebagai "Fintech Innovation of the Year" oleh Bank Indonesia.',
  },
];

const howItWorks = [
  {
    icon: ScanLine,
    title: '1. Scan QR Code',
    description: 'Pelanggan memindai QR code unik di loket drive-thru untuk memulai transaksi.',
  },
  {
    icon: FileText,
    title: '2. Input Data',
    description: 'Sistem otomatis membuka form digital untuk input nama dan nominal transaksi.',
  },
  {
    icon: Car,
    title: '3. Proses Selesai',
    description: 'Transaksi diproses secara real-time tanpa perlu turun dari kendaraan.',
  },
];

const stats = [
  { number: '10,000+', label: 'Transaksi Harian' },
  { number: '500+', label: 'Outlet Tersebar' },
  { number: '98.9%', label: 'Tingkat Kepuasan' },
  { number: '15 Detik', label: 'Rata-rata Waktu Transaksi' },
];

export default function HomePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Jika query berubah (misal user buka link /?tab=services), update tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [searchParams, activeTab]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1">
        {/* Overview Section */}
        {activeTab === 'overview' && (
          <section className="relative min-h-screen flex items-center justify-center text-center text-white px-4 overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-blue-900/90 to-gray-800/95 z-10" />
              <Image
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=2070&auto=format&fit=crop"
                alt="QR Tunai Drive-Thru modern banking"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            <div className="relative z-20 max-w-5xl mx-auto">
              <div className="mb-8">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                  QRTunai Drive Thru
                </h1>
                <div className="text-xl md:text-2xl font-medium text-blue-100 mb-4">
                  Layanan utama dari platform QRTunai
                </div>
              </div>
              
              <p className="text-lg md:text-xl max-w-4xl mx-auto mb-12 leading-relaxed text-gray-100">
                QRTunai adalah platform fintech inovatif yang menghadirkan berbagai layanan transaksi keuangan modern. Salah satu layanan utamanya adalah <b>QRTunai Drive Thru</b>, solusi transaksi perbankan drive-thru berbasis QR code yang aman, cepat, dan mudah digunakan.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 text-lg shadow-lg"
                  onClick={() => setActiveTab('services')}
                >
                  Pelajari Selengkapnya
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/10 font-semibold px-10 py-4 text-lg"
                  onClick={() => setActiveTab('partnership')}
                >
                  Hubungi Kami
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div className="text-2xl md:text-3xl font-bold text-blue-200 mb-2">{stat.number}</div>
                    <div className="text-sm md:text-base font-medium text-gray-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Services Section */}
        {activeTab === 'services' && (
          <section className="py-20 bg-gray-50 min-h-screen">
            <div className="container">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                  Layanan QRTunai Drive Thru
                </h2>
                <p className="text-xl text-gray-600">
                  Layanan utama QRTunai untuk kebutuhan transaksi perbankan drive-thru modern
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 bg-white">
                    <CardHeader className="pb-4">
                      <div className="mx-auto bg-blue-100 p-6 rounded-full w-fit mb-4">
                        <feature.icon className="h-10 w-10 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Partnership Section */}
        {activeTab === 'partnership' && (
          <section className="py-20 bg-white min-h-screen">
            <div className="container">
              <div className="text-center max-w-4xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                  Peluang Kemitraan QRTunai
                </h2>
                <p className="text-xl md:text-2xl leading-relaxed text-gray-600">
                  Bergabunglah menjadi mitra platform QRTunai dan kembangkan bisnis fintech Anda bersama layanan QRTunai Drive Thru serta dukungan teknologi dan sistem operasional yang telah terbukti.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {franchiseFeatures.map((feature, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                    <CardHeader>
                      <div className="mx-auto bg-blue-100 p-4 rounded-full w-fit mb-4">
                        <feature.icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <div className="bg-blue-50 border border-blue-200 text-blue-900 font-semibold text-lg md:text-xl p-6 rounded-xl max-w-2xl mx-auto mb-8">
                  Investasi Terjangkau dengan Return yang Menarik
                </div>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-5 text-xl">
                  Hubungi Tim Kemitraan
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* How It Works Section */}
        {activeTab === 'how-it-works' && (
          <section className="py-20 bg-gray-50 min-h-screen">
            <div className="container">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                  Cara Kerja QRTunai Drive Thru
                </h2>
                <p className="text-xl text-gray-600">
                  Proses transaksi sederhana dan efisien dengan layanan utama QRTunai
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {howItWorks.map((step, index) => (
                  <div key={step.title} className="relative">
                    <div className="mb-8 relative">
                      <div className="bg-blue-600 p-8 rounded-full mx-auto w-fit shadow-lg">
                        <step.icon className="h-12 w-12 text-white" />
                      </div>
                      {index < howItWorks.length - 1 && (
                        <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gray-300 -translate-y-1/2"></div>
                      )}
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                      <h3 className="text-2xl font-semibold mb-4 text-gray-900">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Advantages Section */}
        {activeTab === 'advantages' && (
          <section className="py-20 bg-white min-h-screen">
            <div className="container">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                  Mengapa Memilih QRTunai Drive Thru?
                </h2>
                <p className="text-xl text-gray-600">
                  Keunggulan layanan utama dari platform QRTunai untuk solusi drive-thru banking
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {whyChooseUs.map((feature, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                    <CardHeader>
                      <div className="mx-auto bg-blue-100 p-4 rounded-full w-fit mb-4">
                        <feature.icon className="h-8 w-8 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl font-semibold text-gray-900">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center bg-blue-600 text-white rounded-2xl p-12">
                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                  Siap Bergabung dengan Kami?
                </h3>
                <p className="text-lg max-w-3xl mx-auto mb-8 leading-relaxed">
                  Dapatkan informasi lengkap mengenai peluang kemitraan dan solusi drive-thru banking 
                  yang tepat untuk bisnis Anda
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg">
                    Hubungi Kami
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg">
                    Pelajari Lebih Lanjut
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <footer className="bg-gray-900 text-white">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4 text-white">
                QRTunai Drive Thru
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Layanan utama dari platform QRTunai: solusi drive-thru banking terdepan di Indonesia dengan teknologi QR code yang aman dan efisien. Melayani ribuan transaksi setiap hari dengan standar keamanan tingkat perbankan.
              </p>
              <div className="text-sm text-gray-400">
                📍 Kantor Pusat: Jakarta, Indonesia<br/>
                📞 Customer Service: 021-QRTUNAI<br/>
                ✉️ Email: info@qrtunaindrive.co.id
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Drive-Thru Banking</li>
                <li>QR Payment System</li>
                <li>Kemitraan Bisnis</li>
                <li>Dukungan Teknis</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-gray-300">
                <li>Pusat Bantuan</li>
                <li>Training & Workshop</li>
                <li>Konsultasi Bisnis</li>
                <li>Support 24/7</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} <span className="font-semibold text-white">QRTunai Drive Thru</span> - 
              Layanan utama platform QRTunai. All rights reserved. | 
              <Link href="/terms" className="underline hover:text-blue-400 transition-colors ml-2">
                Syarat & Ketentuan
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Diawasi oleh Otoritas Jasa Keuangan (OJK) • Member Asosiasi Fintech Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}