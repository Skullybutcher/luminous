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

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const STAFF: StaffMember[] = [
  {
    id: 1, name: 'Priya Sharma', initials: 'PS', role: 'Senior Stylist',
    services: 28, revenue: 42000, commissionRate: 12, commission: 5040,
    weeklyBars: [55, 70, 40, 85, 60, 90, 75],
    gradientFrom: '#2563EB', gradientTo: '#7C3AED',
    breakdown: [
      { service: 'Keratin Treatment', count: 8, revenue: 16000, commission: 1920 },
      { service: 'Hair Color + Cut',  count: 10, revenue: 14000, commission: 1680 },
      { service: 'Blow Dry & Style',  count: 5,  revenue: 5000,  commission: 600  },
      { service: 'Deep Conditioning', count: 3,  revenue: 4500,  commission: 540  },
      { service: 'Hair Spa',          count: 2,  revenue: 2500,  commission: 300  },
    ],
  },
  {
    id: 2, name: 'Rahul Verma', initials: 'RV', role: 'Stylist',
    services: 22, revenue: 31500, commissionRate: 10, commission: 3150,
    weeklyBars: [40, 55, 65, 50, 70, 45, 60],
    gradientFrom: '#0EA5E9', gradientTo: '#2563EB',
    breakdown: [
      { service: 'Haircut & Styling', count: 12, revenue: 9600,  commission: 960  },
      { service: 'Hair Color',        count: 5,  revenue: 10000, commission: 1000 },
      { service: 'Beard Design',      count: 3,  revenue: 1500,  commission: 150  },
      { service: 'Hair Spa',          count: 2,  revenue: 7400,  commission: 740  },
      { service: 'Scalp Treatment',   count: 0,  revenue: 3000,  commission: 300  },
    ],
  },
  {
    id: 3, name: 'Sneha Iyer', initials: 'SI', role: 'Stylist',
    services: 19, revenue: 27800, commissionRate: 10, commission: 2780,
    weeklyBars: [35, 45, 60, 40, 75, 55, 50],
    gradientFrom: '#EC4899', gradientTo: '#F43F5E',
    breakdown: [
      { service: 'Facial & Cleanup',  count: 9,  revenue: 13500, commission: 1350 },
      { service: 'Bridal Makeup',     count: 2,  revenue: 8000,  commission: 800  },
      { service: 'Eyebrows & Lashes', count: 4,  revenue: 2800,  commission: 280  },
      { service: 'Skin Brightening',  count: 3,  revenue: 2700,  commission: 270  },
      { service: 'Party Makeup',      count: 1,  revenue: 800,   commission: 80   },
    ],
  },
  {
    id: 4, name: 'Vikram D', initials: 'VD', role: 'Senior Stylist',
    services: 31, revenue: 48200, commissionRate: 12, commission: 5784,
    weeklyBars: [65, 80, 55, 90, 70, 85, 95],
    gradientFrom: '#F59E0B', gradientTo: '#EF4444',
    breakdown: [
      { service: 'Executive Haircut', count: 15, revenue: 15000, commission: 1800 },
      { service: 'Hair Coloring',     count: 8,  revenue: 20000, commission: 2400 },
      { service: 'Beard Sculpt',      count: 5,  revenue: 6000,  commission: 720  },
      { service: 'Scalp Massage',     count: 2,  revenue: 4200,  commission: 504  },
      { service: 'Hot Oil Treatment', count: 1,  revenue: 3000,  commission: 360  },
    ],
  },
  {
    id: 5, name: 'Meera Kapoor', initials: 'MK', role: 'Nail Tech',
    services: 35, revenue: 21000, commissionRate: 8, commission: 1680,
    weeklyBars: [75, 90, 80, 95, 85, 70, 88],
    gradientFrom: '#7C3AED', gradientTo: '#EC4899',
    breakdown: [
      { service: 'Gel Nail Art',      count: 15, revenue: 9000,  commission: 720  },
      { service: 'Manicure',          count: 10, revenue: 5000,  commission: 400  },
      { service: 'Pedicure',          count: 7,  revenue: 4200,  commission: 336  },
      { service: 'Nail Extensions',   count: 2,  revenue: 2400,  commission: 192  },
      { service: 'French Tips',       count: 1,  revenue: 400,   commission: 32   },
    ],
  },
  {
    id: 6, name: 'Arjun T', initials: 'AT', role: 'Manager',
    services: 15, revenue: 38000, commissionRate: 15, commission: 5700,
    weeklyBars: [45, 60, 50, 70, 55, 65, 58],
    gradientFrom: '#10B981', gradientTo: '#0EA5E9',
    breakdown: [
      { service: 'Premium Haircut',   count: 5,  revenue: 10000, commission: 1500 },
      { service: 'VIP Grooming',      count: 4,  revenue: 12000, commission: 1800 },
      { service: 'Consultation',      count: 4,  revenue: 8000,  commission: 1200 },
      { service: 'Color Correction',  count: 1,  revenue: 6000,  commission: 900  },
      { service: 'Package Deal',      count: 1,  revenue: 2000,  commission: 300  },
    ],
  },
]

const TOTAL_PAYOUT = STAFF.reduce((s, m) => s + m.commission, 0)
const TOP_EARNER = STAFF.reduce((a, b) => a.commission > b.commission ? a : b)

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

  const months = ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025']
  const monthIdx = months.indexOf(month)

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
          <select className="bg-[#1C1F2A] border border-white/8 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none appearance-none cursor-pointer">
            <option>Downtown Branch</option>
            <option>Westside Branch</option>
          </select>
          {/* Export */}
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-5">
        {/* Total overview card */}
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
                <CountUp target={TOTAL_PAYOUT} />
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-black/20 border border-white/5 rounded-lg px-4 py-3 min-w-[130px]">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Top Earner</p>
                <p className="text-sm font-bold text-foreground">{TOP_EARNER.name.split(' ')[0]}</p>
                <p className="text-xs text-success font-semibold mt-0.5">₹{TOP_EARNER.commission.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-black/20 border border-white/5 rounded-lg px-4 py-3 min-w-[130px]">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Avg per Stylist</p>
                <p className="text-sm font-bold text-foreground">
                  ₹{Math.round(TOTAL_PAYOUT / STAFF.length).toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{STAFF.length} staff</p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STAFF.map((member, i) => (
            <StaffCard
              key={member.id}
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
