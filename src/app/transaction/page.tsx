
'use client';

import { Suspense } from 'react';
import Link from "next/link"
import TransactionForm from "@/components/transaction-form"
import { QrCode } from "lucide-react"

function TransactionPageContents() {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-background flex flex-col">
      {/* Header - Fixed spacing for mobile */}
      <div className="flex-shrink-0 pt-safe-top pt-4 pb-4 px-4">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <QrCode className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            <span className="text-xl sm:text-2xl font-bold tracking-tight">QR Tunai Drive</span>
          </Link>
        </div>
      </div>
      
      {/* Main Content - Scrollable */}
      <div className="flex-1 flex items-start justify-center px-4 pb-safe-bottom pb-4 overflow-y-auto">
        <div className="w-full max-w-md">
          <Suspense fallback={
            <div className="w-full text-center p-8">
              <p className="text-gray-600">Memuat formulir...</p>
            </div>
          }>
            <TransactionForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default function TransactionPage() {
  return (
    <TransactionPageContents />
  )
}
