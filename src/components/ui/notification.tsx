"use client";

import React from 'react';
import { CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { Button } from './button';

interface NotificationProps {
  type: 'loading' | 'success' | 'error';
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
}

export function Notification({ 
  type, 
  title, 
  message, 
  onClose, 
  duration = 5000 
}: NotificationProps) {
  React.useEffect(() => {
    if (type !== 'loading' && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [type, duration, onClose]);

  const getNotificationStyles = () => {
    switch (type) {
      case 'loading':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={`
      fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm w-full sm:w-auto
      border-2 transition-all duration-300 ease-in-out transform
      ${getNotificationStyles()}
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight">
            {title}
          </div>
          {message && (
            <div className="mt-1 text-xs opacity-90 leading-relaxed">
              {message}
            </div>
          )}
        </div>

        {type !== 'loading' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-black/10 rounded-full"
            aria-label="Tutup notifikasi"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Hook untuk menggunakan notification dengan state management
export function useNotification() {
  const [notification, setNotification] = React.useState<{
    type: 'loading' | 'success' | 'error';
    title: string;
    message?: string;
  } | null>(null);

  const showNotification = React.useCallback((
    type: 'loading' | 'success' | 'error', 
    title: string, 
    message?: string
  ) => {
    setNotification({ type, title, message });
  }, []);

  const hideNotification = React.useCallback(() => {
    setNotification(null);
  }, []);

  const NotificationComponent = notification ? (
    <Notification
      type={notification.type}
      title={notification.title}
      message={notification.message}
      onClose={hideNotification}
    />
  ) : null;

  return {
    showNotification,
    hideNotification,
    NotificationComponent
  };
}