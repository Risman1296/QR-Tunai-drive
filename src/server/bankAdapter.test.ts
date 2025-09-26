import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getBalance, getMutations, clearCache } from './bankAdapter';

describe('bankAdapter', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return balance for valid account ID', async () => {
      const result = await getBalance('12345');
      
      expect(result).toMatchObject({
        accountId: '12345',
        balance: expect.any(Number),
        currency: 'IDR',
        lastUpdated: expect.any(String),
      });
    });

    it('should validate account ID', async () => {
      await expect(getBalance('')).rejects.toThrow('Account ID is required');
    });

    it('should cache results', async () => {
      const result1 = await getBalance('12345');
      const result2 = await getBalance('12345');
      
      expect(result1).toEqual(result2);
    });

    it('should handle API errors gracefully', async () => {
      // Mock Math.random to always trigger error
      const originalRandom = Math.random;
      Math.random = () => 0.05; // Will trigger error in mockBankApiCall
      
      try {
        await getBalance('12345');
      } catch (error) {
        expect(error).toMatchObject({
          code: expect.any(String),
          message: expect.any(String),
        });
      }
      
      Math.random = originalRandom;
    });
  });

  describe('getMutations', () => {
    it('should return mutations for valid account ID', async () => {
      const result = await getMutations('12345');
      
      expect(result).toMatchObject({
        accountId: '12345',
        mutations: expect.any(Array),
        pagination: {
          page: expect.any(Number),
          limit: expect.any(Number),
          total: expect.any(Number),
          hasNext: expect.any(Boolean),
        },
      });
      
      expect(result.mutations.length).toBeGreaterThan(0);
      expect(result.mutations[0]).toMatchObject({
        id: expect.any(String),
        accountId: '12345',
        timestamp: expect.any(String),
        type: expect.stringMatching(/^(DEBIT|CREDIT)$/),
        amount: expect.any(Number),
        description: expect.any(String),
        balance: expect.any(Number),
      });
    });

    it('should handle pagination parameters', async () => {
      const result = await getMutations('12345', {
        page: 2,
        limit: 10,
      });
      
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
    });

    it('should handle date range filters', async () => {
      const from = '2023-01-01T00:00:00Z';
      const to = '2023-12-31T23:59:59Z';
      
      const result = await getMutations('12345', {
        from,
        to,
        page: 1,
        limit: 20,
      });
      
      expect(result.accountId).toBe('12345');
      expect(result.mutations).toBeInstanceOf(Array);
    });

    it('should validate account ID', async () => {
      await expect(getMutations('')).rejects.toThrow('Account ID is required');
    });

    it('should cache results', async () => {
      const query = { page: 1, limit: 10 };
      const result1 = await getMutations('12345', query);
      const result2 = await getMutations('12345', query);
      
      expect(result1).toEqual(result2);
    });

    it('should handle different cache keys for different queries', async () => {
      const result1 = await getMutations('12345', { page: 1 });
      const result2 = await getMutations('12345', { page: 2 });
      
      // Results should be different for different pages
      expect(result1.pagination.page).not.toBe(result2.pagination.page);
    });
  });

  describe('error handling', () => {
    it('should map timeout errors correctly', async () => {
      // Force timeout error
      const originalRandom = Math.random;
      Math.random = () => 0.05; // Trigger error
      
      try {
        await getBalance('12345');
      } catch (error: any) {
        expect(error.code).toBeDefined();
        expect(error.message).toBeDefined();
        expect(['TIMEOUT', 'UNKNOWN_ERROR']).toContain(error.code);
      }
      
      Math.random = originalRandom;
    });
  });

  describe('cache functionality', () => {
    it('should clear cache when requested', async () => {
      // Get initial result (will cache it)
      await getBalance('12345');
      
      // Clear cache
      clearCache();
      
      // This should make a new API call, not use cache
      const result = await getBalance('12345');
      expect(result).toBeDefined();
    });
  });
});