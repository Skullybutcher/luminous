'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Phone, Send, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// TYPES & DATA
// ─────────────────────────────────────────────────────────────
type ConvStatus = 'active' | 'waiting' | 'completed' | 'failed'

interface Conversation {
  id: string
  name: string
  initials: string
  phone: string
  preview: string
  time: string
  status: ConvStatus
  membership?: string
}

interface Message {
  id: string
  role: 'bot' | 'user'
  text: string
  chips?: string[]
  slotChips?: { label: string; available: boolean }[]
  timestamp?: string
}

interface SessionItem {
  _id: string
  phone: string
  customerId?: { name?: string; phone?: string; membershipTier?: string }
  step: string
  context?: Record<string, any>
  isActive: boolean
  lastMessageAt?: string
  updatedAt?: string
}

const EMPTY_CONVERSATIONS: Conversation[] = []
const EMPTY_MESSAGES: Message[] = []
const STEP_LABELS = ['Branch', 'Service', 'Slot', 'Confirm']

function formatRelativeTime(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.max(1, Math.round(diffMs / 60000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}

function formatMembership(value?: string) {
  if (!value || value === 'none') return undefined
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getPreview(step: string) {
  switch (step) {
    case 'branch_selected':
      return 'Awaiting branch selection'
    case 'service_selected':
      return 'Awaiting service selection'
    case 'date_selected':
      return 'Awaiting preferred date'
    case 'slot_selected':
      return 'Awaiting slot confirmation'
    case 'details_collected':
      return 'Awaiting confirmation'
    case 'completed':
      return 'Booking completed'
    default:
      return 'New conversation'
  }
}

function getStatus(step: string, isActive: boolean): ConvStatus {
  if (!isActive) return 'failed'
  if (step === 'completed') return 'completed'
  return 'active'
}

function getStepIndex(step: string) {
  switch (step) {
    case 'service_selected':
      return 1
    case 'date_selected':
    case 'slot_selected':
      return 2
    case 'details_collected':
    case 'completed':
      return 3
    default:
      return 0
  }
}

function buildSteps(step: string) {
  const activeIndex = getStepIndex(step)
  return STEP_LABELS.map((label, index) => ({
    label,
    done: index < activeIndex || (step === 'completed' && index <= activeIndex),
    active: index === activeIndex && step !== 'completed',
  }))
}

function buildMessages(session?: SessionItem): Message[] {
  if (!session) return []
  const context = session.context ?? {}
  const messages: Message[] = []

  messages.push({
    id: 'bot-welcome',
    role: 'bot',
    text: 'Welcome to Luminous. I can help you book an appointment.',
    timestamp: session.lastMessageAt
      ? new Date(session.lastMessageAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
      : undefined,
  })

  if (context.branchName) {
    messages.push({ id: 'user-branch', role: 'user', text: String(context.branchName) })
  }

  if (context.serviceName) {
    messages.push({ id: 'user-service', role: 'user', text: String(context.serviceName) })
  }

  messages.push({
    id: 'bot-step',
    role: 'bot',
    text: getPreview(session.step),
  })

  return messages
}

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
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [takenOver, setTakenOver] = useState(false)
  const [manualMsg, setManualMsg] = useState('')
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [conversations, setConversations] = useState<Conversation[]>(EMPTY_CONVERSATIONS)
  const [messages, setMessages] = useState<Message[]>(EMPTY_MESSAGES)
  const [steps, setSteps] = useState<{ label: string; done?: boolean; active?: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const fetchSessions = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/sessions')
        if (!res.ok) {
          throw new Error('Failed to load conversations')
        }
        const payload = await res.json()
        if (!active) return
        const nextSessions = payload.data ?? []
        setSessions(nextSessions)

        const mapped = nextSessions.map((session: SessionItem) => {
          const name = session.customerId?.name ?? 'Guest'
          const initials = name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
          return {
            id: session._id,
            name,
            initials,
            phone: session.phone,
            preview: getPreview(session.step),
            time: formatRelativeTime(session.lastMessageAt ?? session.updatedAt),
            status: getStatus(session.step, session.isActive),
            membership: formatMembership(session.customerId?.membershipTier),
          }
        })

        setConversations(mapped)

        if (!selectedId && mapped.length > 0) {
          setSelectedId(mapped[0].id)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load conversations')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchSessions()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const selectedSession = sessions.find((session) => session._id === selectedId)
    setMessages(buildMessages(selectedSession))
    setSteps(buildSteps(selectedSession?.step ?? 'init'))
  }, [sessions, selectedId])

  const selected = conversations.find((c) => c.id === selectedId)
  const filtered = conversations.filter(
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

        {error && (
          <div className="mx-3 mt-3 rounded-lg border border-danger/30 bg-danger/10 px-2.5 py-1.5 text-[10px] text-danger">
            {error}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 border-b border-white/[0.04] px-3 py-3">
                <div className="h-10 rounded-lg bg-bg-card/60 animate-pulse" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="px-3 py-6 text-[11px] text-text-muted">No conversations found.</div>
          ) : (
            filtered.map((conv) => (
              <ConvItem
                key={conv.id}
                conv={conv}
                selected={conv.id === selectedId}
                onClick={() => setSelectedId(conv.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── RIGHT: Chat View ── */}
      <section className="flex-1 flex flex-col bg-bg-primary min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-white/5 px-4 flex items-center justify-between bg-bg-primary/90 backdrop-blur-md shrink-0">
          {selected ? (
            <>
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
            </>
          ) : (
            <p className="text-xs text-text-muted">Select a conversation</p>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-bg-card/60 animate-pulse" />
            ))
          ) : messages.length === 0 ? (
            <div className="text-[11px] text-text-muted">No messages to display.</div>
          ) : (
            messages.map((msg, i) => (
              <ChatBubble key={msg.id} msg={msg} index={i} />
            ))
          )}
        </div>

        {/* Status bar + take over */}
        <div className="px-4 pb-3 flex flex-col gap-2 shrink-0">
          {/* Booking progress */}
          <div className="rounded-xl border border-white/5 bg-bg-card px-3 py-2">
            <p className="text-[10px] font-semibold text-warning mb-2">
              Step 3 of 4: Awaiting slot confirmation
            </p>
            <div className="flex items-center gap-0">
              {steps.map((step, i) => (
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
                  {i < STEP_LABELS.length - 1 && (
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
