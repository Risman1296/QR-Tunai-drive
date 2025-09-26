// QR Token Store - Centralized token management with TTL and one-time use
import { EventEmitter } from 'events';

export interface QrToken {
  id: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  isConsumed: boolean;
  viewedAt?: number;
  consumedAt?: number;
  metadata?: Record<string, any>;
}

export interface QrTokenStatus {
  id: string;
  status: 'pending' | 'viewed' | 'consumed' | 'expired';
  viewedAt?: number;
  consumedAt?: number;
  expiresAt: number;
  isConsumed: boolean;
}

class QrTokenStore extends EventEmitter {
  private tokens = new Map<string, QrToken>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    super();
    // Cleanup expired tokens every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 30000);
  }

  // Create a new token with TTL
  createToken(id: string, ttlSeconds: number = 60, metadata?: Record<string, any>): QrToken {
    const now = Date.now();
    const token: QrToken = {
      id,
      token: this.generateSecureToken(),
      createdAt: now,
      expiresAt: now + (ttlSeconds * 1000),
      isConsumed: false,
      metadata,
    };

    this.tokens.set(id, token);
    
    // Emit token created event
    this.emit('token:created', token);
    
    // Auto-expire token after TTL
    setTimeout(() => {
      this.expireToken(id);
    }, ttlSeconds * 1000);

    return token;
  }

  // Get token by ID
  getToken(id: string): QrToken | null {
    const token = this.tokens.get(id);
    if (!token) return null;
    
    // Check if expired
    if (Date.now() > token.expiresAt) {
      this.expireToken(id);
      return null;
    }
    
    return token;
  }

  // Mark token as viewed
  viewToken(id: string): QrTokenStatus | null {
    const token = this.getToken(id);
    if (!token) return null;

    if (!token.viewedAt) {
      token.viewedAt = Date.now();
      this.tokens.set(id, token);
      this.emit('token:viewed', token);
    }

    return this.getTokenStatus(id);
  }

  // Consume token (one-time use)
  consumeToken(id: string): { success: boolean; status: QrTokenStatus | null; error?: string } {
    const token = this.getToken(id);
    
    if (!token) {
      return { success: false, status: null, error: 'Token not found or expired' };
    }

    if (token.isConsumed) {
      return { success: false, status: this.getTokenStatus(id), error: 'Token already consumed' };
    }

    // Mark as consumed
    token.isConsumed = true;
    token.consumedAt = Date.now();
    this.tokens.set(id, token);

    const status = this.getTokenStatus(id);
    this.emit('token:consumed', token);

    return { success: true, status };
  }

  // Get token status
  getTokenStatus(id: string): QrTokenStatus | null {
    const token = this.tokens.get(id);
    if (!token) return null;

    const now = Date.now();
    let status: QrTokenStatus['status'];

    if (now > token.expiresAt) {
      status = 'expired';
    } else if (token.isConsumed) {
      status = 'consumed';
    } else if (token.viewedAt) {
      status = 'viewed';
    } else {
      status = 'pending';
    }

    return {
      id: token.id,
      status,
      viewedAt: token.viewedAt,
      consumedAt: token.consumedAt,
      expiresAt: token.expiresAt,
      isConsumed: token.isConsumed,
    };
  }

  // Expire token manually
  private expireToken(id: string): void {
    const token = this.tokens.get(id);
    if (token && !token.isConsumed && Date.now() > token.expiresAt) {
      this.emit('token:expired', token);
    }
  }

  // Cleanup expired tokens
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    const expiredIds: string[] = [];

    for (const [id, token] of this.tokens.entries()) {
      if (now > token.expiresAt) {
        expiredIds.push(id);
      }
    }

    expiredIds.forEach(id => {
      this.tokens.delete(id);
      this.emit('token:cleaned', id);
    });

    if (expiredIds.length > 0) {
      console.log(`Cleaned up ${expiredIds.length} expired tokens`);
    }
  }

  // Generate secure random token
  private generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Get all active tokens (for debugging)
  getAllTokens(): QrToken[] {
    return Array.from(this.tokens.values());
  }

  // Clear all tokens
  clearAll(): void {
    this.tokens.clear();
    this.emit('store:cleared');
  }

  // Cleanup resources
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clearAll();
    this.removeAllListeners();
  }
}

// Singleton instance
export const qrTokenStore = new QrTokenStore();

// Graceful shutdown
process.on('SIGINT', () => {
  qrTokenStore.destroy();
});

process.on('SIGTERM', () => {
  qrTokenStore.destroy();
});
