
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, LogOut, QrCode, Settings } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";

// In a real app, you would get the user's role from the session
const useUserRole = () => {
    // For demonstration, we'll assume the user is a 'Cashier'. 
    // Change to 'Owner' to see the Settings menu.
    return 'Cashier'; 
}

export function DashboardNav() {
  const pathname = usePathname();
  const userRole = useUserRole();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['Owner', 'Cashier', 'Admin'] },
    { href: "/dashboard/history", label: "Riwayat", icon: History, roles: ['Owner', 'Cashier', 'Admin'] },
    { href: "/dashboard/settings", label: "Pengaturan", icon: Settings, roles: ['Owner'] },
  ];

  const availableMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <QrCode className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">QR Tunai</span>
        </Link>
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-2">
        {availableMenuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.href)}
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
