'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useFinancialStore } from '@/lib/financial-store';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ArrowUpCircle, ArrowDownCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BankLogo from '@/components/bank-logo';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { BankIntegration as ConfigBankIntegration, BankAccount as ConfigBankAccount } from '@/lib/payment-config';

type BalanceState = {
  loading?: boolean;
  value?: number;
  fetchedAt?: string;
  error?: string;
  raw?: any;
};

type SidebarBankAccount = {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  isActive: boolean;
  integrationId?: string;
};

function maskAccountNumber(value?: string) {
  if (!value) return '-';
  const digits = value.replace(/[^0-9]/g, '');
  if (digits.length <= 4) return digits;
  const masked = digits.slice(0, Math.max(0, digits.length - 4)).replace(/\\d/g, '•');
  return `${masked}${digits.slice(-4)}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function extractBalance(provider: string, payload: any): number | undefined {
  if (!payload) return undefined;
  const candidates = [
    payload.balance,
    payload.Balance,
    payload.currentBalance,
    payload.CurrentBalance,
    payload.availableBalance,
    payload.available_balance,
    payload.data?.balance,
    payload.data?.currentBalance,
    payload.data?.CurrentBalance,
    payload.data?.availableBalance,
    payload.data?.available_balance,
    payload?.Data?.[0]?.availableBalance,
    payload?.BalanceAmount,
    payload?.BalanceInfo?.availableBalance,
    payload?.balanceInfo?.availableBalance,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }
    if (typeof candidate === 'string') {
      const normalized = Number(candidate.replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(normalized)) {
        return normalized;
      }
    }
  }

  if (provider === 'bca_snap_qris' && Array.isArray(payload?.Data)) {
    const first = payload.Data[0]?.Balance || payload.Data[0]?.balance;
    if (first && Number.isFinite(Number(first))) {
      return Number(first);
    }
  }

  if (provider === 'bri_realtime') {
    const direct = payload?.data?.saldo || payload?.data?.balance || payload?.data?.availableBalance;
    if (typeof direct === 'number') return direct;
    if (typeof direct === 'string') {
      const normalized = Number(direct.replace(/[^0-9.-]/g, ''));
      if (!Number.isNaN(normalized)) return normalized;
    }
  }

  return undefined;
}

type HistoryItemProps = {
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  time: string;
};

function HistoryItem({ description, amount, type, time }: HistoryItemProps) {
  const isCredit = type === 'credit';
  const Icon = isCredit ? ArrowUpCircle : ArrowDownCircle;
  const colorClass = isCredit ? 'text-green-500' : 'text-red-500';

  return (
    <div className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-sidebar-accent/50 rounded-md">
      <div className="flex items-center gap-2 truncate">
        <Icon className={`h-4 w-4 shrink-0 ${colorClass}`} />
        <div className="truncate">
          <p className="truncate text-sidebar-foreground/90">{description}</p>
          <p className="text-sidebar-foreground/60">{time}</p>
        </div>
      </div>
      <p className={`font-mono shrink-0 ${colorClass}`}>{formatCurrency(Math.abs(amount))}</p>
    </div>
  );
}

type BankAccountItemProps = {
  account: SidebarBankAccount;
  integration?: ConfigBankIntegration;
  balanceState?: BalanceState;
  onRefresh: () => void;
  history: HistoryItemProps[];
};

function BankAccountItem({ account, integration, balanceState, onRefresh, history }: BankAccountItemProps) {
  const isLoading = Boolean(balanceState?.loading);
  const isInactive = !account.isActive;
  const balanceValue =
    typeof balanceState?.value === 'number' ? balanceState.value : account.balance;

  return (
    <Collapsible asChild>
      <SidebarMenuItem>
        <div className="flex items-center">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={`h-12 justify-start group-data-[collapsible=icon]:justify-center flex-1 ${isInactive ? 'opacity-50' : ''}`}
            >
              <BankLogo
                bankCode={account.bankCode || account.id}
                bankName={account.bankName}
                size="lg"
                className="shrink-0 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6"
              />
              <div className="flex flex-col items-start truncate group-data-[collapsible=icon]:hidden">
                <span className="font-medium leading-tight">{account.bankName}</span>
                <span className="text-xs text-sidebar-foreground/70 leading-tight">
                  {formatCurrency(balanceValue)}{!account.isActive ? ' (Nonaktif)' : ''}
                </span>
                <span className="text-[10px] text-sidebar-foreground/60 leading-tight">
                  {maskAccountNumber(account.accountNumber)}
                </span>
              </div>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
            <Badge variant={account.isActive ? 'default' : 'outline'}>
              {account.isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              disabled={!integration || isLoading}
              onClick={(event) => {
                event.stopPropagation();
                onRefresh();
              }}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 data-[state=open]:rotate-180"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
          <div className="px-2 py-2 space-y-2 text-xs text-sidebar-foreground/80">
            <div className="space-y-1">
              <p>Nomor Rekening: {account.accountNumber || '-'}</p>
              <p>Nama Rekening: {account.accountHolder}</p>
              <p>Integrasi: {integration ? `${integration.bankName} (${integration.provider})` : 'Belum terhubung'}
              {isInactive && (<span className="text-red-500">Rekening sedang nonaktif</span>)}</p>
              {balanceState?.fetchedAt && (
                <p>Terakhir diperbarui: {new Date(balanceState.fetchedAt).toLocaleString('id-ID')}</p>
              )}
              {balanceState?.error && (
                <p className="text-red-500">{balanceState.error}</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Aktivitas terbaru</p>
              {history.length === 0 ? (
                <p className="text-sidebar-foreground/60">Belum ada transaksi terkait rekening ini.</p>
              ) : (
                history.slice(0, 5).map((item) => <HistoryItem key={`${item.time}-${item.description}`} {...item} />)
              )}
            </div>
          </div>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function BankStatusSidebar() {
  const { toast } = useToast();
  const { transactions, bankAccounts: storeBankAccounts } = useFinancialStore();
  const [accounts, setAccounts] = useState<SidebarBankAccount[]>([]);
  const [integrations, setIntegrations] = useState<ConfigBankIntegration[]>([]);
  const [balanceState, setBalanceState] = useState<Record<string, BalanceState>>({});
  const [configLoaded, setConfigLoaded] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/payment-config', { cache: 'no-store', credentials: 'include' });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || 'Gagal mengambil konfigurasi pembayaran');

      const configAccounts = (json?.data?.bankAccounts as ConfigBankAccount[]) ?? [];
      setAccounts(
        configAccounts.map((account) => ({
          id: account.id,
          bankName: account.bankName,
          bankCode: account.bankCode,
          accountNumber: account.accountNumber,
          accountHolder: account.accountHolder,
          balance: Number(account.balance ?? 0),
          isActive: account.isActive ?? true,
          integrationId: account.integrationId,
        }))
      );
      setIntegrations(json?.data?.bankIntegrations ?? []);
      setConfigLoaded(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Gagal memuat status rekening',
        description: error?.message ?? 'Terjadi kesalahan tak terduga',
      });
      setAccounts([]);
      setIntegrations([]);
      setConfigLoaded(true);
    }
  }, [toast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (!configLoaded) return;
    if (accounts.length > 0) return;
    if (!storeBankAccounts.length) return;
    setAccounts(
      storeBankAccounts.map((account) => ({
        id: account.id,
        bankName: account.name,
        bankCode: account.code,
        accountNumber: account.accountNumber ?? '',
        accountHolder: account.name,
        balance: Number(account.balance ?? 0),
        isActive: account.isActive,
        integrationId: undefined,
      }))
    );
  }, [accounts.length, storeBankAccounts]);

  const resolveIntegration = useCallback(
    (account: SidebarBankAccount) => {
      if (account.integrationId) {
        return integrations.find((integration) => integration.id === account.integrationId);
      }
      return integrations.find((integration) => integration.bankCode === account.bankCode);
    },
    [integrations]
  );

  const refreshBalance = useCallback(async (account: SidebarBankAccount) => {
    const integration = resolveIntegration(account);
    if (!integration) {
      setBalanceState((prev) => ({
        ...prev,
        [account.id]: { ...prev[account.id], error: 'Integrasi tidak ditemukan', loading: false },
      }));
      toast({
        variant: 'destructive',
        title: 'Integrasi tidak ditemukan',
        description: 'Hubungkan rekening dengan integrasi API terlebih dahulu.',
      });
      return;
    }

    const accountParam = (account.accountNumber || '').replace(/[^0-9]/g, '') || account.accountNumber;

    setBalanceState((prev) => ({
      ...prev,
      [account.id]: { ...prev[account.id], loading: true, error: undefined },
    }));

    try {
      const response = await fetch(`/api/banks/${encodeURIComponent(integration.id)}/balance?account=${encodeURIComponent(accountParam)}`, { cache: 'no-store' });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error ? JSON.stringify(json.error) : 'Permintaan saldo gagal');
      }
      const balanceValue = extractBalance(integration.provider, json.data);
      setBalanceState((prev) => ({
        ...prev,
        [account.id]: {
          loading: false,
          value: typeof balanceValue === 'number' ? balanceValue : prev[account.id]?.value,
          fetchedAt: json.fetchedAt,
          raw: json.data,
          error: typeof balanceValue === 'number' ? undefined : 'Saldo tidak ditemukan pada respons',
        },
      }));
    } catch (error: any) {
      setBalanceState((prev) => ({
        ...prev,
        [account.id]: { ...prev[account.id], loading: false, error: error?.message ?? 'Gagal memuat saldo' },
      }));
      toast({
        variant: 'destructive',
        title: 'Gagal memuat saldo',
        description: error?.message ?? 'Terjadi kesalahan tak terduga',
      });
    }
  }, [resolveIntegration, toast]);

  useEffect(() => {
    accounts.forEach((account) => {
      if (!account.integrationId) return;
      refreshBalance(account);
    });
  }, [accounts, refreshBalance]);

  const accountHistories = useMemo(() => {
    return accounts.reduce<Record<string, HistoryItemProps[]>>((acc, account) => {
      const related = transactions.filter(
        (tx) => tx.fromAccount?.id === account.id || tx.toAccount?.id === account.id
      );
      acc[account.id] = related
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10)
        .map((tx) => ({
          description: tx.description,
          amount: tx.amount,
          type: tx.toAccount?.id === account.id ? 'credit' : 'debit',
          time: formatTimeLabel(tx.date),
        }));
      return acc;
    }, {});
  }, [accounts, transactions]);

  return (
    <div className="flex flex-col group-data-[collapsible=icon]:items-center">
      <h3 className="px-4 py-2 text-xs font-semibold text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
        Status Rekening
      </h3>
      <SidebarMenu className="px-2 space-y-1">
        {accounts.map((account) => {
          const integration = resolveIntegration(account);
          return (
            <BankAccountItem
              key={account.id}
              account={account}
              integration={integration}
              balanceState={balanceState[account.id]}
              onRefresh={() => refreshBalance(account)}
              history={accountHistories[account.id] || []}
            />
          );
        })}
        {accounts.length === 0 && (
          <SidebarMenuItem>
            <div className="px-4 py-3 text-xs text-sidebar-foreground/60">
              Belum ada rekening yang dikonfigurasi.
            </div>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </div>
  );
}
