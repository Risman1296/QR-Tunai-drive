import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QrCode, LogIn } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative">
            <QrCode className="h-8 w-8 text-qr-blue-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-qr-yellow-500 rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-qr-blue-700">
              QR<span className="text-qr-yellow-600">Tunai</span>
            </span>
            <span className="text-xs text-qr-blue-400 -mt-1">Digital Payment</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            asChild 
            className="text-qr-blue-600 hover:text-qr-blue-700 hover:bg-qr-yellow-50"
          >
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
