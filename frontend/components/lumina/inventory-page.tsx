'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  TrendingDown,
  AlertTriangle,
  IndianRupee,
  Search,
  ChevronDown,
  Download,
  Eye,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// TYPES & DATA
// ─────────────────────────────────────────────────────────────
type StockStatus = 'CRITICAL' | 'LOW' | 'GOOD'

interface Product {
  id: number
  name: string
  category: string
  current: number
  max: number
  min: number
  unit: string
  cost: number
  retail: number
  restocked: string
  status: StockStatus
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Hair Serum Pro', category: 'Hair', current: 0, max: 20, min: 5, unit: 'bottles', cost: 450, retail: 890, restocked: 'Never', status: 'CRITICAL' },
  { id: 2, name: 'Keratin Shampoo', category: 'Hair', current: 3, max: 15, min: 5, unit: 'bottles', cost: 380, retail: 750, restocked: '2w ago', status: 'LOW' },
  { id: 3, name: 'Hair Color Black', category: 'Hair', current: 12, max: 30, min: 8, unit: 'tubes', cost: 120, retail: 280, restocked: '3d ago', status: 'GOOD' },
  { id: 4, name: 'Nail Polish Remover', category: 'Nails', current: 0, max: 10, min: 3, unit: 'bottles', cost: 80, retail: 180, restocked: 'Never', status: 'CRITICAL' },
  { id: 5, name: 'Base Coat', category: 'Nails', current: 2, max: 8, min: 3, unit: 'bottles', cost: 150, retail: 320, restocked: '1w ago', status: 'LOW' },
  { id: 6, name: 'Facial Cleanser', category: 'Skin', current: 8, max: 20, min: 5, unit: 'units', cost: 520, retail: 980, restocked: '5d ago', status: 'GOOD' },
  { id: 7, name: 'Moisturizer SPF', category: 'Skin', current: 4, max: 12, min: 4, unit: 'units', cost: 680, retail: 1200, restocked: '1w ago', status: 'LOW' },
  { id: 8, name: 'Massage Oil', category: 'Spa', current: 15, max: 25, min: 6, unit: 'bottles', cost: 290, retail: 580, restocked: '2d ago', status: 'GOOD' },
  { id: 9, name: 'Scrub Exfoliator', category: 'Skin', current: 6, max: 15, min: 4, unit: 'units', cost: 340, retail: 680, restocked: '4d ago', status: 'GOOD' },
  { id: 10, name: 'Nail Art Kit', category: 'Nails', current: 1, max: 5, min: 2, unit: 'kits', cost: 890, retail: 1600, restocked: '3w ago', status: 'LOW' },
  { id: 11, name: 'Henna Powder', category: 'Hair', current: 22, max: 30, min: 8, unit: 'packs', cost: 65, retail: 150, restocked: '1d ago', status: 'GOOD' },
  { id: 12, name: 'Wax Strips', category: 'Skin', current: 18, max: 40, min: 10, unit: 'packs', cost: 45, retail: 120, restocked: '1d ago', status: 'GOOD' },
]

const STATUS_CONFIG: Record<StockStatus, { label: string; color: string; bg: string; border: string; barColor: string }> = {
  CRITICAL: { label: 'Critical', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/40', barColor: '#EF4444' },
  LOW: { label: 'Low', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/40', barColor: '#F59E0B' },
  GOOD: { label: 'Good', color: 'text-success', bg: 'bg-success/10', border: 'border-success/40', barColor: '#22C55E' },
}

// ─────────────────────────────────────────────────────────────
// COUNT-UP HOOK
// ─────────────────────────────────────────────────────────────
function useCountUp(end: number, duration = 1000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start: number | null = null
    let raf: number
    const animate = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [end, duration])
  return count
}

// ─────────────────────────────────────────────────────────────
// KPI STAT CARD
// ─────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string
  value: number
  prefix?: string
  icon: React.ReactNode
  accent: string
  delay?: number
  glow?: boolean
}

