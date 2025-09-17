"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AmountInput } from "@/components/ui/amount-input";
import { useNotification } from "@/components/ui/notification";
import { Loader2, CreditCard, Receipt } from "lucide-react";
import Link from "next/link";
import { outletBanks, transactionMethods } from "@/lib/bank-config";

// Data options
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

const transactionTypes = [
	{ value: "Tarik Tunai", label: "Tarik Tunai" },
	{ value: "Setor Tunai", label: "Setor Tunai" },
	{ value: "Transfer", label: "Transfer" },
	{ value: "Pembayaran", label: "Pembayaran" },
	{ value: "Top Up E Wallet", label: "Top Up E Wallet" },
];

const paymentTypes = [
	{ value: "listrik", label: "Listrik" },
	{ value: "air", label: "Air" },
	{ value: "internet", label: "Internet" },
	{ value: "telepon", label: "Telepon" },
	{ value: "lainnya", label: "Lainnya" },
];

const eWallets = [
	{ value: "Gopay", label: "Gopay" },
	{ value: "OVO", label: "OVO" },
	{ value: "DANA", label: "DANA" },
	{ value: "ShopeePay", label: "ShopeePay" },
	{ value: "LinkAja", label: "LinkAja" },
];

// Fungsi untuk memformat angka dengan format Rupiah
const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('IDR', 'Rp');
};

// Schema validasi form dengan validasi kondisional yang komprehensif
const formSchema = z.object({
	type: z.string().min(1, "Pilih jenis transaksi"),
	bank: z.string().optional(),
	accountNumber: z.string()
		.optional()
		.refine(val => !val || /^\d+$/.test(val), {
			message: "Nomor rekening hanya boleh berisi angka"
		}),
	customerName: z.string().optional(),
	amount: z.coerce.number().optional(),
	notes: z.string().optional(),
	ewallet: z.string().optional(),
	phone: z.string()
		.optional()
		.refine(val => !val || /^(08|\+628)[0-9]{8,11}$/.test(val), {
			message: "Format nomor HP tidak valid"
		}),
	verification: z.boolean().default(false),
	// Field yang sebelumnya menggunakan manual state
	method: z.string().optional(),
	outletBank: z.string().optional(),
	paymentType: z.string().optional(),
	manualPaymentType: z.string().optional(),
	customerId: z.string().optional(), // ID Pelanggan untuk pembayaran
}).superRefine((data, ctx) => {
	// Validasi kondisional berdasarkan jenis transaksi
	
	// Validasi umum untuk amount
	if (!data.amount || data.amount < 1000) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Minimal nominal Rp1.000",
			path: ['amount'],
		});
	}

	// Validasi Top Up E Wallet
	if (data.type === "Top Up E Wallet") {
		if (!data.ewallet) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Pilih jenis e-wallet",
				path: ['ewallet'],
			});
		}
		if (!data.phone) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Nomor HP e-wallet wajib diisi",
				path: ['phone'],
			});
		}
		if (!data.customerName) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Nama pemilik e-wallet wajib diisi",
				path: ['customerName'],
			});
		}
	}

	// Validasi Transfer
	if (data.type === "Transfer") {
		if (!data.method) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Pilih metode transfer",
				path: ['method'],
			});
		}
		if (!data.bank) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Bank tujuan wajib diisi",
				path: ['bank'],
			});
		}
		if (!data.accountNumber) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Nomor rekening tujuan wajib diisi",
				path: ['accountNumber'],
			});
		}
		if (!data.customerName) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Nama penerima wajib diisi",
				path: ['customerName'],
			});
		}
	}

	// Validasi Tarik Tunai
	if (data.type === "Tarik Tunai") {
		if (!data.method) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Pilih metode tarik tunai",
				path: ['method'],
			});
		}
		if (!data.customerName) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Nama nasabah wajib diisi",
				path: ['customerName'],
			});
		}
		// Validasi khusus untuk transfer outlet
		if (data.method === "transfer_outlet" && !data.outletBank) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Pilih bank outlet untuk transfer",
				path: ['outletBank'],
			});
		}
		// Validasi limit QRIS
		if (data.method === "qris" && data.amount && data.amount > 1000000) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Maksimal QRIS Rp1.000.000",
				path: ['amount'],
			});
		}
	}

	// Validasi Setor Tunai
	if (data.type === "Setor Tunai") {
		if (!data.bank) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Pilih bank",
				path: ['bank'],
			});
		}
		if (!data.accountNumber) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Nomor rekening wajib diisi",
				path: ['accountNumber'],
			});
		}
		if (!data.customerName) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Nama penyetor wajib diisi",
				path: ['customerName'],
			});
		}
	}

	// Validasi Pembayaran
	if (data.type === "Pembayaran") {
		if (!data.paymentType) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Pilih jenis pembayaran",
				path: ['paymentType'],
			});
		}
		if (data.paymentType === "lainnya" && !data.manualPaymentType) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Sebutkan jenis pembayaran lainnya",
				path: ['manualPaymentType'],
			});
		}
		if (!data.customerId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "ID pelanggan/nomor pembayaran wajib diisi",
				path: ['customerId'],
			});
		}
	}

	// Validasi checkbox verifikasi wajib
	if (!data.verification) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Anda harus menyetujui bahwa informasi yang dimasukkan valid",
			path: ['verification'],
		});
	}
});

