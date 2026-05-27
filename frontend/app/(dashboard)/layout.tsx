// app/(dashboard)/layout.tsx
"use client"

import { DashboardShell } from "@/components/lumina"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
