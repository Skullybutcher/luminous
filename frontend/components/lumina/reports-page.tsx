'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  UserPlus,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from 'lucide-react'

// ─── Data ───────────────────────────────────────────────────────────────────

type RevenuePoint = { date: string; revenue: number }
type BookingChannelPoint = { week: string; Web: number; WhatsApp: number; WalkIn: number; Call: number }
type TopServicePoint = { service: string; revenue: number }
type CustomerSplitPoint = { name: string; value: number }
type StaffRow = { name: string; appts: number; revenue: number; commission: number }
type BranchPoint = { name: string; revenue: number; pct: number; color: string }

const EMPTY_REVENUE: RevenuePoint[] = []
const EMPTY_BOOKINGS: BookingChannelPoint[] = []
const EMPTY_SERVICES: TopServicePoint[] = []
const EMPTY_CUSTOMER_SPLIT: CustomerSplitPoint[] = []
const EMPTY_STAFF_ROWS: StaffRow[] = []
const EMPTY_BRANCHES: BranchPoint[] = []
const WEEK_LABELS = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
const DEFAULT_BRANCH_OPTIONS = ['All Branches']

const PRESETS = ['Today', 'Week', 'Month', 'Last Month'] as const
type Preset = (typeof PRESETS)[number]

const PIE_COLORS = ['#10B981', '#2563EB']
const BAR_COLORS = { Web: '#2563EB', WalkIn: '#F59E0B', WhatsApp: '#10B981', Call: '#7C3AED' }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupee(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`
  return `₹${v}`
}

function formatMonthDay(date: Date) {
  const monthLabel = new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(date)
  return `${monthLabel} ${date.getDate()}`
}

function buildRevenueSeries(invoices: any[], refDate: Date): RevenuePoint[] {
  const year = refDate.getFullYear()
  const month = refDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totals = Array.from({ length: daysInMonth }, () => 0)

  invoices.forEach((inv) => {
    const date = new Date(inv.createdAt ?? inv.updatedAt ?? inv.date ?? inv.appointmentId?.slot ?? Date.now())
    if (date.getFullYear() !== year || date.getMonth() !== month) return
    totals[date.getDate() - 1] += Number(inv.total ?? 0)
  })

  return totals.map((value, index) => (
    { date: formatMonthDay(new Date(year, month, index + 1)), revenue: Math.round(value) }
  ))
}

function buildBookingsByChannel(appointments: any[], refDate: Date): BookingChannelPoint[] {
  const year = refDate.getFullYear()
  const month = refDate.getMonth()
  const buckets = WEEK_LABELS.map((week) => ({ week, Web: 0, WhatsApp: 0, WalkIn: 0, Call: 0 }))

  appointments.forEach((apt) => {
    const date = new Date(apt.slot ?? apt.date ?? apt.createdAt ?? Date.now())
    if (date.getFullYear() !== year || date.getMonth() !== month) return
    const idx = Math.min(3, Math.floor((date.getDate() - 1) / 7))
    const channel = String(apt.channel ?? 'web').toLowerCase()
    const key = channel === 'whatsapp'
      ? 'WhatsApp'
      : channel === 'walkin'
      ? 'WalkIn'
      : channel === 'call'
      ? 'Call'
      : 'Web'
    buckets[idx][key] += 1
  })

  return buckets
}

function buildTopServices(appointments: any[]): TopServicePoint[] {
  const totals: Record<string, number> = {}
  appointments.forEach((apt) => {
    const name = apt.serviceId?.name ?? apt.serviceName ?? 'Service'
    const price = Number(apt.price ?? apt.serviceId?.price ?? 0)
    totals[name] = (totals[name] ?? 0) + price
  })

  return Object.entries(totals)
    .map(([service, revenue]) => ({ service, revenue: Math.round(revenue) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
}

function buildCustomerSplit(customers: any[]): { split: CustomerSplitPoint[]; total: number } {
  const total = customers.length
  if (total === 0) {
    return { split: [], total }
  }
  const newCount = customers.filter((c) => Number(c.totalVisits ?? 0) <= 1).length
  const returning = total - newCount
  const newPct = Math.round((newCount / total) * 100)
  const returningPct = 100 - newPct
  return {
    split: [
      { name: 'Returning', value: returningPct },
      { name: 'New', value: newPct },
    ],
    total,
  }
}

function buildStaffRows(users: any[], appointments: any[], invoices: any[]): StaffRow[] {
  const rows = new Map<string, StaffRow>()

  users.forEach((user) => {
    const key = String(user._id ?? user.id ?? user.name)
    rows.set(key, { name: user.name ?? 'Staff', appts: 0, revenue: 0, commission: 0 })
  })

  appointments.forEach((apt) => {
    const staffId = apt.staffId?._id ?? apt.staffId
    if (!staffId) return
    const key = String(staffId)
    const existing = rows.get(key) ?? {
      name: apt.staffId?.name ?? 'Staff',
      appts: 0,
      revenue: 0,
      commission: 0,
    }
    existing.appts += 1
    rows.set(key, existing)
  })

  invoices.forEach((inv) => {
    const lineItems = Array.isArray(inv.lineItems) ? inv.lineItems : []
    lineItems.forEach((item: any) => {
      const staffId = item.staffId?._id ?? item.staffId ?? item.staffName
      if (!staffId) return
      const key = String(staffId)
      const existing = rows.get(key) ?? {
        name: item.staffName ?? item.staffId?.name ?? 'Staff',
        appts: 0,
        revenue: 0,
        commission: 0,
      }
      const price = Number(item.price ?? 0)
      const commission = Number(item.commissionAmount ?? Math.round(price * (Number(item.commissionRate ?? 0) / 100)))
      existing.revenue += price
      existing.commission += commission
      rows.set(key, existing)
    })
  })

  return Array.from(rows.values()).sort((a, b) => b.revenue - a.revenue)
}

function buildBranchData(branches: any[], invoices: any[]): BranchPoint[] {
  const totals: Record<string, number> = {}
  invoices.forEach((inv) => {
    const branchId = inv.branchId?._id ?? inv.branchId
    if (!branchId) return
    const key = String(branchId)
    totals[key] = (totals[key] ?? 0) + Number(inv.total ?? 0)
  })
  const maxRevenue = Math.max(...Object.values(totals), 1)
  const colors = ['#2563EB', '#7C3AED', '#0D9488', '#F59E0B', '#EC4899']
  return branches.map((branch, index) => {
    const revenue = totals[String(branch._id)] ?? 0
    return {
      name: branch.name,
      revenue,
      pct: Math.round((revenue / maxRevenue) * 100),
      color: colors[index % colors.length],
    }
  })
}

// ─── Count-up hook ───────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1.4) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, target, { duration, ease: 'easeOut' })
    const unsub = rounded.on('change', setDisplay)
    return () => {
      controls.stop()
      unsub()
    }
  }, [inView, target, duration, count, rounded])

  return { ref, display }
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#2563EB30] bg-[#1C1F2A] px-3 py-2 shadow-xl text-xs">
      <p className="mb-1 font-semibold text-text-primary">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color ?? p.stroke }}>
          {p.name ?? p.dataKey}: {typeof p.value === 'number' && p.dataKey === 'revenue'
            ? `₹${p.value.toLocaleString()}`
            : p.value}
        </p>
      ))}
    </div>
  )
}

function ChannelTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-[#2563EB30] bg-[#1C1F2A] px-3 py-2 shadow-xl text-xs">
      <p className="mb-1 font-semibold text-text-primary">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: number
  prefix?: string
  trend: number
  icon: React.ReactNode
  iconColor: string
  delay?: number
}

function KpiCard({ label, value, prefix = '', trend, icon, iconColor, delay = 0 }: KpiCardProps) {
  const { ref, display } = useCountUp(value)
  const isUp = trend >= 0
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-border bg-bg-card p-5 flex flex-col gap-3 hover:-translate-y-0.5 transition-transform"
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</span>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <p className="text-3xl font-bold tracking-tight text-text-primary">
        {prefix}{display.toLocaleString()}
      </p>
      <div className={`flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 w-fit ${isUp ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
        {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isUp ? '+' : ''}{trend}% vs last month
      </div>
    </motion.div>
  )
}

