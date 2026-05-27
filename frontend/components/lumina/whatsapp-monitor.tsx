'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Phone, Send, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// TYPES & DATA
// ─────────────────────────────────────────────────────────────
type ConvStatus = 'active' | 'waiting' | 'completed' | 'failed'

interface Conversation {
  id: number
  name: string
  initials: string
  phone: string
  preview: string
  time: string
  status: ConvStatus
  membership?: string
}

interface Message {
  id: number
  role: 'bot' | 'user'
  text: string
  chips?: string[]
  slotChips?: { label: string; available: boolean }[]
  timestamp?: string
}

const CONVERSATIONS: Conversation[] = [
  { id: 1, name: 'Anjali Singh', initials: 'AS', phone: '98765 43210', preview: 'What time is 3pm slot available', time: '2m ago', status: 'active', membership: 'Gold' },
  { id: 2, name: 'Rahul M', initials: 'RM', phone: '87654 32109', preview: 'Can I reschedule to tomorrow', time: '15m ago', status: 'waiting' },
  { id: 3, name: 'Preethi K', initials: 'PK', phone: '76543 21098', preview: 'Booking confirmed, thank you!', time: '1h ago', status: 'completed' },
  { id: 4, name: 'Kiran R', initials: 'KR', phone: '65432 10987', preview: 'Which branch is open Sunday', time: '2h ago', status: 'active' },
  { id: 5, name: 'Meera J', initials: 'MJ', phone: '54321 09876', preview: 'Book facial for tomorrow morning', time: '3h ago', status: 'waiting' },
  { id: 6, name: 'Suresh P', initials: 'SP', phone: '21098 76543', preview: 'Unable to process your request', time: '5h ago', status: 'failed' },
]

const CHAT_MESSAGES: Message[] = [
  {
    id: 1, role: 'bot',
    text: 'Hi Anjali! Welcome to Luminous. Which branch would you prefer?',
    chips: ['Banjara Hills', 'Jubilee Hills', 'Madhapur'],
    timestamp: 'Today 2:28 PM',
  },
  { id: 2, role: 'user', text: 'Banjara Hills' },
  {
    id: 3, role: 'bot',
    text: 'Perfect! What service are you looking for today?',
    chips: ['Haircut', 'Hair Color', 'Hair Spa', 'Other'],
  },
  { id: 4, role: 'user', text: 'Haircut please' },
  {
    id: 5, role: 'bot',
    text: 'Great choice! Here are available slots for tomorrow at Banjara Hills:',
    slotChips: [
      { label: '10:00 AM', available: true },
      { label: '11:30 AM', available: true },
      { label: '2:00 PM', available: true },
      { label: '4:30 PM', available: true },
    ],
  },
  { id: 6, role: 'user', text: 'What about 3pm?', timestamp: 'Today 2:34 PM' },
  {
    id: 7, role: 'bot',
    text: '3:00 PM isn\'t available, but I have 2:00 PM and 4:30 PM open. Which works better for you?',
  },
]

const BOOKING_STEPS = [
  { label: 'Branch', done: true },
  { label: 'Service', done: true },
  { label: 'Slot', done: false, active: true },
  { label: 'Confirm', done: false },
]

const STATUS_CONFIG: Record<ConvStatus, { dot: string; label: string; pulse: boolean; chipColor: string; chipBg: string; chipBorder: string }> = {
  active: { dot: 'bg-primary', label: 'Active', pulse: true, chipColor: 'text-primary', chipBg: 'bg-primary/10', chipBorder: 'border-primary/25' },
  waiting: { dot: 'bg-warning', label: 'Waiting', pulse: false, chipColor: 'text-warning', chipBg: 'bg-warning/10', chipBorder: 'border-warning/25' },
  completed: { dot: 'bg-success', label: 'Completed', pulse: false, chipColor: 'text-success', chipBg: 'bg-success/10', chipBorder: 'border-success/25' },
  failed: { dot: 'bg-danger', label: 'Needs Human', pulse: false, chipColor: 'text-danger', chipBg: 'bg-danger/10', chipBorder: 'border-danger/25' },
}

