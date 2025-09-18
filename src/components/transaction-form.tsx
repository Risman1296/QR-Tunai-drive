"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Notification } from "@/components/notification";
import { CopyButton } from "@/components/copy-button";
import WiFiAccess, { WiFiQuickConnect } from "@/components/wifi-access";
import { WiFiManager, WiFiCredentials, ConnectionQuality } from "@/lib/wifi-manager";
import Link from "next/link";
import { useState, Suspense } from "react";
import { Loader2, Copy, CheckCircle, Store } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// Data options - Updated dengan bank Indonesia standar
const bankOptions = [
	{ value: "Bank Central Asia", label: "Bank Central Asia (BCA)", code: "BCA" },
	{ value: "Bank Mandiri", label: "Bank Mandiri", code: "MANDIRI" },
	{ value: "Bank Rakyat Indonesia", label: "Bank Rakyat Indonesia (BRI)", code: "BRI" },
	{ value: "Bank Negara Indonesia", label: "Bank Negara Indonesia (BNI)", code: "BNI" },
	{ value: "Bank Syariah Indonesia", label: "Bank Syariah Indonesia (BSI)", code: "BSI" },
	{ value: "Bank Tabungan Negara", label: "Bank Tabungan Negara (BTN)", code: "BTN" },
	{ value: "CIMB Niaga", label: "CIMB Niaga", code: "CIMB" },
	{ value: "Bank Danamon", label: "Bank Danamon", code: "DANAMON" },
	{ value: "Bank Permata", label: "Bank Permata", code: "PERMATA" },
	{ value: "Lainnya", label: "Bank Lainnya", code: "OTHER" },
];

// Data rekening outlet untuk setiap bank - Real account numbers should be used in production
const outletBankAccounts = [
	{
		bankCode: "BCA",
		bankName: "Bank Central Asia (BCA)",
		accountNumber: "8460-5678-90",
		accountName: "QR TUNAI OUTLET BCA",
		instructions: "Transfer ke rekening BCA outlet dan tunjukkan bukti transfer ke petugas"
	},
	{
		bankCode: "MANDIRI",
		bankName: "Bank Mandiri",
		accountNumber: "123-00-4567890-1",
		accountName: "QR TUNAI OUTLET MDR",
		instructions: "Transfer ke rekening Mandiri outlet dan tunjukkan bukti transfer ke petugas"
	},
	{
		bankCode: "BRI",
		bankName: "Bank Rakyat Indonesia (BRI)",
		accountNumber: "0234-01-012345-67-8",
		accountName: "QR TUNAI OUTLET BRI",
		instructions: "Transfer ke rekening BRI outlet dan tunjukkan bukti transfer ke petugas"
	},
	{
		bankCode: "BNI",
		bankName: "Bank Negara Indonesia (BNI)",
		accountNumber: "1234567890",
		accountName: "QR TUNAI OUTLET BNI",
		instructions: "Transfer ke rekening BNI outlet dan tunjukkan bukti transfer ke petugas"
	},
	{
		bankCode: "BSI",
		bankName: "Bank Syariah Indonesia (BSI)",
		accountNumber: "7123456789",
		accountName: "QR TUNAI OUTLET BSI",
		instructions: "Transfer ke rekening BSI outlet dan tunjukkan bukti transfer ke petugas"
	},
	{
		bankCode: "BTN",
		bankName: "Bank Tabungan Negara (BTN)",
		accountNumber: "00001-01-23-456789",
		accountName: "QR TUNAI OUTLET BTN",
		instructions: "Transfer ke rekening BTN outlet dan tunjukkan bukti transfer ke petugas"
	}
];

const paymentTypes = [
	{ value: "angsuran", label: "Bayar Angsuran" },
	{ value: "virtual_account", label: "Bayar Virtual Account" },
	{ value: "tagihan_bulanan", label: "Bayar Tagihan Bulanan" },
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

const transferMethods = [
	{ value: "tunai", label: "Tunai" },
	{ value: "transfer_atm_edc", label: "Transfer ATM (Mesin EDC)" },
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
  }).format(amount);
};

// Fungsi untuk parse value dari input rupiah
const parseRupiahValue = (value: string): number => {
  if (!value) return 0;
  // Remove "Rp", dots, and spaces, keep only numbers
  const numericValue = value.replace(/[^\d]/g, '');
  return parseInt(numericValue) || 0;
};

