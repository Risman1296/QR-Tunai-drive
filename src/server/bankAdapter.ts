import { z } from 'zod';

// Zod Schemas
export const AccountIdSchema = z.string().min(1, 'Account ID is required');

export const MutationQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const BalanceResponseSchema = z.object({
  accountId: z.string(),
  balance: z.number(),
  currency: z.string().default('IDR'),
  lastUpdated: z.string().datetime(),
});

export const MutationSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  timestamp: z.string().datetime(),
  type: z.enum(['DEBIT', 'CREDIT']),
  amount: z.number(),
  description: z.string(),
  reference: z.string().optional(),
  balance: z.number(),
});

export const MutationResponseSchema = z.object({
  accountId: z.string(),
  mutations: z.array(MutationSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    hasNext: z.boolean(),
  }),
});

export const BankErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  hint: z.string().optional(),
});

// Types
export type AccountId = z.infer<typeof AccountIdSchema>;
export type MutationQuery = z.infer<typeof MutationQuerySchema>;
export type BalanceResponse = z.infer<typeof BalanceResponseSchema>;
export type MutationResponse = z.infer<typeof MutationResponseSchema>;
export type BankError = z.infer<typeof BankErrorSchema>;

// In-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private ttl = 30 * 1000; // 30 seconds

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new MemoryCache();

// Retry utility with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Mock API calls (replace with actual bank API integration)
async function mockBankApiCall<T>(endpoint: string, params?: any): Promise<T> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  // Simulate random failures for testing retry logic
  if (Math.random() < 0.1) {
    throw new Error('Network timeout');
  }
  
  // Mock data generation based on endpoint
  if (endpoint.includes('/balance')) {
    return {
      accountId: params?.accountId || '12345',
      balance: 1500000,
      currency: 'IDR',
      lastUpdated: new Date().toISOString(),
    } as T;
  }
  
  if (endpoint.includes('/mutations')) {
    const mutations = Array.from({ length: 10 }, (_, i) => ({
      id: `mut_${Date.now()}_${i}`,
      accountId: params?.accountId || '12345',
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      type: i % 2 === 0 ? 'CREDIT' : 'DEBIT',
      amount: Math.floor(Math.random() * 500000) + 10000,
      description: `Transaction ${i + 1}`,
      reference: `REF_${i + 1}`,
      balance: 1500000 - (i * 50000),
    }));
    
    return {
      accountId: params?.accountId || '12345',
      mutations,
      pagination: {
        page: params?.page || 1,
        limit: params?.limit || 20,
        total: 100,
        hasNext: (params?.page || 1) < 5,
      },
    } as T;
  }
  
  throw new Error(`Unknown endpoint: ${endpoint}`);
}

// Error mapping utility
function mapBankError(error: any): BankError {
  if (error.message?.includes('timeout')) {
    return {
      code: 'TIMEOUT',
      message: 'Bank service is temporarily unavailable',
      hint: 'Please try again in a few moments',
    };
  }
  
  if (error.message?.includes('unauthorized')) {
    return {
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
      hint: 'Please check your bank API credentials',
    };
  }
  
  if (error.message?.includes('not found')) {
    return {
      code: 'ACCOUNT_NOT_FOUND',
      message: 'Account not found',
      hint: 'Please verify the account ID',
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred',
    hint: 'Please contact support if this persists',
  };
}

// Main adapter functions
export async function getBalance(accountId: string): Promise<BalanceResponse> {
  try {
    // Validate input
    const validAccountId = AccountIdSchema.parse(accountId);
    
    // Check cache first
    const cacheKey = `balance:${validAccountId}`;
    const cached = cache.get<BalanceResponse>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Make API call with retry
    const response = await retryWithBackoff(async () => {
      const result = await mockBankApiCall<any>('/balance', { accountId: validAccountId });
      return BalanceResponseSchema.parse(result);
    });
    
    // Cache the result
    cache.set(cacheKey, response);
    
    return response;
  } catch (error) {
    console.error('Bank adapter error (getBalance):', error);
    throw mapBankError(error);
  }
}

export async function getMutations(
  accountId: string,
  query: Partial<MutationQuery> = {}
): Promise<MutationResponse> {
  try {
    // Validate inputs
    const validAccountId = AccountIdSchema.parse(accountId);
    const validQuery = MutationQuerySchema.parse(query);
    
    // Check cache first
    const cacheKey = `mutations:${validAccountId}:${JSON.stringify(validQuery)}`;
    const cached = cache.get<MutationResponse>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Make API call with retry
    const response = await retryWithBackoff(async () => {
      const result = await mockBankApiCall<any>('/mutations', {
        accountId: validAccountId,
        ...validQuery,
      });
      return MutationResponseSchema.parse(result);
    });
    
    // Cache the result
    cache.set(cacheKey, response);
    
    return response;
  } catch (error) {
    console.error('Bank adapter error (getMutations):', error);
    throw mapBankError(error);
  }
}

// Utility to clear cache (for testing)
export function clearCache(): void {
  cache.clear();
}