// ─────────────────────────────────────────────────────────────
// AVATAR GRADIENT
// ─────────────────────────────────────────────────────────────
function Avatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-11 w-11 text-sm' }
  return (
    <div className={cn('rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0 font-semibold text-primary', sizes[size])}>
      {initials}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CONVERSATION LIST ITEM
// ─────────────────────────────────────────────────────────────
function ConvItem({ conv, selected, onClick }: { conv: Conversation; selected: boolean; onClick: () => void }) {
  const cfg = STATUS_CONFIG[conv.status]
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-3 border-b border-white/[0.04] text-left transition-colors hover:bg-white/[0.03]',
        selected && 'border-l-[3px] border-l-primary bg-primary/[0.05]'
      )}
    >
      <Avatar initials={conv.initials} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-semibold text-text-primary truncate">{conv.name}</span>
          <span className="text-[10px] text-text-muted/60 shrink-0 ml-2">{conv.time}</span>
        </div>
        <p className="text-[10px] text-text-muted flex items-center gap-1 mb-1">
          <Phone size={8} />
          +91 {conv.phone}
        </p>
        <p className="text-[10px] text-text-muted/70 truncate leading-relaxed">{conv.preview}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold', cfg.chipColor, cfg.chipBg, cfg.chipBorder)}>
            <span className={cn('h-1 w-1 rounded-full', cfg.dot, cfg.pulse && 'animate-pulse')} />
            {cfg.label}
          </span>
        </div>
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// CHAT BUBBLE
// ─────────────────────────────────────────────────────────────
function ChatBubble({ msg, index }: { msg: Message; index: number }) {
  const isBot = msg.role === 'bot'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="flex flex-col gap-1"
    >
      {msg.timestamp && (
        <div className="flex justify-center my-1">
          <span className="text-[9px] text-text-muted/50 bg-bg-elevated/80 border border-white/5 rounded-full px-2 py-0.5">
            {msg.timestamp}
          </span>
        </div>
      )}
      <div className={cn('flex gap-2 max-w-[85%]', isBot ? 'self-start' : 'self-end flex-row-reverse')}>
        {isBot && (
          <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
            <span className="text-[9px] font-bold text-primary">AI</span>
          </div>
        )}
        {!isBot && (
          <div className="h-6 w-6 rounded-full bg-bg-elevated border border-white/10 flex items-center justify-center shrink-0 mt-1">
            <span className="text-[9px] font-semibold text-text-muted">AS</span>
          </div>
        )}
        <div className="flex flex-col gap-1">
          {isBot && (
            <span className="text-[9px] font-semibold text-primary/70 px-1">Luminous Bot</span>
          )}
          <div
            className={cn(
              'rounded-xl px-3 py-2 text-xs leading-relaxed shadow-sm',
              isBot
                ? 'bg-[#1e3358] border border-primary/10 rounded-tl-sm text-text-primary'
                : 'bg-bg-elevated border border-white/5 rounded-tr-sm text-text-primary'
            )}
          >
            {msg.text}
          </div>

          {/* Branch / Service chips */}
          {msg.chips && (
            <div className="flex flex-wrap gap-1 px-1">
              {msg.chips.map((chip) => (
                <button
                  key={chip}
                  className="rounded-md border border-primary/30 bg-primary/5 px-2 py-0.5 text-[10px] text-primary hover:bg-primary/15 hover:border-primary/60 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Slot chips */}
          {msg.slotChips && (
            <div className="flex flex-wrap gap-1 px-1">
              {msg.slotChips.map((slot) => (
                <button
                  key={slot.label}
                  className="rounded-md bg-primary border border-primary/80 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-primary/80 transition-colors"
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN WHATSAPP MONITOR COMPONENT
// ─────────────────────────────────────────────────────────────
export function WhatsAppMonitor() {
  const [selectedId, setSelectedId] = useState(1)
  const [search, setSearch] = useState('')
  const [takenOver, setTakenOver] = useState(false)
  const [manualMsg, setManualMsg] = useState('')

  const selected = CONVERSATIONS.find((c) => c.id === selectedId)!
  const filtered = CONVERSATIONS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  )

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg-primary">
      {/* ── LEFT: Conversation List ── */}
      <aside className="w-[280px] min-w-[240px] flex flex-col border-r border-white/5 bg-[#0D0E14] shrink-0">
        {/* Header */}
        <div className="px-3 pt-4 pb-3 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-text-primary">Bot Monitor</h2>
            <span className="flex items-center gap-1 bg-bg-card border border-white/5 rounded-md px-1.5 py-0.5 text-[9px] font-semibold text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Live
            </span>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted/60" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg-card border border-border rounded-lg pl-8 pr-3 py-1.5 text-[11px] text-text-primary placeholder:text-text-muted/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((conv) => (
            <ConvItem
              key={conv.id}
              conv={conv}
              selected={conv.id === selectedId}
              onClick={() => setSelectedId(conv.id)}
            />
          ))}
        </div>
      </aside>

      {/* ── RIGHT: Chat View ── */}
      <section className="flex-1 flex flex-col bg-bg-primary min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-white/5 px-4 flex items-center justify-between bg-bg-primary/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <Avatar initials={selected.initials} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-text-primary">{selected.name}</h2>
                {selected.membership && (
                  <span className="rounded-full bg-warning/15 border border-warning/30 px-1.5 py-0.5 text-[9px] font-semibold text-warning">
                    {selected.membership}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-text-muted flex items-center gap-1 mt-0.5">
                <Phone size={9} />
                +91 {selected.phone}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1 rounded-lg border border-border bg-bg-card px-2 py-1.5 text-[10px] text-text-muted hover:text-text-primary hover:border-white/15 transition-colors">
            <UserCircle size={12} />
            Open Profile
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          {CHAT_MESSAGES.map((msg, i) => (
            <ChatBubble key={msg.id} msg={msg} index={i} />
          ))}
        </div>

        {/* Status bar + take over */}
        <div className="px-4 pb-3 flex flex-col gap-2 shrink-0">
          {/* Booking progress */}
          <div className="rounded-xl border border-white/5 bg-bg-card px-3 py-2">
            <p className="text-[10px] font-semibold text-warning mb-2">
              Step 3 of 4: Awaiting slot confirmation
            </p>
            <div className="flex items-center gap-0">
              {BOOKING_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full border-2 flex items-center justify-center text-[8px] font-bold transition-all',
                        step.done && 'bg-success border-success text-white',
                        step.active && 'border-warning bg-warning/20 text-warning animate-pulse',
                        !step.done && !step.active && 'border-border bg-bg-elevated text-text-muted'
                      )}
                    >
                      {step.done ? '✓' : i + 1}
                    </div>
                    <span
                      className={cn(
                        'text-[8px] mt-0.5 font-medium',
                        step.done && 'text-success',
                        step.active && 'text-warning',
                        !step.done && !step.active && 'text-text-muted/50'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < BOOKING_STEPS.length - 1 && (
                    <div className={cn('flex-1 h-px mx-1', step.done ? 'bg-success/40' : 'bg-border')} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Take over / manual reply */}
          <AnimatePresence mode="wait">
            {!takenOver ? (
              <motion.button
                key="takeover-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setTakenOver(true)}
                className="self-start flex items-center gap-1 rounded-lg border border-danger/35 bg-transparent text-danger text-[10px] font-semibold px-2.5 py-1.5 hover:bg-danger/10 hover:border-danger/60 hover:shadow-[0_0_10px_rgba(239,68,68,0.15)] transition-all"
              >
                Take Over Chat
              </motion.button>
            ) : (
              <motion.div
                key="manual-input"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2"
              >
                <span className="text-[9px] font-semibold text-danger shrink-0">Manual</span>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={manualMsg}
                  onChange={(e) => setManualMsg(e.target.value)}
                  autoFocus
                  className="flex-1 bg-transparent outline-none text-xs text-text-primary placeholder:text-text-muted/50"
                />
                <button
                  onClick={() => { setManualMsg(''); setTakenOver(false) }}
                  className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/80 transition-colors shrink-0"
                >
                  <Send size={11} className="text-white" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
