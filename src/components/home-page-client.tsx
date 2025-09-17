'use client';

import { useState } from 'react';
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

export function HomePageClient() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mounted, setMounted] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1">
        {/* Your existing content here */}
      </main>
    </div>
  );
}