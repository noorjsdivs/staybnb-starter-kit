// Backfill Airbnb-style booking criteria for every active Service:
// packages, weekly hours, blocked dates, and capacity defaults.
//
// Idempotent — safe to re-run. Existing packages/hours are left alone unless
// a service has none yet.
//
// Run:  pnpm --filter api exec tsx scripts/seed-service-booking-criteria.ts
import { randomUUID } from "crypto";
import prisma from "../utils/prisma.js";

/** Category → booking defaults tuned per service type (Airbnb Services). */
const CATEGORY_DEFAULTS: Record<
  string,
  {
    durationMinutes: number;
    minGuests: number;
    maxGuests: number;
    locationType: "guest_location" | "provider_location" | "either";
    minLeadHours: number;
    includes: string[];
    hours: { start: string; end: string; closedDays: number[] };
    packages: Array<{
      name: string;
      description: string;
      durationMinutes: number;
      /** Multiplier of priceFrom for the package base price. */
      priceMult: number;
      priceMode: "per_person" | "fixed";
      isDefault?: boolean;
    }>;
  }
> = {
  chefs: {
    durationMinutes: 180,
    minGuests: 2,
    maxGuests: 12,
    locationType: "guest_location",
    minLeadHours: 48,
    includes: [
      "Private chef for the full session",
      "Grocery shopping for the menu",
      "Cooking and plating",
      "Kitchen cleanup",
    ],
    hours: { start: "11:00", end: "22:00", closedDays: [1] }, // closed Mon
    packages: [
      {
        name: "3-course private dinner",
        description: "Starter, main and dessert prepared in your kitchen.",
        durationMinutes: 180,
        priceMult: 1,
        priceMode: "per_person",
        isDefault: true,
      },
      {
        name: "Chef's tasting menu (5 courses)",
        description: "A longer multi-course experience with wine-pairing notes.",
        durationMinutes: 240,
        priceMult: 1.45,
        priceMode: "per_person",
      },
      {
        name: "Intimate dinner for two",
        description: "Fixed price for couples — perfect for anniversaries.",
        durationMinutes: 150,
        priceMult: 2.2,
        priceMode: "fixed",
      },
    ],
  },
  photography: {
    durationMinutes: 120,
    minGuests: 1,
    maxGuests: 8,
    locationType: "either",
    minLeadHours: 24,
    includes: [
      "Professional photographer",
      "Edited digital gallery",
      "Location scouting tips",
    ],
    hours: { start: "07:00", end: "19:00", closedDays: [] },
    packages: [
      {
        name: "2-hour photo session",
        description: "Up to 50 edited photos delivered in 5 days.",
        durationMinutes: 120,
        priceMult: 1,
        priceMode: "fixed",
        isDefault: true,
      },
      {
        name: "Half-day shoot (4 hours)",
        description: "Extended coverage for proposals, families or brand days.",
        durationMinutes: 240,
        priceMult: 1.75,
        priceMode: "fixed",
      },
    ],
  },
  massage: {
    durationMinutes: 60,
    minGuests: 1,
    maxGuests: 2,
    locationType: "guest_location",
    minLeadHours: 12,
    includes: [
      "Licensed massage therapist",
      "Table and linens",
      "Premium oils",
    ],
    hours: { start: "09:00", end: "21:00", closedDays: [] },
    packages: [
      {
        name: "60-minute session",
        description: "Classic full-body massage at your place.",
        durationMinutes: 60,
        priceMult: 1,
        priceMode: "per_person",
        isDefault: true,
      },
      {
        name: "90-minute deep tissue",
        description: "Extended session focused on tension release.",
        durationMinutes: 90,
        priceMult: 1.4,
        priceMode: "per_person",
      },
      {
        name: "Couples massage (60 min)",
        description: "Two therapists, side by side.",
        durationMinutes: 60,
        priceMult: 1.9,
        priceMode: "fixed",
      },
    ],
  },
  training: {
    durationMinutes: 60,
    minGuests: 1,
    maxGuests: 4,
    locationType: "either",
    minLeadHours: 12,
    includes: [
      "Certified personal trainer",
      "Custom workout plan",
      "Resistance bands (if needed)",
    ],
    hours: { start: "06:00", end: "20:00", closedDays: [] },
    packages: [
      {
        name: "1-hour training session",
        description: "Focused strength or mobility work.",
        durationMinutes: 60,
        priceMult: 1,
        priceMode: "per_person",
        isDefault: true,
      },
      {
        name: "Small-group session",
        description: "Train with friends — up to 4 people.",
        durationMinutes: 60,
        priceMult: 0.75,
        priceMode: "per_person",
      },
    ],
  },
  makeup: {
    durationMinutes: 90,
    minGuests: 1,
    maxGuests: 6,
    locationType: "guest_location",
    minLeadHours: 24,
    includes: [
      "Professional makeup artist",
      "Premium product kit",
      "Touch-up essentials",
    ],
    hours: { start: "07:00", end: "18:00", closedDays: [] },
    packages: [
      {
        name: "Event glam",
        description: "Full-face makeup for weddings, parties or shoots.",
        durationMinutes: 90,
        priceMult: 1,
        priceMode: "per_person",
        isDefault: true,
      },
      {
        name: "Bridal package",
        description: "Trial + day-of makeup with long-wear products.",
        durationMinutes: 120,
        priceMult: 1.6,
        priceMode: "per_person",
      },
    ],
  },
  hair: {
    durationMinutes: 75,
    minGuests: 1,
    maxGuests: 4,
    locationType: "guest_location",
    minLeadHours: 24,
    includes: [
      "Mobile hair stylist",
      "Styling tools and products",
      "Light touch-up kit",
    ],
    hours: { start: "07:00", end: "19:00", closedDays: [] },
    packages: [
      {
        name: "Blowout & style",
        description: "Wash optional — styled look for your event.",
        durationMinutes: 75,
        priceMult: 1,
        priceMode: "per_person",
        isDefault: true,
      },
      {
        name: "Updo / formal style",
        description: "Elegant set for weddings and evenings out.",
        durationMinutes: 90,
        priceMult: 1.35,
        priceMode: "per_person",
      },
    ],
  },
};

