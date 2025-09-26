import type { BankProvider } from '../types';
import { BalanceResponseSchema, MutationRecordSchema, type AccountId, type MutationQuery } from '@/server/contracts/banking';

export const mockProvider: BankProvider = {
  async getBalance(accountId: AccountId) {
    const now = new Date().toISOString();
    return BalanceResponseSchema.parse({
      accountId,
      balance: 2500000,
      currency: 'IDR',
      bank: 'REALTIME',
      fetchedAt: now,
    });
  },
  async getMutations(accountId: AccountId, query: MutationQuery) {
    const baseTime = Date.now();
    const items = Array.from({ length: query.limit ?? 5 }).map((_, i) =>
      MutationRecordSchema.parse({
        id: `mock-${baseTime}-${i}`,
        accountId,
        type: i % 2 === 0 ? 'credit' : 'debit',
        amount: 50000 + i * 10000,
        description: i % 2 === 0 ? 'Setor tunai' : 'Tarik tunai',
        timestamp: new Date(baseTime - i * 3600_000).toISOString(),
        balanceAfter: 2500000 + (i % 2 === 0 ? 1 : -1) * (50000 + i * 10000),
        bank: 'REALTIME',
      }),
    );
    return { items };
  },
};

