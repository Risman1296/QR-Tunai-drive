import { HistoryTable } from "@/components/history-table"

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Riwayat Transaksi</h1>
        <p className="text-muted-foreground">
          Lihat dan kelola semua transaksi yang telah selesai atau dibatalkan.
        </p>
      </div>
      <HistoryTable />
    </div>
  )
}
