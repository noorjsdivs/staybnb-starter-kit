// Airbnb-style home page seeder.
//
// Creates hosts + ~64 published listings across 8 cities, each with 4 photos.
// Photos are free-license stock images (Unsplash CDN, picsum fallback) that
// are downloaded, compressed with Sharp (webp), uploaded to ImageKit
// (folder /listings/seed) and persisted in `listing_images` with the
// ImageKit URL + fileId.
//
// Run with:  pnpm --filter api exec tsx scripts/seed-home-listings.ts
//
// Idempotent: listings are keyed on slug and skipped when they already
// exist; pool images use deterministic ImageKit file names with
// useUniqueFileName=false so reruns never duplicate assets.
import sharp from "sharp";
import prisma from "../utils/prisma.js";
import { imageKitUpload } from "../config/imagekit.js";
import type { ListingType } from "@prisma/client";

// =============================================================================
// Free-license stock photo pool (Unsplash license — free to use).
// =============================================================================

const UNSPLASH_IDS = [
  "photo-1522708323590-d24dbb6b0267", // bright apartment living room
  "photo-1502672260266-1c1ef2d93688", // cozy interior
  "photo-1493809842364-78817add7ffb", // loft living room
  "photo-1484154218962-a197022b5858", // modern kitchen
  "photo-1556912173-3bb406ef7e77", // kitchen island
  "photo-1560448204-e02f11c3d0e2", // studio apartment
  "photo-1560185007-cde436f6a4d0", // house exterior
  "photo-1560185127-6ed189bf02f4", // bedroom
  "photo-1560184897-ae75f418493e", // living room
  "photo-1512917774080-9991f1c4c750", // luxury house + pool
  "photo-1568605114967-8130f3a36994", // suburban house
  "photo-1570129477492-45c003edd2be", // craftsman house
  "photo-1564013799919-ab600027ffc6", // brick house dusk
  "photo-1583608205776-bfd35f0d9f83", // villa with pool
  "photo-1613490493576-7fde63acd811", // modern villa night
  "photo-1613977257363-707ba9348227", // villa pool view
  "photo-1600596542815-ffad4c1539a9", // modern white house
  "photo-1600585154340-be6161a56a0c", // contemporary home
  "photo-1600607687939-ce8a6c25118c", // hallway interior
  "photo-1600566753190-17f0baa2a6c3", // bathroom
  "photo-1600210492486-724fe5c67fb0", // bedroom suite
  "photo-1598928506311-c55ded91a20c", // sofa living room
  "photo-1554995207-c18c203602cb", // green chair interior
  "photo-1493663284031-b7e3aefcae8e", // armchair corner
  "photo-1586023492125-27b2c045efd7", // styled living room
  "photo-1616594039964-ae9021a400a0", // warm bedroom
  "photo-1616486338812-3dadae4b4ace", // shelf interior
  "photo-1631049307264-da0ec9d70304", // minimalist bedroom
  "photo-1540518614846-7eded433c457", // hotel bedroom
  "photo-1567767292278-a4f21aa2d36e", // hotel room
  "photo-1582719478250-c89cae4dc85b", // resort room
  "photo-1571003123894-1f0594d2b5d9", // cabin exterior
  "photo-1449158743715-0a90ebb6d2d8", // countryside cottage
  "photo-1518780664697-55e3ad937233", // barn cabin
  "photo-1542718610-a1d656d1884c", // a-frame cabin
  "photo-1499793983690-e29da59ef1c2", // beach house
  "photo-1507089947368-19c1da9775ae", // white interior
  "photo-1536376072261-38c75010e6c9", // industrial loft
  "photo-1505691938895-1758d7feb511", // bedding detail
  "photo-1505693416388-ac5ce068fe85", // bedroom window
];

const poolUrl = (i: number) =>
  `https://images.unsplash.com/${UNSPLASH_IDS[i % UNSPLASH_IDS.length]}?auto=format&fit=crop&w=1400&q=80`;
const fallbackUrl = (i: number) =>
  `https://picsum.photos/seed/staybnb-home-${i}/1400/1050`;

// =============================================================================
// Cities & listing specs
// =============================================================================

interface CitySpec {
  city: string;
  country: string;
  lat: number;
  lng: number;
  currency: string;
  /** Typical nightly price band [min, max] in USD. */
  price: [number, number];
  areas: string[];
}

