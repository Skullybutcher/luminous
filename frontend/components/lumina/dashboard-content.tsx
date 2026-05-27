'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  IndianRupee,
  Calendar,
  Footprints,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Package,
  FileText,
  UserPlus,
  X,
  Star,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// COUNT-UP HOOK
// ─────────────────────────────────────────────────────────────
function useCountUp(end: number, duration: number = 1200) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])
  
  return count
}

// ─────────────────────────────────────────────────────────────
// SPARKLINE COMPONENT
// ─────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 100
  const height = 20
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
      className="w-full h-8"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────
// STAT CARD COMPONENT
// ─────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string
  value: number
  prefix?: string
  trend?: 'up' | 'down'
  trendValue?: string
  icon: React.ReactNode
  accentColor: string
  sparkline?: number[]
  delay?: number
  children?: React.ReactNode
}

function StatCard({
  title,
  value,
  prefix = '',
  trend,
  trendValue,
  icon,
  accentColor,
  sparkline,
  delay = 0,
  children,
}: StatCardProps) {
  const animatedValue = useCountUp(value)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className="relative overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br from-bg-elevated to-bg-card p-5 flex flex-col gap-4 hover:-translate-y-1 hover:border-white/15 transition-all duration-300 group"
    >
      {/* Icon + trend row */}
      <div className="flex items-start justify-between">
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: `${accentColor}18`, color: accentColor }}
        >
          {icon}
        </div>
        {trend && trendValue && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold',
              trend === 'up' && 'bg-success/10 border-success/20 text-success',
              trend === 'down' && 'bg-danger/10 border-danger/20 text-danger'
            )}
          >
            {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trendValue}
          </span>
        )}
      </div>

      {/* Value + title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">
          {title}
        </p>
        <p className="text-3xl font-bold text-text-primary leading-tight tracking-tight">
          {prefix}{animatedValue.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Sparkline or children */}
      {sparkline && sparkline.length > 1 && (
        <div className="mt-auto">
          <Sparkline data={sparkline} color={accentColor} />
        </div>
      )}
      {children}

      {/* Glow accent */}
      <div
        className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full blur-[48px] opacity-20"
        style={{ background: accentColor }}
      />
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// TODAY'S SCHEDULE COMPONENT
// ─────────────────────────────────────────────────────────────
const STAFF_SCHEDULE = [
  {
    name: 'Priya',
    avatar: 'P',
    color: '#2563EB',
    slots: [
      { start: 9, end: 10.5, service: 'Haircut', customer: 'Anjali M.' },
      { start: 11, end: 12, service: 'Color', customer: 'Sneha R.' },
      { start: 14, end: 15.5, service: 'Balayage', customer: 'Kavya P.' },
    ],
  },
  {
    name: 'Rahul',
    avatar: 'R',
    color: '#7C3AED',
    slots: [
      { start: 10, end: 11, service: 'Beard Trim', customer: 'Arjun K.' },
      { start: 13, end: 14.5, service: 'Haircut', customer: 'Vikram S.' },
    ],
  },
  {
    name: 'Sneha',
    avatar: 'S',
    color: '#0D9488',
    slots: [
      { start: 9.5, end: 10.5, service: 'Facial', customer: 'Preethi M.' },
      { start: 12, end: 13, service: 'Cleanup', customer: 'Divya K.' },
      { start: 15, end: 16.5, service: 'Facial', customer: 'Meera R.' },
    ],
  },
  {
    name: 'Vikram',
    avatar: 'V',
    color: '#F59E0B',
    slots: [
      { start: 10.5, end: 12, service: 'Hair Spa', customer: 'Rohan P.' },
      { start: 14, end: 15, service: 'Haircut', customer: 'Kiran T.' },
    ],
  },
  {
    name: 'Meera',
    avatar: 'M',
    color: '#EC4899',
    slots: [
      { start: 9, end: 10, service: 'Manicure', customer: 'Lakshmi S.' },
      { start: 11.5, end: 13, service: 'Pedicure', customer: 'Ananya G.' },
      { start: 16, end: 17, service: 'Nail Art', customer: 'Riya M.' },
    ],
  },
]

const TIME_SLOTS = [9, 10, 11, 12, 13, 14, 15, 16, 17]