/**
 * Represents the shape of form values as inferred from the `formSchema` Zod schema.
 * 
 * This type is automatically generated based on the structure and validation rules
 * defined in `formSchema`, ensuring type safety and consistency throughout the form.
 */
type FormValues = z.infer<typeof formSchema>;

export default function TransactionForm() {
	// Set up form dengan default values yang lebih lengkap dan mode validation
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		mode: "onBlur", // Validasi saat blur untuk UX yang lebih baik
		defaultValues: {
			type: "",
			amount: undefined,
			verification: false,
			method: "",
			paymentType: "",
			manualPaymentType: "",
			customerId: "",
			customerName: "",
			bank: "",
			accountNumber: "",
			ewallet: "",
			phone: "",
			outletBank: "",
			notes: "",
		},
	});

	// Router for navigation
	const router = useRouter();

	// Generate unique transaction ID using timestamp
	const transactionId = React.useMemo(() => {
		return 'TXN-' + Date.now().toString(36).toUpperCase();
	}, []);

	// Use the new notification hook
	const { showNotification, NotificationComponent } = useNotification();

	// Watch values untuk conditional rendering
	const watchType = form.watch("type");
	const watchMethod = form.watch("method");
	const watchPaymentType = form.watch("paymentType");

	// Derived values untuk field visibility
	const isEWallet = watchType === "Top Up E Wallet";
	const isTransfer = watchType === "Transfer";
	const isTarik = watchType === "Tarik Tunai";
	const isSetor = watchType === "Setor Tunai";
	const isPembayaran = watchType === "Pembayaran";
	
	// Method-specific visibility
	const showOutletBankDropdown = isTarik && watchMethod === "transfer_outlet";
	const availableMethods = transactionMethods[watchType as keyof typeof transactionMethods] || [];

	// State untuk loading
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function onSubmit(values: FormValues) {
		// Show loading notification
		showNotification('loading', 'Menyimpan transaksi...', 'Memproses data transaksi Anda');
		setIsSubmitting(true);
		
		try {
			// Simulate network delay untuk better UX
			await new Promise(resolve => setTimeout(resolve, 800));
			
			const res = await fetch("/api/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...values,
					id: transactionId, // Include transaction ID
				}),
			});
			
			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				showNotification('error', 'Gagal menyimpan transaksi', err?.error || res.statusText);
				return;
			}
			
			const data = await res.json();
			showNotification('success', 'Transaksi berhasil disimpan!', `ID Transaksi: ${data.id || transactionId}`);
			
			// Reset form after successful submission
			form.reset();
			
			// Reset form ke default values
			form.reset({
				type: "",
				amount: undefined,
				verification: false,
				method: "",
				paymentType: "",
				manualPaymentType: "",
				customerId: "",
				customerName: "",
				bank: "",
				accountNumber: "",
				ewallet: "",
				phone: "",
				outletBank: "",
				notes: "",
			});
			
			// Redirect to main page after successful submission for service simulation
			setTimeout(() => {
				router.push(`/?transaction=${encodeURIComponent(data.id || transactionId)}&status=completed`);
			}, 2000); // Wait 2 seconds to show success notification
			
		} catch (e) {
			showNotification('error', 'Terjadi kesalahan jaringan', 'Silakan periksa koneksi internet dan coba lagi');
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<>
			{/* Use the new notification component */}
			{NotificationComponent}
			
			<Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white rounded-xl sm:max-w-lg mb-4 sm:mb-6">
				<CardHeader className="text-center py-6 border-b border-gray-100">
					<div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full">
						<Receipt className="h-6 w-6 text-blue-600" />
					</div>
					<CardTitle className="text-xl font-bold text-gray-900">
						Form Transaksi
					</CardTitle>
					<div className="text-sm text-gray-500 mt-1">
						ID: {transactionId}
					</div>
				</CardHeader>
				<CardContent className="p-6">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

							{/* Jenis Transaksi */}
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium text-gray-700">
											Jenis Transaksi *
										</FormLabel>
										<Select onValueChange={field.onChange} value={field.value}>
											<FormControl>
												<SelectTrigger className="h-11">
													<SelectValue placeholder="Pilih jenis layanan transaksi..." />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{transactionTypes.map((t) => (
													<SelectItem key={t.value} value={t.value}>
														{t.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>							{/* E-Wallet Fields */}
							{isEWallet && (
								<div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
									<Badge variant="outline" className="text-xs">
										Top Up E-Wallet
									</Badge>
									
									<FormField
										control={form.control}
										name="ewallet"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-medium text-gray-700">
													E-Wallet *
												</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger className="h-11">
															<SelectValue placeholder="Pilih e-wallet..." />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{eWallets.map((ew) => (
															<SelectItem key={ew.value} value={ew.value}>
																{ew.label}
															</SelectItem>
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
												<FormLabel className="text-sm font-medium text-gray-700">
													Nomor HP Terdaftar *
												</FormLabel>
												<FormControl>
													<Input 
														type="tel" 
														placeholder="08123456789" 
														className="h-11"
														{...field} 
													/>
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
												<FormLabel className="text-sm font-medium text-gray-700">
													Nominal Top Up *
												</FormLabel>
												<FormControl>
													<AmountInput
														value={field.value}
														onChange={field.onChange}
														min={10000}
														quickAmounts={[10000, 25000, 50000, 100000, 200000, 500000]}
														placeholder="Masukkan nominal..."
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									
									<FormField
										control={form.control}
										name="verification"
										render={({ field }) => (
											<FormItem className="flex flex-row items-center space-x-3 space-y-0">
												<FormControl>
													<Checkbox
														checked={field.value}
														onCheckedChange={field.onChange}
													/>
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel className="text-sm font-medium">
														Saya yakin data sudah benar
													</FormLabel>
												</div>
											</FormItem>
										)}
									/>
								</div>
							)}

							{/* Transfer Fields */}
							{isTransfer && (
								<div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
									<Badge variant="outline" className="text-xs">
										Transfer Bank
									</Badge>
									
									<FormField
										control={form.control}
										name="method"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-medium text-gray-700">
													Metode Transfer *
												</FormLabel>
												<FormControl>
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
														{availableMethods.map((method) => (
															<button
																key={method.value}
																type="button"
																className={`w-full rounded-lg border px-4 py-3 text-sm font-medium transition-all
																	${field.value === method.value
																		? "border-blue-600 bg-blue-50 text-blue-800"
																		: "border-gray-300 bg-white text-gray-700 hover:border-gray-400"}
																`}
																onClick={() => field.onChange(method.value)}
															>
																{method.label}
															</button>
														))}
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="bank"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-sm font-medium text-gray-700">
														Bank Tujuan *
													</FormLabel>
													<FormControl>
														<Input 
															placeholder="BCA, Mandiri, BRI..." 
															className="h-11"
															{...field} 
														/>
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
													<FormLabel className="text-sm font-medium text-gray-700">
														No. Rekening *
													</FormLabel>
													<FormControl>
														<Input 
															type="text" 
															pattern="[0-9]*" 
															inputMode="numeric"
															placeholder="1234567890" 
															className="h-11"
															{...field}
															onChange={(e) => {
																const value = e.target.value.replace(/\D/g, '');
																field.onChange(value);
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
									
									<FormField
										control={form.control}
										name="customerName"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-medium text-gray-700">
													Nama Penerima *
												</FormLabel>
												<FormControl>
													<Input 
														placeholder="Nama sesuai rekening" 
														className="h-11"
														{...field} 
													/>
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
												<FormLabel className="text-sm font-medium text-gray-700">
													Nominal Transfer *
												</FormLabel>
												<FormControl>
													<AmountInput
														value={field.value}
														onChange={field.onChange}
														min={10000}
														max={25000000}
														quickAmounts={[50000, 100000, 250000, 500000, 1000000, 2500000]}
														placeholder="Masukkan nominal..."
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}


									{/* Tarik Tunai Fields */}
									{isTarik && (
										<div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
											<Badge variant="outline" className="text-xs">
												Tarik Tunai
											</Badge>
											
											<FormField
												control={form.control}
												name="method"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-sm font-medium text-gray-700">
															Metode Tarik Tunai *
														</FormLabel>
														<FormControl>
															<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
																{availableMethods.map((method) => (
																	<button
																		key={method.value}
																		type="button"
																		className={`w-full rounded-lg border px-4 py-3 text-sm font-medium transition-all
																			${field.value === method.value
																				? "border-blue-600 bg-blue-50 text-blue-800"
																				: "border-gray-300 bg-white text-gray-700 hover:border-gray-400"}
																		`}
																		onClick={() => field.onChange(method.value)}
																	>
																		{method.label}
																	</button>
																))}
															</div>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											{showOutletBankDropdown && (
												<FormField
													control={form.control}
													name="outletBank"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-sm font-medium text-gray-700">
																Bank Outlet *
															</FormLabel>
															<FormControl>
																<Select onValueChange={field.onChange} value={field.value}>
																	<SelectTrigger className="h-11">
																		<SelectValue placeholder="Pilih bank outlet..." />
																	</SelectTrigger>
																	<SelectContent>
																		{outletBanks.map((bank) => (
																			<SelectItem key={bank.code} value={bank.code}>
																				{bank.name} - {bank.accountNumber}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											)}
											
											{watchMethod === "transfer_outlet" && (
												<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
													<p className="font-medium text-sm">Transfer ke rekening outlet QR Tunai</p>
													<p className="text-xs text-gray-600 mt-1">Silakan transfer ke rekening sesuai instruksi</p>
												</div>
											)}
											
											{watchMethod === "qris" && (
												<div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
													<p className="font-medium text-sm">Pindai kode QRIS (max Rp1.000.000)</p>
													<div className="w-32 h-32 bg-gray-200 mx-auto my-2 rounded flex items-center justify-center">
														<span className="text-xs text-gray-500">[QRIS]</span>
													</div>
													<p className="text-xs text-gray-600">QRIS berlaku satu kali transaksi</p>
												</div>
											)}
											
											{watchMethod === "edc" && (
												<div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
													<p className="font-medium text-sm">Lanjutkan di loket dengan ATM/EDC</p>
													<p className="text-xs text-gray-600 mt-1">Berikan kartu ATM kepada petugas</p>
												</div>
											)}
											
											<FormField
												control={form.control}
												name="customerName"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-sm font-medium text-gray-700">
															Nama Nasabah *
														</FormLabel>
														<FormControl>
															<Input 
																placeholder="Nama nasabah" 
																className="h-11"
																{...field} 
															/>
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
														<FormLabel className="text-sm font-medium text-gray-700">
															Nominal Tarik *
														</FormLabel>
														<FormControl>
															<AmountInput
																value={field.value}
																onChange={field.onChange}
																min={10000}
																quickAmounts={[50000, 100000, 250000, 500000, 1000000]}
																placeholder="Masukkan nominal..."
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									)}							{/* Setor Tunai Fields */}
							{isSetor && (
								<div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
									<Badge variant="outline" className="text-xs">
										Setor Tunai
									</Badge>
									
									<FormField
										control={form.control}
										name="bank"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-medium text-gray-700">
													Bank Tujuan *
												</FormLabel>
												<Select onValueChange={field.onChange} value={field.value}>
													<FormControl>
														<SelectTrigger className="h-11">
															<SelectValue placeholder="Pilih bank..." />
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
												<FormLabel className="text-sm font-medium text-gray-700">
													No. Rekening *
												</FormLabel>
												<FormControl>
													<Input 
														type="text" 
														pattern="[0-9]*" 
														inputMode="numeric"
														placeholder="Nomor rekening" 
														className="h-11"
														{...field}
														onChange={(e) => {
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
												<FormLabel className="text-sm font-medium text-gray-700">
													Nama Penyetor *
												</FormLabel>
												<FormControl>
													<Input 
														placeholder="Nama penyetor" 
														className="h-11"
														{...field} 
													/>
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
												<FormLabel className="text-sm font-medium text-gray-700">
													Nominal Setor *
												</FormLabel>
												<FormControl>
													<AmountInput
														value={field.value}
														onChange={field.onChange}
														min={10000}
														quickAmounts={[50000, 100000, 250000, 500000, 1000000]}
														placeholder="Masukkan nominal..."
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}


									{/* Pembayaran Fields */}
									{isPembayaran && (
										<div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
											<Badge variant="outline" className="text-xs">
												Bayar Tagihan
											</Badge>
											
											<FormField
												control={form.control}
												name="paymentType"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-sm font-medium text-gray-700">
															Jenis Pembayaran *
														</FormLabel>
														<Select onValueChange={field.onChange} value={field.value}>
															<FormControl>
																<SelectTrigger className="h-11">
																	<SelectValue placeholder="Pilih jenis pembayaran..." />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																{paymentTypes.map((pt) => (
																	<SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
																))}
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>
											
											{watchPaymentType === "lainnya" && (
												<FormField
													control={form.control}
													name="manualPaymentType"
													render={({ field }) => (
														<FormItem>
															<FormLabel className="text-sm font-medium text-gray-700">
																Jenis Pembayaran Lainnya *
															</FormLabel>
															<FormControl>
																<Input 
																	placeholder="Contoh: Sewa Apartemen" 
																	className="h-11"
																	{...field} 
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											)}
											
											<FormField
												control={form.control}
												name="customerId"
												render={({ field }) => (
													<FormItem>
														<FormLabel className="text-sm font-medium text-gray-700">
															ID Pelanggan / Nomor Ref *
														</FormLabel>
														<FormControl>
															<Input 
																placeholder="Masukkan ID/nomor referensi..." 
																className="h-11"
																{...field} 
															/>
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
														<FormLabel className="text-sm font-medium text-gray-700">
															Nominal Pembayaran *
														</FormLabel>
														<FormControl>
															<AmountInput
																value={field.value}
																onChange={field.onChange}
																min={1000}
																quickAmounts={[20000, 50000, 100000, 200000, 500000]}
																placeholder="Masukkan nominal..."
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									)}									{/* Optional Notes Field */}
									<FormField
										control={form.control}
										name="notes"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
													<Receipt className="h-4 w-4 text-gray-500" />
													Catatan Tambahan <span className="text-xs font-normal text-gray-500">(Opsional)</span>
												</FormLabel>
												<FormControl>
													<Textarea 
														placeholder="Tambahkan catatan atau keterangan jika diperlukan..."
														className="min-h-[80px] resize-none border-2 hover:border-blue-300 focus:border-blue-500"
														{...field} 
													/>
												</FormControl>
												<div className="text-xs text-gray-500 mt-1">
													Maksimal 200 karakter. Field ini bersifat opsional.
												</div>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Enhanced Checkbox Validasi dan Syarat & Ketentuan */}
									<FormField
										control={form.control}
										name="verification"
										rules={{ required: true }}
										render={({ field }) => (
											<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4">
												<FormControl>
													<input
														type="checkbox"
														checked={!!field.value}
														onChange={e => field.onChange(e.target.checked)}
														className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
													/>
												</FormControl>
												<div className="space-y-1 leading-none">
													<FormLabel className="text-sm font-semibold text-gray-700 cursor-pointer">
														Verifikasi & Persetujuan Data
													</FormLabel>
													<div className="text-xs text-gray-600 leading-relaxed">
														Saya menyatakan bahwa semua informasi yang dimasukkan adalah <strong>valid dan benar</strong>. 
														Saya telah membaca dan menyetujui
														<Link href="/terms" target="_blank" className="text-blue-600 underline hover:text-blue-800 mx-1 font-medium">
															Syarat & Ketentuan
														</Link>
														yang berlaku.
													</div>
													<FormMessage />
												</div>
											</FormItem>
										)}
									/>
<<<<<<< HEAD
									
									{/* Enhanced Submit Button */}
									<div className="pt-6">
										<Button 
											type="submit" 
											className={`w-full h-14 text-base font-bold transition-all duration-300 rounded-xl ${
												isSubmitting 
													? 'bg-gray-400 cursor-not-allowed shadow-sm' 
													: 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5'
											}`}
											disabled={isSubmitting}
											size="lg"
										>
											{isSubmitting ? (
												<>
													<Loader2 className="mr-3 h-5 w-5 animate-spin" />
													<span className="animate-pulse">Menyimpan Transaksi...</span>
												</>
											) : (
												<>
													<svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													SIMPAN & PROSES TRANSAKSI
												</>
											)}
										</Button>
									</div>
								</form>
							</Form>
						</CardContent>
					</Card>
				</>
			);
		}
=======
									{/* Submit Button */}
									<CardFooter className="p-0 pt-2 flex justify-end">
										<Button type="submit" className="w-full">Simpan Transaksi</Button>
									</CardFooter>
					</form>
				</Form>
			</CardContent>
		</Card>
		</>
	);
}
>>>>>>> 9ce9d968594197bc5c16e6c13217b7cf31b67dfc