const CITIES: CitySpec[] = [
  {
    city: "Dubai",
    country: "United Arab Emirates",
    lat: 25.2048,
    lng: 55.2708,
    currency: "USD",
    price: [90, 420],
    areas: [
      "Dubai Marina",
      "Downtown",
      "Jumeirah",
      "Palm Jumeirah",
      "Business Bay",
      "Deira",
      "JBR",
      "Al Barsha",
    ],
  },
  {
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    lat: 24.4539,
    lng: 54.3773,
    currency: "USD",
    price: [70, 300],
    areas: [
      "Corniche",
      "Al Reem Island",
      "Yas Island",
      "Saadiyat",
      "Khalifa City",
      "Al Zahiyah",
      "Masdar City",
      "Al Raha",
    ],
  },
  {
    city: "Doha",
    country: "Qatar",
    lat: 25.2854,
    lng: 51.531,
    currency: "USD",
    price: [65, 260],
    areas: [
      "West Bay",
      "The Pearl",
      "Lusail",
      "Msheireb",
      "Al Sadd",
      "Katara",
      "Al Waab",
      "Old Town",
    ],
  },
  {
    city: "Riyadh",
    country: "Saudi Arabia",
    lat: 24.7136,
    lng: 46.6753,
    currency: "USD",
    price: [55, 240],
    areas: [
      "Al Olaya",
      "Diplomatic Quarter",
      "Al Malqa",
      "King Abdullah District",
      "Al Nakheel",
      "Hittin",
      "Al Yasmin",
      "Diriyah",
    ],
  },
  {
    city: "Istanbul",
    country: "Turkey",
    lat: 41.0082,
    lng: 28.9784,
    currency: "USD",
    price: [40, 180],
    areas: [
      "Beyoğlu",
      "Kadıköy",
      "Beşiktaş",
      "Sultanahmet",
      "Karaköy",
      "Nişantaşı",
      "Üsküdar",
      "Galata",
    ],
  },
  {
    city: "London",
    country: "United Kingdom",
    lat: 51.5072,
    lng: -0.1276,
    currency: "USD",
    price: [110, 480],
    areas: [
      "Notting Hill",
      "Shoreditch",
      "Camden",
      "Kensington",
      "Soho",
      "Greenwich",
      "Islington",
      "Chelsea",
    ],
  },
  {
    city: "Paris",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    currency: "USD",
    price: [100, 450],
    areas: [
      "Le Marais",
      "Montmartre",
      "Saint-Germain",
      "Latin Quarter",
      "Bastille",
      "Belleville",
      "Opéra",
      "Canal Saint-Martin",
    ],
  },
  {
    city: "Kuala Lumpur",
    country: "Malaysia",
    lat: 3.139,
    lng: 101.6869,
    currency: "USD",
    price: [35, 150],
    areas: [
      "KLCC",
      "Bukit Bintang",
      "Bangsar",
      "Mont Kiara",
      "Chinatown",
      "Brickfields",
      "Damansara",
      "Ampang",
    ],
  },
];

const TYPES: { type: ListingType; label: string; categorySlug: string }[] = [
  { type: "apartment", label: "Apartment", categorySlug: "flat" },
  { type: "house", label: "Home", categorySlug: "house" },
  { type: "villa", label: "Villa", categorySlug: "villa" },
  { type: "loft", label: "Loft", categorySlug: "city" },
  { type: "room", label: "Room", categorySlug: "room" },
  { type: "guesthouse", label: "Guesthouse", categorySlug: "bed" },
  { type: "cottage", label: "Cottage", categorySlug: "countryside" },
  { type: "apartment", label: "Flat", categorySlug: "flat" },
];

const HOSTS = [
  { name: "Amira Hassan", email: "amira.host@staybnb.test" },
  { name: "Omar Al-Farsi", email: "omar.host@staybnb.test" },
  { name: "Layla Demir", email: "layla.host@staybnb.test" },
  { name: "James Whitfield", email: "james.host@staybnb.test" },
  { name: "Chloé Marchand", email: "chloe.host@staybnb.test" },
  { name: "Aisyah Rahman", email: "aisyah.host@staybnb.test" },
];

// Deterministic PRNG so reruns generate identical data.
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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// =============================================================================
// Image pipeline: download → sharp(webp) → ImageKit
// =============================================================================

