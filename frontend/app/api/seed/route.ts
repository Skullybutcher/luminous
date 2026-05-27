import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Branch from "@/lib/models/Branch";
import User from "@/lib/models/User";
import Service from "@/lib/models/Service";
import Customer from "@/lib/models/Customer";
import Appointment from "@/lib/models/Appointment";
import Invoice from "@/lib/models/Invoice";
import Inventory from "@/lib/models/Inventory";
import Session from "@/lib/models/Session";

const CHANNELS = ["web", "whatsapp", "walkin", "call"] as const;

const PRODUCTS = [
  { name: "Hair Serum Pro", category: "Hair", current: 0, max: 20, min: 5, unit: "bottles", cost: 450, retail: 890, restocked: "Never", status: "CRITICAL" },
  { name: "Keratin Shampoo", category: "Hair", current: 3, max: 15, min: 5, unit: "bottles", cost: 380, retail: 750, restocked: "2w ago", status: "LOW" },
  { name: "Hair Color Black", category: "Hair", current: 12, max: 30, min: 8, unit: "tubes", cost: 120, retail: 280, restocked: "3d ago", status: "GOOD" },
  { name: "Nail Polish Remover", category: "Nails", current: 0, max: 10, min: 3, unit: "bottles", cost: 80, retail: 180, restocked: "Never", status: "CRITICAL" },
  { name: "Base Coat", category: "Nails", current: 2, max: 8, min: 3, unit: "bottles", cost: 150, retail: 320, restocked: "1w ago", status: "LOW" },
  { name: "Facial Cleanser", category: "Skin", current: 8, max: 20, min: 5, unit: "units", cost: 520, retail: 980, restocked: "5d ago", status: "GOOD" },
  { name: "Moisturizer SPF", category: "Skin", current: 4, max: 12, min: 4, unit: "units", cost: 680, retail: 1200, restocked: "1w ago", status: "LOW" },
  { name: "Massage Oil", category: "Spa", current: 15, max: 25, min: 6, unit: "bottles", cost: 290, retail: 580, restocked: "2d ago", status: "GOOD" },
  { name: "Scrub Exfoliator", category: "Skin", current: 6, max: 15, min: 4, unit: "units", cost: 340, retail: 680, restocked: "4d ago", status: "GOOD" },
  { name: "Nail Art Kit", category: "Nails", current: 1, max: 5, min: 2, unit: "kits", cost: 890, retail: 1600, restocked: "3w ago", status: "LOW" },
  { name: "Henna Powder", category: "Hair", current: 22, max: 30, min: 8, unit: "packs", cost: 65, retail: 150, restocked: "1d ago", status: "GOOD" },
  { name: "Wax Strips", category: "Skin", current: 18, max: 40, min: 10, unit: "packs", cost: 45, retail: 120, restocked: "1d ago", status: "GOOD" },
];