function TodaysSchedule() {
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    service: string
    customer: string
  } | null>(null)

  const getSlotPosition = (start: number, end: number) => {
    const totalHours = 8
    const left = ((start - 9) / totalHours) * 100
    const width = ((end - start) / totalHours) * 100
    return { left: `${left}%`, width: `${width}%` }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="lg:col-span-8 bg-gradient-to-br from-bg-elevated to-bg-card border border-white/5 rounded-xl p-5 flex flex-col"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
        <h3 className="text-lg font-semibold text-text-primary">Today&apos;s Schedule</h3>
        <div className="flex items-center gap-1 bg-bg-card rounded-lg p-1 border border-white/5">
          <button className="px-3 py-1.5 rounded-md bg-bg-elevated text-primary text-xs font-semibold shadow-sm border border-white/5">
            Day
          </button>
          <button className="px-3 py-1.5 rounded-md text-text-muted hover:text-text-primary text-xs font-semibold transition-colors">
            Week
          </button>
        </div>
      </div>

      {/* Time axis */}
      <div className="flex pl-20 pr-2 mb-2">
        {TIME_SLOTS.map((hour) => (
          <div key={hour} className="flex-1 text-xs text-text-muted/60">
            {hour}:00
          </div>
        ))}
      </div>

      {/* Staff rows */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2">
        {STAFF_SCHEDULE.map((staff) => (
          <div key={staff.name} className="flex items-center gap-3">
            {/* Avatar + name */}
            <div className="flex items-center gap-2 w-16 shrink-0">
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: staff.color }}
              >
                {staff.avatar}
              </div>
              <span className="text-xs font-medium text-text-primary truncate">
                {staff.name}
              </span>
            </div>

            {/* Timeline bar */}
            <div className="flex-1 relative h-8 bg-bg-card rounded-md border border-white/5">
              {/* Grid lines */}
              {TIME_SLOTS.slice(1).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-white/5"
                  style={{ left: `${((i + 1) / 8) * 100}%` }}
                />
              ))}

              {/* Appointment slots */}
              {staff.slots.map((slot, i) => {
                const pos = getSlotPosition(slot.start, slot.end)
                return (
                  <div
                    key={i}
                    className="absolute top-1 bottom-1 rounded-md cursor-pointer transition-all hover:brightness-110"
                    style={{
                      ...pos,
                      background: `${staff.color}30`,
                      borderLeft: `3px solid ${staff.color}`,
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                        service: slot.service,
                        customer: slot.customer,
                      })
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <span className="text-[10px] font-medium text-text-primary px-1.5 truncate block">
                      {slot.service}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-bg-elevated border border-white/10 rounded-lg px-3 py-2 shadow-xl pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <p className="text-xs font-semibold text-text-primary">{tooltip.service}</p>
          <p className="text-[10px] text-text-muted">{tooltip.customer}</p>
        </div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// LIVE ACTIVITY FEED
// ─────────────────────────────────────────────────────────────
const ACTIVITY_FEED = [
  {
    icon: Calendar,
    iconColor: '#2563EB',
    text: 'Anjali booked Haircut',
    sub: 'Banjara Hills',
    time: '2m ago',
  },
  {
    icon: FileText,
    iconColor: '#22C55E',
    text: 'Invoice #1042 generated',
    sub: '₹2,400',
    time: '5m ago',
  },
  {
    icon: Package,
    iconColor: '#F59E0B',
    text: 'Low stock: Hair Serum',
    sub: '2 items left',
    time: '12m ago',
  },
  {
    icon: UserPlus,
    iconColor: '#2563EB',
    text: 'Walk-in added',
    sub: 'Rahul M',
    time: '18m ago',
  },
  {
    icon: X,
    iconColor: '#EF4444',
    text: 'Preethi cancelled',
    sub: 'Appointment',
    time: '25m ago',
  },
  {
    icon: Star,
    iconColor: '#7C3AED',
    text: 'Commission unlocked',
    sub: 'Priya ₹960',
    time: '32m ago',
  },
  {
    icon: Users,
    iconColor: '#22C55E',
    text: 'New customer registered',
    sub: 'Kiran T',
    time: '45m ago',
  },
  {
    icon: CheckCircle,
    iconColor: '#22C55E',
    text: 'Invoice #1041 paid',
    sub: '₹1,800',
    time: '1h ago',
  },
]

function LiveActivityFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="lg:col-span-4 bg-gradient-to-br from-bg-elevated to-bg-card border border-white/5 rounded-xl p-5 flex flex-col h-[400px]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <h3 className="text-lg font-semibold text-text-primary">Live Activity</h3>
      </div>

      {/* Feed items */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
        {ACTIVITY_FEED.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
            className="flex gap-3 items-start p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-default border-l-2"
            style={{ borderLeftColor: item.iconColor }}
          >
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border border-white/10"
              style={{ background: `${item.iconColor}15` }}
            >
              <item.icon size={14} style={{ color: item.iconColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary leading-tight truncate">
                {item.text}
              </p>
              <p className="text-xs text-text-muted">{item.sub}</p>
            </div>
            <span className="text-[10px] text-text-muted/60 shrink-0">{item.time}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// TOP SERVICES DONUT
// ─────────────────────────────────────────────────────────────
const TOP_SERVICES = [
  { name: 'Hair', value: 42, color: '#2563EB' },
  { name: 'Skin', value: 28, color: '#7C3AED' },
  { name: 'Nails', value: 18, color: '#0D9488' },
  { name: 'Spa', value: 12, color: '#F59E0B' },
]

function TopServicesDonut() {
  const radius = 40
  const circumference = 2 * Math.PI * radius

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-gradient-to-br from-bg-elevated to-bg-card border border-white/5 rounded-xl p-5"
    >
      <h3 className="text-base font-semibold text-text-primary mb-4">Top Services</h3>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {(() => {
              let cumulativePercent = 0
              return TOP_SERVICES.map((service) => {
                const strokeDasharray = (service.value / 100) * circumference
                const strokeDashoffset = -(cumulativePercent / 100) * circumference
                cumulativePercent += service.value

                return (
                  <circle
                    key={service.name}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={service.color}
                    strokeWidth="12"
                    strokeDasharray={`${strokeDasharray} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                )
              })
            })()}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-text-primary">100%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {TOP_SERVICES.map((service) => (
            <div key={service.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: service.color }}
              />
              <span className="text-xs text-text-muted">{service.name}</span>
              <span className="text-xs font-semibold text-text-primary ml-auto">
                {service.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// BRANCH PERFORMANCE
// ─────────────────────────────────────────────────────────────
const BRANCHES = [
  { name: 'Banjara Hills', revenue: 140000, percent: 88, color: '#2563EB' },
  { name: 'Jubilee Hills', revenue: 110000, percent: 71, color: '#7C3AED' },
  { name: 'Madhapur', revenue: 80000, percent: 52, color: '#0D9488' },
]

function BranchPerformance() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-gradient-to-br from-bg-elevated to-bg-card border border-white/5 rounded-xl p-5"
    >
      <h3 className="text-base font-semibold text-text-primary mb-4">Branch Performance</h3>

      <div className="flex flex-col gap-4">
        {BRANCHES.map((branch, i) => (
          <div key={branch.name}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-text-primary">{branch.name}</span>
              <span className="text-sm font-semibold text-text-primary">
                ₹{(branch.revenue / 100000).toFixed(1)}L
              </span>
            </div>
            <div className="h-2 bg-bg-card rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${branch.percent}%` }}
                transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                className="h-full rounded-full"
                style={{ background: branch.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// STAFF ON DUTY
// ─────────────────────────────────────────────────────────────
const STAFF_ON_DUTY = [
  { name: 'Priya', avatar: 'P', status: 'In Session', statusColor: '#22C55E', next: '11:00' },
  { name: 'Rahul', avatar: 'R', status: 'Available', statusColor: '#2563EB', next: '11:00' },
  { name: 'Sneha', avatar: 'S', status: 'Break', statusColor: '#F59E0B', next: '12:00' },
  { name: 'Vikram', avatar: 'V', status: 'In Session', statusColor: '#22C55E', next: '13:00' },
  { name: 'Meera', avatar: 'M', status: 'Available', statusColor: '#2563EB', next: '14:00' },
]

function StaffOnDuty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="bg-gradient-to-br from-bg-elevated to-bg-card border border-white/5 rounded-xl p-5"
    >
      <h3 className="text-base font-semibold text-text-primary mb-4">Staff On Duty</h3>

      <div className="flex flex-col gap-3">
        {STAFF_ON_DUTY.map((staff, i) => (
          <motion.div
            key={staff.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.9 + i * 0.05 }}
            className="flex items-center gap-3"
          >
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {staff.avatar}
            </div>
            <span className="text-sm font-medium text-text-primary flex-1">{staff.name}</span>
            <span
              className="text-[10px] font-semibold px-2 py-1 rounded-full"
              style={{
                background: `${staff.statusColor}15`,
                color: staff.statusColor,
              }}
            >
              {staff.status}
            </span>
            <span className="text-xs text-text-muted w-12 text-right">{staff.next}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD CONTENT
// ─────────────────────────────────────────────────────────────
export function DashboardContent() {
  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={42500}
          prefix="₹"
          trend="up"
          trendValue="12.5%"
          icon={<IndianRupee size={20} />}
          accentColor="#2563EB"
          sparkline={[20, 15, 18, 10, 12, 5, 8, 2, 6, 1]}
          delay={0}
        />
        <StatCard
          title="Appointments"
          value={124}
          trend="up"
          trendValue="4.2%"
          icon={<Calendar size={20} />}
          accentColor="#7C3AED"
          sparkline={[15, 12, 16, 8, 10, 4, 6, 2]}
          delay={0.1}
        />
        <StatCard
          title="Walk-ins"
          value={18}
          trend="down"
          trendValue="2.1%"
          icon={<Footprints size={20} />}
          accentColor="#0D9488"
          sparkline={[5, 8, 4, 12, 10, 16]}
          delay={0.2}
        />
        <StatCard
          title="Pending Confirmation"
          value={7}
          icon={<Clock size={20} />}
          accentColor="#F59E0B"
          delay={0.3}
        >
          <div className="mt-auto flex items-center">
            <div className="flex -space-x-2">
              {['A', 'P', 'S'].map((initial, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-bg-card bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary"
                >
                  {initial}
                </div>
              ))}
              <div className="w-7 h-7 rounded-full border-2 border-bg-card bg-bg-elevated flex items-center justify-center text-[10px] font-semibold text-text-muted">
                +4
              </div>
            </div>
          </div>
        </StatCard>
      </div>

      {/* Row 2: Calendar & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <TodaysSchedule />
        <LiveActivityFeed />
      </div>

      {/* Row 3: Services, Branch Performance, Staff */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TopServicesDonut />
        <BranchPerformance />
        <StaffOnDuty />
      </div>
    </div>
  )
}
