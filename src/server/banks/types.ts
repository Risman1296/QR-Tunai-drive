import type {
  AccountId,
  MutationQuery,
  BalanceResponse,
  MutationRecord
} from '../contracts/banking';

// All adapters must use these types for consistency
export interface BankProvider {
  getBalance(accountId: AccountId): Promise<BalanceResponse>;
  getMutations(accountId: AccountId, query: MutationQuery): Promise<{
    items: MutationRecord[];
    nextCursor?: string;
    total?: number;
  }>;
  // Optional: transfer, inquiry, etc.
}
