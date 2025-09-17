// Temporary content
'use client';

import { Suspense, useState } from 'react';
import { Header } from '@/components/header';
import { TabNavigation } from '@/components/tab-navigation';

function TabContent() {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">
        {/* Content will be added back */}
        <div>Content loading...</div>
      </main>
    </div>
  );
}

export function HomePageContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TabContent />
    </Suspense>
  );
}