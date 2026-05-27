'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────
type Membership = 'Gold' | 'Silver' | 'Bronze' | 'None'

interface Customer {
  id: string
  name: string
  initials: string
  phone: string
  email: string
  membership: Membership
  points: number
  visits: number
  lastVisit: string
  totalSpend: string
  memberSince: string
  gradientFrom: string
  gradientTo: string
  visitHistory: VisitRecord[]
}

interface VisitRecord {
  date: string
  service: string
  staff: string
  branch: string
  amount: string
}

const EMPTY_CUSTOMERS: Customer[] = []

// ─── Membership Badge ─────────────────────────────────────────────────────────
const membershipConfig: Record<Membership, { label: string; className: string; dot: string }> = {
  Gold:   { label: 'Gold',   className: 'bg-amber-500/10 text-amber-400 border border-amber-400/25',  dot: 'bg-amber-400' },
  Silver: { label: 'Silver', className: 'bg-slate-400/10 text-slate-300 border border-slate-300/25',  dot: 'bg-slate-300' },
  Bronze: { label: 'Bronze', className: 'bg-orange-700/10 text-orange-400 border border-orange-400/25', dot: 'bg-orange-400' },
  None:   { label: 'None',   className: 'bg-white/5 text-muted-foreground border border-white/10',    dot: 'bg-muted-foreground' },
}

function MembershipBadge({ tier }: { tier: Membership }) {
  const cfg = membershipConfig[tier]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── WhatsApp Icon ────────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.855L.054 23.25a.75.75 0 0 0 .926.926l5.395-1.478A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.663-.49-5.2-1.347l-.374-.21-3.878 1.061 1.061-3.878-.21-.374A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  )
}

