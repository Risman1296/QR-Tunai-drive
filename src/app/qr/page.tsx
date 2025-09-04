import Link from 'next/link';
import { QrCode, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateQrCode } from '@/ai/flows/qr-code-flow';
import Image from 'next/image';

async function getQrCode(url: string) {
  try {
    const response = await generateQrCode({ url });
    return response.qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    // Return a placeholder or null to handle the error gracefully
    return null;
  }
}

export default async function QrPage() {
  // Construct the full URL for the transaction page
  // In a real production app, you might get the base URL from environment variables
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const transactionUrl = `${baseUrl}/transaction`;

  const qrCodeDataUrl = await getQrCode(transactionUrl);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="absolute top-4 left-4">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2" />
              Kembali
            </Link>
          </Button>
        </div>
      <div className="text-center mb-8 max-w-lg">
        <QrCode className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold">Pindai Untuk Memulai Transaksi</h1>
        <p className="text-lg text-muted-foreground mt-3">
          Arahkan kamera ponsel Anda ke QR code di bawah ini untuk mengisi formulir transaksi secara digital sebelum tiba di loket.
        </p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-2xl ring-4 ring-offset-4 ring-primary ring-offset-background">
        <Link href="/transaction" aria-label="Mulai Transaksi">
          <div className="w-64 h-64 md:w-80 md:h-80 text-gray-900">
            {qrCodeDataUrl ? (
              <Image 
                src={qrCodeDataUrl}
                alt="Dynamic QR Code for transaction"
                width={320}
                height={320}
                className="rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-sm text-muted-foreground">QR Code tidak tersedia.</p>
              </div>
            )}
          </div>
        </Link>
      </div>
      <p className="mt-8 text-sm text-muted-foreground animate-pulse">
        QR code ini akan mengarahkan Anda ke formulir transaksi.
      </p>
    </div>
  );
}