// Schema validasi form - Updated dengan validasi yang lebih ketat
const formSchema = z.object({
	type: z.string().min(1, "Pilih jenis transaksi"),
	bank: z.string().optional(),
	manualBankName: z.string().optional(),
	manualPaymentType: z.string().optional(),
	paymentInstitution: z.string().optional(),
	accountNumber: z.string()
		.optional()
		.refine(val => !val || /^\d+$/.test(val), {
			message: "Nomor rekening hanya boleh berisi angka"
		}),
	customerName: z.string().min(2, "Nama minimal 2 karakter").max(100, "Nama maksimal 100 karakter"),
	amount: z.union([
		z.number().min(10000, "Nominal minimal Rp10.000").max(10000000, "Nominal maksimal 10 juta"),
		z.string().transform((val, ctx) => {
			if (!val || val.trim() === "") {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Nominal wajib diisi"
				});
				return z.NEVER;
			}
			const numericValue = parseRupiahValue(val);
			if (isNaN(numericValue) || numericValue <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Nominal harus berupa angka yang valid"
				});
				return z.NEVER;
			}
			if (numericValue < 10000) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Nominal minimal Rp10.000"
				});
				return z.NEVER;
			}
			if (numericValue > 10000000) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Nominal maksimal 10 juta"
				});
				return z.NEVER;
			}
			return numericValue;
		})
	]),
	notes: z.string().optional(),
	ewallet: z.string().optional(),
	phone: z.string()
		.optional()
		.refine(val => !val || /^(08|\+628)[0-9]{8,11}$/.test(val), {
			message: "Format nomor HP tidak valid (contoh: 08123456789)"
		}),
	verification: z.boolean().optional(),
}).superRefine((data, ctx) => {
	// Custom validation untuk QRIS limit
	if (data.type === "Tarik Tunai" && data.amount && data.amount > 1000000) {
		// Check if QRIS method is being used - this would need to be passed through context
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Untuk QRIS, nominal maksimal Rp1.000.000",
			path: ["amount"]
		});
	}
});

type FormValues = z.infer<typeof formSchema>;

