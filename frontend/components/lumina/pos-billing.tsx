"use client"

import { useState, useCallback, createContext, useContext, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, X } from "lucide-react"

// ─── Data ───────────────────────────────────────────────────────────────────

const CATEGORIES = ["All"]

const SERVICES: Array<{
  id: string
  name: string
  category: string
  duration: string
  price: number
  accent: string
}> = []

const STAFF: string[] = []

type CartItem = {
  uid: string
  serviceId: string
  name: string
  price: number
  staff: string
  duration: string
  category: string
}

const GST_RATE  = 0.18
const DISC_RATE = 0.10  // Gold membership
const LOYALTY_OFF = 50  // ₹50 off

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN")
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ServiceCard({
  service,
  onAdd,
}: {
  service: (typeof SERVICES)[0]
  onAdd: (s: (typeof SERVICES)[0]) => void
}) {
  const [popping, setPopping] = useState(false)

  const handleAdd = () => {
    setPopping(true)
    setTimeout(() => setPopping(false), 350)
    onAdd(service)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="relative overflow-hidden rounded-xl border border-white/5 bg-[#16181F] cursor-pointer group hover:border-blue-500/30 transition-colors"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
    >
      {/* accent bar */}
      <span
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ background: service.accent }}
      />
      <div className="p-4 pl-5">
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight pr-2">
            {service.name}
          </h4>
          <span className="shrink-0 text-[10px] font-semibold bg-white/5 text-muted-foreground px-2 py-0.5 rounded-full border border-white/5">
            {service.duration}
          </span>
        </div>

        <div className="flex items-end justify-between mt-1">
          <span className="text-base font-bold text-foreground">{fmt(service.price)}</span>
          <motion.button
            animate={popping ? { scale: [1, 1.35, 0.9, 1] } : {}}
            transition={{ duration: 0.3 }}
            onClick={handleAdd}
            className="w-7 h-7 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all text-sm font-bold leading-none"
          >
            +
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Invoice Modal ───────────────────────────────────────────────────────────

