import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QrCode, LogIn } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <QrCode className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight">QR Tunai Drive</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/qr">Lihat QR</Link>
          </Button>
          <Button asChild>
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
