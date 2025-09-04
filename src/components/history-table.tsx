"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { transactionHistory as data, type Transaction } from "@/lib/data"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

const InvoiceDetails = ({ transaction }: { transaction: Transaction }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">ID Transaksi</p>
                <p className="font-mono">{transaction.id}</p>
            </div>
            <div className="space-y-1 text-right">
                <p className="text-sm text-muted-foreground">Tanggal</p>
                <p>{transaction.date.toLocaleString('id-ID')}</p>
            </div>
        </div>
        <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Jenis Transaksi:</span> <span>{transaction.type}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Bank:</span> <span>{transaction.bank}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">No. Rekening:</span> <span className="font-mono">{transaction.accountNumber}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Atas Nama:</span> <span>{transaction.customerName || '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Catatan:</span> <span>{transaction.notes || '-'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Kasir:</span> <span>{transaction.cashier}</span></div>
        </div>
        <div className="border-t pt-4 flex justify-between items-center font-bold text-xl">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(transaction.amount)}</span>
        </div>
    </div>
)

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "ID Transaksi",
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as Date
      return <div className="text-left">{date.toLocaleDateString('id-ID')}</div>
    },
  },
  {
    accessorKey: "type",
    header: "Jenis",
  },
   {
    accessorKey: "customerName",
    header: "Atas Nama",
  },
  {
    accessorKey: "accountNumber",
    header: "No. Rekening",
    cell: ({ row }) => <div className="font-mono">{row.getValue("accountNumber")}</div>
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Jumlah
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      return <div className="text-right font-medium">{formatCurrency(amount)}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variant = status === 'Completed' ? 'default' : status === 'Cancelled' ? 'destructive' : 'secondary';
        return <Badge variant={variant} className={status === 'Completed' ? 'bg-green-600' : ''}>{status}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
                <FileText className="h-4 w-4" />
                <span className="sr-only">Lihat Invoice</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Invoice: {transaction.id}</DialogTitle>
            </DialogHeader>
            <InvoiceDetails transaction={transaction} />
          </DialogContent>
        </Dialog>
      )
    },
  },
]

export function HistoryTable() {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "date", desc: true }])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter berdasarkan ID transaksi..."
          value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("id")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