function InvoiceModal({
  cart,
  subtotal,
  discount,
  loyalty,
  gst,
  total,
  paymentMethod,
  onClose,
}: {
  cart: CartItem[]
  subtotal: number
  discount: number
  loyalty: boolean
  gst: number
  total: number
  paymentMethod: string
  onClose: () => void
}) {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  })

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-4 bg-[#16181F] rounded-2xl border border-white/8 shadow-[0_24px_64px_rgba(0,0,0,0.7)] overflow-hidden"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6 bg-[#1C1F2A]/60">
          <div>
            <span className="text-lg font-bold text-primary tracking-tight">Luminous</span>
            <span className="ml-2 text-[11px] text-muted-foreground font-medium">Invoice #INV-1042</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {/* Branch */}
          <div className="text-center mb-4">
            <p className="text-xs text-muted-foreground">Lumina Salon — Downtown Branch</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">42 MG Road, Bengaluru 560001 | Date: {today}</p>
          </div>

          {/* Customer */}
          <div className="bg-[#1C1F2A] rounded-xl p-3 mb-4 flex items-center gap-3 border border-white/5">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              AS
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Anjali Singh</p>
              <p className="text-[11px] text-muted-foreground">+91 98765 43210 · Gold Member</p>
            </div>
            <span className="ml-auto text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
              GOLD
            </span>
          </div>

          {/* Itemized table */}
          <div className="mb-4">
            <div className="grid grid-cols-[1fr_auto_auto_auto] text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider pb-2 border-b border-white/5 gap-x-2">
              <span>Service</span>
              <span>Staff</span>
              <span>Duration</span>
              <span className="text-right">Price</span>
            </div>
            {cart.map((item, i) => (
              <motion.div
                key={item.uid}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="grid grid-cols-[1fr_auto_auto_auto] text-xs py-2.5 border-b border-white/4 gap-x-2 items-center"
              >
                <span className="text-foreground font-medium">{item.name}</span>
                <span className="text-muted-foreground">{item.staff}</span>
                <span className="text-muted-foreground">{item.duration}</span>
                <span className="text-right text-foreground font-semibold">{fmt(item.price)}</span>
              </motion.div>
            ))}
          </div>

          {/* Calculations */}
          <div className="space-y-2 text-xs mb-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Membership Discount (Gold 10%)</span><span>-{fmt(discount)}</span>
            </div>
            {loyalty && (
              <div className="flex justify-between text-amber-400">
                <span>Loyalty Redemption (100 pts)</span><span>-{fmt(LOYALTY_OFF)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>GST 18%</span><span>+{fmt(Math.round(gst))}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/8">
              <span className="text-sm font-semibold text-foreground">Total Paid</span>
              <span className="text-xl font-bold text-primary tracking-tight">{fmt(Math.round(total))}</span>
            </div>
          </div>

          {/* Payment chip + QR */}
          <div className="bg-[#1C1F2A] rounded-xl p-3 flex items-center justify-between border border-white/5 mb-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Payment Method</p>
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                {paymentMethod === "Cash" && (
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
                {paymentMethod === "Card" && (
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                )}
                {paymentMethod === "UPI" && (
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 7h18M3 12h18M3 17h18"/>
                  </svg>
                )}
                {paymentMethod}
              </span>
            </div>
            {/* QR code placeholder */}
            <div className="w-14 h-14 bg-white rounded p-1 shrink-0">
              <div
                className="w-full h-full rounded-sm"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg,#000 0,#000 2px,transparent 2px,transparent 4px), repeating-linear-gradient(90deg,#000 0,#000 2px,transparent 2px,transparent 4px)",
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-[#1C1F2A] hover:bg-white/5 text-foreground text-xs font-semibold transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/>
              </svg>
              Print
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 bg-[#1C1F2A] hover:bg-white/5 text-foreground text-xs font-semibold transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Download PDF
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-semibold transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Current Bill Panel ──────────────────────────────────────────────────────

interface CurrentBillPanelProps {
  open: boolean
  onClose: () => void
  cart: CartItem[]
  subtotal: number
  discount: number
  gst: number
  total: number
  redeemLoyalty: boolean
  setRedeemLoyalty: (v: boolean) => void
  paymentMethod: string
  setPaymentMethod: (v: string) => void
  removeFromCart: (uid: string) => void
  updateStaff: (uid: string, staff: string) => void
  onGenerateInvoice: () => void
  staffOptions: string[]
}

function CurrentBillPanel({
  open,
  onClose,
  cart,
  subtotal,
  discount,
  gst,
  total,
  redeemLoyalty,
  setRedeemLoyalty,
  paymentMethod,
  setPaymentMethod,
  removeFromCart,
  updateStaff,
  onGenerateInvoice,
  staffOptions,
}: CurrentBillPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Slide Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-screen w-[420px] max-w-[90vw] bg-[#16181F] border-l border-white/5 shadow-2xl z-50 flex flex-col"
          >
            {/* Bill header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-bold text-foreground">Current Bill</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">#APT-1042 · Anjali Singh</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-semibold bg-white/5 border border-white/8 text-muted-foreground px-2.5 py-1 rounded-full">
                  {cart.length} item{cart.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              <AnimatePresence initial={false}>
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/40 text-sm">
                    <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 6h14M9 19a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"/>
                    </svg>
                    Add services from the left panel
                  </div>
                ) : (
                  cart.map(item => (
                    <motion.div
                      key={item.uid}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24, height: 0, marginBottom: 0 }}
                      transition={{ type: "spring", damping: 22, stiffness: 300 }}
                      className="group flex items-center gap-3 bg-[#1C1F2A] rounded-xl p-3 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-foreground truncate">{item.name}</span>
                          <span className="text-sm font-bold text-foreground ml-2 shrink-0">{fmt(item.price)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <svg className="w-3 h-3 text-muted-foreground shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                          </svg>
                          <select
                            value={item.staff}
                            onChange={e => updateStaff(item.uid, e.target.value)}
                            className="bg-transparent text-[11px] text-primary font-semibold outline-none cursor-pointer border-none p-0 hover:text-blue-400 transition-colors"
                          >
                            {staffOptions.map(s => (
                              <option key={s} value={s} className="bg-[#1C1F2A] text-foreground">{s}</option>
                            ))}
                          </select>
                          <span className="text-[10px] text-muted-foreground/50 ml-auto">{item.duration}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.uid)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center text-destructive shrink-0"
                        aria-label="Remove"
                      >
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                          <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Totals + actions */}
            <div className="px-6 pb-6 pt-4 border-t border-white/5 space-y-4 shrink-0">
              {/* Calculations */}
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Membership Discount (Gold 10%)</span>
                  <span>-{fmt(discount)}</span>
                </div>

                {/* Loyalty toggle */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRedeemLoyalty(!redeemLoyalty)}
                      className={`relative w-8 h-4.5 rounded-full border transition-all shrink-0 ${
                        redeemLoyalty
                          ? "bg-primary border-primary"
                          : "bg-white/5 border-white/10"
                      }`}
                      style={{ height: "18px", width: "32px" }}
                      role="switch"
                      aria-checked={redeemLoyalty}
                    >
                      <span
                        className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform shadow ${
                          redeemLoyalty ? "translate-x-[14px]" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-muted-foreground text-xs">Redeem 100 pts = ₹50 off</span>
                  </div>
                  {redeemLoyalty && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-amber-400"
                    >
                      -₹50
                    </motion.span>
                  )}
                </div>

                <div className="flex justify-between text-muted-foreground">
                  <span>GST 18%</span>
                  <span>+{fmt(Math.round(gst))}</span>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/6 mt-1">
                  <span className="text-sm font-semibold text-foreground">Total</span>
                  <motion.span
                    key={Math.round(total)}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="text-2xl font-bold text-primary tracking-tight"
                  >
                    {fmt(Math.round(total))}
                  </motion.span>
                </div>
              </div>

              {/* Payment method */}
              <div className="grid grid-cols-3 gap-2">
                {(["Cash", "Card", "UPI"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all ${
                      paymentMethod === m
                        ? "bg-primary/10 border-primary text-primary shadow-[0_0_12px_rgba(37,99,235,0.2)]"
                        : "bg-[#1C1F2A] border-white/5 text-muted-foreground hover:border-white/15"
                    }`}
                  >
                    {m === "Cash" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                        <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>
                        <path d="M6 6v12M18 6v12"/>
                      </svg>
                    )}
                    {m === "Card" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                        <path d="M6 15h2M10 15h4"/>
                      </svg>
                    )}
                    {m === "UPI" && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    )}
                    {m}
                  </button>
                ))}
              </div>

              {/* Generate Invoice */}
              <button
                onClick={onGenerateInvoice}
                disabled={cart.length === 0}
                className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide text-white transition-all ${
                  cart.length > 0
                    ? "bg-gradient-to-r from-primary to-blue-600 shadow-[0_0_24px_rgba(37,99,235,0.45)] hover:shadow-[0_0_32px_rgba(37,99,235,0.6)] hover:scale-[1.01] active:scale-[0.99]"
                    : "bg-white/5 text-muted-foreground cursor-not-allowed"
                }`}
              >
                Generate Invoice
              </button>

              {/* WhatsApp toggle */}
              <div className="flex items-center justify-between bg-[#1C1F2A] rounded-xl px-4 py-3 border border-white/5">
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-xs text-foreground">Send Invoice to WhatsApp</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer" aria-label="Toggle WhatsApp invoice">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-8 h-[18px] bg-white/5 border border-white/10 rounded-full peer peer-checked:bg-primary peer-checked:border-primary transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-3.5 after:h-3.5 after:transition-all peer-checked:after:translate-x-[14px]" />
                </label>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function POSBilling() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [cart, setCart]                     = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod]   = useState("UPI")
  const [redeemLoyalty, setRedeemLoyalty]   = useState(false)
  const [showInvoice, setShowInvoice]       = useState(false)
  const [searchFocused, setSearchFocused]   = useState(false)
  const [billPanelOpen, setBillPanelOpen]   = useState(false)
  const [services, setServices]             = useState<typeof SERVICES>([])
  const [staffList, setStaffList]           = useState<string[]>([])
  const [customerQuery, setCustomerQuery]   = useState('')
  const [customer, setCustomer]             = useState<any>(null)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState<string | null>(null)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerError, setCustomerError]     = useState<string | null>(null)

  // Calculations
  const subtotal  = cart.reduce((s, i) => s + i.price, 0)
  const discount  = Math.round(subtotal * DISC_RATE)
  const loyaltyOff = redeemLoyalty ? LOYALTY_OFF : 0
  const taxable   = subtotal - discount - loyaltyOff
  const gst       = taxable * GST_RATE
  const total     = taxable + gst

  useEffect(() => {
    let active = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [servicesRes, staffRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/users?role=stylist'),
        ])

        if (!servicesRes.ok || !staffRes.ok) {
          throw new Error('Failed to load POS data')
        }

        const servicesPayload = await servicesRes.json()
        const staffPayload = await staffRes.json()

        if (!active) return

        const normalizedServices = (servicesPayload.data ?? []).map((service: any) => ({
          id: service._id,
          name: service.name,
          category: service.category?.charAt(0).toUpperCase() + service.category?.slice(1),
          duration: `${service.duration} min`,
          price: service.price,
          accent: '#2563EB',
        }))

        const normalizedStaff = (staffPayload.data ?? []).map((staff: any) => staff.name)

        setServices(normalizedServices)
        setStaffList(normalizedStaff)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load POS data')
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

  useEffect(() => {
    let active = true
    const trimmed = customerQuery.trim()

    if (!trimmed) {
      setCustomer(null)
      setCustomerError(null)
      return
    }

    const handler = setTimeout(async () => {
      try {
        setCustomerLoading(true)
        setCustomerError(null)
        const res = await fetch(`/api/customers?phone=${encodeURIComponent(trimmed)}`)
        if (!res.ok) {
          throw new Error('Customer lookup failed')
        }
        const payload = await res.json()
        if (!active) return
        const [result] = payload.data ?? []
        setCustomer(result ?? null)
      } catch (err) {
        if (active) {
          setCustomerError(err instanceof Error ? err.message : 'Customer lookup failed')
        }
      } finally {
        if (active) {
          setCustomerLoading(false)
        }
      }
    }, 400)

    return () => {
      active = false
      clearTimeout(handler)
    }
  }, [customerQuery])

  const addToCart = useCallback((s: (typeof SERVICES)[0]) => {
    setCart(prev => [
      ...prev,
      {
        uid: `${s.id}-${Date.now()}`,
        serviceId: s.id,
        name: s.name,
        price: s.price,
        staff: staffList[Math.floor(Math.random() * staffList.length)] ?? 'Staff',
        duration: s.duration,
        category: s.category,
      },
    ])
  }, [staffList])

  const removeFromCart = (uid: string) =>
    setCart(prev => prev.filter(i => i.uid !== uid))

  const updateStaff = (uid: string, staff: string) =>
    setCart(prev => prev.map(i => i.uid === uid ? { ...i, staff } : i))

  const categories = ['All', ...Array.from(new Set(services.map((s) => s.category)))]

  const filtered = activeCategory === "All"
    ? services
    : services.filter(s => s.category === activeCategory)

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0B0F] overflow-hidden font-sans">
      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-primary tracking-tight">LuminaOS</h1>
          <span className="text-muted-foreground/40 text-sm">·</span>
          <span className="text-sm text-muted-foreground font-medium">POS &amp; Billing</span>
        </div>

        {/* Cart Icon */}
        <button
          onClick={() => setBillPanelOpen(true)}
          className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16181F] border border-white/5 hover:border-primary/30 transition-colors"
        >
          <ShoppingCart size={18} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">View Bill</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 overflow-hidden flex flex-col px-6 py-4">
        {/* Customer search */}
        <div
          className={`flex items-center gap-3 bg-[#16181F] border rounded-xl px-4 py-2.5 transition-all mb-4 ${
            searchFocused ? "border-primary/50 ring-1 ring-primary/20" : "border-white/6"
          }`}
        >
          <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search customer by name or phone..."
            value={customerQuery}
            onChange={(e) => setCustomerQuery(e.target.value)}
            className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/50 w-full"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {/* Customer badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            {customerLoading ? (
              <div className="h-6 w-24 rounded-md bg-white/5 animate-pulse" />
            ) : customer ? (
              <>
                <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                  {(customer.name ?? 'G')
                    .split(' ')
                    .map((part: string) => part[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full tracking-wider">
                  {String(customer.membershipTier ?? 'none').toUpperCase()}
                </span>
                <span className="text-[10px] text-muted-foreground">{customer.loyaltyPoints ?? 0} pts</span>
                <span className="text-[10px] text-muted-foreground/40">·</span>
                <span className="text-[10px] text-muted-foreground">{customer.totalVisits ?? 0} visits</span>
              </>
            ) : (
              <span className="text-[10px] text-muted-foreground">No customer</span>
            )}
          </div>
        </div>

        {customerError && (
          <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {customerError}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </div>
        )}

        {/* Category tabs */}
        <div className="shrink-0 mb-4">
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all ${
                  activeCategory === cat
                    ? "bg-primary/15 text-primary border-primary/40"
                    : "bg-[#16181F] text-muted-foreground border-white/5 hover:border-white/15"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Service grid */}
        <div className="flex-1 overflow-y-auto">
          <p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest mb-3">
            {activeCategory === "All" ? "All Services" : activeCategory}
            <span className="ml-2 text-primary/60">{filtered.length}</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {loading && (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-[110px] rounded-xl bg-[#16181F] border border-white/5 animate-pulse" />
              ))
            )}
            {!loading && filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ServiceCard service={s} onAdd={addToCart} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CURRENT BILL PANEL ── */}
      <CurrentBillPanel
        open={billPanelOpen}
        onClose={() => setBillPanelOpen(false)}
        cart={cart}
        subtotal={subtotal}
        discount={discount}
        gst={gst}
        total={total}
        redeemLoyalty={redeemLoyalty}
        setRedeemLoyalty={setRedeemLoyalty}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        removeFromCart={removeFromCart}
        updateStaff={updateStaff}
        onGenerateInvoice={() => {
          if (cart.length > 0) {
            setBillPanelOpen(false)
            setShowInvoice(true)
          }
        }}
        staffOptions={staffList}
      />

      {/* ── INVOICE MODAL ── */}
      <AnimatePresence>
        {showInvoice && (
          <InvoiceModal
            cart={cart}
            subtotal={subtotal}
            discount={discount}
            loyalty={redeemLoyalty}
            gst={gst}
            total={total}
            paymentMethod={paymentMethod}
            onClose={() => setShowInvoice(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
