"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, LogOut, QrCode, Settings } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";

export function DashboardNav() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/history", label: "Riwayat", icon: History },
    { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <QrCode className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">QR Tunai</span>
        </Link>
      </SidebarHeader>

      <SidebarMenu className="flex-1 p-2">
        {menuItems.map((item) => (
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
