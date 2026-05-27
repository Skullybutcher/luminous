// components/lumina/sidebar.tsx
"use client"

import { useState, createContext, useContext } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  CalendarDays,
  ShoppingCart,
  Users,
  UserSquare2,
  Package,
  BarChart3,
  ChevronDown,
  CheckCircle2,
  Plus,
  MessageSquareMore,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { SidebarNavItem } from "./sidebar-nav-item"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { id: "/", label: "Dashboard", icon: LayoutDashboard },
  { id: "/bookings", label: "Bookings", icon: CalendarDays, badge: 7 },
  { id: "/pos", label: "POS", icon: ShoppingCart },
  { id: "/customers", label: "Customers", icon: Users },
  { id: "/staff", label: "Staff", icon: UserSquare2 },
  { id: "/inventory", label: "Inventory", icon: Package },
  { id: "/whatsapp", label: "Bot Monitor", icon: MessageSquareMore },
  { id: "/reports", label: "Reports", icon: BarChart3 },
]

const BRANCHES = [
  { id: "downtown", label: "Downtown Branch" },
  { id: "uptown", label: "Uptown Branch" },
  { id: "mall", label: "City Mall Branch" },
]

// Context for new booking modal
interface NewBookingContextValue {
  openNewBooking: () => void
}

export const NewBookingContext = createContext<NewBookingContextValue | null>(null)

export function useNewBooking() {
  const context = useContext(NewBookingContext)
  return context
}

interface SidebarProps {
  activePage: string
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNewAppointment?: () => void
}

export function Sidebar({ activePage, collapsed = false, onToggleCollapse, onNewAppointment }: SidebarProps) {
  const [branchOpen, setBranchOpen] = useState(false)
  const [activeBranch, setActiveBranch] = useState(BRANCHES[0])

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-bg-primary transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Logo + Collapse Toggle */}
      <div className={cn(
        "flex items-center gap-2.5 px-5 py-5",
        collapsed && "justify-center px-3"
      )}>
        <div className="flex h-9 w-9 items-center justify-center shrink-0">
          <Image
            src="/images/logo.png"
            alt="Luminous Logo"
            width={36}
            height={36}
            className="object-contain"
          />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-text-primary">
            Luminous
          </span>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={cn(
              "ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors",
              collapsed && "ml-0 mt-2"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        )}
      </div>

      {/* Branch Switcher */}
      {!collapsed && (
        <div className="relative px-3 pb-3">
          <button
            onClick={() => setBranchOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-bg-card px-3 py-2 text-sm transition-colors hover:border-white/10 hover:bg-bg-elevated"
            aria-expanded={branchOpen}
            aria-haspopup="listbox"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full bg-success"
                aria-label="Active branch"
              />
              <span className="font-medium text-text-primary">
                {activeBranch.label}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={cn(
                "text-text-muted transition-transform duration-200",
                branchOpen && "rotate-180"
              )}
            />
          </button>

          {branchOpen && (
            <div
              role="listbox"
              aria-label="Select branch"
              className="absolute left-3 right-3 top-full z-50 mt-1 rounded-lg border border-border bg-bg-elevated shadow-xl"
            >
              {BRANCHES.map((branch) => (
                <button
                  key={branch.id}
                  role="option"
                  aria-selected={branch.id === activeBranch.id}
                  onClick={() => {
                    setActiveBranch(branch)
                    setBranchOpen(false)
                  }}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-sm text-text-muted transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-bg-primary hover:text-text-primary"
                >
                  {branch.label}
                  {branch.id === activeBranch.id && (
                    <CheckCircle2 size={14} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Appointment CTA */}
      <div className={cn("px-3 pb-4", collapsed && "px-2")}>
        <button 
          onClick={onNewAppointment}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_12px_rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(37,99,235,0.4)]",
            collapsed && "px-2"
          )}
        >
          <Plus size={16} />
          {!collapsed && "New Appointment"}
        </button>
      </div>

      {/* Nav */}
      <nav className={cn("flex-1 overflow-y-auto px-2", collapsed && "px-1")} aria-label="Main navigation">
        <div className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <Link key={item.id} href={item.id} title={collapsed ? item.label : undefined}>
              {collapsed ? (
                <div
                  className={cn(
                    "flex h-10 w-full items-center justify-center rounded-lg transition-colors",
                    activePage === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-text-muted hover:bg-bg-elevated hover:text-text-primary"
                  )}
                >
                  <item.icon size={18} />
                </div>
              ) : (
                <SidebarNavItem
                  icon={<item.icon size={16} />}
                  label={item.label}
                  active={activePage === item.id}
                  badge={item.badge}
                />
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer — user avatar */}
      <div className="border-t border-border p-3">
        <button className={cn(
          "flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-bg-elevated",
          collapsed && "justify-center px-0"
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
            A
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold leading-tight text-text-primary">
                  Arjun Mehta
                </p>
                <p className="text-[11px] text-text-muted">Branch Manager</p>
              </div>
              <ChevronDown size={13} className="text-text-muted" />
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
