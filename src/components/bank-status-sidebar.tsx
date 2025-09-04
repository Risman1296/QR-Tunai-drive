
'use client';

import Image from "next/image";
import { bankAccounts, type BankAccount } from "@/lib/data";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    notation: 'compact'
  }).format(amount);
}

function BankAccountItem({ account }: { account: BankAccount }) {
  const tooltipContent = (
    <div className="flex flex-col">
      <span className="font-bold">{account.bankName}</span>
      <span className="text-muted-foreground">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(account.balance)}</span>
    </div>
  );
  
  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        size="lg"
        className="h-12 justify-start group-data-[collapsible=icon]:justify-center"
        tooltip={{ children: tooltipContent, side: "right", align: "center" }}>
        <Image src={account.logo} alt={`${account.bankName} logo`} width={32} height={32} className="shrink-0 group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6" />
        <div className="flex flex-col items-start truncate group-data-[collapsible=icon]:hidden">
          <span className="font-medium leading-tight">{account.bankName}</span>
          <span className="text-xs text-sidebar-foreground/70 leading-tight">{formatCurrency(account.balance)}</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
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
