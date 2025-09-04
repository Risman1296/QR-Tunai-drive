import type { ReactNode } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import { DashboardNav } from "@/components/dashboard-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
            <p className="text-sm font-medium">Kasir: Admin</p>
            <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifikasi</span>
            </Button>
            <ThemeSwitcher />
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://picsum.photos/100" data-ai-hint="person" alt="@admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