const daysFromNow = (days: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const getMembershipDiscount = (tier: string) => {
  if (tier === "gold") return 15;
  if (tier === "silver") return 8;
  if (tier === "bronze") return 5;
  return 0;
};

export async function GET() {
  try {
    await connectDB();

    await Invoice.deleteMany({});
    await Appointment.deleteMany({});
    await Session.deleteMany({});
    await Service.deleteMany({});
    await Customer.deleteMany({});
    await User.deleteMany({});
    await Branch.deleteMany({});
    await Inventory.deleteMany({});

    const operatingHours = [
      { day: "Mon", open: "10:00", close: "20:00", isOpen: true },
      { day: "Tue", open: "10:00", close: "20:00", isOpen: true },
      { day: "Wed", open: "10:00", close: "20:00", isOpen: true },
      { day: "Thu", open: "10:00", close: "20:00", isOpen: true },
      { day: "Fri", open: "10:00", close: "20:00", isOpen: true },
      { day: "Sat", open: "10:00", close: "20:00", isOpen: true },
      { day: "Sun", open: "10:00", close: "20:00", isOpen: true },
    ];

    const branches = await Branch.insertMany([
      {
        name: "Banjara Hills",
        address: "Road No. 12, Banjara Hills",
        city: "Hyderabad",
        phone: "+91 40 4000 1200",
        email: "banjara@luminous.in",
        operatingHours,
      },
      {
        name: "Jubilee Hills",
        address: "Rd No. 45, Jubilee Hills",
        city: "Hyderabad",
        phone: "+91 40 4000 1300",
        email: "jubilee@luminous.in",
        operatingHours,
      },
      {
        name: "Madhapur",
        address: "Hitech City Rd, Madhapur",
        city: "Hyderabad",
        phone: "+91 40 4000 1400",
        email: "madhapur@luminous.in",
        operatingHours,
      },
    ]);

    const branchByName = new Map(branches.map((branch) => [branch.name, branch]));

    const users = await User.insertMany([
      {
        name: "Priya Sharma",
        email: "priya.sharma@luminous.in",
        phone: "+91 98760 10001",
        role: "stylist",
        branchId: branchByName.get("Banjara Hills")?._id,
        commissionRate: 12,
        specializations: ["Hair"],
        isActive: true,
      },
      {
        name: "Rahul Verma",
        email: "rahul.verma@luminous.in",
        phone: "+91 98760 10002",
        role: "stylist",
        branchId: branchByName.get("Banjara Hills")?._id,
        commissionRate: 10,
        specializations: ["Hair"],
        isActive: true,
      },
      {
        name: "Sneha Iyer",
        email: "sneha.iyer@luminous.in",
        phone: "+91 98760 10003",
        role: "stylist",
        branchId: branchByName.get("Jubilee Hills")?._id,
        commissionRate: 10,
        specializations: ["Hair"],
        isActive: true,
      },
      {
        name: "Vikram D",
        email: "vikram.d@luminous.in",
        phone: "+91 98760 10004",
        role: "stylist",
        branchId: branchByName.get("Jubilee Hills")?._id,
        commissionRate: 12,
        specializations: ["Hair"],
        isActive: true,
      },
      {
        name: "Meera Kapoor",
        email: "meera.kapoor@luminous.in",
        phone: "+91 98760 10005",
        role: "stylist",
        branchId: branchByName.get("Madhapur")?._id,
        commissionRate: 8,
        specializations: ["Nails"],
        isActive: true,
      },
      {
        name: "Arjun Kumar",
        email: "arjun.kumar@luminous.in",
        phone: "+91 98760 10006",
        role: "admin",
        branchId: branchByName.get("Banjara Hills")?._id,
        commissionRate: 15,
        specializations: [],
        isActive: true,
      },
    ]);

    const arjun = users.find((user) => user.name === "Arjun Kumar");
    if (arjun) {
      await Branch.updateOne(
        { _id: branchByName.get("Banjara Hills")?._id },
        { managerId: arjun._id }
      );
    }

    const services = await Service.insertMany([
      { name: "Haircut", category: "hair", duration: 45, price: 800, description: "Precision cut and style" },
      { name: "Hair Color", category: "hair", duration: 90, price: 2500, description: "Full color application" },
      { name: "Hair Spa", category: "hair", duration: 60, price: 1500, description: "Deep conditioning and massage" },
      { name: "Keratin", category: "hair", duration: 120, price: 4500, description: "Smoothening treatment" },
      { name: "Facial", category: "skin", duration: 60, price: 1200, description: "Classic facial" },
      { name: "Moisturizing Facial", category: "skin", duration: 45, price: 900, description: "Hydration boost" },
      { name: "Manicure", category: "nails", duration: 30, price: 600, description: "Nail grooming and polish" },
      { name: "Pedicure", category: "nails", duration: 45, price: 700, description: "Foot care and polish" },
      { name: "Nail Art", category: "nails", duration: 60, price: 900, description: "Creative nail art" },
      { name: "Head Massage", category: "spa", duration: 30, price: 500, description: "Relaxing head massage" },
    ]);

    const customers = await Customer.insertMany([
      { name: "Anjali Singh", phone: "+91 98765 43210", membershipTier: "gold", loyaltyPoints: 320, totalVisits: 12, totalSpend: 18000, membershipDiscount: getMembershipDiscount("gold"), isActive: true, tags: ["vip"] },
      { name: "Rahul Mehta", phone: "+91 87654 32109", membershipTier: "silver", loyaltyPoints: 150, totalVisits: 8, totalSpend: 9200, membershipDiscount: getMembershipDiscount("silver"), isActive: true, tags: ["regular"] },
      { name: "Preethi K", phone: "+91 76543 21098", membershipTier: "gold", loyaltyPoints: 480, totalVisits: 16, totalSpend: 24000, membershipDiscount: getMembershipDiscount("gold"), isActive: true, tags: ["vip"] },
      { name: "Kiran Rao", phone: "+91 65432 10987", membershipTier: "none", loyaltyPoints: 40, totalVisits: 3, totalSpend: 1800, membershipDiscount: getMembershipDiscount("none"), isActive: true, tags: [] },
      { name: "Meera Joshi", phone: "+91 54321 09876", membershipTier: "bronze", loyaltyPoints: 90, totalVisits: 5, totalSpend: 3600, membershipDiscount: getMembershipDiscount("bronze"), isActive: true, tags: ["new"] },
      { name: "Aryan Shah", phone: "+91 43210 98765", membershipTier: "silver", loyaltyPoints: 200, totalVisits: 9, totalSpend: 10800, membershipDiscount: getMembershipDiscount("silver"), isActive: true, tags: ["regular"] },
      { name: "Divya Nair", phone: "+91 32109 87654", membershipTier: "gold", loyaltyPoints: 560, totalVisits: 20, totalSpend: 32000, membershipDiscount: getMembershipDiscount("gold"), isActive: true, tags: ["vip"] },
      { name: "Suresh P", phone: "+91 21098 76543", membershipTier: "none", loyaltyPoints: 20, totalVisits: 2, totalSpend: 1200, membershipDiscount: getMembershipDiscount("none"), isActive: true, tags: [] },
    ]);

    const staffByBranch = branches.reduce<Record<string, typeof users>>((acc, branch) => {
      acc[branch._id.toString()] = users.filter((user) => user.branchId?.toString() === branch._id.toString());
      return acc;
    }, {});

    const appointmentOffsets = [-6, -5, -4, -3, -2, -1, 0, -7, -6, -2, 1, 2, 3, 5, 7];
    const statusOrder = [
      "completed",
      "completed",
      "completed",
      "completed",
      "completed",
      "completed",
      "completed",
      "completed",
      "completed",
      "completed",
      "confirmed",
      "confirmed",
      "confirmed",
      "pending",
      "pending",
    ] as const;

    const appointments = await Appointment.insertMany(
      appointmentOffsets.map((offset, index) => {
        const branch = branches[index % branches.length];
        const branchStaff = staffByBranch[branch._id.toString()];
        const staff = branchStaff[index % branchStaff.length];
        const service = services[index % services.length];
        const customer = customers[index % customers.length];
        const slot = daysFromNow(offset, 10 + (index % 6));
        const status = statusOrder[index];
        const appointment: Record<string, unknown> = {
          customerId: customer._id,
          branchId: branch._id,
          staffId: staff._id,
          serviceId: service._id,
          slot,
          duration: service.duration,
          status,
          channel: CHANNELS[index % CHANNELS.length],
          price: service.price,
          notes: status === "completed" ? "Service completed successfully" : undefined,
        };

        if (status === "completed") {
          appointment.completedAt = new Date(slot.getTime() + service.duration * 60000);
        }

        return appointment;
      })
    );

    const completedAppointments = appointments.filter((appt) => appt.status === "completed");

    const invoices = await Invoice.insertMany(
      completedAppointments.slice(0, 10).map((appt, index) => {
        const service = services.find((item) => item._id.toString() === appt.serviceId.toString());
        const staff = users.find((item) => item._id.toString() === appt.staffId.toString());
        const customer = customers.find((item) => item._id.toString() === appt.customerId.toString());
        const subtotal = service?.price ?? 0;
        const commissionRate = staff?.commissionRate ?? 0;
        const commissionAmount = Math.round((subtotal * commissionRate) / 100);
        const membershipDiscount = customer ? getMembershipDiscount(customer.membershipTier) : 0;
        const discountType = membershipDiscount > 0 ? "membership" : "flat";
        const discountValue = membershipDiscount > 0 ? membershipDiscount : 0;
        const discountAmount = Math.round((subtotal * discountValue) / 100);
        const taxable = subtotal - discountAmount;
        const taxRate = 18;
        const taxAmount = Math.round((taxable * taxRate) / 100);
        const total = taxable + taxAmount;
        const paymentMethod = ["cash", "card", "upi", "split"][index % 4] as
          | "cash"
          | "card"
          | "upi"
          | "split";
        const paymentSplit =
          paymentMethod === "split"
            ? { cash: Math.round(total * 0.4), card: Math.round(total * 0.4), upi: Math.round(total * 0.2) }
            : undefined;

        return {
          appointmentId: appt._id,
          customerId: appt.customerId,
          branchId: appt.branchId,
          lineItems: [
            {
              serviceId: appt.serviceId,
              serviceName: service?.name ?? "Service",
              staffId: appt.staffId,
              staffName: staff?.name ?? "Staff",
              price: subtotal,
              commissionRate,
              commissionAmount,
            },
          ],
          subtotal,
          discountType,
          discountValue,
          discountAmount,
          loyaltyPointsRedeemed: 0,
          taxRate,
          taxAmount,
          total,
          paymentMethod,
          paymentSplit,
          status: "paid",
          sentToWhatsApp: index % 2 === 0,
        };
      })
    );

    const inventory = await Inventory.insertMany(PRODUCTS);

    return NextResponse.json({
      success: true,
      message: "Seeded successfully",
      counts: {
        branches: branches.length,
        users: users.length,
        services: services.length,
        customers: customers.length,
        appointments: appointments.length,
        invoices: invoices.length,
        inventory: inventory.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, message: "Seeding failed" },
      { status: 500 }
    );
  }
}
