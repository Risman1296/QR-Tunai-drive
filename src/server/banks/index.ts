import { BankProvider } from './types';
import { mockProvider } from './mock/adapter';

// Import real adapters here when ready
// import { briProvider } from './bri/adapter';
// import { bcaProvider } from './bca/adapter';

const registry: Record<string, BankProvider> = {
  mock: mockProvider,
  // 'bri': briProvider,
  // 'bca': bcaProvider,
};

export function resolveBankProvider(bank: string): BankProvider | undefined {
  const key = bank.toLowerCase();
  return registry[key];
}

export function getActiveProviders(): string[] {
  const env = process.env.BANK_ACTIVE || '';
  const configured = env.split(',').map((s) => s.trim()).filter(Boolean);
  return configured.length ? configured : Object.keys(registry);
}
