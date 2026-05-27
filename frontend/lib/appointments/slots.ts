import Appointment from "@/lib/models/Appointment";
import Branch from "@/lib/models/Branch";
import Service from "@/lib/models/Service";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseTimeForDate(date: Date, value: string) {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export async function getAvailableSlots(params: {
  branchId: string;
  staffId: string;
  serviceId: string;
  date: Date;
}) {
  const { branchId, staffId, serviceId, date } = params;

  const service = await Service.findById(serviceId);
  if (!service) {
    throw new Error("Service not found");
  }

  const branch = await Branch.findById(branchId);
  if (!branch) {
    throw new Error("Branch not found");
  }

  const dayLabel = DAY_LABELS[date.getDay()];
  const hours = branch.operatingHours.find((entry) => entry.day === dayLabel && entry.isOpen);

  if (!hours) {
    return [] as { time: string; available: boolean }[];
  }

  const openTime = parseTimeForDate(date, hours.open);
  const closeTime = parseTimeForDate(date, hours.close);
  const serviceDurationMs = service.duration * 60000;

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const appointments = await Appointment.find({
    staffId,
    status: { $ne: "cancelled" },
    slot: { $gte: start, $lt: end },
  }).populate("serviceId", "duration");

  const slots: { time: string; available: boolean }[] = [];
  let cursor = new Date(openTime);

  while (cursor.getTime() + serviceDurationMs <= closeTime.getTime()) {
    const candidateStart = new Date(cursor);
    const candidateEnd = new Date(candidateStart.getTime() + serviceDurationMs);

    const hasConflict = appointments.some((appt) => {
      const apptStart = new Date(appt.slot);
      const apptDuration =
        appt.duration ??
        ((appt.serviceId as { duration?: number } | null)?.duration ?? service.duration);
      const apptEnd = new Date(apptStart.getTime() + apptDuration * 60000);
      return apptStart < candidateEnd && apptEnd > candidateStart;
    });

    slots.push({ time: candidateStart.toISOString(), available: !hasConflict });
    cursor = new Date(cursor.getTime() + 30 * 60000);
  }

  return slots;
}
