"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  ChevronDown,
  Users,
  Tag,
  Search,
  Bell,
  Plus,
  X,
  Clock,
  User,
  CalendarDays,
  Phone,
  MessageCircle,
  Globe,
  FileText,
  RefreshCw,
  Trash2,
  Check,
  Star,
} from "lucide-react"

// Types
interface Staff {
  id: string
  name: string
  role: string
  avatar: string
  available: boolean
}

interface Appointment {
  id: string
  staffId: string
  service: string
  customer: string
  phone: string
  startTime: string
  endTime: string
  price: number
  category: "hair" | "color" | "nails" | "spa"
  status: "confirmed" | "in-progress" | "pending"
  bookedVia: "whatsapp" | "web" | "phone"
  notes?: string
}

// Category colors
const categoryColors: Record<string, string> = {
  hair: "#2563EB",
  color: "#A855F7",
  nails: "#D946EF",
  spa: "#10B981",
}

// Dummy data
const staffMembers: Staff[] = [
  {
    id: "sarah",
    name: "Sarah J.",
    role: "Senior Stylist",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    available: true,
  },
  {
    id: "marcus",
    name: "Marcus T.",
    role: "Colorist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    available: true,
  },
  {
    id: "elena",
    name: "Elena R.",
    role: "Nail Tech",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    available: true,
  },
  {
    id: "alex",
    name: "Alex B.",
    role: "Off Today",
    avatar: "",
    available: false,
  },
]

const appointments: Appointment[] = [
  {
    id: "1",
    staffId: "sarah",
    service: "Balayage & Cut",
    customer: "Emma Watson",
    phone: "+1 (555) 123-4567",
    startTime: "09:15",
    endTime: "10:30",
    price: 180,
    category: "hair",
    status: "in-progress",
    bookedVia: "web",
    notes: "Client requested ash blonde tones. First time visiting this branch.",
  },
  {
    id: "2",
    staffId: "sarah",
    service: "Blowout",
    customer: "Jennifer Lopez",
    phone: "+1 (555) 987-6543",
    startTime: "11:00",
    endTime: "11:45",
    price: 65,
    category: "hair",
    status: "confirmed",
    bookedVia: "phone",
  },
  {
    id: "3",
    staffId: "marcus",
    service: "Root Touch-up",
    customer: "John Doe",
    phone: "+1 (555) 456-7890",
    startTime: "11:00",
    endTime: "12:00",
    price: 95,
    category: "color",
    status: "confirmed",
    bookedVia: "web",
  },
  {
    id: "4",
    staffId: "marcus",
    service: "Full Color",
    customer: "Sarah Miller",
    phone: "+1 (555) 321-0987",
    startTime: "13:00",
    endTime: "14:30",
    price: 150,
    category: "color",
    status: "pending",
    bookedVia: "whatsapp",
  },
  {
    id: "5",
    staffId: "elena",
    service: "Gel Manicure",
    customer: "Lisa M.",
    phone: "+1 (555) 111-2222",
    startTime: "09:30",
    endTime: "10:30",
    price: 55,
    category: "nails",
    status: "confirmed",
    bookedVia: "whatsapp",
  },
  {
    id: "6",
    staffId: "elena",
    service: "Pedicure Deluxe",
    customer: "Maria Garcia",
    phone: "+1 (555) 333-4444",
    startTime: "11:30",
    endTime: "12:30",
    price: 75,
    category: "nails",
    status: "confirmed",
    bookedVia: "web",
  },
  {
    id: "7",
    staffId: "sarah",
    service: "Men's Cut",
    customer: "David Chen",
    phone: "+1 (555) 555-6666",
    startTime: "14:00",
    endTime: "14:45",
    price: 45,
    category: "hair",
    status: "confirmed",
    bookedVia: "phone",
  },
]

const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00",
]

// Helper to calculate appointment position
function getAppointmentPosition(startTime: string, endTime: string) {
  const [startHour, startMin] = startTime.split(":").map(Number)
  const [endHour, endMin] = endTime.split(":").map(Number)
  
  const startOffset = (startHour - 8) * 80 + (startMin / 60) * 80
  const duration = (endHour - startHour) * 80 + ((endMin - startMin) / 60) * 80
  
  return { top: startOffset, height: Math.max(duration, 40) }
}