function KpiCard({ title, value, prefix = '', icon, accent, delay = 0, glow = false }: KpiCardProps) {
  const animated = useCountUp(value)
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br from-bg-elevated to-bg-card p-5 flex flex-col gap-3',
        glow ? 'border-danger/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]' : 'border-white/5'
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-1">{title}</p>
        <p className="text-2xl font-bold text-text-primary leading-tight">
          {prefix}{animated.toLocaleString('en-IN')}
        </p>
      </div>
      <div
        className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full blur-[40px] opacity-15"
        style={{ background: accent }}
      />
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// STOCK PROGRESS BAR
// ─────────────────────────────────────────────────────────────
function StockBar({ current, max, status }: { current: number; max: number; status: StockStatus }) {
  const pct = max === 0 ? 0 : Math.round((current / max) * 100)
  const { barColor } = STATUS_CONFIG[status]
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className={cn('font-medium', STATUS_CONFIG[status].color)}>
          {current} / {max}
        </span>
        {status !== 'GOOD' && (
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              status === 'CRITICAL' ? 'bg-danger animate-pulse' : 'bg-warning animate-pulse'
            )}
          />
        )}
      </div>
      <div className="h-1.5 w-full rounded-full bg-bg-card overflow-hidden min-w-[120px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: barColor }}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// STATUS CHIP
