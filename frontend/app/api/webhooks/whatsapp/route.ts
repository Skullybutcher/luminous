import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/lib/models/Appointment";
import Branch from "@/lib/models/Branch";
import Customer from "@/lib/models/Customer";
import Service from "@/lib/models/Service";
import Session from "@/lib/models/Session";
import User from "@/lib/models/User";
import { getAvailableSlots } from "@/lib/appointments/slots";

const SESSION_TTL_MS = 30 * 60 * 1000;

function formatTime(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function parseDateFromText(text: string) {
  const lower = text.toLowerCase();
  const today = new Date();
  if (lower.includes("tomorrow")) {
    const date = new Date(today);
    date.setDate(date.getDate() + 1);
    return date;
  }
  if (lower.includes("today")) {
    return today;
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function sendWhatsAppMessage(phone: string, message: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) {
    console.warn("WhatsApp token or phone id missing");
    return;
  }

  await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: message },
    }),
  });
}

function matchBranch(text: string) {
  if (text.includes("1") || text.includes("banjara")) return "Banjara Hills";
  if (text.includes("2") || text.includes("jubilee")) return "Jubilee Hills";
  if (text.includes("3") || text.includes("madhapur")) return "Madhapur";
  return null;
}

function matchService(text: string) {
  if (text.includes("1") || text.includes("haircut")) return "Haircut";
  if (text.includes("2") || text.includes("hair color") || text.includes("hair colour")) return "Hair Color";
  if (text.includes("3") || text.includes("facial")) return "Facial";
  if (text.includes("4") || text.includes("other")) return "OTHER";
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN && challenge) {
    return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const entry = payload?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    const phone = message?.from;
    const text = message?.text?.body?.toLowerCase().trim();

    if (!phone || !text) {
      return NextResponse.json({ success: true });
    }

    await connectDB();

    let customer = await Customer.findOne({ phone });
    if (!customer) {
      customer = await Customer.create({
        name: "Guest",
        phone,
        isActive: true,
        tags: [],
      });
    }

    let session = await Session.findOne({ phone });
    if (!session) {
      session = await Session.create({
        phone,
        customerId: customer._id,
        step: "init",
        isActive: true,
        lastMessageAt: new Date(),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      });
    }

    const context = { ...(session.context ?? {}) } as Record<string, unknown>;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
    let responseMessage = "";
    let nextStep = session.step;
    let isActive = session.isActive;

    if (!session.isActive) {
      nextStep = "init";
      isActive = true;
    }

    if (nextStep === "init") {
      const branchName = matchBranch(text);
      if (branchName) {
        const branch = await Branch.findOne({ name: branchName });
        if (branch) {
          const staff = await User.findOne({ branchId: branch._id, isActive: true, role: { $ne: "admin" } });
          context.branchId = branch._id;
          context.branchName = branch.name;
          if (staff) {
            context.staffId = staff._id;
          }
          nextStep = "service_selected";
          responseMessage =
            "Great! What service are you looking for?\n" +
            "1. Haircut 800\n" +
            "2. Hair Color 2500\n" +
            "3. Facial 1200\n" +
            "4. Other services";
        }
      }

      if (!responseMessage) {
        const name = customer.name || "there";
        responseMessage =
          `Hi ${name}! Welcome to Luminous. Which branch would you prefer?\n` +
          "1. Banjara Hills\n" +
          "2. Jubilee Hills\n" +
          "3. Madhapur";
        nextStep = "branch_selected";
      }
    } else if (nextStep === "branch_selected") {
      const branchName = matchBranch(text);
      if (!branchName) {
        responseMessage =
          "Please select a branch:\n" +
          "1. Banjara Hills\n" +
          "2. Jubilee Hills\n" +
          "3. Madhapur";
      } else {
        const branch = await Branch.findOne({ name: branchName });
        if (!branch) {
          responseMessage = "That branch was not found. Please try again.";
        } else {
          const staff = await User.findOne({ branchId: branch._id, isActive: true, role: { $ne: "admin" } });
          context.branchId = branch._id;
          context.branchName = branch.name;
          if (staff) {
            context.staffId = staff._id;
          }
          nextStep = "service_selected";
          responseMessage =
            "Great! What service are you looking for?\n" +
            "1. Haircut 800\n" +
            "2. Hair Color 2500\n" +
            "3. Facial 1200\n" +
            "4. Other services";
        }
      }
    } else if (nextStep === "service_selected") {
      const serviceChoice = matchService(text);
      const services = await Service.find();

      if (serviceChoice === "OTHER") {
        responseMessage =
          "Here are more services:\n" +
          services.map((service, index) => `${index + 1}. ${service.name}`).join("\n") +
          "\nReply with a service name.";
      } else {
        const service = services.find((item) => {
          if (serviceChoice) {
            return item.name.toLowerCase().includes(serviceChoice.toLowerCase());
          }
          return text.includes(item.name.toLowerCase());
        });

        if (!service) {
          responseMessage = "Please reply with a valid service name or number.";
        } else {
          context.serviceId = service._id;
          context.serviceName = service.name;
          nextStep = "date_selected";
          responseMessage = "When would you like to come in? Reply with a date like 'tomorrow' or 'June 2'.";
        }
      }
    } else if (nextStep === "date_selected") {
      const date = parseDateFromText(text);
      if (!date) {
        responseMessage = "Please share a valid date like 'tomorrow' or 'June 2'.";
      } else if (!context.branchId || !context.staffId || !context.serviceId) {
        nextStep = "branch_selected";
        responseMessage = "Let us start again. Which branch would you prefer?";
      } else {
        const slots = await getAvailableSlots({
          branchId: String(context.branchId),
          staffId: String(context.staffId),
          serviceId: String(context.serviceId),
          date,
        });

        const availableSlots = slots.filter((slot) => slot.available);
        if (availableSlots.length === 0) {
          responseMessage = "No slots are available on that date. Please choose another date.";
        } else {
          context.selectedDate = date.toISOString();
          context.availableSlots = availableSlots.map((slot) => slot.time);
          nextStep = "slot_selected";
          responseMessage =
            "Here are available slots:\n" +
            availableSlots
              .map((slot, index) => `${index + 1}. ${formatTime(slot.time)}`)
              .join("\n") +
            "\nReply with a slot number.";
        }
      }
    } else if (nextStep === "slot_selected") {
      const availableSlots = Array.isArray(context.availableSlots) ? context.availableSlots : [];
      const selection = parseInt(text, 10);
      const index = Number.isNaN(selection) ? -1 : selection - 1;
      const selectedSlot = availableSlots[index];

      if (!selectedSlot || !context.branchId || !context.serviceId || !context.staffId) {
        responseMessage = "Please reply with a valid slot number.";
      } else {
        const service = await Service.findById(context.serviceId);
        const branch = await Branch.findById(context.branchId);
        if (!service || !branch) {
          responseMessage = "Unable to complete booking. Please try again.";
        } else {
          const appointment = await Appointment.create({
            customerId: customer._id,
            branchId: context.branchId,
            staffId: context.staffId,
            serviceId: context.serviceId,
            slot: new Date(selectedSlot),
            duration: service.duration,
            status: "confirmed",
            channel: "whatsapp",
            price: service.price,
          });

          context.selectedSlot = selectedSlot;
          nextStep = "completed";
          isActive = false;
          responseMessage =
            "Booking confirmed.\n" +
            `Service: ${service.name}\n` +
            `Branch: ${branch.name}\n` +
            `Date: ${new Date(selectedSlot).toLocaleString("en-IN")}\n` +
            `Booking ID: ${appointment._id.toString()}\n` +
            "We will send you a reminder.";
        }
      }
    }

    await Session.updateOne(
      { _id: session._id },
      {
        $set: {
          customerId: customer._id,
          step: nextStep,
          context,
          isActive,
          lastMessageAt: now,
          expiresAt,
        },
      }
    );

    if (responseMessage) {
      await sendWhatsAppMessage(phone, responseMessage);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ success: false });
  }
}
