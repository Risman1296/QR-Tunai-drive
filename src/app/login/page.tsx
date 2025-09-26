'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '', // This will be phone number for employees or username for admin
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // State untuk pemeriksaan awal
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user is already logged in dengan cleanup
  useEffect(() => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          signal: abortController.signal,
          cache: 'no-store',
          credentials: 'include',
        });
        
        if (response.ok) {
          router.push('/dashboard');
          return;
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error.name === 'AbortError') return;
        // User is not logged in, stay on login page
      } finally {
        if (!abortController.signal.aborted) {
          setIsCheckingAuth(false);
        }
      }
    };

    checkAuth();

    // Cleanup function
    return () => {
      abortController.abort();
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, [router]);

  // Debounced submit handler untuk mencegah double click
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');

    // Clear any existing timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        // Ensure cookies from the response are stored
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Login Berhasil',
          description: `Selamat datang, ${data.user.name}!`,
        });

        // Confirm cookie/session is active before redirecting
        // Try a quick check to /api/auth/me with a short timeout
        try {
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), 1500);
          const meRes = await fetch('/api/auth/me', {
            signal: controller.signal,
            cache: 'no-store',
            credentials: 'include',
          });
          clearTimeout(t);
          if (!meRes.ok) {
            // Fallback small delay if cookie not immediately readable
            await new Promise(r => setTimeout(r, 300));
          }
        } catch {
          // Ignore, proceed to redirect
        }

        // Use replace to avoid back navigation to login
        router.replace('/dashboard');

        // Fallback: if still on /login after a short delay, force navigation
        submitTimeoutRef.current = setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname === '/login') {
            window.location.assign('/dashboard');
          }
        }, 1000);
      } else {
        setError(data.error || 'Login gagal');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      setError('Terjadi kesalahan jaringan, silakan coba lagi');
    } finally {
      setIsLoading(false);
    }
  }, [credentials, isLoading, router, toast]);

  // Loading screen saat mengecek autentikasi
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-qr-blue-50 to-qr-yellow-50">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-qr-blue-600" />
            <p className="text-qr-blue-600 font-medium">Memeriksa status login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-qr-blue-50 to-qr-yellow-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-qr-blue-500/10 p-4 rounded-full border-2 border-qr-yellow-400/30">
              <div className="relative">
                <Lock className="h-8 w-8 text-qr-blue-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-qr-yellow-500 rounded-full"></div>
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            <span className="text-qr-blue-700">QR</span>
            <span className="text-qr-yellow-600">Tunai</span> Drive
          </CardTitle>
          <CardDescription className="text-qr-blue-500">
            Masuk ke dashboard kasir menggunakan nomor HP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" id="login-error" role="alert">
                <AlertDescription className="font-medium">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Nomor HP / Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="081234567890 atau username admin"
                  className="pl-10"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Karyawan: gunakan nomor HP terdaftar • Admin: gunakan username
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  className="pl-10 pr-10"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? 
                    <EyeOff className="h-4 w-4" aria-hidden="true" /> : 
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  }
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-qr-blue-600 hover:bg-qr-blue-700 text-white font-semibold py-3 shadow-lg transition-all duration-200" 
              disabled={isLoading || !credentials.username.trim() || !credentials.password.trim()}
              aria-describedby={error ? "login-error" : undefined}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {isLoading ? 'Sedang masuk...' : 'Masuk ke Dashboard'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-qr-blue-400">
              © 2025 QR-Tunai Drive. Semua hak dilindungi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
