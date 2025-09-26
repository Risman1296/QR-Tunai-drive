"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Loader2, Plus, ServerCog, ShieldCheck, Trash2, Pencil } from "lucide-react"

interface BankIntegration {
  id: string
  bankName: string
  bankCode: string
  provider: "bca_snap_qris" | "bri_realtime" | "custom"
  description?: string
  isActive: boolean
  credentials: {
    baseUrl: string
    clientId?: string
    clientSecret?: string
    apiSecret?: string
    channelId?: string
    partnerId?: string
    qrisPath?: string
    tokenPath?: string
    balancePath?: string
    transactionsPath?: string
    additional?: Record<string, unknown>
  }
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

type IntegrationFormState = {
  bankName: string
  bankCode: string
  provider: "bca_snap_qris" | "bri_realtime" | "custom"
  baseUrl: string
  channelId: string
  qrisPath: string
  partnerId: string
  tokenPath: string
  balancePath: string
  transactionsPath: string
  clientId: string
  clientSecret: string
  apiSecret: string
  description: string
  isActive: boolean
}

const providerOptions: { value: IntegrationFormState["provider"]; label: string; helper: string }[] = [
  {
    value: "bca_snap_qris",
    label: "BCA SNAP QRIS",
    helper: "Gunakan untuk integrasi API SNAP QRIS milik BCA"
  },
  {
    value: "bri_realtime",
    label: "BRIAPI Realtime (Saldo & Mutasi)",
    helper: "Gunakan untuk integrasi BRIAPI Account Information Service"
  },
  {
    value: "custom",
    label: "Custom API",
    helper: "Konfigurasi manual untuk bank/penyedia lain"
  }
]

const defaultFormState: IntegrationFormState = {
  bankName: "",
  bankCode: "",
  provider: "bca_snap_qris",
  baseUrl: "https://",
  channelId: "",
  qrisPath: "/openapi/v1.0/qris-mpm",
  partnerId: "",
  tokenPath: "/oauth/client_credential/accesstoken",
  balancePath: "/v2/inquiry/{accountNumber}",
  transactionsPath: "/v2/accounts/{accountNumber}/transactions",
  clientId: "",
  clientSecret: "",
  apiSecret: "",
  description: "",
  isActive: true
}

export default function BankIntegrationManager() {
  const [integrations, setIntegrations] = useState<BankIntegration[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<BankIntegration | null>(null)
  const [form, setForm] = useState<IntegrationFormState>(defaultFormState)
  const [submitting, setSubmitting] = useState(false)

  const hasIntegrations = useMemo(() => integrations.length > 0, [integrations])

  useEffect(() => {
    refreshIntegrations()
  }, [])

  function resetForm() {
    setForm(defaultFormState)
    setEditingIntegration(null)
  }

  async function refreshIntegrations() {
    try {
      setLoading(true)
      const res = await fetch("/api/payment-config", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Gagal mengambil konfigurasi pembayaran")
      setIntegrations(json?.data?.bankIntegrations ?? [])
    } catch (error: any) {
      console.error("[BankIntegrationManager] refresh error", error)
      toast({
        variant: "destructive",
        title: "Gagal memuat integrasi",
        description: error?.message ?? "Terjadi kesalahan tak terduga"
      })
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    resetForm()
    setDialogOpen(true)
  }

  function openEditDialog(integration: BankIntegration) {
    setEditingIntegration(integration)
    setForm({
      bankName: integration.bankName,
      bankCode: integration.bankCode,
      provider: integration.provider,
      baseUrl: integration.credentials.baseUrl ?? "https://",
      channelId: integration.credentials.channelId ?? "",
      qrisPath: integration.credentials.qrisPath ?? "",
      partnerId: integration.credentials.partnerId ?? "",
      tokenPath: integration.credentials.tokenPath ?? "/oauth/client_credential/accesstoken",
      balancePath: integration.credentials.balancePath ?? "/v2/accounts/{accountNumber}/balance",
      transactionsPath: integration.credentials.transactionsPath ?? "/v2/accounts/{accountNumber}/transactions",
      clientId: integration.credentials.clientId ?? "",
      clientSecret: integration.credentials.clientSecret ?? "",
      apiSecret: integration.credentials.apiSecret ?? "",
      description: integration.description ?? "",
      isActive: integration.isActive,
    })
    setDialogOpen(true)
  }

  function updateFormField<K extends keyof IntegrationFormState>(key: K, value: IntegrationFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    try {
      setSubmitting(true)
      const payload = {
        bankName: form.bankName,
        bankCode: form.bankCode,
        provider: form.provider,
        description: form.description,
        isActive: form.isActive,
        credentials: {
          baseUrl: form.baseUrl,
          channelId: form.channelId || undefined,
          qrisPath: form.qrisPath || undefined,
          partnerId: form.partnerId || undefined,
          tokenPath: form.tokenPath || undefined,
          balancePath: form.balancePath || undefined,
          transactionsPath: form.transactionsPath || undefined,
          clientId: form.clientId,
          clientSecret: form.clientSecret,
          apiSecret: form.apiSecret,
        },
      }

      const endpoint = "/api/payment-config/integrations"
      let res: Response
      if (editingIntegration) {
        res = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", id: editingIntegration.id, ...payload })
        })
      } else {
        res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      }

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Permintaan gagal")

      toast({
        title: "Berhasil",
        description: editingIntegration ? "Integrasi bank diperbarui" : "Integrasi bank ditambahkan"
      })

      setDialogOpen(false)
      resetForm()
      refreshIntegrations()
    } catch (error: any) {
      console.error("[BankIntegrationManager] submit error", error)
      toast({
        variant: "destructive",
        title: "Gagal menyimpan integrasi",
        description: error?.message ?? "Terjadi kesalahan tak terduga"
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggle(integration: BankIntegration, nextState: boolean) {
    try {
      const res = await fetch("/api/payment-config/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id: integration.id, isActive: nextState })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Gagal memperbarui status")
      toast({
        title: "Status diperbarui",
        description: `Integrasi ${integration.bankName} ${nextState ? "aktif" : "nonaktif"}`
      })
      refreshIntegrations()
    } catch (error: any) {
      console.error("[BankIntegrationManager] toggle error", error)
      toast({
        variant: "destructive",
        title: "Gagal memperbarui status",
        description: error?.message ?? "Terjadi kesalahan"
      })
    }
  }

  async function handleDelete(integration: BankIntegration) {
    try {
      const res = await fetch("/api/payment-config/integrations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: integration.id })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Gagal menghapus integrasi")
      toast({ title: "Integrasi dihapus", description: integration.bankName })
      refreshIntegrations()
    } catch (error: any) {
      console.error("[BankIntegrationManager] delete error", error)
      toast({
        variant: "destructive",
        title: "Gagal menghapus integrasi",
        description: error?.message ?? "Terjadi kesalahan"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ServerCog className="h-5 w-5" />
              Integrasi Bank Realtime
            </CardTitle>
            <CardDescription>
              Kelola kredensial API untuk permintaan saldo realtime dan QRIS.
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Integrasi Baru
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memuat integrasi...
          </div>
        ) : hasIntegrations ? (
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-primary">{integration.bankName}</p>
                    <Badge variant="outline">{integration.bankCode}</Badge>
                    <Badge variant={integration.isActive ? "default" : "secondary"}>
                      {integration.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{integration.credentials.baseUrl}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>Penyedia: {integration.provider === "bca_snap_qris"
                      ? "BCA SNAP QRIS"
                      : integration.provider === "bri_realtime"
                        ? "BRIAPI Realtime"
                        : "Custom API"}</span>
                    {integration.provider === "bca_snap_qris" && integration.credentials.channelId && (
                      <span>Channel ID: {integration.credentials.channelId}</span>
                    )}
                    {integration.provider === "bca_snap_qris" && integration.credentials.qrisPath && (
                      <span>Path: {integration.credentials.qrisPath}</span>
                    )}
                    {integration.provider === "bri_realtime" && integration.credentials.partnerId && (
                      <span>Partner ID: {integration.credentials.partnerId}</span>
                    )}
                    {integration.provider === "bri_realtime" && integration.credentials.balancePath && (
                      <span>Balance Path: {integration.credentials.balancePath}</span>
                    )}
                    {integration.provider === "bri_realtime" && integration.credentials.transactionsPath && (
                      <span>Transactions Path: {integration.credentials.transactionsPath}</span>
                    )}
                  </div>
                  {integration.description && (
                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={integration.isActive}
                    onCheckedChange={(value) => handleToggle(integration, value)}
                  />
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(integration)}>
                    <Pencil className="mr-2 h-4 w-4" /> Ubah
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(integration)}>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            <ShieldCheck className="mx-auto mb-3 h-8 w-8 opacity-60" />
            Belum ada integrasi bank yang dikonfigurasi.
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingIntegration ? "Ubah Integrasi" : "Integrasi Bank Baru"}</DialogTitle>
            <DialogDescription>
              Masukkan kredensial API sesuai panduan bank. Kredensial tersimpan secara aman di server.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nama Bank</Label>
              <Input
                value={form.bankName}
                onChange={(e) => updateFormField("bankName", e.target.value)}
                placeholder="Bank Central Asia"
              />
            </div>
            <div className="space-y-2">
              <Label>Kode Bank</Label>
              <Input
                value={form.bankCode}
                onChange={(e) => updateFormField("bankCode", e.target.value.toUpperCase())}
                placeholder="014"
              />
            </div>
            <div className="space-y-2">
              <Label>Penyedia Integrasi</Label>
              <Select value={form.provider} onValueChange={(value) => updateFormField("provider", value as IntegrationFormState["provider"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih penyedia" />
                </SelectTrigger>
                <SelectContent>
                  {providerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {providerOptions.find((opt) => opt.value === form.provider)?.helper}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Status Integrasi</Label>
              <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                <Switch checked={form.isActive} onCheckedChange={(value) => updateFormField("isActive", value)} />
                <span className="text-sm text-muted-foreground">{form.isActive ? "Aktif" : "Nonaktif"}</span>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Base URL API</Label>
              <Input
                value={form.baseUrl}
                onChange={(e) => updateFormField("baseUrl", e.target.value)}
                placeholder="https://sandbox.bca.co.id"
              />
            </div>
            {form.provider === "bca_snap_qris" && (
              <>
                <div className="space-y-2">
                  <Label>Channel ID</Label>
                  <Input
                    value={form.channelId}
                    onChange={(e) => updateFormField("channelId", e.target.value)}
                    placeholder="95051"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Path QRIS</Label>
                  <Input
                    value={form.qrisPath}
                    onChange={(e) => updateFormField("qrisPath", e.target.value)}
                    placeholder="/openapi/v1.0/qris-mpm"
                  />
                </div>
              </>
            )}
            {form.provider === "bri_realtime" && (
              <>
                <div className="space-y-2">
                  <Label>Partner ID</Label>
                  <Input
                    value={form.partnerId}
                    onChange={(e) => updateFormField("partnerId", e.target.value)}
                    placeholder="BRIAPI Partner ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Token Path</Label>
                  <Input
                    value={form.tokenPath}
                    onChange={(e) => updateFormField("tokenPath", e.target.value)}
                    placeholder="/oauth/client_credential/accesstoken"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Balance Path</Label>
                  <Input
                    value={form.balancePath}
                    onChange={(e) => updateFormField("balancePath", e.target.value)}
                    placeholder="/v2/accounts/{accountNumber}/balance"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transactions Path</Label>
                  <Input
                    value={form.transactionsPath}
                    onChange={(e) => updateFormField("transactionsPath", e.target.value)}
                    placeholder="/v2/accounts/{accountNumber}/transactions"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Client ID</Label>
              <Input
                value={form.clientId}
                onChange={(e) => updateFormField("clientId", e.target.value)}
                placeholder="cff7cb29-...."
              />
            </div>
            <div className="space-y-2">
              <Label>Client Secret</Label>
              <Input
                type="password"
                value={form.clientSecret}
                onChange={(e) => updateFormField("clientSecret", e.target.value)}
                placeholder="••••••"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>API Secret / Signature Key</Label>
              <Input
                type="password"
                value={form.apiSecret}
                onChange={(e) => updateFormField("apiSecret", e.target.value)}
                placeholder="••••••"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Catatan (opsional)</Label>
              <Textarea
                value={form.description}
                onChange={(e) => updateFormField("description", e.target.value)}
                placeholder="Contoh: gunakan kredensial akun produksi setelah proses UAT"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan Integrasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
