"use client";

import { useEffect, useState } from 'react';
import { useShiftStore, getCurrentShiftName } from '@/lib/shift-store';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

export default function ShiftStatusWidget() {
  const { 
    currentShift, 
    setCurrentShift, 
    getCurrentShiftEmployees,
    isShiftActive
  } = useShiftStore();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update current shift on mount and every minute
    setCurrentShift();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setCurrentShift();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [setCurrentShift]);

  const currentEmployees = getCurrentShiftEmployees();
  const shiftName = getCurrentShiftName();

  // Simple notification status only
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-qr-blue-500" />
          <Badge variant={currentShift && isShiftActive(currentShift) ? "default" : "secondary"} className="flex items-center gap-1">
            {currentShift && isShiftActive(currentShift) ? "🟢" : "🔴"} {shiftName || "Tidak Ada Shift"}
          </Badge>
        </div>
        {currentEmployees.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{currentEmployees[0].name}</span>
            {currentEmployees.length > 1 && (
              <span>+{currentEmployees.length - 1}</span>
            )}
          </div>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        {currentTime.toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  );
}