'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────
interface StaffMember {
  id: number
  name: string
  initials: string
  role: string
  services: number
  revenue: number
  commissionRate: number
  commission: number
  weeklyBars: number[]
  gradientFrom: string
  gradientTo: string
  breakdown: ServiceBreakdown[]
}

interface ServiceBreakdown {
  service: string
  count: number
  revenue: number
  commission: number
}

const EMPTY_STAFF: StaffMember[] = []
const STAFF_GRADIENTS = [
  ['#2563EB', '#7C3AED'],
  ['#0EA5E9', '#2563EB'],
  ['#EC4899', '#F43F5E'],
  ['#F59E0B', '#EF4444'],
  ['#7C3AED', '#EC4899'],
  ['#10B981', '#0EA5E9'],
]

function buildStaffFromInvoices(
  users: any[],
  invoices: any[],
  monthDate: Date,
  branchName: string
): StaffMember[] {
  const staffMap = new Map<string, StaffMember>()
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()

  users.forEach((user, index) => {
    const key = String(user._id ?? user.id ?? user.name)
    const initials = String(user.name ?? 'S')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
    const [from, to] = STAFF_GRADIENTS[index % STAFF_GRADIENTS.length]
    staffMap.set(key, {
      id: index,
      name: user.name ?? 'Staff',
      initials,
      role: user.role ?? 'Stylist',
      services: 0,
      revenue: 0,
      commissionRate: Number(user.commissionRate ?? 0),
      commission: 0,
      weeklyBars: Array.from({ length: 7 }, () => 0),
      gradientFrom: from,
      gradientTo: to,
      breakdown: [],
    })
  })

  invoices.forEach((inv) => {
    if (branchName !== 'All Branches' && inv.branchId?.name !== branchName) return
    const createdAt = new Date(inv.createdAt ?? inv.updatedAt ?? Date.now())
    if (createdAt.getFullYear() !== year || createdAt.getMonth() !== month) return

    const dayIndex = createdAt.getDay()
    const lineItems = Array.isArray(inv.lineItems) ? inv.lineItems : []
    lineItems.forEach((item: any) => {
      const staffId = item.staffId?._id ?? item.staffId ?? item.staffName
      if (!staffId) return
      const key = String(staffId)
      const staff = staffMap.get(key) ?? {
        id: staffMap.size,
        name: item.staffName ?? 'Staff',
        initials: String(item.staffName ?? 'S').slice(0, 2).toUpperCase(),
        role: 'Stylist',
        services: 0,
        revenue: 0,
        commissionRate: Number(item.commissionRate ?? 0),
        commission: 0,
        weeklyBars: Array.from({ length: 7 }, () => 0),
        gradientFrom: STAFF_GRADIENTS[staffMap.size % STAFF_GRADIENTS.length][0],
        gradientTo: STAFF_GRADIENTS[staffMap.size % STAFF_GRADIENTS.length][1],
        breakdown: [],
      }

      const price = Number(item.price ?? 0)
      const commission = Number(item.commissionAmount ?? Math.round(price * (Number(item.commissionRate ?? 0) / 100)))
      staff.services += 1
      staff.revenue += price
      staff.commission += commission
      staff.weeklyBars[dayIndex] = (staff.weeklyBars[dayIndex] ?? 0) + price

      const serviceName = item.serviceName ?? item.serviceId?.name ?? 'Service'
      const breakdownRow = staff.breakdown.find((row) => row.service === serviceName)
      if (breakdownRow) {
        breakdownRow.count += 1
        breakdownRow.revenue += price
        breakdownRow.commission += commission
      } else {
        staff.breakdown.push({ service: serviceName, count: 1, revenue: price, commission })
      }

      staffMap.set(key, staff)
    })
  })

  return Array.from(staffMap.values())
    .map((staff) => ({
      ...staff,
      weeklyBars: staff.weeklyBars.map((value) => Math.round(value)),
      breakdown: staff.breakdown
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6),
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

// ─── Animated Count-up ────────────────────────────────────────────────────────
function CountUp({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0)
  const raf = useRef<number | null>(null)
  const start = useRef<number | null>(null)
  const duration = 1200

  useEffect(() => {
    start.current = null
    const animate = (ts: number) => {
      if (!start.current) start.current = ts
      const progress = Math.min((ts - start.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target])

  return <>{prefix}{displayed.toLocaleString('en-IN')}{suffix}</>
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function MiniBarChart({ bars }: { bars: number[] }) {
  const [animate, setAnimate] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimate(true), 200); return () => clearTimeout(t) }, [])
  const max = Math.max(...bars)

  return (
    <div className="flex items-end gap-0.5 h-10 w-full">
      {bars.map((h, i) => {
        const pct = (h / max) * 100
        return (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ background: pct === 100 ? 'rgba(37,99,235,0.8)' : 'rgba(37,99,235,0.25)' }}
            initial={{ height: 0 }}
            animate={{ height: animate ? `${pct}%` : 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

// ─── Staff Detail Modal ────────────────────────────────────────────────────────
function StaffModal({ staff, onClose }: { staff: StaffMember | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {staff && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-[#16181F] border border-white/8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#1C1F2A]/50 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${staff.gradientFrom}, ${staff.gradientTo})` }}
                  >
                    {staff.initials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{staff.name}</h3>
                    <p className="text-xs text-muted-foreground">{staff.role} · May 2025 Breakdown</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Mini chart */}
                <div className="bg-[#1C1F2A] rounded-xl border border-white/5 p-4 mb-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Weekly Earnings Trend</p>
                  <MiniBarChart bars={staff.weeklyBars} />
                  <div className="flex justify-between mt-1">
                    {['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'].map((w) => (
                      <span key={w} className="text-[10px] text-muted-foreground/60">{w}</span>
                    ))}
                  </div>
                </div>

                {/* Breakdown table */}
                <div className="rounded-xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#1C1F2A]/70 border-b border-white/5">
                        <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Service</th>
                        <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Count</th>
                        <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Revenue</th>
                        <th className="py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.breakdown.map((row, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="border-b border-white/5 last:border-0 hover:bg-[#1C1F2A]/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-foreground font-medium">{row.service}</td>
                          <td className="py-3 px-4 text-muted-foreground text-right">{row.count}</td>
                          <td className="py-3 px-4 text-foreground text-right">₹{row.revenue.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-success font-bold">₹{row.commission.toLocaleString('en-IN')}</span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#1C1F2A]/80 border-t border-white/10">
                        <td className="py-3 px-4 text-sm font-bold text-foreground">Total</td>
                        <td className="py-3 px-4 text-right text-muted-foreground font-bold">{staff.services}</td>
                        <td className="py-3 px-4 text-right font-bold text-foreground">₹{staff.revenue.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-success font-bold text-base">₹{staff.commission.toLocaleString('en-IN')}</span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Staff Card ────────────────────────────────────────────────────────────────
function StaffCard({ member, index, onOpen }: { member: StaffMember; index: number; onOpen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: '0 0 24px rgba(37,99,235,0.2)' }}
      className="bg-card border border-white/5 rounded-xl p-5 flex flex-col gap-4 cursor-pointer transition-colors hover:border-primary/20"
      onClick={onOpen}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md"
            style={{ background: `linear-gradient(135deg, ${member.gradientFrom}, ${member.gradientTo})` }}
          >
            {member.initials}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-tight">{member.name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{member.role}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wider border border-success/20">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Active
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#1C1F2A] rounded-lg p-2.5 border border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Services</p>
          <p className="text-sm font-bold text-foreground">{member.services}</p>
        </div>
        <div className="bg-[#1C1F2A] rounded-lg p-2.5 border border-white/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Revenue</p>
          <p className="text-sm font-bold text-foreground">₹{(member.revenue / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Commission earned */}
      <div className="bg-success/8 border border-success/15 rounded-lg px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-success/70 uppercase tracking-wider font-semibold">Commission Earned</p>
            <p className="text-lg font-bold text-success mt-0.5">
              ₹<CountUp target={member.commission} />
            </p>
          </div>
          <span className="text-xs text-success/60 font-semibold">{member.commissionRate}%</span>
        </div>
      </div>

      {/* Mini bar chart */}
      <MiniBarChart bars={member.weeklyBars} />

      {/* View Details button */}
      <button
        onClick={(e) => { e.stopPropagation(); onOpen() }}
        className="w-full py-2 rounded-lg border border-white/10 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
      >
        View Details
      </button>
    </motion.div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function StaffCommission() {
  const [month, setMonth] = useState('May 2025')
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(EMPTY_STAFF)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [branchFilter, setBranchFilter] = useState('All Branches')
  const [branchOptions, setBranchOptions] = useState<{ id: string; name: string }[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  const months = ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025']
  const monthIdx = months.indexOf(month)

  useEffect(() => {
    let active = true

    const fetchStaffData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [invoicesRes, usersRes, branchesRes] = await Promise.all([
          fetch('/api/invoices'),
          fetch('/api/users'),
          fetch('/api/branches'),
        ])

        if (!invoicesRes.ok || !usersRes.ok || !branchesRes.ok) {
          throw new Error('Failed to load staff commission data')
        }

        const [invoicesPayload, usersPayload, branchesPayload] = await Promise.all([
          invoicesRes.json(),
          usersRes.json(),
          branchesRes.json(),
        ])

        if (!active) return

        setInvoices(invoicesPayload.data ?? [])
        setUsers(usersPayload.data ?? [])
        setBranchOptions(branchesPayload.data ?? [])
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load staff commission data')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchStaffData()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const parsedMonth = new Date(`${month} 1`)
    setStaffMembers(buildStaffFromInvoices(users, invoices, parsedMonth, branchFilter))
  }, [users, invoices, month, branchFilter])

  const totalPayout = staffMembers.reduce((sum, member) => sum + member.commission, 0)
  const topEarner = staffMembers.reduce<StaffMember | null>((best, current) => {
    if (!best) return current
    return current.commission > best.commission ? current : best
  }, null)
  const avgPayout = staffMembers.length > 0 ? Math.round(totalPayout / staffMembers.length) : 0

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page header */}
      <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Staff &amp; Commission</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Performance and payout overview for {month}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-1 bg-[#1C1F2A] border border-white/8 rounded-lg px-2 py-1.5">
            <button
              onClick={() => setMonth(months[Math.max(0, monthIdx - 1)])}
              disabled={monthIdx === 0}
              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <span className="text-sm font-semibold text-foreground px-2 min-w-[80px] text-center">{month}</span>
            <button
              onClick={() => setMonth(months[Math.min(months.length - 1, monthIdx + 1)])}
              disabled={monthIdx === months.length - 1}
              className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
          {/* Branch */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-[#1C1F2A] border border-white/8 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none appearance-none cursor-pointer"
          >
            <option value="All Branches">All Branches</option>
            {branchOptions.map((branch) => (
              <option key={branch.id ?? branch._id ?? branch.name} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>
          {/* Export */}
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-5">
        {error && (
          <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        {/* Total overview card */}
        {loading ? (
          <div className="h-[120px] rounded-xl border border-white/5 bg-bg-card animate-pulse mb-6" />
        ) : (
          <div
            className="relative rounded-xl border border-white/5 p-5 mb-6 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1C1F2A 0%, #16181F 100%)' }}
          >
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-primary/5 rounded-full blur-[48px] pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Commission Payout</p>
                <p className="text-4xl font-bold text-foreground tracking-tight">
                  <span className="text-primary">₹</span>
                  <CountUp target={totalPayout} />
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-black/20 border border-white/5 rounded-lg px-4 py-3 min-w-[130px]">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Top Earner</p>
                  <p className="text-sm font-bold text-foreground">{topEarner?.name?.split(' ')[0] ?? '—'}</p>
                  <p className="text-xs text-success font-semibold mt-0.5">₹{(topEarner?.commission ?? 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-black/20 border border-white/5 rounded-lg px-4 py-3 min-w-[130px]">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Avg per Stylist</p>
                  <p className="text-sm font-bold text-foreground">
                    ₹{avgPayout.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{staffMembers.length} staff</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Staff grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[260px] rounded-xl border border-white/5 bg-bg-card animate-pulse" />
            ))
          ) : staffMembers.map((member, i) => (
            <StaffCard
              key={`${member.id}-${member.name}`}
              member={member}
              index={i}
              onOpen={() => setSelectedStaff(member)}
            />
          ))}
        </div>
      </div>

      <StaffModal staff={selectedStaff} onClose={() => setSelectedStaff(null)} />
    </div>
  )
}
