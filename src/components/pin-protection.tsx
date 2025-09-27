'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePinStore } from '@/lib/pin-store';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface PinProtectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function PinProtection({ 
  children, 
  title = "Area Terbatas",
  description = "Masukkan PIN untuk mengakses halaman ini" 
}: PinProtectionProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const router = useRouter();
  const { 
    authenticate, 
    isSessionValid, 
    extendSession,
    logout 
  } = usePinStore();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    if (isSessionValid()) {
      setIsAuthenticated(true);
      extendSession(); // Extend session on page access
    } else {
      setIsAuthenticated(false);
      setShowDialog(true);
    }
  }, [isSessionValid, extendSession]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!pin.trim()) {
      setError('PIN harus diisi');
      return;
    }

    if (authenticate(pin)) {
      setIsAuthenticated(true);
      setShowDialog(false);
      setPin('');
      setError('');
    } else {
      setError('PIN salah. Hubungi penanggung jawab.');
      setPin('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setShowDialog(true);
    setPin('');
    setError('');
  };

  const handleGoBack = () => {
    router.back(); // Navigate back to previous page
  };

  // Show dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <Dialog open={showDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-red-700">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handlePinSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="pin">PIN Akses</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  placeholder="Masukkan PIN"
                  className="pl-10 pr-12"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={10}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Masuk
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            </div>
            
            <div className="text-xs text-center text-gray-500 mt-4">
              <p>Hanya penanggung jawab yang memiliki akses PIN</p>
              <p>Hubungi supervisor jika Anda memerlukan bantuan</p>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Show protected content with logout button
  return (
    <div className="relative">
      {/* Logout button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
        >
          <Shield className="h-4 w-4 mr-2" />
          Keluar PIN
        </Button>
      </div>
      
      {children}
    </div>
  );
}