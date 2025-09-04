import { Header } from '@/components/header';
import { ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
                <ShieldCheck className="mx-auto h-16 w-16 text-primary mb-4" />
                <h1 className="text-3xl md:text-4xl font-bold">Syarat dan Ketentuan</h1>
                <p className="mt-4 text-muted-foreground">
                    Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
            
            <div className="space-y-6 text-muted-foreground">
              <h2 className="text-xl font-semibold text-foreground">1. Penerimaan Ketentuan</h2>
              <p>
                Dengan menggunakan layanan QR Tunai Drive ("Layanan"), Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Layanan ini disediakan oleh PT QR Tunai Sejahtera. Jika Anda tidak menyetujui ketentuan ini, Anda tidak boleh menggunakan layanan kami.
              </p>

              <h2 className="text-xl font-semibold text-foreground">2. Deskripsi Layanan</h2>
              <p>
                Layanan ini memungkinkan Anda untuk melakukan transaksi keuangan seperti tarik tunai, setor tunai, transfer, dan pembayaran melalui sistem drive-thru dengan mengisi formulir digital terlebih dahulu melalui QR code. Tujuannya adalah untuk mempercepat dan mempermudah proses transaksi di loket fisik kami.
              </p>

              <h2 className="text-xl font-semibold text-foreground">3. Keamanan dan Tanggung Jawab Pelanggan</h2>
              <p>
                Kami menggunakan langkah-langkah keamanan standar untuk melindungi informasi yang Anda kirimkan melalui formulir digital. Namun, keamanan transaksi sepenuhnya bergantung pada keakuratan data yang Anda masukkan.
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Anda bertanggung jawab penuh atas kebenaran dan keakuratan semua informasi yang Anda masukkan, termasuk nomor rekening, nama, dan jumlah transaksi.</li>
                <li>QR Tunai Drive tidak bertanggung jawab atas kerugian yang timbul akibat kesalahan penulisan atau kelalaian dari pihak Anda.</li>
                <li>Pastikan Anda selalu berada di lokasi outlet resmi kami saat memindai QR code untuk menghindari upaya penipuan (phishing).</li>
              </ul>

              <h2 className="text-xl font-semibold text-foreground">4. Privasi Data</h2>
              <p>
                Kami menghargai privasi Anda. Data yang Anda masukkan ke dalam formulir hanya akan digunakan untuk keperluan transaksi yang sedang berlangsung dan akan dicatat dalam riwayat transaksi kami untuk keperluan audit dan layanan pelanggan. Kami tidak akan membagikan data pribadi Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali diwajibkan oleh hukum.
              </p>

               <h2 className="text-xl font-semibold text-foreground">5. Batasan Tanggung Jawab</h2>
              <p>
                Layanan ini disediakan "sebagaimana adanya". QR Tunai Drive tidak menjamin bahwa layanan akan selalu bebas dari gangguan atau kesalahan. Tanggung jawab kami terbatas pada penyelesaian transaksi sesuai dengan data yang Anda berikan.
              </p>

              <h2 className="text-xl font-semibold text-foreground">6. Perubahan Ketentuan</h2>
              <p>
                Kami dapat mengubah Syarat dan Ketentuan ini dari waktu ke waktu. Perubahan akan diinformasikan melalui pembaruan di halaman ini. Dengan terus menggunakan layanan setelah perubahan, Anda dianggap menyetujui ketentuan yang baru.
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-card border-t">
        <div className="container py-6 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} QR Tunai Drive. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
