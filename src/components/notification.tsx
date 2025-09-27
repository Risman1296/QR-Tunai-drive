import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error' | null;
  message: string;
  onClose?: () => void;
}

export function Notification({ type, message, onClose }: NotificationProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (type && message) {
      setVisible(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [type, message, onClose]);
  
  if (!visible || !type || !message) return null;
  
  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';
  
  return (
    <div className={`fixed top-4 right-4 max-w-md p-4 rounded-md shadow-md border ${bgColor} z-50`}>
      <div className="flex gap-3">
        {type === 'success' ? (
          <CheckCircle className={`h-5 w-5 ${iconColor}`} />
        ) : (
          <AlertCircle className={`h-5 w-5 ${iconColor}`} />
        )}
        <div className={`flex-1 ${textColor}`}>{message}</div>
        <button 
          onClick={() => {
            setVisible(false);
            if (onClose) onClose();
          }}
          className="text-gray-500 hover:text-gray-700"
          title="Tutup notifikasi"
          aria-label="Tutup notifikasi"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}