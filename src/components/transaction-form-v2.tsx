"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { FormattedInput } from "@/components/ui/formatted-input";
import { Notification } from "@/components/notification";
import Link from "next/link";
import { useState, Suspense } from "react";
import { Loader2 } from "lucide-react";

const bankOptions = [
	{ value: "Bank Central Asia", label: "Bank Central Asia (BCA)" },
	{ value: "Bank Mandiri", label: "Bank Mandiri" },
	{ value: "Bank Rakyat Indonesia", label: "Bank Rakyat Indonesia (BRI)" },
	{ value: "Bank Syariah Indonesia", label: "Bank Syariah Indonesia (BSI)" },
	{ value: "Bank Negara Indonesia", label: "Bank Negara Indonesia (BNI)" },
	{ value: "Bank Tabungan Negara", label: "Bank Tabungan Negara (BTN)" },
	{ value: "Citibank", label: "Citibank" },
	{ value: "Permata", label: "Bank Permata" },
	{ value: "Lainnya", label: "Bank Lainnya" },
];

// Fungsi untuk memformat angka dengan titik sebagai pemisah ribuan
const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('IDR', 'Rp');
};

const paymentTypes = [
	{ value: "angsuran", label: "Bayar Angsuran" },
	{ value: "pdam", label: "Bayar PDAM" },
	{ value: "pln", label: "Bayar PLN" },
	{ value: "telepon", label: "Bayar Telepon" },
	{ value: "internet", label: "Bayar Internet" },
	{ value: "bpjs_kesehatan", label: "Bayar BPJS Kesehatan" },
	{ value: "bpjs_ketenagakerjaan", label: "Bayar BPJS Ketenagakerjaan" },
	{ value: "kartu_kredit", label: "Bayar Kartu Kredit" },
	{ value: "tv_kabel", label: "Bayar TV Kabel" },
	{ value: "lainnya", label: "Lainnya" },
];

const transactionTypes = [
	{ value: "Tarik Tunai", label: "Tarik Tunai" },
	{ value: "Setor Tunai", label: "Setor Tunai" },
	{ value: "Transfer", label: "Transfer" },
	{ value: "Pembayaran", label: "Pembayaran" },
	{ value: "Top Up E Wallet", label: "Top Up E Wallet" },
];

const tarikMethods = [
	{ value: "transfer_outlet", label: "Transfer Outlet" },
	{ value: "qris", label: "QRIS (Max. 1 Juta)" },
	{ value: "edc", label: "ATM - Mesin EDC" },
];

const eWallets = [
	{ value: "Gopay", label: "Gopay" },
	{ value: "OVO", label: "OVO" },
	{ value: "DANA", label: "DANA" },
	{ value: "ShopeePay", label: "ShopeePay" },
	{ value: "LinkAja", label: "LinkAja" },
];

const formSchema = z.object({
	type: z.string().min(1, "Pilih jenis transaksi"),
	bank: z.string().optional(),
	accountNumber: z.string()
		.optional()
		.refine(val => !val || /^\d+$/.test(val), {
			message: "Nomor rekening hanya boleh berisi angka"
		}),
	customerName: z.string().min(1, "Nama wajib diisi"),
	amount: z.coerce.number().min(1000, "Minimal Rp1.000"),
	notes: z.string().optional(),
	ewallet: z.string().optional(),
	phone: z.string()
		.optional()
		.refine(val => !val || /^(08|\+628)[0-9]{8,11}$/.test(val), {
			message: "Format nomor HP tidak valid (contoh: 08xxxxxxxxxx atau +628xxxxxxxxxx)"
		}),
	verification: z.boolean().optional(),
});

/**
 * Represents the shape of form values as inferred from the `formSchema` Zod schema.
 * 
 * This type is automatically generated based on the structure and validation rules
 * defined in `formSchema`, ensuring type safety and consistency throughout the form.
 */
type FormValues = z.infer<typeof formSchema>;