// ─── Customer Drawer ──────────────────────────────────────────────────────────
function CustomerDrawer({ customer, onClose }: { customer: Customer | null; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'history' | 'invoices' | 'preferences'>('history')

  return (
    <AnimatePresence>
      {customer && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 h-screen w-[420px] bg-[#16181F] border-l border-white/5 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#1C1F2A]/50">
              <h3 className="text-sm font-semibold text-foreground">Customer Profile</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Avatar + Info */}
              <div className="px-6 py-6 flex flex-col items-center text-center border-b border-white/5">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${customer.gradientFrom}, ${customer.gradientTo})` }}
                >
                  {customer.initials}
                </div>
                <h2 className="text-lg font-bold text-foreground">{customer.name}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{customer.phone}</p>
                <div className="mt-2">
                  <MembershipBadge tier={customer.membership} />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 divide-x divide-white/5 border-b border-white/5">
                {[
                  { label: 'Visits', value: customer.visits },
                  { label: 'Spend', value: customer.totalSpend },
                  { label: 'Points', value: `${customer.points}` },
                  { label: 'Since', value: customer.memberSince },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center py-4 px-2">
                    <span className="text-base font-bold text-foreground">{value}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</span>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5 px-6">
                {(['history', 'invoices', 'preferences'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors capitalize ${
                      activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab === 'history' ? 'Visit History' : tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="px-6 py-4">
                {activeTab === 'history' && (
                  <div className="flex flex-col gap-0">
                    {customer.visitHistory.map((v, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="relative flex gap-4 pb-6 last:pb-0"
                      >
                        {/* Timeline line */}
                        {i < customer.visitHistory.length - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-0 w-px bg-white/5" />
                        )}
                        {/* Dot */}
                        <div className="w-5 h-5 rounded-full bg-[#1C1F2A] border-2 border-primary/40 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{v.service}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{v.staff} · {v.branch}</p>
                            </div>
                            <span className="text-sm font-bold text-primary flex-shrink-0">{v.amount}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground/70 mt-1">{v.date}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {activeTab === 'invoices' && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#1C1F2A] flex items-center justify-center mb-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <p className="text-sm text-muted-foreground">Invoice history coming soon</p>
                  </div>
                )}
                {activeTab === 'preferences' && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#1C1F2A] flex items-center justify-center mb-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                    </div>
                    <p className="text-sm text-muted-foreground">No preferences saved yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 bg-[#1C1F2A]/30">
              <button className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.45)]">
                Book Appointment
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CustomerDatabase() {
  const [search, setSearch] = useState('')
  const [memberFilter, setMemberFilter] = useState<Membership | 'All'>('All')
  const [branchFilter, setBranchFilter] = useState('All')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [visible, setVisible] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>(EMPTY_CUSTOMERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [branchOptions, setBranchOptions] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let active = true

    const fetchCustomers = async () => {
      try {
        setLoading(true)
        setError(null)
        const [customersRes, branchesRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/branches'),
        ])
        if (!customersRes.ok || !branchesRes.ok) {
          throw new Error('Failed to load customers')
        }
        const payload = await customersRes.json()
        const branchesPayload = await branchesRes.json()
        if (!active) return

        const mapped = (payload.data ?? []).map((item: any, index: number) => {
          const membership = (item.membershipTier ?? 'none').toLowerCase()
          const membershipLabel = membership === 'gold'
            ? 'Gold'
            : membership === 'silver'
            ? 'Silver'
            : membership === 'bronze'
            ? 'Bronze'
            : 'None'

          return {
            id: item._id,
            name: item.name,
            initials: item.name
              .split(' ')
              .map((part: string) => part[0])
              .join('')
              .slice(0, 2),
            phone: item.phone,
            email: item.email ?? '',
            membership: membershipLabel,
            points: item.loyaltyPoints ?? 0,
            visits: item.totalVisits ?? 0,
            lastVisit: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-IN') : '—',
            totalSpend: `₹${(item.totalSpend ?? 0).toLocaleString('en-IN')}`,
            memberSince: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—',
            gradientFrom: ['#2563EB', '#7C3AED', '#0D9488', '#F59E0B'][index % 4],
            gradientTo: ['#7C3AED', '#EC4899', '#22C55E', '#F97316'][index % 4],
            visitHistory: [],
          } as Customer
        })

        setCustomers(mapped)
        setBranchOptions(branchesPayload.data ?? [])
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load customers')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchCustomers()
    return () => {
      active = false
    }
  }, [])

  const filtered = customers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    const matchMember = memberFilter === 'All' || c.membership === memberFilter
    return matchSearch && matchMember
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page header */}
      <div className="px-6 pt-6 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Customer Database</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your {customers.length.toLocaleString()} active clients across all branches.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="bg-[#1C1F2A] border border-white/8 rounded-lg py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 w-56 transition-all"
            />
          </div>
          {/* Membership filter */}
          <div className="flex bg-[#1C1F2A] border border-white/8 rounded-lg overflow-hidden">
            {(['All', 'Gold', 'Silver', 'Bronze', 'None'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setMemberFilter(tier)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  memberFilter === tier
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
          {/* Branch */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="bg-[#1C1F2A] border border-white/8 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
          >
            <option value="All">All Branches</option>
            {branchOptions.map((branch) => (
              <option key={branch.id ?? branch._id ?? branch.name} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>
          {/* Add Customer */}
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-[0_0_12px_rgba(37,99,235,0.3)]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Add Customer
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {error && (
          <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
            {error}
          </div>
        )}
        <div className="bg-card rounded-xl border border-white/5 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#1C1F2A]/60">
                {['Customer', 'Phone', 'Membership', 'Loyalty Points', 'Visits', 'Last Visit', 'Total Spend', 'Actions'].map((h) => (
                  <th key={h} className="py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="py-8 px-4">
                    <div className="h-24 rounded-lg bg-[#1C1F2A]/60 animate-pulse" />
                  </td>
                </tr>
              )}
              {!loading && filtered.map((customer, i) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={visible ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  onClick={() => setSelectedCustomer(customer)}
                  className="border-b border-white/5 hover:bg-[#1C1F2A]/70 transition-colors group cursor-pointer"
                >
                  {/* Name + Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${customer.gradientFrom}, ${customer.gradientTo})` }}
                      >
                        {customer.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight">{customer.name}</p>
                        <p className="text-[11px] text-muted-foreground">{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  {/* Phone */}
                  <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">{customer.phone}</td>
                  {/* Membership */}
                  <td className="py-3 px-4"><MembershipBadge tier={customer.membership} /></td>
                  {/* Points */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min((customer.points / 600) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{customer.points} pts</span>
                    </div>
                  </td>
                  {/* Visits */}
                  <td className="py-3 px-4 text-sm text-foreground font-medium">{customer.visits}</td>
                  {/* Last visit */}
                  <td className="py-3 px-4 text-sm text-muted-foreground">{customer.lastVisit}</td>
                  {/* Spend */}
                  <td className="py-3 px-4 text-sm font-bold text-foreground">{customer.totalSpend}</td>
                  {/* Actions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-200">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer) }}
                        className="p-1.5 rounded-md bg-white/5 hover:bg-primary/20 hover:text-primary text-muted-foreground transition-colors"
                        title="View"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md bg-white/5 hover:bg-primary/20 hover:text-primary text-muted-foreground transition-colors"
                        title="Edit"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-md bg-white/5 hover:bg-[#25D366]/15 hover:text-[#25D366] text-muted-foreground transition-colors"
                        title="WhatsApp"
                      >
                        <WhatsAppIcon size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground text-sm">
                    No customers match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground text-sm">No customers match your filters.</p>
            </div>
          )}
        </div>
      </div>

      <CustomerDrawer customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
    </div>
  )
}
