
'use client';

import Image from "next/image";
import { bankAccounts, type BankAccount, type BankAccountHistory } from "@/lib/data";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    notation: 'compact'
  }).format(amount);
}

function formatFullCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function HistoryItem({ item }: { item: BankAccountHistory }) {
    const isCredit = item.type === 'credit';
    const Icon = isCredit ? ArrowUpCircle : ArrowDownCircle;
    const colorClass = isCredit ? 'text-green-500' : 'text-red-500';

    return (
        <div className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-sidebar-accent/50 rounded-md">
            <div className="flex items-center gap-2 truncate">
                <Icon className={`h-4 w-4 shrink-0 ${colorClass}`} />
                <div className="truncate">
                    <p className="truncate text-sidebar-foreground/90">{item.description}</p>
                    <p className="text-sidebar-foreground/60">{item.time}</p>
                </div>
            </div>
            <p className={`font-mono shrink-0 ${colorClass}`}>{formatFullCurrency(Math.abs(item.amount))}</p>
        </div>
    )
}

function BankAccountItem({ account }: { account: BankAccount }) {
  const tooltipContent = (
    <div className="flex flex-col">
      <span className="font-bold">{account.bankName}</span>
      <span className="text-muted-foreground">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(account.balance)}</span>
    </div>
  );
  
  return (
    <Collapsible asChild>
      <SidebarMenuItem>
          <div className="flex items-center">
            <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                    size="lg"
                    className="h-12 justify-start group-data-[collapsible=icon]:justify-center flex-1"
                    tooltip={{ children: tooltipContent, side: "right", align: "center" }}>
                    <Image src={account.logo} alt={`${account.bankName} logo`} width={32} height={32} className="shrink-0 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6" />
                    <div className="flex flex-col items-start truncate group-data-[collapsible=icon]:hidden">
                    <span className="font-medium leading-tight">{account.bankName}</span>
                    <span className="text-xs text-sidebar-foreground/70 leading-tight">{formatCurrency(account.balance)}</span>
                    </div>
                </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 group-data-[collapsible=icon]:hidden data-[state=open]:rotate-180">
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
              <div className="flex flex-col gap-0.5 px-2 py-1">
                {account.history.map((item) => (
                    <HistoryItem key={item.id} item={item} />
                ))}
              </div>
          </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function BankStatusSidebar() {
  return (
    <div className="flex flex-col group-data-[collapsible=icon]:items-center">
      <h3 className="px-4 py-2 text-xs font-semibold text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
        Status Rekening
      </h3>
      <SidebarMenu className="px-2">
        {bankAccounts.map((account) => (
          <BankAccountItem key={account.id} account={account} />
        ))}
      </SidebarMenu>
    </div>
  );
}
