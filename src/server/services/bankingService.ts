import { resolveBankProvider } from '../banks';
import type { AccountId, MutationQuery, BalanceResponse, MutationRecord } from '../contracts/banking';

// Public API for banking operations
export async function fetchBalance(accountId: AccountId, options?: { bank?: string }): Promise<BalanceResponse> {
  const bank = options?.bank || 'bri'; // default bank
  const provider = resolveBankProvider(bank);
  if (!provider) throw new Error(`No provider for bank: ${bank}`);
  return provider.getBalance(accountId);
}

export async function fetchMutations(accountId: AccountId, query: MutationQuery, options?: { bank?: string }): Promise<MutationRecord[]> {
  const bank = options?.bank || 'bri';
  const provider = resolveBankProvider(bank);
  if (!provider) throw new Error(`No provider for bank: ${bank}`);
  const result = await provider.getMutations(accountId, query);
  return result.items;
}

// Add more orchestrator logic: caching, audit, error mapping, etc. as needed