const uploadedPool = new Map<number, { url: string; fileId: string }>();

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function ensurePoolImage(
  i: number,
): Promise<{ url: string; fileId: string }> {
  const cached = uploadedPool.get(i);
  if (cached) return cached;

  let raw: Buffer;
  try {
    raw = await download(poolUrl(i));
  } catch {
    console.warn(`  ! unsplash fetch failed for #${i}, using picsum fallback`);
    raw = await download(fallbackUrl(i));
  }

  const webp = await sharp(raw)
    .resize(1400, 1050, { fit: "cover" })
    .webp({ quality: 80 })
    .toBuffer();

  const result = await imageKitUpload({
    file: webp,
    fileName: `staybnb-home-${String(i).padStart(2, "0")}.webp`,
    folder: "/listings/seed",
    useUniqueFileName: false,
  });

  const entry = { url: result.url, fileId: result.fileId };
  uploadedPool.set(i, entry);
  console.log(`  ↑ imagekit ${entry.url}`);
  return entry;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  // 1. Hosts -----------------------------------------------------------------
  const hostIds: string[] = [];
  for (const h of HOSTS) {
    const user = await prisma.user.upsert({
      where: { email: h.email },
      update: { role: "host", isHostVerified: true },
      create: {
        name: h.name,
        email: h.email,
        role: "host",
        isHostVerified: true,
        hasSetPassword: false,
        avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(h.email)}`,
      },
    });
    hostIds.push(user.id);
  }
  console.log(`✓ ${hostIds.length} hosts ready`);

  // 2. Category lookup --------------------------------------------------------
  const categories = await prisma.propertyCategory.findMany({
    select: { id: true, slug: true },
  });
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  // 3. Listings ---------------------------------------------------------------
  let created = 0;
  let skipped = 0;
  let poolCursor = 0;

  for (const c of CITIES) {
    console.log(`→ ${c.city}, ${c.country}`);
    for (let i = 0; i < c.areas.length; i++) {
      const area = c.areas[i]!;
      const t = TYPES[i % TYPES.length]!;
      const title = `${t.label} in ${area}`;
      const slug = slugify(`${t.label}-${area}-${c.city}`);

      const existing = await prisma.listing.findUnique({ where: { slug } });
      if (existing) {
        skipped++;
        poolCursor += 4;
        continue;
      }

      const rand = mulberry32(
        [...slug].reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7) >>> 0,
      );
      const [minP, maxP] = c.price;
      const basePrice = Math.round(minP + rand() * (maxP - minP));
      const bedrooms = 1 + Math.floor(rand() * 3);
      const rating = Math.round((4.5 + rand() * 0.47) * 100) / 100;
      const reviewCount = 8 + Math.floor(rand() * 300);

      // 4 photos per listing from the shared pool (rotating window).
      const photos = await Promise.all(
        Array.from({ length: 4 }, (_, k) =>
          ensurePoolImage((poolCursor + k) % UNSPLASH_IDS.length),
        ),
      );
      poolCursor += 4;

      await prisma.listing.create({
        data: {
          slug,
          title,
          summary: `Stylish ${t.label.toLowerCase()} in ${area}, ${c.city} — walkable, well-connected and fully equipped.`,
          description: `Settle into this ${bedrooms}-bedroom ${t.label.toLowerCase()} in ${area}, one of ${c.city}'s most loved neighbourhoods. Fast Wi-Fi, a fully equipped kitchen and a dedicated workspace make it ideal for both holidays and longer stays. Cafés, transport and local highlights are all within a short walk.`,
          type: t.type,
          categoryId: categoryBySlug.get(t.categorySlug) ?? null,
          hostId: hostIds[(i + CITIES.indexOf(c)) % hostIds.length]!,
          addressLine: `${area}, ${c.city}`,
          city: c.city,
          country: c.country,
          latitude: c.lat + (rand() - 0.5) * 0.09,
          longitude: c.lng + (rand() - 0.5) * 0.09,
          bedrooms,
          beds: bedrooms + Math.floor(rand() * 2),
          bathrooms: 1 + Math.floor(rand() * 2),
          maxGuests: bedrooms * 2,
          area: 40 + Math.floor(rand() * 140),
          placeType: t.type === "room" ? "room" : "entire_place",
          basePrice,
          cleaningFee: Math.round(basePrice * 0.12),
          serviceFee: Math.round(basePrice * 0.08),
          currency: c.currency,
          minNights: 1,
          instantBook: rand() > 0.3,
          status: "published",
          isFeatured: rand() > 0.65,
          avgRating: rating,
          reviewCount,
          bookingCount: Math.floor(reviewCount * (1.2 + rand())),
          familyFriendly: rand() > 0.4,
          publishedAt: new Date(),
          images: {
            create: photos.map((p, k) => ({
              url: p.url,
              providerRef: p.fileId,
              alt: `${title} — photo ${k + 1}`,
              order: k,
              isCover: k === 0,
            })),
          },
        },
      });
      created++;
      console.log(`  ✓ ${title} ($${basePrice}/night)`);
    }
  }

  console.log(`\n✓ Done. Created ${created}, skipped ${skipped} existing.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
