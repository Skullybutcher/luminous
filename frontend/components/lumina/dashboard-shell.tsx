// components/lumina/dashboard-shell.tsx
"use client"

import { type ReactNode, useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar, NewBookingContext } from "./sidebar"
import { Topbar } from "./topbar"
import { NewBookingModal } from "./booking-calendar"
import { cn } from "@/lib/utils"

const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/bookings": "Bookings",
  "/pos": "Point of Sale",
  "/customers": "Customers",
  "/staff": "Staff",
  "/inventory": "Inventory",
  "/reports": "Reports",
  "/whatsapp": "Bot Monitor",
}

// Pages that handle their own full-bleed layout (no padded wrapper)
const FULL_BLEED_PAGES = new Set(["/whatsapp", "/pos"])

interface DashboardShellProps {
  children?: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [newBookingOpen, setNewBookingOpen] = useState(false)

  const isFullBleed = FULL_BLEED_PAGES.has(pathname)
  const pageTitle = PAGE_TITLES[pathname] ?? "Dashboard"

  return (
    <NewBookingContext.Provider value={{ openNewBooking: () => setNewBookingOpen(true) }}>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <Sidebar 
          activePage={pathname} 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          onNewAppointment={() => setNewBookingOpen(true)}
        />

        <div className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          sidebarCollapsed ? "pl-[72px]" : "pl-[240px]"
        )}>
          <Topbar pageTitle={pageTitle} />

          <main
            id="main-content"
            className="flex-1 overflow-hidden pt-16"
            tabIndex={-1}
            aria-label="Main content"
          >
            {isFullBleed ? (
              children
            ) : (
              <div className="h-full overflow-y-auto">
                <div className="mx-auto max-w-[1400px] p-8">{children}</div>
              </div>
            )}
          </main>
        </div>

        {/* New Booking Modal */}
        <NewBookingModal open={newBookingOpen} onClose={() => setNewBookingOpen(false)} />
      </div>
    </NewBookingContext.Provider>
  )
}