// ─── Branch Bar ──────────────────────────────────────────────────────────────

function BranchBar({ branch, index }: { branch: BranchPoint; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-primary font-medium">{branch.name}</span>
        <span className="font-bold text-text-primary">₹{(branch.revenue / 1000).toFixed(0)}k</span>
      </div>
      <div className="h-2 w-full rounded-full bg-bg-elevated overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: branch.color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${branch.pct}%` } : { width: 0 }}
          transition={{ duration: 0.8, delay: index * 0.15, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-text-muted text-right">{branch.pct}%</p>
    </div>
  )
}

// ─── Staff Table ─────────────────────────────────────────────────────────────

type SortKey = 'name' | 'appts' | 'revenue' | 'commission'

function StaffTable({ rows, loading }: { rows: StaffRow[]; loading: boolean }) {
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [sortAsc, setSortAsc] = useState(false)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey]
    const bv = b[sortKey]
    if (typeof av === 'string') return sortAsc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown size={12} className="text-text-muted" />
    return sortAsc ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />
  }

  const cols: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'appts', label: 'Appts' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'commission', label: 'Commission' },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {cols.map((c) => (
              <th
                key={c.key}
                onClick={() => handleSort(c.key)}
                className="pb-2 text-left font-semibold text-text-muted text-xs uppercase tracking-wide cursor-pointer select-none hover:text-text-primary transition-colors"
              >
                <span className="flex items-center gap-1">{c.label} <SortIcon col={c.key} /></span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="py-6">
                <div className="h-20 rounded-lg bg-bg-elevated/60 animate-pulse" />
              </td>
            </tr>
          ) : sorted.map((row, i) => (
            <tr
              key={`${row.name}-${i}`}
              className="border-b border-border/50 transition-colors hover:bg-[#2563EB08]"
            >
              <td className="py-2.5 font-medium text-text-primary">{row.name}</td>
              <td className="py-2.5 text-text-muted">{row.appts}</td>
              <td className="py-2.5 text-text-primary">₹{row.revenue.toLocaleString()}</td>
              <td className="py-2.5 font-semibold text-emerald-400">₹{row.commission.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Custom Pie Label ────────────────────────────────────────────────────────

function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#F8FAFC" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ─── Service Bar Label ───────────────────────────────────────────────────────

function ServiceBarLabel(props: any) {
  const { x, y, width, height, value } = props
  return (
    <text x={x + width + 6} y={y + height / 2} fill="#94A3B8" fontSize={11} dominantBaseline="central">
      {formatRupee(value)}
    </text>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [preset, setPreset] = useState<Preset>('Month')
  const [branch, setBranch] = useState(DEFAULT_BRANCH_OPTIONS[0])
  const [branchOpen, setBranchOpen] = useState(false)
  const [revToggle, setRevToggle] = useState<'Daily' | 'Weekly'>('Daily')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>(EMPTY_REVENUE)
  const [bookingsByChannel, setBookingsByChannel] = useState<BookingChannelPoint[]>(EMPTY_BOOKINGS)
  const [topServices, setTopServices] = useState<TopServicePoint[]>(EMPTY_SERVICES)
  const [customerSplit, setCustomerSplit] = useState<CustomerSplitPoint[]>(EMPTY_CUSTOMER_SPLIT)
  const [staffRows, setStaffRows] = useState<StaffRow[]>(EMPTY_STAFF_ROWS)
  const [branchData, setBranchData] = useState<BranchPoint[]>(EMPTY_BRANCHES)
  const [totalCustomers, setTotalCustomers] = useState(0)

  useEffect(() => {
    let active = true

    const fetchReportsData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [appointmentsRes, invoicesRes, customersRes, branchesRes, usersRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/invoices'),
          fetch('/api/customers'),
          fetch('/api/branches'),
          fetch('/api/users'),
        ])

        if (!appointmentsRes.ok || !invoicesRes.ok || !customersRes.ok || !branchesRes.ok || !usersRes.ok) {
          throw new Error('Failed to load reports data')
        }

        const [appointmentsPayload, invoicesPayload, customersPayload, branchesPayload, usersPayload] = await Promise.all([
          appointmentsRes.json(),
          invoicesRes.json(),
          customersRes.json(),
          branchesRes.json(),
          usersRes.json(),
        ])

        if (!active) return

        setAppointments(appointmentsPayload.data ?? [])
        setInvoices(invoicesPayload.data ?? [])
        setCustomers(customersPayload.data ?? [])
        setBranches(branchesPayload.data ?? [])
        setUsers(usersPayload.data ?? [])
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load reports data')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchReportsData()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const referenceDate = new Date()
    const branchFilteredAppointments = branch === 'All Branches'
      ? appointments
      : appointments.filter((apt) => apt.branchId?.name === branch)
    const branchFilteredInvoices = branch === 'All Branches'
      ? invoices
      : invoices.filter((inv) => inv.branchId?.name === branch)

    setRevenueData(buildRevenueSeries(branchFilteredInvoices, referenceDate))
    setBookingsByChannel(buildBookingsByChannel(branchFilteredAppointments, referenceDate))
    setTopServices(buildTopServices(branchFilteredAppointments))

    const { split, total } = buildCustomerSplit(customers)
    setCustomerSplit(split)
    setTotalCustomers(total)

    setStaffRows(buildStaffRows(users, branchFilteredAppointments, branchFilteredInvoices))
    setBranchData(buildBranchData(branches, branchFilteredInvoices))
  }, [appointments, invoices, customers, branches, users, branch])

  // every-5th-date ticks for area chart X axis
  const xTicks = revenueData.filter((_, i) => i % 5 === 0).map((d) => d.date)

  const branchOptions = [
    ...DEFAULT_BRANCH_OPTIONS,
    ...branches.map((item) => item.name).filter((name) => !DEFAULT_BRANCH_OPTIONS.includes(name)),
  ]

  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total ?? 0), 0)
  const totalAppointments = appointments.length
  const newCustomerCount = customers.filter((c) => Number(c.totalVisits ?? 0) <= 1).length
  const avgBill = invoices.length > 0 ? Math.round(totalRevenue / invoices.length) : 0

  return (
    <div className="space-y-6">

      {/* ── Controls row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Preset tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-card p-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                preset === p
                  ? 'bg-primary text-white shadow'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Branch dropdown */}
          <div className="relative">
            <button
              onClick={() => setBranchOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-border bg-bg-card px-3 py-2 text-xs font-medium text-text-primary hover:border-white/10 transition-colors"
            >
              {branch}
              <ChevronDown size={12} className={`text-text-muted transition-transform ${branchOpen ? 'rotate-180' : ''}`} />
            </button>
            {branchOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg border border-border bg-bg-elevated shadow-xl">
                {branchOptions.map((b) => (
                  <button
                    key={b}
                    onClick={() => { setBranch(b); setBranchOpen(false) }}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-bg-primary ${b === branch ? 'text-primary font-semibold' : 'text-text-muted'}`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export */}
          <button className="flex items-center gap-2 rounded-lg border border-border bg-bg-card px-3 py-2 text-xs font-semibold text-text-primary hover:border-primary/40 hover:text-primary transition-colors">
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      {/* ── KPI row ── */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[104px] rounded-xl border border-border bg-bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Total Revenue" value={totalRevenue} prefix="₹" trend={18} icon={<TrendingUp size={18} />} iconColor="#10B981" delay={0} />
          <KpiCard label="Appointments" value={totalAppointments} trend={8} icon={<Calendar size={18} />} iconColor="#2563EB" delay={0.05} />
          <KpiCard label="New Customers" value={newCustomerCount} trend={23} icon={<UserPlus size={18} />} iconColor="#10B981" delay={0.1} />
          <KpiCard label="Avg Bill" value={avgBill} prefix="₹" trend={-3} icon={<TrendingDown size={18} />} iconColor="#EF4444" delay={0.15} />
        </div>
      )}

      {/* ── Revenue area chart ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="rounded-xl border border-border bg-bg-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Revenue Trend — May 2025</h3>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-bg-elevated p-0.5">
            {(['Daily', 'Weekly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRevToggle(t)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${revToggle === t ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="h-[280px] rounded-lg bg-bg-elevated/60 animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#ffffff08" vertical={false} />
              <XAxis
                dataKey="date"
                ticks={xTicks}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fill: '#94A3B8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<DarkTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#blueGrad)"
                isAnimationActive
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* ── Two-column row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bookings by channel */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Bookings by Channel</h3>
          {loading ? (
            <div className="h-[250px] rounded-lg bg-bg-elevated/60 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bookingsByChannel} barCategoryGap="28%">
                <CartesianGrid stroke="#ffffff08" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<ChannelTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: '#94A3B8', paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="Web" name="Web" fill={BAR_COLORS.Web} radius={[3, 3, 0, 0]} />
                <Bar dataKey="WhatsApp" name="WhatsApp" fill={BAR_COLORS.WhatsApp} radius={[3, 3, 0, 0]} />
                <Bar dataKey="WalkIn" name="Walk-in" fill={BAR_COLORS.WalkIn} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Call" name="Call" fill={BAR_COLORS.Call} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top services horizontal bar */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Top Services</h3>
          {loading ? (
            <div className="h-[250px] rounded-lg bg-bg-elevated/60 animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={topServices}
                layout="vertical"
                margin={{ top: 0, right: 64, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="#ffffff08" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="service"
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="revenue" fill="#2563EB" radius={[0, 3, 3, 0]} isAnimationActive>
                  <LabelList dataKey="revenue" content={<ServiceBarLabel />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Bottom three-column row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Customer split pie */}
        <div className="rounded-xl border border-border bg-bg-card p-5 flex flex-col">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Customer Split</h3>
          <div className="flex-1 flex flex-col items-center">
            {loading ? (
              <div className="h-[200px] rounded-lg bg-bg-elevated/60 animate-pulse" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={customerSplit}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      labelLine={false}
                      label={renderPieLabel}
                      isAnimationActive
                    >
                      {customerSplit.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" fill="#F8FAFC" fontSize={15} fontWeight={700}>
                      {totalCustomers}
                    </text>
                    <text x="50%" y="56%" textAnchor="middle" dominantBaseline="central" fill="#94A3B8" fontSize={10}>
                      total
                    </text>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 text-xs">
                  {customerSplit.map((d, i) => (
                    <span key={d.name} className="flex items-center gap-1.5 text-text-muted">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      {d.name} ({d.value}%)
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Staff performance table */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Staff Performance</h3>
          <StaffTable rows={staffRows} loading={loading} />
        </div>

        {/* Branch comparison */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h3 className="mb-5 text-sm font-semibold text-text-primary">Branch Comparison</h3>
          <div className="space-y-5">
            {loading ? (
              <div className="h-28 rounded-lg bg-bg-elevated/60 animate-pulse" />
            ) : branchData.map((b, i) => (
              <BranchBar key={b.name} branch={b} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// recharts doesn't export LabelList directly from named exports in some versions
// so we import it inline
import { LabelList } from 'recharts'
