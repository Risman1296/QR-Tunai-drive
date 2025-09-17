'use client';

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/dashboard-nav"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, Settings, Loader2 } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/'); // Still redirect to home even if logout API fails
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <DashboardNav />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="hidden md:flex items-center gap-3">
               <Separator orientation="vertical" className="h-6" />
                <div>
                    <p className="text-sm font-semibold">LC-PST</p>
                    <p className="text-xs text-muted-foreground">Jl. Jenderal Sudirman No. 123</p>
                </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">
              Kasir: <span className="font-semibold">{user.name}</span>
              <span className="text-xs text-muted-foreground ml-1">({user.role})</span>
            </p>
            <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifikasi</span>
            </Button>
            <ThemeSwitcher />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Pengaturan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
