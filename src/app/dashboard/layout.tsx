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

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <DashboardNav />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b px-6">
          <SidebarTrigger />
          <div className="flex items-center gap-4">
            <p className="text-sm font-medium">Kasir: Admin</p>
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
