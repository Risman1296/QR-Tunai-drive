'use client';

import TransactionForm from '@/components/transaction-form-fixed';

export default function TransactionFormPage() {
  return (
    <div className="flex h-screen items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mt-8 mb-8">{/* Tambah margin atas & bawah agar header tidak mentok */}
        <TransactionForm />
      </div>
    </div>
  );
}

