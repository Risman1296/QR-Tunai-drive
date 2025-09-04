import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const users = [
    { id: "USR001", name: "Admin Utama", username: "admin", role: "Admin", status: "Active" },
    { id: "USR002", name: "Kasir Pagi", username: "kasir01", role: "Cashier", status: "Active" },
    { id: "USR003", name: "Kasir Malam", username: "kasir02", role: "Cashier", status: "Inactive" },
]

const feeSettings = [
    { id: "FEE01", type: "Transfer Antar Bank", fee: "Rp 6.500", status: true },
    { id: "FEE02", type: "Tarik Tunai (Beda Bank)", fee: "Rp 7.500", status: true },
    { id: "FEE03", type: "Pembayaran QRIS (> 100rb)", fee: "0.7%", status: true },
    { id: "FEE04", type: "Biaya Layanan Drive-Thru", fee: "Rp 2.000", status: false },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengguna, tarif, dan konfigurasi outlet Anda.
        </p>
      </div>
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Manajemen Pengguna</TabsTrigger>
          <TabsTrigger value="fees">Pengaturan Tarif</TabsTrigger>
          <TabsTrigger value="outlet">Konfigurasi Outlet</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Pengguna Sistem</CardTitle>
              <CardDescription>
                Tambah, lihat, dan kelola akun yang dapat mengakses dasbor kasir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-end">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Pengguna
                    </Button>
                </div>
               <div className="rounded-md border">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Peran</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead><span className="sr-only">Aksi</span></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                            <Badge variant={user.status === "Active" ? "default" : "secondary"} className={user.status === 'Active' ? 'bg-green-600' : ''}>
                                {user.status}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
           <Card>
            <CardHeader>
              <CardTitle>Tarif Transaksi</CardTitle>
              <CardDescription>
                Atur biaya administrasi untuk setiap jenis transaksi yang relevan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Jenis Transaksi</TableHead>
                            <TableHead>Tarif</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {feeSettings.map((fee) => (
                        <TableRow key={fee.id}>
                            <TableCell className="font-medium">{fee.type}</TableCell>
                            <TableCell>{fee.fee}</TableCell>
                            <TableCell className="text-right">
                                <Switch defaultChecked={fee.status} />
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </div>
               <div className="flex justify-end">
                    <Button>Simpan Perubahan Tarif</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outlet">
          <Card>
            <CardHeader>
              <CardTitle>Konfigurasi Outlet</CardTitle>
              <CardDescription>
                Pengaturan teknis untuk integrasi dan operasional outlet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
                <div className="space-y-2">
                    <Label htmlFor="outletId">ID Outlet</Label>
                    <Input id="outletId" defaultValue="LC-PST" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="apiUrl">API Base URL</Label>
                    <Input id="apiUrl" defaultValue="https://api.qrtunaidrive.com/v1" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="adminToken">Token Admin</Label>
                    <Input id="adminToken" type="password" defaultValue="supersecrettoken" />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                    <Switch id="sound-notification" defaultChecked={true}/>
                    <Label htmlFor="sound-notification">Aktifkan Notifikasi Suara</Label>
                </div>
                <div className="flex justify-end pt-4">
                    <Button>Simpan Konfigurasi</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
