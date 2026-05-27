'use client'

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  trend: 'up' | 'down' | 'neutral'
  trendValue: string
  icon: ReactNode
  accentColor?: string
  sparkline?: number[]
  className?: string
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 100
  const height = 24
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="w-full h-6"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  )
}

const trendArrow = {
  up: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
    </svg>
  ),
  down: (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 10L2 5H10L6 10Z" fill="currentColor" />
    </svg>
  ),
  neutral: null,
}

export function StatCard({
  title,
  value,
  trend,
  trendValue,
  icon,
  accentColor = '#2563EB',
  sparkline,
  className,
}: StatCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-success'
      : trend === 'down'
        ? 'text-danger'
        : 'text-text-muted'

  const trendBg =
    trend === 'up'
      ? 'bg-success/10 border-success/20'
      : trend === 'down'
        ? 'bg-danger/10 border-danger/20'
        : 'bg-muted border-border'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-bg-card p-5 flex flex-col gap-4',
        'hover:-translate-y-0.5 hover:border-white/10 transition-all duration-300 group',
        className
      )}
    >
      {/* Icon + trend row */}
      <div className="flex items-start justify-between">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors group-hover:opacity-90"
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          {icon}
        </div>
        {trendValue && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold',
              trendColor,
              trendBg
            )}
          >
            {trendArrow[trend]}
            {trendValue}
          </span>
        )}
      </div>

      {/* Value + title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">
          {title}
        </p>
        <p className="text-3xl font-bold text-text-primary leading-tight">{value}</p>
      </div>

      {/* Sparkline */}
      {sparkline && sparkline.length > 1 && (
        <div className="mt-auto">
          <Sparkline data={sparkline} color={accentColor} />
        </div>
      )}

      {/* Glow accent */}
      <div
        className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full blur-[48px] opacity-25"
        style={{ background: accentColor }}
      />
    </motion.div>
  )
}