// ─────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: StockStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        cfg.color, cfg.bg, cfg.border
      )}
    >
      {status === 'CRITICAL' && <AlertTriangle size={10} />}
      {cfg.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// RESTOCK MODAL
// ─────────────────────────────────────────────────────────────
interface RestockModalProps {
  product: Product | null
  onClose: () => void
}

function RestockModal({ product, onClose }: RestockModalProps) {
  const [qty, setQty] = useState(10)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (product) setQty(product.min * 2)
  }, [product])

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="w-full max-w-md rounded-2xl border border-white/8 bg-bg-elevated shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-semibold text-text-primary">Restock Product</h3>
                <p className="text-xs text-text-muted mt-0.5">{product.name}</p>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-5">
              {/* Current stock info */}
              <div className="rounded-xl border border-white/5 bg-bg-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted">Current Stock</p>
                  <p className={cn('text-xl font-bold mt-0.5', STATUS_CONFIG[product.status].color)}>
                    {product.current} <span className="text-sm font-normal text-text-muted">{product.unit}</span>
                  </p>
                </div>
                <StatusChip status={product.status} />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Order Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-10 w-10 rounded-lg border border-border bg-bg-card text-text-primary hover:border-primary/40 hover:text-primary flex items-center justify-center text-lg transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 h-10 rounded-lg border border-border bg-bg-card text-center text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm font-semibold"
                  />
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="h-10 w-10 rounded-lg border border-border bg-bg-card text-text-primary hover:border-primary/40 hover:text-primary flex items-center justify-center text-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Supplier note */}
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Supplier Note (optional)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Urgent delivery required..."
                  className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={onClose}
                className="flex-1 h-10 rounded-lg border border-border text-text-muted hover:text-text-primary hover:border-white/15 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="flex-1 h-10 rounded-lg bg-primary text-white text-sm font-semibold shadow-[0_0_14px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:-translate-y-0.5 transition-all"
              >
                Update Stock
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN INVENTORY PAGE
// ─────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [restockProduct, setRestockProduct] = useState<Product | null>(null)

  const categories = ['All', ...Array.from(new Set(PRODUCTS.map((p) => p.category)))]
  const statuses = ['All', 'Good', 'Low', 'Critical']

  const filtered = PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter
    const matchStatus = statusFilter === 'All' || p.status === statusFilter.toUpperCase()
    return matchSearch && matchCat && matchStatus
  })

  const totalValue = PRODUCTS.reduce((sum, p) => sum + p.current * p.cost, 0)
  const lowCount = PRODUCTS.filter((p) => p.status === 'LOW').length
  const criticalCount = PRODUCTS.filter((p) => p.status === 'CRITICAL').length

  const criticalItems = PRODUCTS.filter((p) => p.status === 'CRITICAL').map((p) => p.name)

  return (
    <div className="flex flex-col gap-6">
      {/* Critical Alert Banner */}
      <AnimatePresence>
        {!alertDismissed && criticalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between rounded-xl border border-danger/30 bg-danger/[0.08] px-4 py-3 shadow-[0_0_16px_rgba(239,68,68,0.12)]"
            style={{
              borderLeftWidth: 3,
              borderLeftColor: '#EF4444',
            }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-danger animate-pulse shrink-0" />
              <div>
                <p className="text-sm font-semibold text-danger">Critical Stock Alert</p>
                <p className="text-xs text-danger/70">
                  {criticalItems.join(' and ')} {criticalItems.length === 1 ? 'is' : 'are'} out of stock.
                </p>
              </div>
            </div>
            <button
              onClick={() => setAlertDismissed(true)}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-danger/60 hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total SKUs" value={48} icon={<Package size={18} />} accent="#2563EB" delay={0} />
        <KpiCard title="Low Stock" value={lowCount} icon={<TrendingDown size={18} />} accent="#F59E0B" delay={0.05} />
        <KpiCard title="Out of Stock" value={criticalCount} icon={<AlertTriangle size={18} />} accent="#EF4444" delay={0.1} glow />
        <KpiCard title="Inventory Value" value={totalValue} prefix="₹" icon={<IndianRupee size={18} />} accent="#22C55E" delay={0.15} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-bg-card border border-border rounded-lg pl-3 pr-8 py-2 text-xs text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none cursor-pointer"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
          {/* Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-bg-card border border-border rounded-lg pl-3 pr-8 py-2 text-xs text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none cursor-pointer"
            >
              {statuses.map((s) => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-bg-card border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none w-48"
            />
          </div>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-card px-3 py-2 text-xs text-text-muted hover:text-text-primary hover:border-white/15 transition-colors">
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-xl border border-white/5 bg-bg-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-bg-elevated/60">
                {['Product', 'Category', 'Stock', 'Min', 'Unit', 'Cost', 'Retail', 'Restocked', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, i) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className={cn(
                    'border-b border-white/[0.04] group transition-colors hover:bg-primary/[0.03]',
                    product.status === 'CRITICAL' && 'border-l-2 border-l-danger bg-danger/[0.03]',
                    product.status === 'LOW' && 'border-l-2 border-l-warning'
                  )}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors whitespace-nowrap">
                      {product.name}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">{product.category}</td>
                  <td className="px-4 py-3">
                    <StockBar current={product.current} max={product.max} status={product.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-text-muted">{product.min}</td>
                  <td className="px-4 py-3 text-xs text-text-muted capitalize">{product.unit}</td>
                  <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">₹{product.cost}</td>
                  <td className="px-4 py-3 text-xs text-text-primary whitespace-nowrap">₹{product.retail}</td>
                  <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">{product.restocked}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={product.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button className="h-7 w-7 rounded-md flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-colors">
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => setRestockProduct(product)}
                        className={cn(
                          'rounded-md px-2.5 py-1 text-[11px] font-semibold border transition-all',
                          product.status === 'CRITICAL'
                            ? 'text-danger border-danger/40 bg-danger/10 hover:bg-danger/20'
                            : product.status === 'LOW'
                            ? 'text-warning border-warning/40 bg-warning/10 hover:bg-warning/20'
                            : 'text-primary border-primary/30 bg-primary/10 hover:bg-primary/20'
                        )}
                      >
                        Restock
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-text-muted">
                    No products match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Restock Modal */}
      <RestockModal product={restockProduct} onClose={() => setRestockProduct(null)} />
    </div>
  )
}
