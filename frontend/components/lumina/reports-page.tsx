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

const REVENUE_DATA = [
  { date: 'May 1', revenue: 8200 },
  { date: 'May 2', revenue: 9100 },
  { date: 'May 3', revenue: 14800 },
  { date: 'May 4', revenue: 15200 },
  { date: 'May 5', revenue: 9600 },
  { date: 'May 6', revenue: 8800 },
  { date: 'May 7', revenue: 7900 },
  { date: 'May 8', revenue: 10200 },
  { date: 'May 9', revenue: 9400 },
  { date: 'May 10', revenue: 15600 },
  { date: 'May 11', revenue: 14900 },
  { date: 'May 12', revenue: 8700 },
  { date: 'May 13', revenue: 9300 },
  { date: 'May 14', revenue: 10100 },
  { date: 'May 15', revenue: 11200 },
  { date: 'May 16', revenue: 10600 },
  { date: 'May 17', revenue: 15400 },
  { date: 'May 18', revenue: 16000 },
  { date: 'May 19', revenue: 9800 },
  { date: 'May 20', revenue: 8500 },
  { date: 'May 21', revenue: 9200 },
  { date: 'May 22', revenue: 10400 },
  { date: 'May 23', revenue: 10900 },
  { date: 'May 24', revenue: 15800 },
  { date: 'May 25', revenue: 14600 },
  { date: 'May 26', revenue: 9100 },
  { date: 'May 27', revenue: 8400 },
  { date: 'May 28', revenue: 9700 },
  { date: 'May 29', revenue: 10300 },
  { date: 'May 30', revenue: 11100 },
]

const BOOKINGS_BY_CHANNEL = [
  { week: 'Week 1', Web: 45, WhatsApp: 38, WalkIn: 22, Call: 12 },
  { week: 'Week 2', Web: 52, WhatsApp: 41, WalkIn: 19, Call: 15 },
  { week: 'Week 3', Web: 38, WhatsApp: 55, WalkIn: 25, Call: 8 },
  { week: 'Week 4', Web: 61, WhatsApp: 47, WalkIn: 21, Call: 11 },
]

const TOP_SERVICES = [
  { service: 'Hair Color', revenue: 86500 },
  { service: 'Haircut', revenue: 48000 },
  { service: 'Facial', revenue: 31200 },
  { service: 'Keratin', revenue: 28400 },
  { service: 'Manicure', revenue: 19800 },
  { service: 'Pedicure', revenue: 16200 },
  { service: 'Hair Spa', revenue: 14500 },
  { service: 'Head Massage', revenue: 11800 },
]

const CUSTOMER_SPLIT = [
  { name: 'Returning', value: 62 },
  { name: 'New', value: 38 },
]

const STAFF_DATA = [
  { name: 'Priya Sharma', appts: 28, revenue: 42000, commission: 5040 },
  { name: 'Rahul Verma', appts: 22, revenue: 31500, commission: 3150 },
  { name: 'Sneha Iyer', appts: 19, revenue: 27800, commission: 2780 },
  { name: 'Vikram D', appts: 31, revenue: 48200, commission: 5784 },
  { name: 'Meera Kapoor', appts: 35, revenue: 21000, commission: 1680 },
]

const BRANCH_DATA = [
  { name: 'Banjara Hills', revenue: 140000, pct: 88, color: '#2563EB' },
  { name: 'Jubilee Hills', revenue: 110000, pct: 71, color: '#7C3AED' },
  { name: 'Madhapur', revenue: 80000, pct: 52, color: '#0D9488' },
]

const PRESETS = ['Today', 'Week', 'Month', 'Last Month'] as const
type Preset = (typeof PRESETS)[number]

const BRANCHES = ['All Branches', 'Banjara Hills', 'Jubilee Hills', 'Madhapur']

const PIE_COLORS = ['#10B981', '#2563EB']
const BAR_COLORS = { Web: '#2563EB', WalkIn: '#F59E0B', WhatsApp: '#10B981', Call: '#7C3AED' }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRupee(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`
  return `₹${v}`
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

function BranchBar({ branch, index }: { branch: typeof BRANCH_DATA[number]; index: number }) {
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

function StaffTable() {
  const [sortKey, setSortKey] = useState<SortKey>('revenue')
  const [sortAsc, setSortAsc] = useState(false)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(false) }
  }

  const sorted = [...STAFF_DATA].sort((a, b) => {
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
          {sorted.map((row, i) => (
            <tr
              key={row.name}
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
  const [branch, setBranch] = useState('All Branches')
  const [branchOpen, setBranchOpen] = useState(false)
  const [revToggle, setRevToggle] = useState<'Daily' | 'Weekly'>('Daily')

  // every-5th-date ticks for area chart X axis
  const xTicks = REVENUE_DATA.filter((_, i) => i % 5 === 0).map((d) => d.date)

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
                {BRANCHES.map((b) => (
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

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={324500} prefix="₹" trend={18} icon={<TrendingUp size={18} />} iconColor="#10B981" delay={0} />
        <KpiCard label="Appointments" value={412} trend={8} icon={<Calendar size={18} />} iconColor="#2563EB" delay={0.05} />
        <KpiCard label="New Customers" value={67} trend={23} icon={<UserPlus size={18} />} iconColor="#10B981" delay={0.1} />
        <KpiCard label="Avg Bill" value={787} prefix="₹" trend={-3} icon={<TrendingDown size={18} />} iconColor="#EF4444" delay={0.15} />
      </div>

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
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
      </motion.div>

      {/* ── Two-column row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bookings by channel */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Bookings by Channel</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={BOOKINGS_BY_CHANNEL} barCategoryGap="28%">
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
        </div>

        {/* Top services horizontal bar */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Top Services</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={TOP_SERVICES}
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
        </div>
      </div>

      {/* ── Bottom three-column row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Customer split pie */}
        <div className="rounded-xl border border-border bg-bg-card p-5 flex flex-col">
          <h3 className="mb-2 text-sm font-semibold text-text-primary">Customer Split</h3>
          <div className="flex-1 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={CUSTOMER_SPLIT}
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
                  {CUSTOMER_SPLIT.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <text x="50%" y="46%" textAnchor="middle" dominantBaseline="central" fill="#F8FAFC" fontSize={15} fontWeight={700}>
                  412
                </text>
                <text x="50%" y="56%" textAnchor="middle" dominantBaseline="central" fill="#94A3B8" fontSize={10}>
                  total
                </text>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 text-xs">
              {CUSTOMER_SPLIT.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1.5 text-text-muted">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  {d.name} ({d.value}%)
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Staff performance table */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Staff Performance</h3>
          <StaffTable />
        </div>

        {/* Branch comparison */}
        <div className="rounded-xl border border-border bg-bg-card p-5">
          <h3 className="mb-5 text-sm font-semibold text-text-primary">Branch Comparison</h3>
          <div className="space-y-5">
            {BRANCH_DATA.map((b, i) => (
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
