// Backfill Airbnb-style booking criteria for every active Experience.
// Idempotent. Run:
//   pnpm --filter api exec tsx scripts/seed-experience-booking-criteria.ts
import { randomUUID } from "crypto";
import prisma from "../utils/prisma.js";

const CATEGORY_DEFAULTS: Record<
  string,
  {
    minGuests: number;
    minLeadHours: number;
    startTimes: string[];
    hours: { start: string; end: string; closedDays: number[] };
    includes: string[];
  }
> = {
  food_drink: {
    minGuests: 1,
    minLeadHours: 24,
    startTimes: ["11:00", "17:00"],
    hours: { start: "10:00", end: "21:00", closedDays: [1] },
    includes: [
      "Local host guide",
      "All tastings included",
      "Walking tour route",
    ],
  },
  culture: {
    minGuests: 1,
    minLeadHours: 24,
    startTimes: ["09:30", "14:00"],
    hours: { start: "09:00", end: "18:00", closedDays: [] },
    includes: ["Local host", "Skip-the-line tips", "Photo spots map"],
  },
  outdoors: {
    minGuests: 2,
    minLeadHours: 48,
    startTimes: ["07:00", "15:00"],
    hours: { start: "06:00", end: "19:00", closedDays: [] },
    includes: ["Guide", "Safety briefing", "Light refreshments"],
  },
  water: {
    minGuests: 1,
    minLeadHours: 24,
    startTimes: ["08:00", "13:00"],
    hours: { start: "07:00", end: "17:00", closedDays: [] },
    includes: ["Equipment", "Instructor", "Life jackets"],
  },
  wellness: {
    minGuests: 1,
    minLeadHours: 12,
    startTimes: ["07:00", "18:00"],
    hours: { start: "06:00", end: "20:00", closedDays: [] },
    includes: ["Mat or props", "Guided session", "Quiet space"],
  },
  nightlife: {
    minGuests: 1,
    minLeadHours: 24,
    startTimes: ["19:00", "21:00"],
    hours: { start: "18:00", end: "23:30", closedDays: [] },
    includes: ["Host guide", "Venue recommendations", "Group meet-up"],
  },
};

const FALLBACK = CATEGORY_DEFAULTS.culture!;

async function seedOne(
  experienceId: string,
  category: string,
  maxGroupSize: number,
) {
  const defaults = CATEGORY_DEFAULTS[category] ?? FALLBACK;

  await prisma.experience.update({
    where: { id: experienceId },
    data: {
      minGuests: Math.min(defaults.minGuests, maxGroupSize),
      minLeadHours: defaults.minLeadHours,
      maxAdvanceDays: 90,
      defaultStartTimes: defaults.startTimes,
      instantBook: true,
      cancellationPolicy: "moderate",
      includes: defaults.includes,
      serviceFeePct: 12,
      taxRate: 0,
    },
  });

  const hoursCount = await prisma.experienceWeeklyHours.count({
    where: { experienceId },
  });
  if (hoursCount === 0) {
    await prisma.experienceWeeklyHours.createMany({
      data: Array.from({ length: 7 }, (_, dayOfWeek) => ({
        id: randomUUID(),
        experienceId,
        dayOfWeek,
        startTime: defaults.hours.start,
        endTime: defaults.hours.end,
        isClosed: defaults.hours.closedDays.includes(dayOfWeek),
      })),
    });
  }

  const blockedCount = await prisma.experienceBlockedDate.count({
    where: { experienceId },
  });
  if (blockedCount === 0) {
    const base = new Date();
    base.setUTCHours(0, 0, 0, 0);
    const offsets = [
      18 + (experienceId.charCodeAt(0) % 5),
      40 + (experienceId.charCodeAt(1) % 8),
    ];
    for (const off of offsets) {
      const d = new Date(base);
      d.setUTCDate(d.getUTCDate() + off);
      await prisma.experienceBlockedDate.upsert({
        where: {
          experienceId_date: { experienceId, date: d },
        },
        create: {
          id: randomUUID(),
          experienceId,
          date: d,
          reason: "Host unavailable",
        },
        update: {},
      });
    }
  }
}

async function main() {
  const items = await prisma.experience.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, category: true, maxGroupSize: true },
  });
  if (items.length === 0) {
    console.log("No experiences — run seed-experiences-services.ts first.");
    return;
  }
  for (const e of items) {
    await seedOne(e.id, e.category, e.maxGroupSize);
    console.log(`  ✓ ${e.slug}`);
  }
  console.log(`\n✓ Booking criteria ready for ${items.length} experiences.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
