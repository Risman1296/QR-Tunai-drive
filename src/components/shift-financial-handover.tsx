'use client';

import { useState, useEffect } from 'react';
import { useFinancialStore } from '@/lib/financial-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  CreditCard, 
  Banknote, 
  AlertTriangle,
  CheckCircle,
  ArrowRightLeft,
  Clock,
  User,
  Calculator
} from 'lucide-react';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

interface ShiftFinancialHandoverProps {
  shiftId: string;
  shiftName: string;
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function ShiftFinancialHandover({ 
  shiftId, 
  shiftName, 
  userId, 
  userName,
  isOpen, 
  onClose, 
  onComplete 
}: ShiftFinancialHandoverProps) {
  const { 
    getAllAccounts, 
    startShiftFinancials, 
    endShiftFinancials,
    getCurrentShiftSummary 
  } = useFinancialStore();
  
  const [step, setStep] = useState<'start' | 'verify' | 'complete'>('start');
  const [actualBalances, setActualBalances] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [currentSummary, setCurrentSummary] = useState<any>(null);

  const accounts = getAllAccounts();

  useEffect(() => {
    if (isOpen) {
      const summary = getCurrentShiftSummary();
      setCurrentSummary(summary);
      
      if (!summary) {
        setStep('start');
        // Initialize actual balances with current balances
        const initialBalances: Record<string, number> = {};
        accounts.forEach(account => {
          initialBalances[account.id] = account.balance;
        });
        setActualBalances(initialBalances);
      } else {
        setStep('verify');
      }
    }
  }, [isOpen, getCurrentShiftSummary, accounts]);

  const handleStartShift = () => {
    startShiftFinancials(shiftId, userId, userName);
    setStep('verify');
    setCurrentSummary(getCurrentShiftSummary());
  };

  const handleEndShift = () => {
    endShiftFinancials(shiftId, actualBalances, notes);
    setStep('complete');
    onComplete();
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank': return <CreditCard className="h-4 w-4" />;
      case 'merchant': return <Wallet className="h-4 w-4" />;
      case 'cash': return <Banknote className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const calculateDiscrepancies = () => {
    const discrepancies: Array<{
      accountId: string;
      accountName: string;
      expected: number;
      actual: number;
      difference: number;
    }> = [];

    accounts.forEach(account => {
      const expected = account.balance;
      const actual = actualBalances[account.id] || 0;
      const difference = actual - expected;

      if (Math.abs(difference) > 0.01) {
        discrepancies.push({
          accountId: account.id,
          accountName: account.name,
          expected,
          actual,
          difference
        });
      }
    });

    return discrepancies;
  };

  const discrepancies = calculateDiscrepancies();
  const hasDiscrepancies = discrepancies.length > 0;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Serah Terima Keuangan - {shiftName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step: Start Shift */}
          {step === 'start' && (
            <div className="space-y-4">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <Clock className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">Mulai Shift Keuangan</h3>
                <p className="text-gray-600 mb-4">
                  Catat saldo awal untuk shift {shiftName}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>{userName}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Saldo Saat Ini:</h4>
                <div className="grid gap-3">
                  {accounts.map(account => (
                    <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getAccountIcon(account.type)}
                        <div>
                          <span className="font-medium">{account.name}</span>
                          <div className="text-xs text-gray-500">{account.type}</div>
                        </div>
                      </div>
                      <div className="font-mono font-bold">
                        {formatCurrency(account.balance)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleStartShift} className="w-full">
                Mulai Shift & Catat Saldo Awal
              </Button>
            </div>
          )}

          {/* Step: Verify & End Shift */}
          {step === 'verify' && currentSummary && (
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Verifikasi Saldo Akhir</h3>
                <p className="text-sm text-gray-600">
                  Masukkan saldo aktual di akhir shift untuk verifikasi
                </p>
              </div>

              {/* Current Shift Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Informasi Shift</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Petugas:</span>
                    <span className="font-medium">{currentSummary.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mulai:</span>
                    <span className="font-medium">
                      {new Date(currentSummary.startTime).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durasi:</span>
                    <span className="font-medium">
                      {Math.round((new Date().getTime() - new Date(currentSummary.startTime).getTime()) / (1000 * 60))} menit
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Account Verification */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Verifikasi Saldo
                </h4>
                {accounts.map(account => {
                  const openingBalance = currentSummary.openingBalance[account.id] || 0;
                  const expectedBalance = account.balance;
                  const actualBalance = actualBalances[account.id] || 0;
                  const difference = actualBalance - expectedBalance;

                  return (
                    <div key={account.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getAccountIcon(account.type)}
                          <div>
                            <h5 className="font-medium">{account.name}</h5>
                            <div className="text-xs text-gray-500">{account.type}</div>
                          </div>
                        </div>
                        <Badge variant="outline" style={{ borderColor: account.color, color: account.color }}>
                          Aktif
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                        <div>
                          <label className="text-gray-600">Saldo Awal:</label>
                          <div className="font-mono font-bold">
                            {formatCurrency(openingBalance)}
                          </div>
                        </div>
                        <div>
                          <label className="text-gray-600">Saldo Sistem:</label>
                          <div className="font-mono font-bold">
                            {formatCurrency(expectedBalance)}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`actual-${account.id}`}>Saldo Aktual:</Label>
                          <Input
                            id={`actual-${account.id}`}
                            type="number"
                            value={actualBalance}
                            onChange={(e) => setActualBalances(prev => ({
                              ...prev,
                              [account.id]: parseFloat(e.target.value) || 0
                            }))}
                            className="font-mono"
                          />
                        </div>
                      </div>

                      {Math.abs(difference) > 0.01 && (
                        <Alert className={difference > 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Selisih: {formatCurrency(Math.abs(difference))}</strong>
                            {difference > 0 ? " (Lebih)" : " (Kurang)"}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Discrepancy Summary */}
              {hasDiscrepancies && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <strong>Ditemukan {discrepancies.length} selisih:</strong>
                      {discrepancies.map((disc, idx) => (
                        <div key={idx} className="text-sm">
                          • {disc.accountName}: {formatCurrency(Math.abs(disc.difference))} 
                          {disc.difference > 0 ? " lebih" : " kurang"}
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan Serah Terima</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan penting untuk shift selanjutnya, penjelasan selisih (jika ada), dll..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleEndShift}
                  className="flex-1"
                  variant={hasDiscrepancies ? "destructive" : "default"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {hasDiscrepancies ? "Selesai dengan Selisih" : "Selesaikan Shift"}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Batal
                </Button>
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <div className="text-center p-6">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold mb-2">Serah Terima Selesai</h3>
              <p className="text-gray-600 mb-4">
                Shift {shiftName} telah diselesaikan dan dicatat dalam sistem keuangan.
              </p>
              <Button onClick={onClose}>Tutup</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShiftFinancialHandover;