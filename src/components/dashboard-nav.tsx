
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, LogOut, QrCode, Settings, FileText, Clock, Wallet } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter, SidebarContent } from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import { BankStatusSidebar } from "./bank-status-sidebar";

// In a real app, you would get the user's role from the session
const useUserRole = () => {
    // Default user role is 'Owner' 
    // Change to 'Cashier' or 'Admin' as needed
    return 'Owner'; 
}

export function DashboardNav() {
  const pathname = usePathname();
  const userRole = useUserRole();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['Owner', 'Cashier', 'Admin'] },
    // Changed from QR display to manual form input
    { href: "/dashboard/manual", label: "Form Manual", icon: FileText, roles: ['Owner', 'Cashier', 'Admin'] },
    { href: "/dashboard/history", label: "Riwayat", icon: History, roles: ['Owner', 'Cashier', 'Admin'] },
    { href: "/dashboard/finance", label: "Keuangan", icon: Wallet, roles: ['Owner', 'Admin'] },
    { href: "/dashboard/shifts", label: "Shift Management", icon: Clock, roles: ['Owner', 'Admin'] },
    { href: "/dashboard/settings", label: "Pengaturan", icon: Settings, roles: ['Owner'] },
  ];

  const availableMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-3 p-2">
          <div className="relative">
            <QrCode className="h-8 w-8 text-qr-blue-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-qr-yellow-500 rounded-full"></div>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-lg font-bold tracking-tight text-qr-blue-700">
              QR<span className="text-qr-yellow-600">Tunai</span>
            </span>
            <span className="text-xs text-qr-blue-400 -mt-1">Dashboard</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="p-2">
          {availableMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                // Exact match for dashboard, prefix match for others
                isActive={item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)}
                tooltip={{ children: item.label, side: "right", align: "center" }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <Separator className="my-2" />

        <BankStatusSidebar />
        
      </SidebarContent>
      
      <SidebarFooter className="p-2 mt-auto">
        <Separator className="my-2 group-data-[collapsible=icon]:hidden" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: "Logout", side: "right", align: "center" }}>
              <Link href="/login">
                <LogOut />
                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </div>
  );
}
