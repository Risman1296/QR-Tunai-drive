'use client';

import { Button } from '@/components/ui/button';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'overview', label: 'Pengenalan' },
    { id: 'services', label: 'Layanan' },
    { id: 'partnership', label: 'Kemitraan' },
    { id: 'how-it-works', label: 'Cara Kerja' },
    { id: 'advantages', label: 'Keunggulan' },
  ];

  return (
    <div className="sticky top-16 z-50 bg-transparent">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 py-3 overflow-x-auto md:overflow-visible">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-white' : 'text-white/70 hover:text-white'}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
