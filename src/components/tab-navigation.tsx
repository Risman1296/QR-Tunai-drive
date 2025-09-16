'use client';

import { useState } from 'react';
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
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="container">
        <div className="flex space-x-1 py-4 overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}