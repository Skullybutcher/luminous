'use client'

import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

export interface SidebarNavItemProps {
  icon: ReactNode
  label: string
  active?: boolean
  badge?: string | number
}

export function SidebarNavItem({
  icon,
  label,
  active = false,
  badge,
}: SidebarNavItemProps) {
  return (
    <div
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 outline-none cursor-pointer',
        active
          ? 'border-l-2 border-primary bg-primary/8 text-primary rounded-l-none pl-[10px]'
          : 'border-l-2 border-transparent text-text-muted hover:bg-bg-elevated hover:text-text-primary pl-[10px]'
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center transition-colors',
          active ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'
        )}
      >
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
            active
              ? 'bg-primary/20 text-primary'
              : 'bg-bg-elevated text-text-muted group-hover:bg-primary/10 group-hover:text-primary'
          )}
        >
          {badge}
        </span>
      )}
    </div>
  )
}