const FALLBACK = CATEGORY_DEFAULTS.chefs!;

async function seedOne(serviceId: string, category: string, priceFrom: number) {
  const defaults = CATEGORY_DEFAULTS[category] ?? FALLBACK;

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      durationMinutes: defaults.durationMinutes,
      minGuests: defaults.minGuests,
      maxGuests: defaults.maxGuests,
      locationType: defaults.locationType,
      minLeadHours: defaults.minLeadHours,
      maxAdvanceDays: 90,
      bufferMinutes: 30,
      slotIntervalMinutes: 30,
      instantBook: true,
      cancellationPolicy: "moderate",
      includes: defaults.includes,
      serviceFeePct: 12,
      taxRate: 0,
    },
  });

  const pkgCount = await prisma.servicePackage.count({
    where: { serviceId },
  });
  if (pkgCount === 0) {
    await prisma.servicePackage.createMany({
      data: defaults.packages.map((p, i) => ({
        id: randomUUID(),
        serviceId,
        name: p.name,
        description: p.description,
        durationMinutes: p.durationMinutes,
        price: Math.round(priceFrom * p.priceMult * 100) / 100,
        priceMode: p.priceMode,
        maxGuests: p.priceMode === "fixed" ? defaults.maxGuests : null,
        isDefault: Boolean(p.isDefault),
        sortOrder: i,
        isActive: true,
      })),
    });
  }

  const hoursCount = await prisma.serviceWeeklyHours.count({
    where: { serviceId },
  });
  if (hoursCount === 0) {
    const rows = Array.from({ length: 7 }, (_, dayOfWeek) => {
      const closed = defaults.hours.closedDays.includes(dayOfWeek);
      return {
        id: randomUUID(),
        serviceId,
        dayOfWeek,
        startTime: defaults.hours.start,
        endTime: defaults.hours.end,
        isClosed: closed,
      };
    });
    await prisma.serviceWeeklyHours.createMany({ data: rows });
  }

  // Seed a couple of blocked dates in the next 90 days (deterministic-ish).
  const blockedCount = await prisma.serviceBlockedDate.count({
    where: { serviceId },
  });
  if (blockedCount === 0) {
    const base = new Date();
    base.setUTCHours(0, 0, 0, 0);
    const offsets = [14 + (serviceId.charCodeAt(0) % 7), 35 + (serviceId.charCodeAt(1) % 10)];
    for (const off of offsets) {
      const d = new Date(base);
      d.setUTCDate(d.getUTCDate() + off);
      await prisma.serviceBlockedDate.upsert({
        where: {
          serviceId_date: { serviceId, date: d },
        },
        create: {
          id: randomUUID(),
          serviceId,
          date: d,
          reason: "Provider unavailable",
        },
        update: {},
      });
    }
  }
}

async function main() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, category: true, priceFrom: true },
  });
  if (services.length === 0) {
    console.log("No services found — run seed-experiences-services.ts first.");
    return;
  }

  let n = 0;
  for (const s of services) {
    await seedOne(s.id, s.category, Number(s.priceFrom));
    n++;
    console.log(`  ✓ ${s.slug}`);
  }
  console.log(`\n✓ Booking criteria ready for ${n} services.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
