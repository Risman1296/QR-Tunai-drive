
'use client';

import { Suspense } from 'react';
import Link from "next/link"
import { TransactionForm } from "@/components/transaction-form"
import { QrCode } from "lucide-react"

function TransactionPageContents() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <QrCode className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold tracking-tight">QR Tunai Drive</span>
        </Link>
        <Suspense fallback={<div className="w-full max-w-md text-center"><p>Memuat formulir...</p></div>}>
          <TransactionForm />
        </Suspense>
    </div>
  )
}

export default function TransactionPage() {
  return (
    <TransactionPageContents />
  )
}
