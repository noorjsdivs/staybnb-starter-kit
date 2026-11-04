// Seed real guest reviews for listings, experiences, and services.
// Creates completed bookings where needed so author ↔ booking ↔ target stays
// consistent. Recomputes avgRating / reviewCount from published reviews.
//
// Run: pnpm --filter api exec tsx scripts/seed-reviews.ts
import { randomBytes } from "crypto";
import prisma from "../utils/prisma.js";
import {
  recomputeExperienceReviewAggregates,
  recomputeListingReviewAggregates,
  recomputeServiceReviewAggregates,
} from "../utils/reviewAggregates.js";

const BODIES = [
  {
    title: "Wonderful stay",
    body: "Everything was exactly as described. The host was thoughtful and the space was spotless. Would happily book again.",
  },
  {
    title: "Highly recommend",
    body: "Loved the views and the calm neighbourhood. Check-in was seamless and communication was excellent throughout.",
  },
  {
    title: "Great experience",
    body: "Charming spot with little touches that made the stay special. Location is perfect for exploring on foot.",
  },
  {
    title: "Would book again",
    body: "Hosting was top-notch. Instructions were crystal clear and the place felt like a home away from home.",
  },
  {
    title: "Fantastic value",
    body: "Clean, comfortable, and well equipped. Great value for the area. Already planning a return visit.",
  },
  {
    title: "Memorable",
    body: "The photos don't do it justice. Quiet at night, bright in the morning, and close to everything we needed.",
  },
];

const EXP_BODIES = [
  {
    title: "Unforgettable",
    body: "Our host made the group feel welcome from the first minute. Learned so much and left full of energy.",
  },
  {
    title: "Perfect pace",
    body: "Well organised, friendly, and the right length. Great for first-timers and seasoned travellers alike.",
  },
  {
    title: "Local insight",
    body: "Genuine local knowledge and stories you won't find in a guidebook. Highly recommend booking early.",
  },
];

const SVC_BODIES = [
  {
    title: "Professional and warm",
    body: "Arrived on time, explained everything clearly, and the result exceeded expectations. Will rebook.",
  },
  {
    title: "Worth every penny",
    body: "Flexible scheduling, transparent pricing, and excellent attention to detail. Five stars.",
  },
  {
    title: "Made our trip",
    body: "Felt personal rather than transactional. Communication before the day was excellent.",
  },
];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const code = (prefix: string) =>
  `${prefix}-${new Date().getFullYear()}-${randomBytes(3).toString("hex").toUpperCase()}`;

function stars(rand: () => number, bias = 4.4): number {
  // Bias toward 4–5 like real Airbnb distributions.
  const r = rand();
  if (r < 0.05) return 3;
  if (r < 0.2) return 4;
  return 5;
}

function cats(overall: number, rand: () => number) {
  const jitter = () => {
    const d = Math.floor(rand() * 3) - 1; // -1,0,1
    return Math.min(5, Math.max(3, overall + d));
  };
  return {
    ratingCleanliness: jitter(),
    ratingAccuracy: jitter(),
    ratingCheckIn: jitter(),
    ratingCommunication: jitter(),
    ratingLocation: jitter(),
    ratingValue: jitter(),
  };
}

async function ensureGuests() {
  const guests = await prisma.user.findMany({
    where: { role: { in: ["user", "host"] } },
    select: { id: true },
    take: 40,
  });
  if (guests.length >= 5) return guests;
  // Fallback: any users
  return prisma.user.findMany({ select: { id: true }, take: 40 });
}

async function seedListingReviews(
  guests: { id: string }[],
  rand: () => number,
) {
  // Prefer published listings; top up those with few reviews.
  const listings = await prisma.listing.findMany({
    where: { status: "published" },
    select: { id: true, hostId: true, reviewCount: true },
    orderBy: { reviewCount: "asc" },
    take: 40,
  });

  let created = 0;
  for (const listing of listings) {
    const target = 4 + Math.floor(rand() * 8); // 4–11 reviews each
    const existing = await prisma.review.count({
      where: { listingId: listing.id, isPublished: true },
    });
    const need = Math.max(0, target - existing);
    for (let i = 0; i < need; i++) {
      const guest = guests[Math.floor(rand() * guests.length)]!;
      if (guest.id === listing.hostId) continue;

      const checkOut = new Date();
      checkOut.setUTCDate(checkOut.getUTCDate() - (20 + Math.floor(rand() * 120)));
      const checkIn = new Date(checkOut);
      checkIn.setUTCDate(checkIn.getUTCDate() - (2 + Math.floor(rand() * 5)));

      const booking = await prisma.booking.create({
        data: {
          bookingCode: code("STB"),
          guestId: guest.id,
          listingId: listing.id,
          checkIn,
          checkOut,
          nights: Math.max(
            1,
            Math.round(
              (checkOut.getTime() - checkIn.getTime()) / 86_400_000,
            ),
          ),
          adults: 1 + Math.floor(rand() * 3),
          children: 0,
          infants: 0,
          pets: 0,
          basePriceTotal: 100,
          cleaningFee: 20,
          serviceFee: 15,
          taxes: 10,
          totalAmount: 145,
          currency: "USD",
          status: "completed",
          paymentStatus: "succeeded",
        },
      });

      const overall = stars(rand);
      const copy = BODIES[Math.floor(rand() * BODIES.length)]!;
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          listingId: listing.id,
          authorId: guest.id,
          subjectId: listing.hostId,
          ratingOverall: overall,
          ...cats(overall, rand),
          title: copy.title,
          body: copy.body,
          isPublished: true,
          createdAt: new Date(
            checkOut.getTime() + (1 + Math.floor(rand() * 10)) * 86_400_000,
          ),
        },
      });
      created++;
    }
    await recomputeListingReviewAggregates(listing.id);
  }
  return created;
}

