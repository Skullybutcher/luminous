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
type StaffScheduleItem = {
  name: string
  avatar: string
  color: string
  slots: { start: number; end: number; service: string; customer: string }[]
}

const TIME_SLOTS = [9, 10, 11, 12, 13, 14, 15, 16, 17]

function TodaysSchedule({ schedule, loading }: { schedule: StaffScheduleItem[]; loading: boolean }) {
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
        {loading && schedule.length === 0 ? (
          <div className="h-32 rounded-lg bg-bg-card/50 animate-pulse" />
        ) : schedule.map((staff) => (
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
type ActivityItem = {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
  iconColor: string
  text: string
  sub: string
  time: string
}

function LiveActivityFeed({ items, loading }: { items: ActivityItem[]; loading: boolean }) {
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
        {loading && items.length === 0 ? (
          <div className="h-40 rounded-lg bg-bg-card/50 animate-pulse" />
        ) : items.map((item, i) => (
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
type TopServiceItem = { name: string; value: number; color: string }

function TopServicesDonut({ services, loading }: { services: TopServiceItem[]; loading: boolean }) {
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
              return services.map((service) => {
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
          {loading && services.length === 0 ? (
            <div className="h-20 w-full rounded-lg bg-bg-card/50 animate-pulse" />
          ) : services.map((service) => (
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
type BranchPerformanceItem = { name: string; revenue: number; percent: number; color: string }

function BranchPerformance({ branches, loading }: { branches: BranchPerformanceItem[]; loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="bg-gradient-to-br from-bg-elevated to-bg-card border border-white/5 rounded-xl p-5"
    >
      <h3 className="text-base font-semibold text-text-primary mb-4">Branch Performance</h3>

      <div className="flex flex-col gap-4">
        {loading && branches.length === 0 ? (
          <div className="h-20 rounded-lg bg-bg-card/50 animate-pulse" />
        ) : branches.map((branch, i) => (
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
type StaffOnDutyItem = { name: string; avatar: string; status: string; statusColor: string; next: string }

function StaffOnDuty({ staff, loading }: { staff: StaffOnDutyItem[]; loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="bg-gradient-to-br from-bg-elevated to-bg-card border border-white/5 rounded-xl p-5"
    >
      <h3 className="text-base font-semibold text-text-primary mb-4">Staff On Duty</h3>

      <div className="flex flex-col gap-3">
        {loading && staff.length === 0 ? (
          <div className="h-20 rounded-lg bg-bg-card/50 animate-pulse" />
        ) : staff.map((staff, i) => (
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])

  useEffect(() => {
    let active = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const today = new Date().toISOString()
        const [branchesRes, appointmentsRes, invoicesRes, staffRes] = await Promise.all([
          fetch('/api/branches'),
          fetch(`/api/appointments?date=${today}`),
          fetch('/api/invoices'),
          fetch('/api/users'),
        ])

        if (!branchesRes.ok || !appointmentsRes.ok || !invoicesRes.ok || !staffRes.ok) {
          throw new Error('Failed to load dashboard data')
        }

        const branchesPayload = await branchesRes.json()
        const appointmentsPayload = await appointmentsRes.json()
        const invoicesPayload = await invoicesRes.json()
        const staffPayload = await staffRes.json()

        if (!active) return
        setBranches(branchesPayload.data ?? [])
        setAppointments(appointmentsPayload.data ?? [])
        setInvoices(invoicesPayload.data ?? [])
        setStaff(staffPayload.data ?? [])
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      active = false
    }
  }, [])

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total ?? 0), 0)
  const totalAppointments = appointments.length
  const walkIns = appointments.filter((apt) => apt.channel === 'walkin').length
  const pendingCount = appointments.filter((apt) => apt.status === 'pending').length

  const staffMap = new Map(staff.map((member) => [member._id, member]))
  const scheduleColors = ['#2563EB', '#7C3AED', '#0D9488', '#F59E0B', '#EC4899']
  const schedule = Object.values(
    appointments.reduce<Record<string, StaffScheduleItem>>((acc, appt, index) => {
      const staffId = appt.staffId?._id ?? appt.staffId
      if (!staffId) return acc
      if (!acc[staffId]) {
        const staffMember = staffMap.get(staffId)
        acc[staffId] = {
          name: staffMember?.name ?? 'Staff',
          avatar: (staffMember?.name ?? 'S').slice(0, 1),
          color: scheduleColors[index % scheduleColors.length],
          slots: [],
        }
      }
      const slot = new Date(appt.slot)
      const duration = appt.duration ?? appt.serviceId?.duration ?? 30
      const start = slot.getHours() + slot.getMinutes() / 60
      const end = start + duration / 60
      acc[staffId].slots.push({
        start,
        end,
        service: appt.serviceId?.name ?? 'Service',
        customer: appt.customerId?.name ?? 'Customer',
      })
      return acc
    }, {})
  )

  const activityItems: ActivityItem[] = [
    ...appointments.slice(0, 3).map((apt: any) => ({
      icon: Calendar,
      iconColor: '#2563EB',
      text: `${apt.customerId?.name ?? 'Customer'} booked ${apt.serviceId?.name ?? 'Service'}`,
      sub: apt.branchId?.name ?? 'Branch',
      time: 'just now',
    })),
    ...invoices.slice(0, 2).map((inv: any) => ({
      icon: FileText,
      iconColor: '#22C55E',
      text: `Invoice ${inv.invoiceNumber ?? ''} generated`,
      sub: `₹${(inv.total ?? 0).toLocaleString('en-IN')}`,
      time: 'recent',
    })),
  ]

  const serviceTotals = appointments.reduce<Record<string, number>>((acc, apt) => {
    const category = apt.serviceId?.category ?? 'Other'
    acc[category] = (acc[category] ?? 0) + 1
    return acc
  }, {})
  const totalServiceCount = Object.values(serviceTotals).reduce((sum, val) => sum + val, 0) || 1
  const topServices: TopServiceItem[] = Object.entries(serviceTotals).map(([name, value], index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((value / totalServiceCount) * 100),
    color: scheduleColors[index % scheduleColors.length],
  }))

  const branchTotals = invoices.reduce<Record<string, number>>((acc, inv) => {
    const branchId = inv.branchId?._id ?? inv.branchId
    acc[branchId] = (acc[branchId] ?? 0) + (inv.total ?? 0)
    return acc
  }, {})
  const branchPerformance: BranchPerformanceItem[] = branches.map((branch: any, index: number) => {
    const revenue = branchTotals[branch._id] ?? 0
    const maxRevenue = Math.max(...Object.values(branchTotals), 1)
    const percent = Math.round((revenue / maxRevenue) * 100)
    return {
      name: branch.name,
      revenue,
      percent,
      color: scheduleColors[index % scheduleColors.length],
    }
  })

  const staffOnDuty: StaffOnDutyItem[] = staff.slice(0, 5).map((member: any, index: number) => ({
    name: member.name,
    avatar: member.name?.slice(0, 1) ?? 'S',
    status: member.isActive ? 'Available' : 'Off',
    statusColor: member.isActive ? '#2563EB' : '#64748B',
    next: '—',
  }))

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </div>
      )}
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={totalRevenue}
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
          value={totalAppointments}
          trend="up"
          trendValue="4.2%"
          icon={<Calendar size={20} />}
          accentColor="#7C3AED"
          sparkline={[15, 12, 16, 8, 10, 4, 6, 2]}
          delay={0.1}
        />
        <StatCard
          title="Walk-ins"
          value={walkIns}
          trend="down"
          trendValue="2.1%"
          icon={<Footprints size={20} />}
          accentColor="#0D9488"
          sparkline={[5, 8, 4, 12, 10, 16]}
          delay={0.2}
        />
        <StatCard
          title="Pending Confirmation"
          value={pendingCount}
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
        <TodaysSchedule schedule={schedule} loading={loading} />
        <LiveActivityFeed items={activityItems} loading={loading} />
      </div>

      {/* Row 3: Services, Branch Performance, Staff */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TopServicesDonut services={topServices} loading={loading} />
        <BranchPerformance branches={branchPerformance} loading={loading} />
        <StaffOnDuty staff={staffOnDuty} loading={loading} />
      </div>
    </div>
  )
}
