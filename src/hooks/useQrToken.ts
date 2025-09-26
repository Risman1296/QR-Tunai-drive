import { useState, useEffect, useRef, useCallback } from 'react';

// Types
export interface QrToken {
  id: string;
  token: string;
  expiresAt: number;
  isConsumed: boolean;
  createdAt: number;
}

export interface QrTokenStatus {
  id: string;
  status: 'pending' | 'viewed' | 'consumed' | 'expired';
  viewedAt?: number;
  consumedAt?: number;
}

export interface UseQrTokenOptions {
  ttlSeconds?: number;
  autoCleanup?: boolean;
  onView?: (tokenId: string) => void;
  onConsume?: (tokenId: string) => void;
  onExpire?: (tokenId: string) => void;
}

export interface UseQrTokenReturn {
  token: QrToken | null;
  status: QrTokenStatus | null;
  isLoading: boolean;
  error: string | null;
  generateToken: () => Promise<void>;
  consumeToken: () => Promise<boolean>;
  clearToken: () => void;
  refreshStatus: () => Promise<void>;
}

// Generate unique token ID
function generateTokenId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `qr_${timestamp}_${random}`;
}

// Generate secure token
function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function useQrToken(options: UseQrTokenOptions = {}): UseQrTokenReturn {
  const {
    ttlSeconds = 60,
    autoCleanup = true,
    onView,
    onConsume,
    onExpire,
  } = options;

  const [token, setToken] = useState<QrToken | null>(null);
  const [status, setStatus] = useState<QrTokenStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const cleanupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup SSE connection for token status updates
  const setupSSE = useCallback((tokenId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/tokens/${tokenId}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const statusUpdate: QrTokenStatus = JSON.parse(event.data);
        setStatus(statusUpdate);

        // Trigger callbacks based on status
        switch (statusUpdate.status) {
          case 'viewed':
            onView?.(tokenId);
            break;
          case 'consumed':
            onConsume?.(tokenId);
            break;
          case 'expired':
            onExpire?.(tokenId);
            break;
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = (event) => {
      console.error('SSE connection error:', event);
      setError('Connection lost');
    };

    return eventSource;
  }, [onView, onConsume, onExpire]);

  // Generate new QR token
  const generateToken = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use new centralized token API
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 50000, // Default amount, should be configurable
          description: 'Drive-Thru Payment',
          ttlSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }
      const data: { id: string; expiresAt: number } = await response.json();

      const newToken: QrToken = {
        id: data.id,
        token: data.id, // Use ID as token for simplicity
        expiresAt: data.expiresAt,
        isConsumed: false,
        createdAt: Date.now(),
      };

      setToken(newToken);
      setStatus({
        id: data.id,
        status: 'pending',
      });

      // Setup SSE for status updates
      setupSSE(data.id);

      // Setup auto cleanup timer
      if (autoCleanup) {
        if (cleanupTimerRef.current) {
          clearTimeout(cleanupTimerRef.current);
        }

        cleanupTimerRef.current = setTimeout(() => {
          setStatus(prev => prev ? { ...prev, status: 'expired' } : null);
          onExpire?.(data.id);
          clearToken();
        }, ttlSeconds * 1000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate token';
      setError(message);
      console.error('Error generating QR token:', err);
    } finally {
      setIsLoading(false);
    }
  }, [ttlSeconds, autoCleanup, setupSSE, onExpire]);

  // Consume token (one-time use)
  const consumeToken = useCallback(async (): Promise<boolean> => {
    if (!token) {
      setError('No token to consume');
      return false;
    }

    if (token.isConsumed) {
      setError('Token already consumed');
      return false;
    }

    if (Date.now() > token.expiresAt) {
      setError('Token expired');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tokens/${token.id}/consume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: 'Customer', // Default name, should be configurable
        }),
      });

      if (!response.ok) {
        if (response.status === 410) {
          throw new Error('Token already consumed');
        }
        if (response.status === 404) {
          throw new Error('Token expired');
        }
        throw new Error('Failed to consume token');
      }

      setToken(prev => prev ? { ...prev, isConsumed: true } : null);
      setStatus(prev => prev ? { ...prev, status: 'consumed', consumedAt: Date.now() } : null);
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to consume token';
      setError(message);
      console.error('Error consuming QR token:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Clear current token and cleanup
  const clearToken = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    setToken(null);
    setStatus(null);
    setError(null);
  }, []);

  // Refresh token status
  const refreshStatus = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`/api/tokens/${token.id}/status`);
      if (response.ok) {
        const statusUpdate: QrTokenStatus = await response.json();
        setStatus(statusUpdate);
      }
    } catch (err) {
      console.error('Error refreshing token status:', err);
    }
  }, [token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
      }
    };
  }, []);

  // Check for expired tokens
  useEffect(() => {
    if (!token || token.isConsumed) return;

    const checkExpiry = () => {
      if (Date.now() > token.expiresAt) {
        setStatus(prev => prev ? { ...prev, status: 'expired' } : null);
        onExpire?.(token.id);
        if (autoCleanup) {
          clearToken();
        }
      }
    };

    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [token, autoCleanup, onExpire, clearToken]);

  return {
    token,
    status,
    isLoading,
    error,
    generateToken,
    consumeToken,
    clearToken,
    refreshStatus,
  };
}
