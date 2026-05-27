// components/lumina/topbar.tsx
"use client"

import { useState, useEffect } from "react"
import { Bell, Search } from "lucide-react"

interface TopbarProps {
  pageTitle: string
}

export function Topbar({ pageTitle }: TopbarProps) {
  const isDashboard = pageTitle === "Dashboard"
  const [dateString, setDateString] = useState<string>("")

  useEffect(() => {
    const today = new Date()
    setDateString(
      today.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    )
  }, [])

  return (
    <header className="fixed right-0 top-0 z-30 flex h-16 w-[calc(100%-240px)] items-center justify-between border-b border-border bg-bg-primary/80 px-6 backdrop-blur-md">
      {/* Page title */}
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-text-primary">
          {isDashboard ? "Good morning, Arjun" : pageTitle}
        </h1>
        {isDashboard && dateString && (
          <p className="text-xs text-text-muted">{dateString}</p>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search (Cmd+K)"
            aria-label="Search"
            className="h-9 w-56 rounded-lg border border-border bg-bg-card pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted/60 outline-none transition-colors focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-bg-card text-text-muted transition-colors hover:border-white/10 hover:text-text-primary"
        >
          <Bell size={16} />
          <span
            aria-label="3 unread notifications"
            className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white ring-2 ring-bg-primary"
          >
            3
          </span>
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-border" aria-hidden="true" />

        {/* Avatar */}
        <button
          aria-label="User menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-primary/20 text-sm font-bold text-primary transition-colors hover:border-primary/40"
        >
          A
        </button>
      </div>
    </header>
  )
}
