"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type TokenAuth = "basic" | "form"
type SignatureFormat = "colon" | "payload"
type HeadersStyle = "x" | "bri"
type SignatureEncoding = "base64" | "hex"

export default function BriTestPage() {
  const [form, setForm] = useState({
    baseUrl: "https://partner.api.bri.co.id",
    clientId: "",
    clientSecret: "",
    apiSecret: "",
    partnerId: "",
    accountNumber: "",
    tokenPath: "/oauth/client_credential/accesstoken",
    balancePath: "/v2/inquiry/{accountNumber}",
    tokenAuth: "form" as TokenAuth,
    signatureFormat: "payload" as SignatureFormat,
    headersStyle: "bri" as HeadersStyle,
    signatureEncoding: "hex" as SignatureEncoding,
    timestampSkewSeconds: 0,
  })
  const [environment, setEnvironment] = useState<"sandbox" | "production">("production")
  const [preset, setPreset] = useState<"standard" | "bri_alt">("bri_alt")
  const [linkSecret, setLinkSecret] = useState<boolean>(true)
  const [linkPartner, setLinkPartner] = useState<boolean>(true)
  const [usedSandboxSample, setUsedSandboxSample] = useState<boolean>(false)
  const [prefilling, setPrefilling] = useState<boolean>(false)
  const [prefillNote, setPrefillNote] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [sigError, setSigError] = useState<string>("")
  const [sigResult, setSigResult] = useState<{
    signature: string
    stringToSign: string
    timestamp: string
    canonicalPath: string
    signatureFormat: string
    headersStyle: string
  } | null>(null)

  async function handleTest() {
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch("/api/bri/test-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || `Permintaan gagal (${res.status})`)
      } else {
        setResult(json)
      }
    } catch (e: any) {
      setError(e?.message || "Terjadi kesalahan saat menguji konfigurasi")
    } finally {
      setLoading(false)
    }
  }

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key === "clientSecret" && linkSecret) {
      setForm((prev) => ({ ...prev, apiSecret: String(value) }))
    }
    if (key === "clientId" && linkPartner && (!form.partnerId || form.partnerId === "")) {
      setForm((prev) => ({ ...prev, partnerId: String(value) }))
    }
  }

  function applyEnvironment(next: "sandbox" | "production") {
    setEnvironment(next)
    const base = next === "sandbox" ? "https://sandbox.partner.api.bri.co.id" : "https://partner.api.bri.co.id"
    update("baseUrl", base)
  }

  function applyPreset(next: "standard" | "bri_alt") {
    setPreset(next)
    if (next === "standard") {
      update("tokenAuth", "basic")
      update("signatureFormat", "colon")
      update("headersStyle", "x")
      update("signatureEncoding", "base64")
      update("balancePath", "/v2/accounts/{accountNumber}/balance")
    } else {
      update("tokenAuth", "form")
      update("signatureFormat", "payload")
      update("headersStyle", "bri")
      update("signatureEncoding", "hex")
      update("balancePath", "/v2/inquiry/{accountNumber}")
    }
  }

  function useSandboxSample() {
    // Example from default config (without dashes)
    const sample = "006801001234560"
    update("accountNumber", sample)
    if (environment !== "sandbox") applyEnvironment("sandbox")
    setUsedSandboxSample(true)
  }

  function prefillProductionOneClick() {
    applyEnvironment("production")
    applyPreset("bri_alt")
    update("tokenPath", "/oauth/client_credential/accesstoken")
    update("balancePath", "/v2/inquiry/{accountNumber}")
    setPrefillNote("Preset produksi BRI telah diisi. Lengkapi Client ID/Secret dan Account Number.")
  }

  async function prefillFromIntegration() {
    try {
      setPrefilling(true)
      setPrefillNote("")
      const res = await fetch("/api/payment-config", { cache: "no-store" })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Gagal mengambil konfigurasi")

      const integrations = json?.data?.bankIntegrations || []
      const bri = integrations.find((x: any) => x?.provider === "bri_realtime" || x?.id === "bri-realtime")
      if (!bri) throw new Error("Integrasi BRI tidak ditemukan")

      // credentials
      const cred = bri.credentials || {}
      if (cred.baseUrl) update("baseUrl", String(cred.baseUrl))
      if (cred.tokenPath) update("tokenPath", String(cred.tokenPath))
      if (cred.balancePath) update("balancePath", String(cred.balancePath))
      if (cred.clientId) update("clientId", String(cred.clientId))
      if (cred.clientSecret) update("clientSecret", String(cred.clientSecret))
      if (cred.apiSecret) update("apiSecret", String(cred.apiSecret))
      if (cred.partnerId) update("partnerId", String(cred.partnerId))

      // metadata presets
      const meta = bri.metadata || {}
      if (meta.tokenAuth) update("tokenAuth", meta.tokenAuth as TokenAuth)
      if (meta.signatureFormat) update("signatureFormat", meta.signatureFormat as SignatureFormat)
      if (meta.headersStyle) update("headersStyle", meta.headersStyle as HeadersStyle)
      if (meta.signatureEncoding) update("signatureEncoding", meta.signatureEncoding as SignatureEncoding)

      // accountNumber: cari bank account BRI
      const accounts = json?.data?.bankAccounts || []
      const acc = accounts.find((a: any) => a?.bankCode === "002" || a?.integrationId === bri.id)
      if (acc?.accountNumber) update("accountNumber", String(acc.accountNumber))

      setPrefillNote("Berhasil memuat kredensial dari integrasi BRI. Silakan cek dan lengkapi jika ada yang kosong.")
    } catch (e: any) {
      setPrefillNote(e?.message || "Gagal memuat dari integrasi")
    } finally {
      setPrefilling(false)
    }
  }

  function generateRandomKey() {
    try {
      const bytes = new Uint8Array(32)
      crypto.getRandomValues(bytes)
      let bin = ""
      bytes.forEach((b) => (bin += String.fromCharCode(b)))
      const base64 = btoa(bin)
      update("apiSecret", base64)
    } catch {
      // fallback simple random
      update("apiSecret", Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2))
    }
  }

  async function handleGenerateSignature() {
    setSigError("")
    setSigResult(null)
    try {
      const res = await fetch("/api/bri/signature-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSigError(json?.error || `Gagal generate signature (${res.status})`)
        return
      }
      const r = json?.result
      setSigResult({
        signature: r?.signature,
        stringToSign: r?.stringToSign,
        timestamp: r?.timestamp,
        canonicalPath: r?.canonicalPath,
        signatureFormat: r?.signatureFormat,
        headersStyle: r?.headersStyle,
      })
    } catch (e: any) {
      setSigError(e?.message || "Gagal generate signature")
    }
  }

  const parsedBalance = (() => {
    const data = result?.data
    if (!data) return undefined
    return (
      data?.balance ||
      data?.availableBalance ||
      data?.data?.balance ||
      data?.data?.availableBalance
    )
  })()

  const resolvedPath = (() => {
    const tpl = form.balancePath || ""
    const acc = form.accountNumber ? encodeURIComponent(form.accountNumber) : "{accountNumber}"
    const p = tpl.replace("{accountNumber}", acc)
    return p.startsWith("/") ? p : "/" + p
  })()
  const finalUrlPreview = (() => {
    try {
      const base = form.baseUrl.replace(/\/$/, "")
      return new URL(resolvedPath, base).toString()
    } catch {
      return ""
    }
  })()
  const dupInquiry = /\/v2\/inquiry(\/|$)/.test(form.baseUrl) && /^\/?v2\/inquiry(\/|$)/.test(form.balancePath)

  function applyFixDuplicateInquiry() {
    // force host-only base and correct path
    const hostOnly = /https?:\/\/[^\/]+/i.exec(form.baseUrl)?.[0] || "https://partner.api.bri.co.id"
    update("baseUrl", hostOnly)
    update("balancePath", "/v2/inquiry/{accountNumber}")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tes Konfigurasi BRI</h1>
        <p className="text-muted-foreground">Masukkan kredensial BRIAPI dan uji pengambilan saldo.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kredensial & Endpoint</CardTitle>
          <CardDescription>Gunakan sandbox atau produksi sesuai kebutuhan.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 flex gap-2">
            <Button type="button" variant="outline" onClick={prefillProductionOneClick}>Isi Otomatis (BRI Production)</Button>
            <Button type="button" onClick={prefillFromIntegration} disabled={prefilling}>{prefilling ? "Memuat..." : "Ambil dari Integrasi (bri-realtime)"}</Button>
            {prefillNote && <span className="text-xs text-muted-foreground">{prefillNote}</span>}
          </div>
          <div className="space-y-2">
            <Label>Environment</Label>
            <Select value={environment} onValueChange={(v) => applyEnvironment(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preset</Label>
            <Select value={preset} onValueChange={(v) => applyPreset(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Default (X-* + colon, Basic)</SelectItem>
                <SelectItem value="bri_alt">BRI-style (BRI-* + payload, Form)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input value={form.baseUrl} onChange={(e) => update("baseUrl", e.target.value)} placeholder="https://sandbox.partner.api.bri.co.id" />
            {/https?:\/\/(developers?\.)?bri\.co\.id/i.test(form.baseUrl) && !/https?:\/\/(sandbox\.)?partner\.api\.bri\.co\.id/i.test(form.baseUrl) && (
              <p className="text-xs text-red-600">Peringatan: URL portal developer terdeteksi. Gunakan host API: https://sandbox.partner.api.bri.co.id (sandbox) atau https://partner.api.bri.co.id (production).</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Partner ID</Label>
            <Input value={form.partnerId} onChange={(e) => { setLinkPartner(false); update("partnerId", e.target.value) }} placeholder="Opsional (default: Client ID)" />
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <input id="linkPartner" type="checkbox" checked={linkPartner} onChange={(e) => setLinkPartner(e.target.checked)} />
              <label htmlFor="linkPartner">Partner ID sama dengan Client ID</label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Client ID</Label>
            <Input value={form.clientId} onChange={(e) => update("clientId", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Client Secret</Label>
            <Input type="password" value={form.clientSecret} onChange={(e) => update("clientSecret", e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>API Secret / Signature Key</Label>
            <div className="flex gap-2">
              <Input type="password" value={form.apiSecret} onChange={(e) => { setLinkSecret(false); update("apiSecret", e.target.value) }} />
              <Button type="button" variant="outline" onClick={generateRandomKey}>Generate Random Key (Dummy)</Button>
              <Button type="button" onClick={handleGenerateSignature}>Generate Signature</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Catatan: API Secret/Signature Key dikeluarkan oleh BRIAPI. Tombol "Generate Random Key" hanya untuk simulasi lokal; tidak berlaku untuk API BRI sebenarnya. Jika portal Anda tidak menyediakan Signature Key terpisah, coba gunakan Consumer Secret sebagai API Secret.
            </p>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <input id="linkSecret" type="checkbox" checked={linkSecret} onChange={(e) => setLinkSecret(e.target.checked)} />
              <label htmlFor="linkSecret">Gunakan Client Secret sebagai API Secret (auto-sync)</label>
            </div>
            {sigError && <div className="text-xs text-red-600">{sigError}</div>}
            {sigResult && (
              <div className="mt-2 space-y-2">
                <div className="text-sm">
                  <span className="font-semibold">Preview Signature</span> ({sigResult.headersStyle}, {sigResult.signatureFormat})
                </div>
                <Textarea readOnly className="font-mono text-xs h-40" value={JSON.stringify(sigResult, null, 2)} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Token Path</Label>
            <Input value={form.tokenPath} onChange={(e) => update("tokenPath", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Balance Path</Label>
            <Input value={form.balancePath} onChange={(e) => update("balancePath", e.target.value)} />
            {dupInquiry && (
              <div className="text-xs text-red-600">
                Duplikasi segmen "/v2/inquiry" terdeteksi pada Base URL dan Path. Gunakan salah satu pola berikut:
                <div>- Base URL: https://partner.api.bri.co.id & Path: /v2/inquiry/{"{accountNumber}"}</div>
                <div>- Base URL: https://partner.api.bri.co.id/v2/inquiry & Path: /{"{accountNumber}"}</div>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={applyFixDuplicateInquiry}>Terapkan Perbaikan</Button>
              </div>
            )}
            {finalUrlPreview && (
              <p className="text-xs text-muted-foreground">Composed URL: <span className="font-mono break-all">{finalUrlPreview}</span></p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Token Auth</Label>
            <Select value={form.tokenAuth} onValueChange={(v) => update("tokenAuth", v as TokenAuth)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (Authorization header)</SelectItem>
                <SelectItem value="form">Form (client_id + client_secret)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Signature Format</Label>
            <Select value={form.signatureFormat} onValueChange={(v) => update("signatureFormat", v as SignatureFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="colon">Colon (METHOD:PATH:...)</SelectItem>
                <SelectItem value="payload">Payload (path=...&verb=...)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Signature Encoding</Label>
            <Select value={form.signatureEncoding} onValueChange={(v) => update("signatureEncoding", v as SignatureEncoding)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base64">Base64</SelectItem>
                <SelectItem value="hex">Hex (64 chars)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Headers Style</Label>
            <Select value={form.headersStyle} onValueChange={(v) => update("headersStyle", v as HeadersStyle)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="x">X-* (X-Timestamp, X-Signature)</SelectItem>
                <SelectItem value="bri">BRI-* (BRI-Timestamp, BRI-Signature)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Timestamp Skew (detik)</Label>
            <Input type="number" value={form.timestampSkewSeconds} onChange={(e) => update("timestampSkewSeconds", Number(e.target.value || 0))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nomor Rekening</CardTitle>
          <CardDescription>Masukkan rekening yang ingin dicek saldonya.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 max-w-md">
            <Label>Account Number</Label>
            <Input value={form.accountNumber} onChange={(e) => update("accountNumber", e.target.value)} placeholder="00680100xxxxxxxxx" />
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={useSandboxSample}>Use Sandbox Sample</Button>
              {usedSandboxSample && <span className="text-xs text-muted-foreground">Sample diisi: 006801001234560 (contoh)</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleTest} disabled={loading}>
              {loading ? "Mengirim..." : "Tes Ambil Saldo"}
            </Button>
          </div>
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          {result && (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-semibold">Hasil:</span>{" "}
                {parsedBalance !== undefined ? (
                  <span>Saldo terdeteksi: <span className="font-mono">{String(parsedBalance)}</span></span>
                ) : (
                  <span>Saldo tidak terdeteksi otomatis, lihat payload di bawah.</span>
                )}
              </div>
              <Textarea readOnly className="font-mono text-xs h-72" value={JSON.stringify(result, null, 2)} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
