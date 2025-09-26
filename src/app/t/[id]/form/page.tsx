'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

const TransactionForm = dynamic(() => import('@/components/transaction-form-enhanced'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  ),
});

export default function TransactionFormPage() {
  const params = useParams();
  const tokenId = params.id as string;

  // Mark token as accessed when form is loaded
  useEffect(() => {
    if (tokenId) {
      fetch(`/api/tokens/${tokenId}/access`, { method: 'POST' })
        .then(res => res.json())
        .then(data => console.log('Token marked as accessed:', data))
        .catch(err => console.error('Error marking token:', err));
    }
  }, [tokenId]);

  return (
    <div className="flex h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="w-full max-w-md mt-8 mb-8">
        <TransactionForm />
      </div>
    </div>
  );
}