async function seedExperienceReviews(
  guests: { id: string }[],
  rand: () => number,
) {
  const experiences = await prisma.experience.findMany({
    where: { isActive: true },
    select: { id: true, hostId: true, pricePerPerson: true, currency: true },
  });

  // Zero out fake seed counts first so only real reviews show.
  await prisma.experience.updateMany({
    data: { avgRating: 0, reviewCount: 0 },
  });

  let created = 0;
  for (const exp of experiences) {
    const target = 3 + Math.floor(rand() * 10);
    const existing = await prisma.review.count({
      where: { experienceId: exp.id, isPublished: true },
    });
    const need = Math.max(0, target - existing);
    for (let i = 0; i < need; i++) {
      const guest = guests[Math.floor(rand() * guests.length)]!;
      if (guest.id === exp.hostId) continue;

      const date = new Date();
      date.setUTCDate(date.getUTCDate() - (15 + Math.floor(rand() * 90)));
      date.setUTCHours(0, 0, 0, 0);
      const unit = Number(exp.pricePerPerson);
      const guestsN = 1 + Math.floor(rand() * 3);
      const subtotal = unit * guestsN;
      const serviceFee = Math.round(subtotal * 0.12 * 100) / 100;

      const booking = await prisma.experienceBooking.create({
        data: {
          bookingCode: code("EXP"),
          guestId: guest.id,
          experienceId: exp.id,
          date,
          startTime: "10:00",
          endTime: "13:00",
          guests: guestsN,
          unitPrice: unit,
          subtotal,
          serviceFee,
          taxes: 0,
          total: subtotal + serviceFee,
          currency: exp.currency,
          status: "completed",
          paymentStatus: "succeeded",
        },
      });

      const overall = stars(rand);
      const copy = EXP_BODIES[Math.floor(rand() * EXP_BODIES.length)]!;
      await prisma.review.create({
        data: {
          experienceBookingId: booking.id,
          experienceId: exp.id,
          authorId: guest.id,
          subjectId: exp.hostId,
          ratingOverall: overall,
          ...cats(overall, rand),
          title: copy.title,
          body: copy.body,
          isPublished: true,
          createdAt: new Date(date.getTime() + 2 * 86_400_000),
        },
      });
      created++;
    }
    await recomputeExperienceReviewAggregates(exp.id);
  }
  return created;
}

async function seedServiceReviews(
  guests: { id: string }[],
  rand: () => number,
) {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, hostId: true, priceFrom: true, currency: true },
  });

  await prisma.service.updateMany({
    data: { avgRating: 0, reviewCount: 0 },
  });

  let created = 0;
  for (const svc of services) {
    const target = 3 + Math.floor(rand() * 8);
    const existing = await prisma.review.count({
      where: { serviceId: svc.id, isPublished: true },
    });
    const need = Math.max(0, target - existing);
    for (let i = 0; i < need; i++) {
      const guest = guests[Math.floor(rand() * guests.length)]!;
      if (guest.id === svc.hostId) continue;

      const date = new Date();
      date.setUTCDate(date.getUTCDate() - (15 + Math.floor(rand() * 90)));
      date.setUTCHours(0, 0, 0, 0);
      const unit = Number(svc.priceFrom);
      const guestsN = 1 + Math.floor(rand() * 2);
      const subtotal = unit * guestsN;
      const serviceFee = Math.round(subtotal * 0.12 * 100) / 100;

      const booking = await prisma.serviceBooking.create({
        data: {
          bookingCode: code("SVC"),
          guestId: guest.id,
          serviceId: svc.id,
          date,
          startTime: "14:00",
          endTime: "16:00",
          guests: guestsN,
          unitPrice: unit,
          subtotal,
          serviceFee,
          taxes: 0,
          total: subtotal + serviceFee,
          currency: svc.currency,
          status: "completed",
          paymentStatus: "succeeded",
        },
      });

      const overall = stars(rand);
      const copy = SVC_BODIES[Math.floor(rand() * SVC_BODIES.length)]!;
      await prisma.review.create({
        data: {
          serviceBookingId: booking.id,
          serviceId: svc.id,
          authorId: guest.id,
          subjectId: svc.hostId,
          ratingOverall: overall,
          ...cats(overall, rand),
          title: copy.title,
          body: copy.body,
          isPublished: true,
          createdAt: new Date(date.getTime() + 2 * 86_400_000),
        },
      });
      created++;
    }
    await recomputeServiceReviewAggregates(svc.id);
  }
  return created;
}

async function main() {
  const guests = await ensureGuests();
  if (guests.length === 0) {
    throw new Error("No users found to author reviews");
  }
  const rand = mulberry32(20260720);
  console.log(`Guests available: ${guests.length}`);

  const listingN = await seedListingReviews(guests, rand);
  console.log(`  ✓ listing reviews created: ${listingN}`);

  const expN = await seedExperienceReviews(guests, rand);
  console.log(`  ✓ experience reviews created: ${expN}`);

  const svcN = await seedServiceReviews(guests, rand);
  console.log(`  ✓ service reviews created: ${svcN}`);

  const total = await prisma.review.count();
  console.log(`\n✓ Done. Total reviews in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
