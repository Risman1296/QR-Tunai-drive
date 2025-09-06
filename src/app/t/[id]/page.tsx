'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This component has two purposes:
// 1. Notify the server that the QR code has been scanned.
// 2. Immediately redirect the user to the actual transaction form.

export default function TransactionRedirector() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (id) {
      // 1. Notify the server that this QR code is now considered 'scanned'.
      // We use sendBeacon for a reliable, non-blocking request that doesn't 
      // need to wait for a response. This is perfect for analytics or events.
      navigator.sendBeacon(`/api/t/${id}/notify-view`);

      // 2. Redirect the user to the form page where they will input details.
      // The redirection happens immediately after the beacon is sent.
      router.replace(`/t/${id}/form`);
    }
  }, [id, router]);

  // Render a loading state while the redirect is in progress.
  // This provides immediate feedback to the user.
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Mempersiapkan halaman...</p>
    </div>
  );
}
