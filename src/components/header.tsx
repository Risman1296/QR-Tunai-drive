import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QrCode, LogIn } from 'lucide-react';

export function Header() {
  return (
    <header className="header-gradient-fade sticky top-0 z-[60] w-full bg-transparent text-white">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8 relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <QrCode className="h-6 w-6 text-qr-yellow-400" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-qr-yellow-400" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold tracking-tight">
              QR<span className="text-qr-yellow-400">Tunai</span>
            </span>
            <span className="-mt-0.5 text-[11px] uppercase tracking-wide text-white/70">Fintech Enabler</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild className="rounded-xl bg-qr-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-qr-blue-500">
            <Link href="/login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