// Helper to format time
function formatTime(time: string) {
  const [hour, min] = time.split(":").map(Number)
  const ampm = hour >= 12 ? "PM" : "AM"
  const h = hour % 12 || 12
  return `${h}:${min.toString().padStart(2, "0")} ${ampm}`
}

export function BookingCalendar() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Week")
  const [hoveredSlot, setHoveredSlot] = useState<{ staffId: string; hour: number } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const openDrawer = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setTimeout(() => setSelectedAppointment(null), 300)
  }

  const getStaffAppointments = (staffId: string) => {
    return appointments.filter((apt) => apt.staffId === staffId)
  }

  return (
    <div className="h-screen flex flex-col bg-[#0A0B0F] text-white overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-white/5 bg-[#0A0B0F]/80 backdrop-blur-md flex justify-between items-center px-6 flex-shrink-0">
        <h2 className="text-xl font-semibold text-[#B4C5FF]">Booking Calendar</h2>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#2563EB] hover:bg-white/5 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-[#2563EB] hover:bg-white/5 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <div className="w-8 h-8 rounded-full bg-[#16181F] border border-white/10 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-[#0D0E14] p-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Date Picker */}
          <button className="flex items-center gap-2 px-4 py-2 bg-[#16181F] rounded-lg border border-white/5 text-sm text-white hover:border-[#2563EB]/50 transition-colors">
            <Calendar className="w-4 h-4 text-[#2563EB]" />
            Oct 24, 2023
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          </button>
          
          <div className="h-6 w-px bg-white/10 mx-1" />
          
          {/* Staff Filter */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs font-medium text-white hover:bg-white/5 transition-colors">
            <Users className="w-4 h-4" />
            All Staff
          </button>
          
          {/* Category Filter */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 text-xs font-medium text-white hover:bg-white/5 transition-colors">
            <Tag className="w-4 h-4" />
            Category
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-[#0A0B0F] p-1 rounded-lg border border-white/5">
          {(["Day", "Week", "Month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === mode
                  ? "bg-[#16181F] text-[#2563EB] shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#0D0E14] m-4 rounded-xl border border-white/5">
        {/* Staff Headers */}
        <div className="flex border-b border-white/5 bg-[#0A0B0F] flex-shrink-0">
          <div className="w-16 flex-shrink-0 border-r border-white/5" />
          <div className="flex-1 grid grid-cols-4 divide-x divide-white/5">
            {staffMembers.map((staff) => (
              <div
                key={staff.id}
                className={`py-3 px-4 flex items-center gap-3 justify-center ${
                  !staff.available ? "opacity-50" : ""
                }`}
              >
                {staff.available ? (
                  <img
                    src={staff.avatar}
                    alt={staff.name}
                    className="w-8 h-8 rounded-full border border-white/10 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#16181F] flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-white">{staff.name}</p>
                  <p className="text-[10px] text-emerald-400">{staff.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Timetable */}
        <div className="flex-1 overflow-y-auto calendar-scroll relative">
          <div className="flex min-h-[1120px]">
            {/* Time Axis */}
            <div className="w-16 flex-shrink-0 border-r border-white/5 flex flex-col relative z-10 bg-[#0A0B0F]/80 backdrop-blur-sm">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-20 border-b border-white/5 flex justify-end pr-2 pt-2"
                >
                  <span className="text-[11px] text-gray-500">{time}</span>
                </div>
              ))}
            </div>

            {/* Grid Columns */}
            <div className="flex-1 grid grid-cols-4 divide-x divide-white/5 relative">
              {/* Horizontal row lines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col">
                {timeSlots.map((_, i) => (
                  <div key={i} className="h-20 border-b border-white/5 w-full" />
                ))}
              </div>

              {/* Current Time Line */}
              <div
                className="absolute left-0 right-0 h-px bg-red-500 z-20 pointer-events-none"
                style={{ top: "180px", boxShadow: "0 0 8px rgba(239, 68, 68, 0.5)" }}
              >
                <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />
              </div>

              {/* Staff Columns */}
              {staffMembers.map((staff) => (
                <div key={staff.id} className="relative p-1">
                  {staff.available ? (
                    <>
                      {/* Empty slot hover areas */}
                      {timeSlots.map((_, hourIndex) => (
                        <div
                          key={hourIndex}
                          className="absolute left-1 right-1 h-20 cursor-pointer group"
                          style={{ top: hourIndex * 80 }}
                          onMouseEnter={() => setHoveredSlot({ staffId: staff.id, hour: hourIndex })}
                          onMouseLeave={() => setHoveredSlot(null)}
                        >
                          <AnimatePresence>
                            {hoveredSlot?.staffId === staff.id && hoveredSlot?.hour === hourIndex && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#2563EB]/10 rounded-lg border border-dashed border-[#2563EB]/30 flex items-center justify-center"
                              >
                                <Plus className="w-5 h-5 text-[#2563EB]/60" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}

                      {/* Appointment Cards */}
                      {getStaffAppointments(staff.id).map((apt, index) => {
                        const pos = getAppointmentPosition(apt.startTime, apt.endTime)
                        return (
                          <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="absolute left-1 right-1 cursor-pointer group z-10"
                            style={{
                              top: pos.top,
                              height: pos.height,
                            }}
                            onClick={() => openDrawer(apt)}
                          >
                            <div
                              className="h-full bg-gradient-to-br from-[#1C1F2A] to-[#16181F] rounded-lg border-t border-r border-b border-white/10 p-2 hover:scale-[1.02] hover:border-white/20 transition-all shadow-lg"
                              style={{ borderLeftWidth: 3, borderLeftColor: categoryColors[apt.category] }}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-xs font-semibold text-white truncate flex-1">
                                  {apt.service}
                                </p>
                              </div>
                              <p className="text-[11px] text-gray-400 truncate">
                                {apt.customer} &bull; {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                              </p>
                              {pos.height > 60 && (
                                <div className="flex justify-between items-center mt-auto absolute bottom-2 left-2 right-2">
                                  <div className="flex gap-1">
                                    {apt.bookedVia === "whatsapp" && (
                                      <MessageCircle className="w-3 h-3 text-[#25D366]" />
                                    )}
                                    {apt.bookedVia === "web" && (
                                      <Globe className="w-3 h-3 text-[#B4C5FF]" />
                                    )}
                                    {apt.bookedVia === "phone" && (
                                      <Phone className="w-3 h-3 text-gray-400" />
                                    )}
                                  </div>
                                  {apt.status === "in-progress" && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      <span className="text-[9px] text-emerald-400 uppercase font-bold tracking-wider">
                                        In Progress
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-[#16181F]/30 flex items-center justify-center">
                      <p className="text-xs text-gray-500 -rotate-90 tracking-widest uppercase">
                        Unavailable
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-lg z-30 border border-[#2563EB]/50"
        style={{ boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)" }}
      >
        <Plus className="w-7 h-7" />
      </motion.button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={closeDrawer}
          />
        )}
      </AnimatePresence>

      {/* Side Panel / Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedAppointment && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-screen w-[400px] bg-[#0D0E14]/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">Booking Details</h3>
              <button
                onClick={closeDrawer}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Client Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#16181F] border border-white/10 flex items-center justify-center text-lg font-semibold text-[#2563EB]">
                  {selectedAppointment.customer
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    {selectedAppointment.customer}
                  </h4>
                  <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedAppointment.phone}
                  </p>
                </div>
              </div>

              {/* Service Block */}
              <div className="bg-[#1C1F2A] rounded-xl border border-white/5 p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] text-[#2563EB] uppercase font-bold tracking-wider mb-1 block">
                      Service
                    </span>
                    <p className="text-base font-semibold text-white">
                      {selectedAppointment.service}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    ${selectedAppointment.price}
                  </p>
                </div>
                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-400">
                      {formatTime(selectedAppointment.startTime)} -{" "}
                      {formatTime(selectedAppointment.endTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-400">
                      {staffMembers.find((s) => s.id === selectedAppointment.staffId)?.name} (
                      {staffMembers.find((s) => s.id === selectedAppointment.staffId)?.role})
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-400">Today, Oct 24, 2023</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Booking Notes
                  </h5>
                  <p className="text-sm text-white bg-[#0A0B0F] p-3 rounded-lg border border-white/5 italic">
                    &ldquo;{selectedAppointment.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-white/5 bg-[#0A0B0F] flex flex-col gap-3">
              <button
                className="w-full py-3 rounded-lg bg-[#2563EB] text-white font-medium text-sm shadow-lg hover:bg-[#2563EB]/90 transition-colors flex items-center justify-center gap-2"
                style={{ boxShadow: "0 0 15px rgba(37, 99, 235, 0.3)" }}
              >
                <FileText className="w-4 h-4" />
                Checkout / Invoice
              </button>
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 rounded-lg border border-white/10 text-white font-medium text-sm hover:border-[#2563EB] hover:text-[#2563EB] transition-colors flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reschedule
                </button>
                <button className="flex-1 py-2.5 rounded-lg border border-red-500/30 text-red-400 font-medium text-sm hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Booking Modal */}
      <NewBookingModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .calendar-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .calendar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .calendar-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .calendar-scroll::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}

// ─── NewBookingModal ────────────────────────────────────────────────────────

const SERVICE_LIST = [
  { name: "Haircut", duration: "45min", price: "₹800" },
  { name: "Hair Color", duration: "90min", price: "₹2,500" },
  { name: "Facial", duration: "60min", price: "₹1,200" },
  { name: "Manicure", duration: "30min", price: "₹600" },
  { name: "Hair Spa", duration: "60min", price: "₹1,500" },
  { name: "Pedicure", duration: "45min", price: "₹700" },
]

const STAFF_LIST = [
  { name: "No Pref.", rating: null, initials: "★" },
  { name: "Priya", rating: "4.9", initials: "PR" },
  { name: "Rahul", rating: "4.7", initials: "RA" },
  { name: "Sneha", rating: "4.8", initials: "SN" },
  { name: "Vikram", rating: "4.6", initials: "VK" },
  { name: "Meera", rating: "4.8", initials: "ME" },
]

const MORNING_SLOTS = [
  { time: "9:00", available: true },
  { time: "9:30", available: true },
  { time: "10:00", available: false },
  { time: "10:30", available: true },
  { time: "11:00", available: false },
  { time: "11:30", available: true },
]
const AFTERNOON_SLOTS = [
  { time: "12:00", available: true },
  { time: "1:00", available: false },
  { time: "2:00", available: true },
  { time: "3:00", available: true },
  { time: "4:00", available: true },
  { time: "4:30", available: true },
]
const EVENING_SLOTS = [
  { time: "5:00", available: true },
  { time: "5:30", available: true },
  { time: "6:00", available: false },
  { time: "7:00", available: true },
]

const BOOKING_CHANNELS = [
  { id: "web", label: "Web", Icon: Globe },
  { id: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { id: "walkin", label: "Walk-in", Icon: User },
  { id: "call", label: "Call", Icon: Phone },
]

const SERVICE_CATEGORIES = ["All", "Hair", "Skin", "Nails", "Spa", "Packages"]

function generateDateChips() {
  const chips = []
  const today = new Date()
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    chips.push({
      label: `${days[d.getDay()]} ${d.getDate()}`,
      isToday: i === 0,
    })
  }
  return chips
}

interface NewBookingModalProps {
  open: boolean
  onClose: () => void
}

export function NewBookingModal({ open, onClose }: NewBookingModalProps) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedStaff, setSelectedStaff] = useState(0)
  const [selectedDate, setSelectedDate] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedChannel, setSelectedChannel] = useState("whatsapp")
  const [waToggle, setWaToggle] = useState(true)

  const dateChips = generateDateChips()

  const handleClose = () => {
    onClose()
    // Reset after close animation
    setTimeout(() => {
      setStep(1)
      setSelectedService(null)
      setSelectedCategory("All")
      setSelectedStaff(0)
      setSelectedDate(0)
      setSelectedSlot(null)
      setSelectedChannel("whatsapp")
      setWaToggle(true)
    }, 300)
  }

  const STEP_LABELS = ["Customer", "Service", "Schedule", "Confirm"]

  function StepSlot({ s }: { s: { time: string; available: boolean } }) {
    const active = selectedSlot === s.time
    if (!s.available) {
      return (
        <span className="bg-[#1C1F2A] text-gray-600 text-xs px-3 py-1.5 rounded-lg cursor-not-allowed line-through">
          {s.time}
        </span>
      )
    }
    return (
      <button
        onClick={() => setSelectedSlot(s.time)}
        className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
          active
            ? "bg-[#2563EB] text-white border border-[#2563EB]"
            : "bg-[#2563EB]/15 border border-[#2563EB]/40 text-[#2563EB] hover:bg-[#2563EB]/25"
        }`}
      >
        {s.time}
      </button>
    )
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center backdrop-blur-xl bg-black/60 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full max-w-2xl mx-auto mt-12 mb-12 bg-[#16181F] rounded-2xl p-8 border border-white/5"
            style={{ boxShadow: "0 0 60px #2563EB15" }}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Step Indicator */}
            <div className="flex items-center mb-8">
              {STEP_LABELS.map((label, i) => {
                const num = i + 1
                const isCompleted = step > num
                const isActive = step === num
                return (
                  <div key={label} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                          isCompleted
                            ? "bg-[#2563EB] text-white"
                            : isActive
                            ? "bg-[#2563EB] text-white"
                            : "bg-[#1C1F2A] border border-white/10 text-gray-500"
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : num}
                      </div>
                      <span
                        className={`text-[10px] font-medium ${
                          isActive ? "text-white" : "text-gray-500"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div
                        className={`flex-1 h-px mx-2 mb-4 transition-colors ${
                          step > num ? "bg-[#2563EB]" : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* STEP 1 — Customer */}
                {step === 1 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Find Customer</h3>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="tel"
                        placeholder="+91 Enter phone number"
                        className="w-full bg-[#0A0B0F] border border-white/10 focus:border-[#2563EB] outline-none rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 transition-colors"
                      />
                    </div>
                    {/* Customer result */}
                    <div className="bg-[#1C1F2A] rounded-xl p-4 mt-3 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                        AS
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">Anjali Singh</p>
                        <p className="text-sm text-gray-400">+91 98765 43210</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium border border-amber-500/20">
                            Gold
                          </span>
                          <span className="text-[11px] text-gray-500">24 visits</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/20">
                            320 pts
                          </span>
                        </div>
                      </div>
                      <button className="ml-auto flex-shrink-0 text-sm text-[#2563EB] font-semibold hover:text-[#2563EB]/80 transition-colors">
                        Select →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2 — Service */}
                {step === 2 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Select Service</h3>
                    {/* Category tabs */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {SERVICE_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            selectedCategory === cat
                              ? "bg-[#2563EB] text-white"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    {/* Service grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {SERVICE_LIST.map((svc) => {
                        const isSelected = selectedService === svc.name
                        return (
                          <button
                            key={svc.name}
                            onClick={() => setSelectedService(svc.name)}
                            className={`relative bg-[#1C1F2A] rounded-xl p-4 text-left cursor-pointer border transition-colors ${
                              isSelected
                                ? "border-[#2563EB]"
                                : "border-white/5 hover:border-[#2563EB]/40"
                            }`}
                          >
                            {isSelected && (
                              <Check className="absolute top-2 right-2 w-4 h-4 text-[#2563EB]" />
                            )}
                            <p className="font-medium text-white text-sm mb-2">{svc.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-[#0A0B0F] px-2 py-0.5 rounded text-gray-400">
                                {svc.duration}
                              </span>
                              <span className="text-xs font-semibold text-[#2563EB] ml-auto">
                                {svc.price}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3 — Schedule */}
                {step === 3 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Schedule</h3>

                    {/* Staff */}
                    <p className="text-sm text-gray-400 mb-2">Select Staff</p>
                    <div className="flex gap-3 pb-2 overflow-x-auto">
                      {STAFF_LIST.map((staff, idx) => (
                        <button
                          key={staff.name}
                          onClick={() => setSelectedStaff(idx)}
                          className={`flex-shrink-0 w-20 text-center rounded-xl p-2 transition-colors ${
                            selectedStaff === idx
                              ? "border border-[#2563EB] bg-[#2563EB]/5"
                              : "border border-transparent"
                          }`}
                        >
                          <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {staff.initials}
                          </div>
                          <p className="text-xs mt-1 text-white truncate">{staff.name}</p>
                          {staff.rating && (
                            <p className="text-[10px] text-amber-400">{staff.rating} <Star className="w-2.5 h-2.5 inline" /></p>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Date */}
                    <p className="text-sm text-gray-400 mt-4 mb-2">Select Date</p>
                    <div className="flex gap-2 pb-2 overflow-x-auto">
                      {dateChips.map((chip, idx) => (
                        <button
                          key={chip.label}
                          onClick={() => setSelectedDate(idx)}
                          className={`flex-shrink-0 rounded-lg px-3 py-2 text-xs transition-colors ${
                            selectedDate === idx
                              ? "bg-[#2563EB] text-white"
                              : "bg-[#1C1F2A] text-gray-400 hover:text-white"
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    {/* Time slots */}
                    <p className="text-sm text-gray-400 mt-4 mb-2">Available Times</p>
                    <div className="space-y-3">
                      {[
                        { label: "Morning", slots: MORNING_SLOTS },
                        { label: "Afternoon", slots: AFTERNOON_SLOTS },
                        { label: "Evening", slots: EVENING_SLOTS },
                      ].map(({ label, slots }) => (
                        <div key={label}>
                          <p className="text-xs text-gray-500 mb-2">{label}</p>
                          <div className="flex flex-wrap gap-2">
                            {slots.map((s) => <StepSlot key={s.time} s={s} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4 — Confirm */}
                {step === 4 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Confirm Booking</h3>

                    {/* Summary */}
                    <div className="bg-[#0A0B0F] rounded-xl p-5 space-y-3">
                      {[
                        { label: "Service", value: "Haircut", valueClass: "text-[#2563EB]", extra: "₹800" },
                        { label: "Customer", value: "Anjali Singh" },
                        { label: "Staff", value: "Priya Sharma" },
                        { label: "Date & Time", value: "Tomorrow, 9:00 AM" },
                        { label: "Branch", value: "Banjara Hills" },
                        { label: "Duration", value: "45 minutes" },
                      ].map((row) => (
                        <div key={row.label} className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">{row.label}</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-white ${row.valueClass ?? ""}`}>
                              {row.value}
                            </span>
                            {row.extra && (
                              <span className="text-sm font-semibold text-[#2563EB]">{row.extra}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Channel selector */}
                    <p className="text-sm text-gray-400 mt-4 mb-2">Booking Channel</p>
                    <div className="grid grid-cols-4 gap-2">
                      {BOOKING_CHANNELS.map(({ id, label, Icon }) => (
                        <button
                          key={id}
                          onClick={() => setSelectedChannel(id)}
                          className={`bg-[#1C1F2A] rounded-xl p-3 text-center cursor-pointer border transition-colors ${
                            selectedChannel === id
                              ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]"
                              : "border-white/5 text-gray-400 hover:text-white"
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1" />
                          <p className="text-xs">{label}</p>
                        </button>
                      ))}
                    </div>

                    {/* WhatsApp toggle */}
                    <div className="flex items-center justify-between mt-4 bg-[#1C1F2A] rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-[#25D366]" />
                        <span className="text-sm text-white">Send WhatsApp confirmation</span>
                      </div>
                      <button
                        onClick={() => setWaToggle((v) => !v)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          waToggle ? "bg-[#25D366]" : "bg-white/10"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            waToggle ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="border border-white/10 text-white px-4 py-2 rounded-lg text-sm hover:border-white/30 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="bg-[#2563EB] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#2563EB]/90 transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm"
                  style={{
                    background: "#2563EB",
                    boxShadow: "0 0 20px rgba(37,99,235,0.4)",
                  }}
                >
                  <Check className="w-4 h-4" />
                  Confirm Booking
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
