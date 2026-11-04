/**
 * Seed the `amenities` table with the canonical catalogue used by the host
 * wizard (apps/web/src/components/host/add-listing/catalog.ts). Idempotent:
 * existing rows are updated by `slug`, missing ones inserted.
 *
 * Run:  pnpm --filter api seed:amenities
 */
import prisma from "../utils/prisma.js";
import type { AmenityGroup } from "@prisma/client";

interface SeedRow {
  slug: string;
  label: string;
  group: AmenityGroup;
  isPopular?: boolean;
  order: number;
}

const FAVORITES: SeedRow[] = [
  {
    slug: "wifi",
    label: "Wifi",
    group: "internet_office",
    isPopular: true,
    order: 1,
  },
  {
    slug: "free_parking",
    label: "Free parking on premises",
    group: "parking_facilities",
    isPopular: true,
    order: 2,
  },
  {
    slug: "tv",
    label: "TV",
    group: "entertainment",
    isPopular: true,
    order: 3,
  },
  {
    slug: "paid_parking",
    label: "Paid parking on premises",
    group: "parking_facilities",
    order: 4,
  },
  {
    slug: "kitchen",
    label: "Kitchen",
    group: "kitchen_dining",
    isPopular: true,
    order: 5,
  },
  {
    slug: "ac",
    label: "Air conditioning",
    group: "heating_cooling",
    isPopular: true,
    order: 6,
  },
  { slug: "washer", label: "Washer", group: "bedroom_laundry", order: 7 },
  {
    slug: "workspace",
    label: "Dedicated Workspace",
    group: "internet_office",
    order: 8,
  },
];

const STANDOUT: SeedRow[] = [
  { slug: "pool", label: "Pool", group: "outdoor", isPopular: true, order: 20 },
  {
    slug: "pool_table",
    label: "Pool table",
    group: "entertainment",
    order: 21,
  },
  { slug: "lake_access", label: "Lake access", group: "outdoor", order: 22 },
  { slug: "hot_tub", label: "Hot Tub", group: "outdoor", order: 23 },
  {
    slug: "indoor_fireplace",
    label: "Indoor fireplace",
    group: "heating_cooling",
    order: 24,
  },
  { slug: "beach_access", label: "Beach access", group: "outdoor", order: 25 },
  { slug: "patio", label: "Patio", group: "outdoor", order: 26 },
  { slug: "piano", label: "Piano", group: "entertainment", order: 27 },
  { slug: "ski_in_out", label: "Ski-in/Ski-out", group: "outdoor", order: 28 },
  { slug: "bbq", label: "BBQ grill", group: "outdoor", order: 29 },
  {
    slug: "exercise",
    label: "Exercise equipment",
    group: "services",
    order: 30,
  },
  {
    slug: "outdoor_shower",
    label: "Outdoor shower",
    group: "outdoor",
    order: 31,
  },
];

const SAFETY: SeedRow[] = [
  {
    slug: "smoke_alarm",
    label: "Smoke alarm",
    group: "home_safety",
    order: 50,
  },
  {
    slug: "first_aid",
    label: "First aid kit",
    group: "home_safety",
    order: 51,
  },
  {
    slug: "fire_extinguisher",
    label: "Fire extinguisher",
    group: "home_safety",
    order: 52,
  },
  {
    slug: "co_alarm",
    label: "Carbon monoxide alarm",
    group: "home_safety",
    order: 53,
  },
];

const ALL: SeedRow[] = [...FAVORITES, ...STANDOUT, ...SAFETY];

async function main() {
  for (const row of ALL) {
    await prisma.amenity.upsert({
      where: { slug: row.slug },
      update: {
        label: row.label,
        group: row.group,
        isPopular: row.isPopular ?? false,
        order: row.order,
      },
      create: {
        slug: row.slug,
        label: row.label,
        group: row.group,
        isPopular: row.isPopular ?? false,
        order: row.order,
      },
    });
  }
  console.log(`[seed:amenities] Upserted ${ALL.length} amenities.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
