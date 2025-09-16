import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QrCode, LogIn } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <QrCode className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold tracking-tight text-gray-800">QR Tunai Drive</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="text-gray-600 hover:text-blue-600">
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
