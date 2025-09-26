import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQrToken } from './useQrToken';

// Mock fetch
global.fetch = vi.fn();


// Enhanced Mock EventSource with instance tracking
const eventSourceInstances: any[] = [];
class MockEventSource {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState = 1;
  constructor(url: string) {
    this.url = url;
    eventSourceInstances.push(this);
  }
  close() {
    this.readyState = 2;
  }
  dispatchMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }));
    }
  }
  dispatchError() {
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
}
global.EventSource = MockEventSource as any;

describe('useQrToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useQrToken());
    
    expect(result.current.token).toBeNull();
    expect(result.current.status).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should generate token successfully', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ success: true }),
    };
    
    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useQrToken({ ttlSeconds: 60 }));

    await act(async () => {
      await result.current.generateToken();
    });

    expect(result.current.token).not.toBeNull();
    expect(result.current.token?.id).toBeDefined();
    expect(result.current.token?.token).toBeDefined();
    expect(result.current.status?.status).toBe('pending');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle token generation error', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
    };
    
    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useQrToken());

    await act(async () => {
      await result.current.generateToken();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.error).toBe('Failed to generate token');
    expect(result.current.isLoading).toBe(false);
  });

  it('should consume token successfully', async () => {
    // First generate a token
    const generateResponse = {
      ok: true,
      json: () => Promise.resolve({ success: true }),
    };
    
    const consumeResponse = {
      ok: true,
      json: () => Promise.resolve({ success: true }),
    };
    
    (global.fetch as any)
      .mockResolvedValueOnce(generateResponse)
      .mockResolvedValueOnce(consumeResponse);

    const { result } = renderHook(() => useQrToken());

    // Generate token
    await act(async () => {
      await result.current.generateToken();
    });

    // Consume token
    await act(async () => {
      const consumed = await result.current.consumeToken();
      expect(consumed).toBe(true);
    });

    expect(result.current.token?.isConsumed).toBe(true);
    expect(result.current.status?.status).toBe('consumed');
  });

  it('should handle token consumption errors', async () => {
    const { result } = renderHook(() => useQrToken());

    // Try to consume without generating
    await act(async () => {
      const consumed = await result.current.consumeToken();
      expect(consumed).toBe(false);
    });

    expect(result.current.error).toBe('No token to consume');
  });

  it('should handle token expiry with auto cleanup', async () => {
    const onExpire = vi.fn();
    const mockResponse = { ok: true, json: () => Promise.resolve({ success: true }) };
    (global.fetch as any).mockResolvedValueOnce(mockResponse);
    vi.useFakeTimers();
    const { result } = renderHook(() => useQrToken({ ttlSeconds: 1, autoCleanup: true, onExpire }));
    await act(async () => {
      await result.current.generateToken();
    });
    // Fast forward time to trigger expiry
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(onExpire).toHaveBeenCalledWith(expect.any(String));
    vi.useRealTimers();
  });

  it('should setup SSE connection on token generation', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ success: true }),
    };
    
    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useQrToken());

    await act(async () => {
      await result.current.generateToken();
    });

    // Check if EventSource was created with correct URL
    expect(result.current.token?.id).toBeDefined();
  });

  it('should handle SSE status updates', async () => {
    const onView = vi.fn();
    const onConsume = vi.fn();
    const mockResponse = { ok: true, json: () => Promise.resolve({ success: true }) };
    (global.fetch as any).mockResolvedValueOnce(mockResponse);
    eventSourceInstances.length = 0;
    const { result } = renderHook(() => useQrToken({ onView, onConsume }));
    await act(async () => {
      await result.current.generateToken();
    });
    // Simulate SSE message for view
    const mockEventSource = eventSourceInstances[0];
    if (mockEventSource) {
      act(() => {
        mockEventSource.dispatchMessage({
          id: result.current.token?.id,
          status: 'viewed',
          viewedAt: Date.now(),
        });
      });
      expect(onView).toHaveBeenCalledWith(result.current.token?.id);
    }
  });

  it('should clear token and cleanup resources', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ success: true }),
    };
    
    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useQrToken());

    await act(async () => {
      await result.current.generateToken();
    });

    act(() => {
      result.current.clearToken();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.status).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should refresh token status', async () => {
    const generateResponse = {
      ok: true,
      json: () => Promise.resolve({ success: true }),
    };
    
    const statusResponse = {
      ok: true,
      json: () => Promise.resolve({
        id: 'test-id',
        status: 'viewed',
        viewedAt: Date.now(),
      }),
    };
    
    (global.fetch as any)
      .mockResolvedValueOnce(generateResponse)
      .mockResolvedValueOnce(statusResponse);

    const { result } = renderHook(() => useQrToken());

    await act(async () => {
      await result.current.generateToken();
    });

    await act(async () => {
      await result.current.refreshStatus();
    });

    expect(result.current.status?.status).toBe('viewed');
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useQrToken());

    await act(async () => {
      await result.current.generateToken();
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.token).toBeNull();
  });
});