export default function TransactionForm() {
	const params = useParams();
	const router = useRouter();
	const tokenId = params.id as string;

	// Use token ID from URL as transaction ID
	const transactionId = tokenId || 'TXN-' + Date.now().toString(36).toUpperCase();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			type: "",
			amount: undefined,
			verification: false,
		},
	});

	const watchType = form.watch("type");
	const [tarikMethod, setTarikMethod] = useState("");
	const [paymentType, setPaymentType] = useState("");
	const [manualPaymentType, setManualPaymentType] = useState("");

	// Field visibility logic
	const isEWallet = watchType === "Top Up E Wallet";
	const isTransfer = watchType === "Transfer";
	const isTarik = watchType === "Tarik Tunai";
	const isSetor = watchType === "Setor Tunai";
	const isPembayaran = watchType === "Pembayaran";

	// State untuk mengelola status submit
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState<{
		type: 'success' | 'error' | null;
		message: string;
	}>({ type: null, message: '' });

	async function onSubmit(values: FormValues) {
		// Reset status
		setSubmitStatus({ type: null, message: '' });
		setIsSubmitting(true);
		
		try {
			const res = await fetch("/api/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});
			
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				setSubmitStatus({ 
					type: 'error', 
					message: "Gagal menyimpan transaksi: " + (err?.error || res.statusText) 
				});
				return;
			}
			
			const data = await res.json();
			
			// Mark token as used
			if (tokenId) {
				try {
					await fetch(`/api/tokens/${tokenId}/use`, { method: 'POST' });
				} catch (err) {
					console.error('Error marking token as used:', err);
				}
			}
			
			setSubmitStatus({ 
				type: 'success', 
				message: `Transaksi berhasil disimpan dengan ID: ${data.id}`
			});
			form.reset();
			
			// Redirect to home page after 2 seconds
			setTimeout(() => {
				window.location.href = '/';
			}, 2000);
		} catch (e) {
			setSubmitStatus({ 
				type: 'error', 
				message: "Terjadi kesalahan server. Silakan coba lagi."
			});
		} finally {
			setIsSubmitting(false);
		}
	}