export default function TransactionForm() {
	const params = useParams();
	const router = useRouter();
	const tokenId = params?.id as string;
	
	// State untuk token validation
	const [tokenValid, setTokenValid] = useState<boolean | null>(null);
	const [tokenError, setTokenError] = useState<string>("");
	const [showBackToTop, setShowBackToTop] = useState(false);

	// WiFi states
	const [needsWiFi, setNeedsWiFi] = useState<boolean | null>(null);
	const [connectionQuality, setConnectionQuality] = useState<'good' | 'slow' | 'poor' | 'no-internet'>('good');
	const [wifiCredentials, setWifiCredentials] = useState<WiFiCredentials | null>(null);
	const [showWiFiInterface, setShowWiFiInterface] = useState(false);
	const [wifiConnected, setWiFiConnected] = useState(false);

	// TESTING MODE: Force WiFi display
	const FORCE_WIFI_FOR_TESTING = true; // Set to false in production

	// Set up form
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			type: "",
			amount: 0,
			verification: false,
		},
	});

	// Generate a transaction ID
	const transactionId = React.useMemo(() => {
		return 'TXN-' + Date.now().toString(36).toUpperCase();
	}, []);

	// State untuk UI
	const [tarikMethod, setTarikMethod] = useState("");
	const [selectedOutletBank, setSelectedOutletBank] = useState("");
	const [transferMethod, setTransferMethod] = useState("");
	const [paymentType, setPaymentType] = useState("");
	const [manualPaymentType, setManualPaymentType] = useState("");
	const [manualBankName, setManualBankName] = useState("");
	const [paymentInstitution, setPaymentInstitution] = useState("");
	
	// State untuk mengelola status submit
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const [submitStatus, setSubmitStatus] = useState<{
		type: 'success' | 'error' | null;
		message: string;
	}>({ type: null, message: '' });

	// Field visibility logic
	const watchType = form.watch("type");
	const isEWallet = watchType === "Top Up E Wallet";
	const isTransfer = watchType === "Transfer";
	const isTarik = watchType === "Tarik Tunai";
	const isSetor = watchType === "Setor Tunai";
	const isPembayaran = watchType === "Pembayaran";

	// Prevent form refresh to avoid token regeneration
	React.useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (form.formState.isDirty) {
				e.preventDefault();
				e.returnValue = '';
			}
		};

		const handleUnload = () => {
			// Clean up token from session storage when user leaves
			if (tokenId) {
				const accessedTokens = JSON.parse(sessionStorage.getItem('accessedTokens') || '[]');
				const updatedTokens = accessedTokens.filter((token: string) => token !== tokenId);
				sessionStorage.setItem('accessedTokens', JSON.stringify(updatedTokens));
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);
		window.addEventListener('unload', handleUnload);
		
		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			window.removeEventListener('unload', handleUnload);
		};
	}, [form.formState.isDirty, tokenId]);

	// Scroll detection untuk back to top button
	React.useEffect(() => {
		const handleScroll = () => {
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			setShowBackToTop(scrollTop > 200);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Function untuk scroll ke atas
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	};

	// Token validation - Pastikan form hanya bisa diakses melalui QR code yang valid
	React.useEffect(() => {
		if (!tokenId) {
			setTokenError("Token tidak ditemukan. Silakan akses melalui QR code.");
			setTokenValid(false);
			// Redirect to main page after 3 seconds
			setTimeout(() => {
				router.push("/");
			}, 3000);
			return;
		}

		// Check if this token was already accessed in this session
		const accessedTokens = JSON.parse(sessionStorage.getItem('accessedTokens') || '[]');
		if (accessedTokens.includes(tokenId)) {
			setTokenError("Token ini sudah pernah diakses. Silakan generate QR code baru untuk keamanan.");
			setTokenValid(false);
			setTimeout(() => {
				router.push("/");
			}, 3000);
			return;
		}

		// Validasi token dengan API
		const validateToken = async () => {
			try {
				const response = await fetch(`/api/tokens/${tokenId}/status`);
				if (!response.ok) {
					throw new Error("Token tidak valid atau sudah expired");
				}
				
				const tokenData = await response.json();
				if (tokenData.status === 'expired' || tokenData.status === 'used') {
					throw new Error("Token sudah tidak berlaku. Silakan generate QR code baru.");
				}
				
				// Mark token as accessed in session storage
				const currentAccessedTokens = JSON.parse(sessionStorage.getItem('accessedTokens') || '[]');
				if (!currentAccessedTokens.includes(tokenId)) {
					currentAccessedTokens.push(tokenId);
					sessionStorage.setItem('accessedTokens', JSON.stringify(currentAccessedTokens));
				}
				
				setTokenValid(true);
				setTokenError("");
			} catch (error) {
				console.error("Token validation error:", error);
				setTokenError(error instanceof Error ? error.message : "Token tidak valid");
				setTokenValid(false);
				// Redirect to main page after 5 seconds
				setTimeout(() => {
					router.push("/");
				}, 5000);
			}
		};

		validateToken();
	}, [tokenId, router]);

	// WiFi Detection - Check internet connection and show WiFi interface if needed
	React.useEffect(() => {
		const detectConnectionAndSetupWiFi = async () => {
			if (tokenValid !== true) return; // Wait for token validation

			try {
				// Generate WiFi credentials for this transaction
				const credentials = WiFiManager.generateCredentials('daily');
				setWifiCredentials(credentials);

				// FOR TESTING: Always show WiFi interface when no internet is detected
				console.log('🔍 Checking connection quality...');
				
				// Check connection quality
				const quality = await ConnectionQuality.assess();
				console.log(`📶 Connection quality detected: ${quality}`);
				setConnectionQuality(quality);

				// Determine if WiFi interface should be shown
				const shouldShowWiFi = FORCE_WIFI_FOR_TESTING || quality === 'no-internet' || quality === 'poor';
				setNeedsWiFi(shouldShowWiFi);
				setShowWiFiInterface(shouldShowWiFi);

				console.log(`🛰️ WiFi Interface Status:`, {
					quality,
					shouldShowWiFi,
					credentials: credentials ? 'Generated' : 'None',
					ssid: credentials?.ssid,
					password: credentials?.password
				});
				
			} catch (error) {
				console.error('❌ WiFi detection failed:', error);
				
				// FOR TESTING: On error, assume no internet and show WiFi
				console.log('🚨 Error detected, showing WiFi interface as fallback');
				const fallbackCredentials = WiFiManager.generateCredentials('daily');
				setWifiCredentials(fallbackCredentials);
				setConnectionQuality('no-internet');
				setNeedsWiFi(true);
				setShowWiFiInterface(FORCE_WIFI_FOR_TESTING || true);
			}
		};

		detectConnectionAndSetupWiFi();
	}, [tokenValid]);

	// Handle WiFi connection success
	const handleWiFiConnected = () => {
		setWiFiConnected(true);
		setShowWiFiInterface(false);
		console.log('WiFi connected successfully');
	};

	// Handle WiFi skip
	const handleWiFiSkip = () => {
		setShowWiFiInterface(false);
		console.log('WiFi interface skipped');
	};

	async function onSubmit(values: FormValues) {
		// Reset status
		setSubmitStatus({ type: null, message: '' });
		setIsSubmitting(true);
		
		try {
			const res = await fetch("/api/transactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...values,
					tokenId: tokenId, // Sertakan tokenId untuk tracking
					transactionId: transactionId,
					// Include UI state untuk detail info ke admin
					transferMethod: transferMethod || null,
					tarikMethod: tarikMethod || null,
					paymentType: paymentType || null,
					manualPaymentType: manualPaymentType || null,
					manualBankName: manualBankName || null,
					paymentInstitution: paymentInstitution || null,
				}),
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
			setSubmitStatus({ 
				type: 'success', 
				message: `✅ Transaksi berhasil! ID: ${data.id}`
			});
			form.reset();
			
			// Reset UI state
			setTarikMethod("");
			setSelectedOutletBank("");
			setTransferMethod("");
			setPaymentType("");
			setManualPaymentType("");
			setManualBankName("");
			setPaymentInstitution("");

			// Clean up token from session storage for security
			if (tokenId) {
				const accessedTokens = JSON.parse(sessionStorage.getItem('accessedTokens') || '[]');
				const updatedTokens = accessedTokens.filter((token: string) => token !== tokenId);
				sessionStorage.setItem('accessedTokens', JSON.stringify(updatedTokens));
			}

			// Start redirect countdown for security
			setIsRedirecting(true);
			setCountdown(5);
			
			const countdownInterval = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						clearInterval(countdownInterval);
						// Use router.push for safer navigation
						router.push("/");
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
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
			
			{/* Token Error Notification */}
			{tokenValid === false && (
				<Notification 
					type="error" 
					message={tokenError} 
					onClose={() => {}}
				/>
			)}

			{/* Loading state untuk token validation */}
			{tokenValid === null && (
				<Card className="max-w-md mx-auto mt-6 shadow-xl border-0 bg-white/70 backdrop-blur-lg rounded-xl">
					<CardContent className="flex items-center justify-center py-12">
						<div className="text-center">
							<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
							<p className="text-gray-600">Memvalidasi token...</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Form hanya ditampilkan jika token valid */}
			{tokenValid === true && (
			<div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/30 p-3 pb-8">
				<Card className="w-full max-w-md mx-auto shadow-lg border-0 bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
					<CardHeader className="pb-3 pt-4 px-4 bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20 border-b border-blue-100/30 sticky top-3 z-50 backdrop-blur-md rounded-t-2xl">
					<div className="flex flex-col items-center space-y-3">
						{/* QRTunai Drive Thru Logo - Mobile Optimized */}
						<div className="flex items-center space-x-3">
							<div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
								<div className="text-white font-bold text-sm">QR</div>
							</div>
							<div className="text-left">
								<h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 leading-tight">
									QRTunai
								</h1>
								<div className="text-xs font-medium text-gray-600 -mt-1">
									Drive Thru Banking
								</div>
							</div>
						</div>
						
						<div className="w-full">
							<CardTitle className="text-base font-semibold text-center text-gray-800 mb-2">Form Transaksi</CardTitle>
							<div className="flex justify-center space-x-2">
								<span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
									ID: {transactionId.slice(-8)}
								</span>
								<span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
									🚗 Drive-Thru
								</span>
							</div>
						</div>
					</div>
					<CardDescription className="text-center text-xs mt-2 text-gray-500">Isi data transaksi dengan lengkap</CardDescription>
				</CardHeader>

				{/* Debug Info - Testing Mode */}
				{FORCE_WIFI_FOR_TESTING && (
					<div className="px-4 pt-2">
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
							<div className="font-semibold text-yellow-800 mb-1">🧪 Testing Mode Active</div>
							<div className="text-yellow-700 space-y-1">
								<div>Connection: {connectionQuality}</div>
								<div>WiFi Interface: {showWiFiInterface ? '✅ Visible' : '❌ Hidden'}</div>
								<div>Credentials: {wifiCredentials ? `${wifiCredentials.ssid} / ${wifiCredentials.password}` : 'None'}</div>
							</div>
						</div>
					</div>
				)}

				{/* WiFi Interface - Show if needed */}
				{showWiFiInterface && wifiCredentials && (
					<div className="px-4 pb-4">
						{needsWiFi ? (
							<WiFiAccess
								credentials={wifiCredentials}
								transactionId={transactionId}
								onConnected={handleWiFiConnected}
								onSkip={handleWiFiSkip}
							/>
						) : connectionQuality === 'slow' ? (
							<WiFiQuickConnect
								credentials={wifiCredentials}
								onConnect={() => setShowWiFiInterface(true)}
								onSkip={handleWiFiSkip}
							/>
						) : null}
					</div>
				)}

				<CardContent className="p-4 pt-3 pb-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
							{/* Jenis Transaksi Select - Mobile Optimized */}
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel className="text-sm font-medium text-gray-700">Jenis Transaksi</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value}>
											<FormControl>
												<SelectTrigger className="h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-gray-50/50">
													<SelectValue placeholder="Pilih jenis transaksi" />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="rounded-xl border-gray-200">
												{transactionTypes.map((type) => (
													<SelectItem key={type.value} value={type.value} className="text-base py-3">{type.label}</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							{/* E-Wallet Fields - Mobile Optimized */}
							{isEWallet && (
								<div className="space-y-3 p-3 bg-blue-50/30 rounded-xl border border-blue-100/50 animate-fade-in">
									<Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-100 text-blue-800 border-0">💳 Top Up E-Wallet</Badge>
									<FormField
										control={form.control}
										name="ewallet"
										render={({ field }) => (
											<FormItem className="space-y-2">
												<FormLabel className="text-sm font-medium text-gray-700">Pilih E-Wallet</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value}>
													<FormControl>
														<SelectTrigger className="h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white">
															<SelectValue placeholder="Pilih jenis e-wallet" />
														</SelectTrigger>
													</FormControl>
													<SelectContent className="rounded-xl border-gray-200">
														{eWallets.map((ew) => (
															<SelectItem key={ew.value} value={ew.value} className="text-base py-3">{ew.label}</SelectItem>
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
											<FormItem className="space-y-2">
												<FormLabel className="text-sm font-medium text-gray-700">No. HP E-Wallet</FormLabel>
												<FormControl>
													<Input 
														type="tel" 
														inputMode="numeric"
														placeholder="08xxxxxxxxxx" 
														{...field}
														className="h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white"
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
											<FormItem className="space-y-2">
												<FormLabel className="text-sm font-medium text-gray-700">Nominal Top Up</FormLabel>
												<FormControl>
													<Input 
														type="text"
														inputMode="numeric"
														pattern="[0-9]*"
														placeholder="Rp 0" 
														value={field.value ? formatRupiah(field.value) : ""}
														onChange={(e) => {
															const numericValue = parseRupiahValue(e.target.value);
															field.onChange(numericValue);
														}}
														className="h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white"
													/>
												</FormControl>
												<FormDescription className="text-xs text-gray-500">
													Nominal minimal Rp10.000, maksimal 10 juta
												</FormDescription>
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

							{/* Transfer Fields - Mobile Optimized */}
							{isTransfer && (
								<div className="space-y-3 p-3 bg-green-50/30 rounded-xl border border-green-100/50 animate-fade-in">
									<Badge variant="secondary" className="text-xs px-2 py-1 bg-green-100 text-green-800 border-0">💸 Transfer Bank</Badge>
									
									{/* Metode Transfer - Mobile Optimized */}
									<div className="space-y-2">
										<FormLabel className="text-sm font-medium text-gray-700">Metode Transfer</FormLabel>
										<div className="grid grid-cols-1 gap-2">
											{transferMethods.map((method) => (
												<button
													key={method.value}
													type="button"
													className={`w-full rounded-xl border-2 px-4 py-3 text-base font-medium transition-all duration-200 touch-manipulation
														${transferMethod === method.value
															? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
															: "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50"}
													`}
													onClick={() => setTransferMethod(method.value)}
												>
													{method.label}
												</button>
											))}
										</div>
										{transferMethod && (
											<div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
												<p className="text-sm text-blue-700 font-medium leading-relaxed">
													{transferMethod === "tunai" && "💰 Transfer akan dilakukan dengan uang tunai ke rekening tujuan"}
													{transferMethod === "transfer_atm_edc" && "💳 Transfer menggunakan ATM/Mesin EDC untuk proses yang lebih cepat"}
												</p>
											</div>
										)}
									</div>

									<FormField
										control={form.control}
										name="bank"
										render={({ field }) => (
											<FormItem className="space-y-2">
												<FormLabel>Bank Tujuan</FormLabel>
												<FormControl>
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Pilih bank tujuan" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{bankOptions.map((bank) => (
																<SelectItem key={bank.value} value={bank.value}>
																	{bank.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Field Manual untuk Bank Lainnya */}
									{form.watch("bank") === "Lainnya" && (
										<FormField
											control={form.control}
											name="manualBankName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Nama Bank</FormLabel>
													<FormControl>
														<Input 
															{...field}
															placeholder="Masukkan nama bank" 
															className="text-base"
															value={manualBankName}
															onChange={(e) => {
																field.onChange(e.target.value);
																setManualBankName(e.target.value);
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}

									<FormField
										control={form.control}
										name="accountNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nomor Rekening</FormLabel>
												<FormControl>
													<Input 
														{...field}
														inputMode="numeric"
														pattern="[0-9]*"
														placeholder="Masukkan nomor rekening" 
														className="text-base"
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
													<Input type="text" placeholder="Masukkan nama penerima" {...field} />
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
												<FormLabel>Nominal Transfer</FormLabel>
												<FormControl>
													<Input 
														type="text"
														inputMode="numeric"
														pattern="[0-9]*"
														placeholder="Rp 0" 
														value={field.value ? formatRupiah(field.value) : ""}
														onChange={(e) => {
															const numericValue = parseRupiahValue(e.target.value);
															field.onChange(numericValue);
														}}
														className="h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white"
													/>
												</FormControl>
												<FormDescription>
													Nominal minimal Rp10.000, maksimal 10 juta
												</FormDescription>
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
										<div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
											<div className="text-center">
												<h3 className="font-semibold text-lg text-blue-800 mb-1">Transfer ke Rekening Outlet</h3>
												<p className="text-sm text-blue-600 mb-3">Pilih bank outlet untuk mendapatkan nomor rekening</p>
											</div>
											
											{/* Bank Selection Dropdown */}
											<div className="space-y-2">
												<FormLabel className="text-blue-800 font-medium">Pilih Bank Outlet</FormLabel>
												<Select
													value={selectedOutletBank}
													onValueChange={setSelectedOutletBank}
												>
													<SelectTrigger className="w-full bg-white border-blue-300 focus:border-blue-500">
														<SelectValue placeholder="Pilih bank outlet yang tersedia" />
													</SelectTrigger>
													<SelectContent>
														{outletBankAccounts.map((bank) => (
															<SelectItem key={bank.bankCode} value={bank.bankCode}>
																{bank.bankName}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>

											{/* Bank Account Details */}
											{selectedOutletBank && (() => {
												const selectedBank = outletBankAccounts.find(bank => bank.bankCode === selectedOutletBank);
												if (!selectedBank) return null;
												
												return (
													<div className="bg-white rounded-lg p-4 border border-blue-300 space-y-3">
														<div className="text-center mb-3">
															<h4 className="font-semibold text-gray-800">{selectedBank.bankName}</h4>
															<p className="text-sm text-gray-600">Rekening Outlet QR Tunai</p>
														</div>
														
														{/* Bank Outlet Account Name - Small and compact */}
														<div className="text-center">
															<p className="text-xs text-gray-500 uppercase tracking-wide">Atas Nama</p>
															<p className="text-sm font-medium text-gray-700 mb-2">{selectedBank.accountName}</p>
														</div>

														{/* Account Number with Copy */}
														<div className="space-y-2">
															<label className="text-sm font-medium text-gray-700">Nomor Rekening:</label>
															<div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
																<span className="font-mono text-lg font-bold text-gray-800 flex-1">
																	{selectedBank.accountNumber}
																</span>
																<CopyButton 
																	textToCopy={selectedBank.accountNumber}
																	label="Salin"
																/>
															</div>
														</div>

														{/* Instructions */}
														<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
															<p className="text-sm text-amber-800 font-medium mb-1">📋 Instruksi:</p>
															<p className="text-sm text-amber-700">{selectedBank.instructions}</p>
														</div>
													</div>
												);
											})()}
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
											<p className="font-semibold text-lg">Gunakan kartu ATM di mesin EDC.</p>
											<p className="text-xs text-gray-500">Petugas akan memproses transaksi melalui mesin EDC.</p>
										</div>
									)}
									
									<FormField
										control={form.control}
										name="customerName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nama</FormLabel>
												<FormControl>
													<Input type="text" placeholder="Masukkan nama Anda" {...field} />
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
												<FormLabel>Nominal Tarik Tunai</FormLabel>
												<FormControl>
													<Input 
														type="text"
														inputMode="numeric"
														pattern="[0-9]*"
														placeholder="Rp 0" 
														value={field.value ? formatRupiah(field.value) : ""}
														onChange={(e) => {
															const numericValue = parseRupiahValue(e.target.value);
															field.onChange(numericValue);
														}}
														className="h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white"
													/>
												</FormControl>
												<FormDescription>
													{tarikMethod === "qris" ? "Maksimal Rp1.000.000 untuk QRIS" : "Nominal minimal Rp10.000, maksimal 10 juta"}
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
									
									<FormField
										control={form.control}
										name="notes"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Catatan</FormLabel>
												<FormControl>
													<Textarea placeholder="Catatan tambahan (opsional)" {...field} />
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
												<FormLabel>Bank Tujuan</FormLabel>
												<FormControl>
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Pilih bank tujuan" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{bankOptions.map((bank) => (
																<SelectItem key={bank.value} value={bank.value}>
																	{bank.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Field Manual untuk Bank Lainnya - Setor */}
									{form.watch("bank") === "Lainnya" && (
										<FormField
											control={form.control}
											name="manualBankName"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Nama Bank</FormLabel>
													<FormControl>
														<Input 
															{...field}
															placeholder="Masukkan nama bank" 
															className="text-base"
															value={manualBankName}
															onChange={(e) => {
																field.onChange(e.target.value);
																setManualBankName(e.target.value);
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}

									<FormField
										control={form.control}
										name="accountNumber"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nomor Rekening</FormLabel>
												<FormControl>
													<Input type="text" placeholder="Masukkan nomor rekening" {...field} />
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
												<FormLabel>Nama Pemilik Rekening</FormLabel>
												<FormControl>
													<Input type="text" placeholder="Masukkan nama pemilik rekening" {...field} />
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
												<FormLabel>Nominal Setor Tunai</FormLabel>
												<FormControl>
													<Input 
														type="text"
														inputMode="numeric"
														pattern="[0-9]*"
														placeholder="Rp 0" 
														value={field.value ? formatRupiah(field.value) : ""}
														onChange={(e) => {
															const numericValue = parseRupiahValue(e.target.value);
															field.onChange(numericValue);
														}}
														className="h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white"
													/>
												</FormControl>
												<FormDescription>
													Nominal minimal Rp10.000, maksimal 10 juta
												</FormDescription>
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

									{/* Field Manual untuk Pembayaran Lainnya */}
									{paymentType === "lainnya" && (
										<FormField
											control={form.control}
											name="manualPaymentType"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Jenis Pembayaran Lainnya</FormLabel>
													<FormControl>
														<Input 
															className="text-base"
															type="text"
															placeholder="Contoh: Sewa Apartemen"
															value={manualPaymentType}
															onChange={(e) => {
																setManualPaymentType(e.target.value);
																field.onChange(e.target.value);
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}

									{/* Field untuk Nama Instansi Pembayaran - Tampil untuk semua jenis pembayaran */}
									{paymentType && (
										<FormField
											control={form.control}
											name="paymentInstitution"
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{paymentType === "angsuran" && "Nama Lembaga Pembiayaan"}
														{paymentType === "virtual_account" && "Nama Bank Virtual Account"}
														{paymentType === "tagihan_bulanan" && "Nama Instansi/Perusahaan"}
														{paymentType === "lainnya" && "Nama Instansi"}
													</FormLabel>
													<FormControl>
														<Input 
															className="h-12 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white"
															type="text"
															placeholder={
																paymentType === "angsuran" ? "Contoh: ADIRA Finance, WOM Finance, BAF" :
																paymentType === "virtual_account" ? "Contoh: VA BRI, VA BCA, VA Mandiri" :
																paymentType === "tagihan_bulanan" ? "Contoh: PDAM, PLN, Telkom, PDAM Tirta" :
																"Masukkan nama instansi"
															}
															value={paymentInstitution}
															onChange={(e) => {
																setPaymentInstitution(e.target.value);
																field.onChange(e.target.value);
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}

									<div>
										<FormLabel>ID Pelanggan / Nomor Pembayaran</FormLabel>
										<Input 
											className="text-base"
											type="text"
											inputMode="numeric"
											placeholder="Contoh: 1234567890" 
										/>
									</div>

									<FormField
										control={form.control}
										name="amount"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Nominal</FormLabel>
												<FormControl>
													<Input 
														className="text-base"
														type="text"
														inputMode="numeric"
														pattern="[0-9]*"
														placeholder="Rp 0" 
														value={field.value ? formatRupiah(field.value) : ""}
														onChange={(e) => {
															const numericValue = parseRupiahValue(e.target.value);
															field.onChange(numericValue);
														}}
													/>
												</FormControl>
												<FormDescription>
													Nominal minimal Rp10.000, maksimal 10 juta
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}

							{/* Customer Info Fields (conditional) */}
							{watchType && !isTarik && !isTransfer && !isSetor && !isEWallet && !isPembayaran && (
								<FormField
									control={form.control}
									name="customerName"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Nama Customer</FormLabel>
											<FormControl>
												<Input type="text" placeholder="Masukkan nama customer" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							{/* Submit button - Mobile Optimized */}
							<div className="pt-2">
								<Button 
									type="submit" 
									size="lg"
									className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
									disabled={isSubmitting || isRedirecting}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
											Memproses...
										</>
									) : isRedirecting ? (
										<>
											<Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
											Mengalihkan ke halaman utama...
										</>
									) : (
										'Proses Transaksi'
									)}
								</Button>
							</div>

							{/* Redirect Countdown Display - Mobile Optimized */}
							{isRedirecting && countdown > 0 && (
								<div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl text-center animate-fade-in">
									<div className="flex items-center justify-center mb-2">
										<CheckCircle className="h-6 w-6 text-green-600 mr-2" />
										<span className="text-green-800 font-semibold">Transaksi Berhasil!</span>
									</div>
									<p className="text-green-700 text-sm mb-2">
										Untuk keamanan, Anda akan dialihkan ke halaman utama dalam:
									</p>
									<div className="text-2xl font-bold text-green-800 mb-2">
										{countdown} detik
									</div>
									<div className="flex items-center justify-center text-xs text-green-600">
										<Store className="h-4 w-4 mr-1" />
										<span>Kembali ke Layanan Outlet</span>
									</div>
								</div>
							)}

							{/* Terms & Conditions - Mobile Optimized */}
							<div className="text-center text-xs text-gray-500 mt-3 px-2 leading-relaxed">
								<p>Dengan memproses transaksi, Anda menyetujui <Link href="/terms" className="text-blue-600 hover:text-blue-700 underline font-medium">Syarat & Ketentuan</Link> layanan kami.</p>
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
			</div>
			)}

			{/* Back to Top Button untuk Mobile */}
			{showBackToTop && (
				<button
					onClick={scrollToTop}
					className="fixed bottom-4 right-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 md:hidden"
					aria-label="Scroll to top"
				>
					<svg 
						className="w-5 h-5" 
						fill="none" 
						stroke="currentColor" 
						viewBox="0 0 24 24"
					>
						<path 
							strokeLinecap="round" 
							strokeLinejoin="round" 
							strokeWidth={2} 
							d="M5 10l7-7m0 0l7 7m-7-7v18" 
						/>
					</svg>
				</button>
			)}
		</>
	);
}