return (
	<>
		{/* Notification component */}
		<Notification 
			type={submitStatus.type} 
			message={submitStatus.message} 
			onClose={() => setSubmitStatus({ type: null, message: '' })}
		/>
		
		<Card className="max-w-md mx-auto mt-6 shadow-xl border-0 bg-white/70 backdrop-blur-lg rounded-xl">
				<CardHeader className="pb-2 bg-white/60 backdrop-blur rounded-t-xl border-b border-gray-100 shadow-sm">
					<div className="flex flex-col items-center gap-2">
						<CardTitle className="text-2xl font-extrabold text-center tracking-tight text-gray-800 font-sans">Form Transaksi</CardTitle>
						<span className="inline-block text-xs font-mono bg-white/70 border border-gray-200 rounded px-2 py-1 text-gray-700 mt-1 shadow-sm">ID Transaksi: {transactionId}</span>
											<span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 rounded px-2 py-1 mt-1 shadow">Layanan: QR Tunai Outlet</span>
										</div>
										<CardDescription className="text-center text-xs mt-3 text-gray-500 font-medium">Pilih jenis transaksi dan isi data sesuai kebutuhan</CardDescription>
									</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

															{/* Jenis Transaksi: Popdown Select */}
															<FormField
																control={form.control}
																name="type"
																render={({ field }) => (
																	<FormItem>
																		<FormLabel className="text-base font-semibold">Jenis Transaksi</FormLabel>
																		<Select onValueChange={field.onChange} value={field.value}>
																			<FormControl>
																				<SelectTrigger className="h-14 text-lg font-bold" >
																					<SelectValue placeholder="Pilih jenis transaksi" />
																				</SelectTrigger>
																			</FormControl>
																			<SelectContent>
																				{transactionTypes.map((t) => (
																					<SelectItem key={t.value} value={t.value} className="text-base font-semibold">{t.label}</SelectItem>
																				))}
																			</SelectContent>
																		</Select>
																		<FormMessage />
																	</FormItem>
																)}
															/>

						{/* E Wallet Fields */}
						{isEWallet && (
							<div className="space-y-2 animate-fade-in">
								<Badge variant="secondary" className="mb-1">Top Up E Wallet</Badge>
								<FormField
									control={form.control}
									name="ewallet"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nama E Wallet</FormLabel>
											<Select onValueChange={field.onChange} value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Pilih e-wallet" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{eWallets.map((ew) => (
														<SelectItem key={ew.value} value={ew.value}>{ew.label}</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>No. HP E Wallet</FormLabel>
											<FormControl>
												<Input type="tel" placeholder="08xxxxxxxxxx" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="amount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nominal</FormLabel>
											<FormControl>
												<Input type="number" min={1000} step={1000} placeholder="Masukkan nominal" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="verification"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 bg-muted/30">
											<FormLabel className="mb-0">Verifikasi nomor & saldo</FormLabel>
											<FormControl>
												<Switch checked={field.value} onCheckedChange={field.onChange} />
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						)}

						{/* Transfer Fields */}
						{isTransfer && (
							<div className="space-y-2 animate-fade-in">
								<Badge variant="secondary" className="mb-1">Transfer Bank</Badge>
								<FormField
									control={form.control}
									name="bank"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Bank Tujuan</FormLabel>
											<FormControl>
												<Input placeholder="Nama bank" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="accountNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>No. Rekening Tujuan</FormLabel>
											<FormControl>
												<Input 
													type="text" 
													pattern="[0-9]*" 
													inputMode="numeric"
													placeholder="Nomor rekening" 
													{...field}
													onChange={(e) => {
														// Filter non-numeric characters
														const value = e.target.value.replace(/\D/g, '');
														field.onChange(value);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="customerName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nama Penerima</FormLabel>
											<FormControl>
												<Input placeholder="Nama penerima" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="amount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nominal</FormLabel>
											<FormControl>
												<Input type="number" min={1000} step={1000} placeholder="Masukkan nominal" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						)}


									{/* Tarik Tunai Fields */}
												{isTarik && (
													<div className="space-y-2 animate-fade-in">
														<Badge variant="secondary" className="mb-1">Tarik Tunai</Badge>
														<div>
															<FormLabel>Metode Tarik Tunai</FormLabel>
															<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
																{tarikMethods.map((m) => (
																	<button
																		key={m.value}
																		type="button"
																		className={`w-full rounded-lg border-2 px-4 py-3 text-base font-semibold transition-all shadow-sm
																			${tarikMethod === m.value
																				? "border-blue-600 bg-blue-50 text-blue-800"
																				: "border-gray-300 bg-white text-gray-700 hover:border-blue-400"}
																		`}
																		onClick={() => setTarikMethod(m.value)}
																	>
																		{m.label}
																	</button>
																))}
															</div>
														</div>
																		{tarikMethod === "transfer_outlet" && (
																			<div className="space-y-2 p-3 bg-gray-100 rounded-md text-center">
																				<p className="font-semibold text-lg">Transfer ke rekening outlet QR Tunai.</p>
																				<p className="text-xs text-gray-500">Silakan transfer ke rekening outlet sesuai instruksi petugas.</p>
																			</div>
																		)}
																		{tarikMethod === "qris" && (
																			<div className="space-y-2 p-3 bg-gray-100 rounded-md text-center">
																				<p className="font-semibold text-lg">Pindai kode QRIS berikut (maksimal Rp1.000.000).</p>
																				<div className="flex justify-center">
																					<div className="w-full max-w-[180px] h-[180px] bg-gray-300 flex items-center justify-center rounded-lg">
																						<p className="text-gray-500 text-sm">[QRIS]</p>
																					</div>
																				</div>
																				<p className="text-xs text-gray-500">QRIS berlaku untuk satu kali transaksi, maksimal Rp1.000.000.</p>
																			</div>
																		)}
																		{tarikMethod === "edc" && (
																			<div className="space-y-2 p-3 bg-gray-100 rounded-md text-center">
																				<p className="font-semibold text-lg">Lanjutkan di loket dengan ATM/EDC.</p>
																				<p className="text-xs text-gray-500">Silakan berikan kartu ATM Anda kepada petugas untuk diproses di mesin EDC.</p>
																			</div>
																		)}
														<FormField
															control={form.control}
															name="customerName"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Nama Nasabah</FormLabel>
																	<FormControl>
																		<Input placeholder="Nama nasabah" {...field} />
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														<FormField
															control={form.control}
															name="amount"
															render={({ field }) => (
																<FormItem>
																	<FormLabel>Nominal</FormLabel>
																	<FormControl>
																		<FormattedInput 
																			type="number" 
																			min={1000} 
																			step={1000} 
																			placeholder="Masukkan nominal" 
																			{...field}
																			formatValue={formatRupiah}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
													</div>
												)}

						{/* Setor Tunai Fields */}
						{isSetor && (
							<div className="space-y-2 animate-fade-in">
								<Badge variant="secondary" className="mb-1">Setor Tunai</Badge>
												<FormField
													control={form.control}
													name="bank"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Bank</FormLabel>
															<Select onValueChange={field.onChange} value={field.value}>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Pilih bank" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{bankOptions.map((b) => (
																		<SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
								<FormField
									control={form.control}
									name="accountNumber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>No. Rekening</FormLabel>
											<FormControl>
												<Input 
													type="text" 
													pattern="[0-9]*" 
													inputMode="numeric"
													placeholder="Nomor rekening" 
													{...field}
													onChange={(e) => {
														// Filter non-numeric characters
														const value = e.target.value.replace(/\D/g, '');
														field.onChange(value);
													}}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="customerName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nama Penyetor</FormLabel>
											<FormControl>
												<Input placeholder="Nama penyetor" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="amount"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nominal</FormLabel>
											<FormControl>
												<Input type="number" min={1000} step={1000} placeholder="Masukkan nominal" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						)}


									{/* Pembayaran Fields */}
									{isPembayaran && (
										<div className="space-y-2 animate-fade-in">
											<Badge variant="secondary" className="mb-1">Pembayaran</Badge>
											<div>
												<FormLabel>Jenis Pembayaran</FormLabel>
												<Select value={paymentType} onValueChange={setPaymentType}>
													<SelectTrigger>
														<SelectValue placeholder="Pilih jenis pembayaran" />
													</SelectTrigger>
													<SelectContent>
														{paymentTypes.map((pt) => (
															<SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
											{paymentType === "lainnya" && (
												<div>
													<FormLabel>Jenis Pembayaran Lainnya</FormLabel>
													<Input value={manualPaymentType} onChange={e => setManualPaymentType(e.target.value)} placeholder="Contoh: Sewa Apartemen" />
												</div>
											)}
											<div>
												<FormLabel>ID Pelanggan / Nomor Pembayaran</FormLabel>
												<Input placeholder="Contoh: 1234567890" />
											</div>
											<FormField
												control={form.control}
												name="amount"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Nominal</FormLabel>
														<FormControl>
															<FormattedInput 
																type="number" 
																min={1000} 
																step={1000} 
																placeholder="Masukkan nominal" 
																{...field}
																formatValue={formatRupiah}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									)}

									{/* Checkbox Validasi dan Syarat & Ketentuan */}
									<FormField
										control={form.control}
										name="verification"
										rules={{ required: true }}
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
												<FormControl>
													<input
														type="checkbox"
														checked={!!field.value}
														onChange={e => field.onChange(e.target.checked)}
														className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
														aria-label="Saya menyatakan semua informasi yang dimasukkan valid"
													/>
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel>Saya menyatakan semua informasi yang dimasukkan valid.</FormLabel>
													<div className="text-xs text-gray-500">
														Saya telah membaca dan menyetujui
														<Link href="/terms" target="_blank" className="underline hover:text-primary ml-1">Syarat & Ketentuan</Link>
														yang berlaku.
													</div>
													<FormMessage />
												</div>
											</FormItem>
										)}
									/>
									{/* Submit Button */}
									<CardFooter className="p-0 pt-2 flex justify-end">
										<Button type="submit" className="w-full" disabled={isSubmitting}>
											{isSubmitting ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Menyimpan...
												</>
											) : (
												'Simpan Transaksi'
											)}
										</Button>
									</CardFooter>
								</form>
							</Form>
						</CardContent>
					</Card>
				</>
			);
		}
