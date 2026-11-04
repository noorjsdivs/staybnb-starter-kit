/**
 * Idempotent rentals mock-data seeder.
 *
 * Run with:
 *   cd apps/api && pnpm exec tsx scripts/import-mock.ts
 *
 * The script is safe to run repeatedly: every record is upserted by a stable
 * key (email / slug / bookingCode / etc.) so re-running just refreshes data
 * without creating duplicates.
 */

import "dotenv/config";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import {
  PrismaClient,
  type AmenityGroup,
  type ListingType,
  type BookingStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Always load apps/api/.env regardless of cwd
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, "..", ".env"), override: false });

// =============================================================================
// Prisma client (mirrors utils/prisma.ts)
// =============================================================================
const connectionString =
  process.env["DIRECT_DATABASE_URL"] ?? process.env["DATABASE_URL"] ?? "";

if (!connectionString) {
  console.error("DATABASE_URL or DIRECT_DATABASE_URL is required");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
} as never);

import {
  CITY_COVERS,
  FALLBACK_COVER,
  coverFor,
  galleryFor,
  resolveImage,
} from "./seed-images.js";
import {
  CITY_LISTING_CONTENT,
  composeDescription,
} from "./listing-content.js";
import { categoryForListing } from "./listing-categories.js";

// =============================================================================
// Helpers
// =============================================================================
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Deterministic pseudo-random so reruns produce the same dataset
const rngFactory = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};
const random = rngFactory(20260430);
const pick = <T>(arr: T[]): T => arr[Math.floor(random() * arr.length)]!;
const pickN = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    out.push(copy.splice(Math.floor(random() * copy.length), 1)[0]!);
  }
  return out;
};
const intBetween = (min: number, max: number) =>
  Math.floor(random() * (max - min + 1)) + min;
const dayOffset = (days: number) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

// =============================================================================
// Reference data
// =============================================================================
// `iconUrl` stores the Lucide icon component name. The web client maps these
// names back to React components via `apps/web/src/lib/category-icons.ts`.
const PROPERTY_CATEGORIES = [
  { slug: "bed", name: "Bed", iconUrl: "Bed" },
  { slug: "room", name: "Room", iconUrl: "DoorClosed" },
  { slug: "suite", name: "Suite", iconUrl: "Building" },
  { slug: "flat", name: "Flat", iconUrl: "Building2" },
  { slug: "house", name: "House", iconUrl: "Home" },
  { slug: "villa", name: "Villa", iconUrl: "Castle" },
  { slug: "chalet", name: "Chalet", iconUrl: "Warehouse" },
  { slug: "farm", name: "Farm", iconUrl: "Tractor" },
  { slug: "camp", name: "Camp", iconUrl: "Tent" },
  { slug: "trending", name: "Trending", iconUrl: "Flame" },
  { slug: "beachfront", name: "Beachfront", iconUrl: "Umbrella" },
  { slug: "lakefront", name: "Lakefront", iconUrl: "Waves" },
  { slug: "skiing", name: "Skiing", iconUrl: "MountainSnow" },
  { slug: "cabin", name: "Cabin", iconUrl: "TreePine" },
  { slug: "boats", name: "Boats", iconUrl: "Ship" },
  { slug: "camper", name: "Camper", iconUrl: "Caravan" },
  { slug: "arctic", name: "Arctic", iconUrl: "Snowflake" },
  { slug: "tropical", name: "Tropical", iconUrl: "Palmtree" },
  { slug: "views", name: "Views", iconUrl: "Camera" },
  { slug: "city", name: "City", iconUrl: "MapPin" },
  { slug: "sailing", name: "Sailing", iconUrl: "Sailboat" },
  { slug: "train", name: "Train", iconUrl: "TrainFront" },
  { slug: "nature", name: "Nature", iconUrl: "Sprout" },
  { slug: "vineyard", name: "Vineyard", iconUrl: "Grape" },
  { slug: "windmill", name: "Windmill", iconUrl: "Wind" },
  { slug: "safari", name: "Safari", iconUrl: "Compass" },
  { slug: "desert", name: "Desert", iconUrl: "Sunset" },
  { slug: "garden", name: "Garden", iconUrl: "Flower2" },
  { slug: "countryside", name: "Countryside", iconUrl: "Wheat" },
  { slug: "historical", name: "Historical", iconUrl: "Landmark" },
  { slug: "chefs-kitchen", name: "Chef's Kitchen", iconUrl: "ChefHat" },
  { slug: "lodge", name: "Lodge", iconUrl: "Trees" },
  { slug: "mansion", name: "Mansion", iconUrl: "KeySquare" },
  { slug: "treehouse", name: "Treehouse", iconUrl: "Tent" },
  { slug: "ryokan", name: "Ryokan", iconUrl: "Bed" },
  { slug: "yurt", name: "Yurt", iconUrl: "Home" },
] as const;

const AMENITIES: Array<{
  slug: string;
  label: string;
  group: AmenityGroup;
  isPopular?: boolean;
}> = [
  { slug: "wifi", label: "Wi-Fi", group: "internet_office", isPopular: true },
  {
    slug: "kitchen",
    label: "Kitchen",
    group: "kitchen_dining",
    isPopular: true,
  },
  {
    slug: "free-parking",
    label: "Free parking on premises",
    group: "parking_facilities",
    isPopular: true,
  },
  { slug: "pool", label: "Pool", group: "outdoor", isPopular: true },
  { slug: "hot-tub", label: "Hot tub", group: "outdoor", isPopular: true },
  { slug: "ev-charger", label: "EV charger", group: "parking_facilities" },
  { slug: "crib", label: "Crib", group: "family" },
  { slug: "king-bed", label: "King bed", group: "bedroom_laundry" },
  { slug: "gym", label: "Gym", group: "services" },
  { slug: "bbq-grill", label: "BBQ grill", group: "outdoor" },
  { slug: "breakfast", label: "Breakfast", group: "services" },
  {
    slug: "indoor-fireplace",
    label: "Indoor fireplace",
    group: "entertainment",
  },
  { slug: "smoking-allowed", label: "Smoking allowed", group: "not_included" },
  {
    slug: "beachfront",
    label: "Beachfront",
    group: "outdoor",
    isPopular: true,
  },
  { slug: "waterfront", label: "Waterfront", group: "outdoor" },
  { slug: "ski-in-out", label: "Ski-in/out", group: "outdoor" },
  { slug: "smoke-alarm", label: "Smoke alarm", group: "home_safety" },
  {
    slug: "carbon-monoxide-alarm",
    label: "Carbon monoxide alarm",
    group: "home_safety",
  },
  { slug: "first-aid-kit", label: "First aid kit", group: "home_safety" },
  {
    slug: "fire-extinguisher",
    label: "Fire extinguisher",
    group: "home_safety",
  },
  { slug: "essentials", label: "Essentials", group: "essentials" },
  { slug: "hangers", label: "Hangers", group: "bedroom_laundry" },
  { slug: "iron", label: "Iron", group: "essentials" },
  { slug: "hair-dryer", label: "Hair dryer", group: "bathroom" },
  { slug: "shampoo", label: "Shampoo", group: "bathroom" },
  { slug: "tv", label: "TV", group: "entertainment", isPopular: true },
  {
    slug: "ac",
    label: "Air conditioning",
    group: "heating_cooling",
    isPopular: true,
  },
  { slug: "heating", label: "Heating", group: "heating_cooling" },
  { slug: "washer", label: "Washer", group: "bedroom_laundry" },
  { slug: "dryer", label: "Dryer", group: "bedroom_laundry" },
  { slug: "workspace", label: "Dedicated workspace", group: "internet_office" },
  { slug: "self-checkin", label: "Self check-in", group: "services" },
  { slug: "patio", label: "Patio or balcony", group: "outdoor" },
  { slug: "garden", label: "Garden", group: "outdoor" },
];

const CITIES = [
  {
    city: "Lisbon",
    country: "Portugal",
    lat: 38.7223,
    lng: -9.1393,
    currency: "EUR",
  },
  {
    city: "Barcelona",
    country: "Spain",
    lat: 41.3851,
    lng: 2.1734,
    currency: "EUR",
  },
  {
    city: "Paris",
    country: "France",
    lat: 48.8566,
    lng: 2.3522,
    currency: "EUR",
  },
  {
    city: "Rome",
    country: "Italy",
    lat: 41.9028,
    lng: 12.4964,
    currency: "EUR",
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    lat: 52.3676,
    lng: 4.9041,
    currency: "EUR",
  },
  {
    city: "Reykjavík",
    country: "Iceland",
    lat: 64.1466,
    lng: -21.9426,
    currency: "USD",
  },
  {
    city: "Marrakesh",
    country: "Morocco",
    lat: 31.6295,
    lng: -7.9811,
    currency: "USD",
  },
  {
    city: "Tokyo",
    country: "Japan",
    lat: 35.6762,
    lng: 139.6503,
    currency: "USD",
  },
  {
    city: "Bali",
    country: "Indonesia",
    lat: -8.4095,
    lng: 115.1889,
    currency: "USD",
  },
  {
    city: "Cape Town",
    country: "South Africa",
    lat: -33.9249,
    lng: 18.4241,
    currency: "USD",
  },
  {
    city: "New York",
    country: "United States",
    lat: 40.7128,
    lng: -74.006,
    currency: "USD",
  },
  {
    city: "Aspen",
    country: "United States",
    lat: 39.1911,
    lng: -106.8175,
    currency: "USD",
  },
  {
    city: "Tulum",
    country: "Mexico",
    lat: 20.2114,
    lng: -87.4654,
    currency: "USD",
  },
  {
    city: "Dubai",
    country: "United Arab Emirates",
    lat: 25.2048,
    lng: 55.2708,
    currency: "USD",
  },
  {
    city: "Sydney",
    country: "Australia",
    lat: -33.8688,
    lng: 151.2093,
    currency: "USD",
  },
];

const LISTING_TYPES: ListingType[] = [
  "house",
  "apartment",
  "villa",
  "loft",
  "cottage",
  "cabin",
  "guesthouse",
  "room",
];

// 1500 x 1000 stock images from Unsplash collections (royalty free)
const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&q=80",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&q=80",
  "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80",
  "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=1200&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80",
  "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=1200&q=80",
  "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=1200&q=80",
  "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=1200&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
];

const AVATAR_IMAGES = [
  "https://i.pravatar.cc/200?img=1",
  "https://i.pravatar.cc/200?img=2",
  "https://i.pravatar.cc/200?img=5",
  "https://i.pravatar.cc/200?img=12",
  "https://i.pravatar.cc/200?img=15",
  "https://i.pravatar.cc/200?img=20",
  "https://i.pravatar.cc/200?img=25",
  "https://i.pravatar.cc/200?img=32",
  "https://i.pravatar.cc/200?img=39",
  "https://i.pravatar.cc/200?img=44",
  "https://i.pravatar.cc/200?img=47",
  "https://i.pravatar.cc/200?img=49",
  "https://i.pravatar.cc/200?img=52",
  "https://i.pravatar.cc/200?img=58",
  "https://i.pravatar.cc/200?img=60",
  "https://i.pravatar.cc/200?img=64",
  "https://i.pravatar.cc/200?img=68",
];

const FIRST_NAMES = [
  "Aisha",
  "Liam",
  "Nora",
  "Ethan",
  "Yuki",
  "Mateo",
  "Zara",
  "Khalid",
  "Sofia",
  "Arjun",
  "Lena",
  "Diego",
  "Maya",
  "Omar",
  "Anya",
  "Tariq",
  "Isabella",
  "Noah",
  "Amira",
  "Lucas",
  "Priya",
  "Hugo",
  "Layla",
  "Idris",
  "Camila",
  "Finn",
  "Yasmin",
  "Jonas",
  "Selin",
  "Mira",
];
const LAST_NAMES = [
  "Khan",
  "Silva",
  "Andersen",
  "Cohen",
  "Rossi",
  "Patel",
  "Nakamura",
  "Diallo",
  "Hassan",
  "Lopez",
  "Müller",
  "Tanaka",
  "Okafor",
  "Reyes",
  "Schmidt",
  "Sato",
  "Brown",
  "Garcia",
  "Yilmaz",
  "Petrov",
  "Singh",
  "Kim",
  "Dubois",
  "Saleh",
  "Costa",
  "Walker",
  "Park",
  "Ahmadi",
  "Eriksen",
  "Romano",
];

const REVIEW_BODIES = [
  "Beautiful place, exactly as advertised. The host was super responsive!",
  "Loved the views and the calm neighbourhood. Would book again.",
  "Spotless and well-equipped — felt like a home away from home.",
  "Hosting was top-notch. Check-in instructions were crystal clear.",
  "Great location, walking distance to everything. Comfy beds.",
  "Charming spot with little touches that made the stay special.",
  "Excellent value for money. Will definitely recommend to friends.",
  "Bright, airy and beautifully designed. The kitchen had everything.",
  "Quiet and peaceful with a stunning sunset from the balcony.",
  "Hosts went above and beyond to make us feel welcome.",
];

// =============================================================================
// Seed
// =============================================================================
async function seedCategories() {
  console.log("→ Categories");
  for (let i = 0; i < PROPERTY_CATEGORIES.length; i++) {
    const c = PROPERTY_CATEGORIES[i]!;
    await prisma.propertyCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, iconUrl: c.iconUrl, order: i, isActive: true },
      create: {
        slug: c.slug,
        name: c.name,
        iconUrl: c.iconUrl,
        order: i,
        isActive: true,
      },
    });
  }
}

async function seedAmenities() {
  console.log("→ Amenities");
  for (let i = 0; i < AMENITIES.length; i++) {
    const a = AMENITIES[i]!;
    await prisma.amenity.upsert({
      where: { slug: a.slug },
      update: {
        label: a.label,
        group: a.group,
        isPopular: a.isPopular ?? false,
        order: i,
      },
      create: {
        slug: a.slug,
        label: a.label,
        group: a.group,
        isPopular: a.isPopular ?? false,
        order: i,
      },
    });
  }
}

// Demo accounts are seeded with a confirmed email, so they can book and list
// straight away (real sign-ups confirm through the emailed link).
const VERIFIED = { emailVerified: true, emailVerifiedAt: new Date() };

async function seedAdmin() {
  console.log("→ Admin user");
  const passwordHash = await bcrypt.hash("Admin1234!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@staybnb.com" },
    update: { role: "admin", ...VERIFIED },
    create: {
      name: "Staybnb Admin",
      email: "admin@staybnb.com",
      password: passwordHash,
      role: "admin",
      isHostVerified: true,
      ...VERIFIED,
      avatar: "https://i.pravatar.cc/200?img=68",
    },
  });

  // Welcome notice so the admin inbox isn't empty after a fresh seed.
  const existing = await prisma.notification.findFirst({
    where: {
      recipientId: admin.id,
      type: "system_welcome",
    },
  });
  if (!existing) {
    await prisma.notification.create({
      data: {
        recipientId: admin.id,
        title: "Welcome to Staybnb Admin",
        body: "Your demo dashboard is ready. Review listings, bookings, and hosting applications from the sidebar.",
        type: "system_welcome",
        priority: "normal",
      },
    });
  }
  return admin;
}

async function seedUsers() {
  console.log("→ Hosts (10) + Guests (30)");
  const passwordHash = await bcrypt.hash("Password1!", 10);

  const hosts = [] as Awaited<ReturnType<typeof prisma.user.upsert>>[];
  const guests = [] as Awaited<ReturnType<typeof prisma.user.upsert>>[];

  for (let i = 0; i < 10; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length]!;
    const last = LAST_NAMES[(i * 3) % LAST_NAMES.length]!;
    const email = `host${i + 1}@staybnb.test`;
    const u = await prisma.user.upsert({
      where: { email },
      update: { role: i < 3 ? "superhost" : "host", isHostVerified: true, ...VERIFIED },
      create: {
        name: `${first} ${last}`,
        email,
        password: passwordHash,
        role: i < 3 ? "superhost" : "host",
        isHostVerified: true,
        ...VERIFIED,
        avatar: AVATAR_IMAGES[i % AVATAR_IMAGES.length],
        about: `Welcome! I'm ${first}, a passionate host who loves meeting travellers from around the world.`,
        location: pick(CITIES).city,
        languages: [
          "English",
          pick(["French", "Spanish", "Arabic", "Japanese", "Italian"]),
        ],
      },
    });
    hosts.push(u);
  }

  for (let i = 0; i < 30; i++) {
    const first = FIRST_NAMES[(i * 7) % FIRST_NAMES.length]!;
    const last = LAST_NAMES[(i * 5) % LAST_NAMES.length]!;
    const email = `guest${i + 1}@staybnb.test`;
    const u = await prisma.user.upsert({
      where: { email },
      update: { role: "user", ...VERIFIED },
      create: {
        name: `${first} ${last}`,
        email,
        password: passwordHash,
        role: "user",
        ...VERIFIED,
        avatar: AVATAR_IMAGES[(i + 4) % AVATAR_IMAGES.length],
        location: pick(CITIES).city,
      },
    });
    guests.push(u);
  }

  // Default wallet for everyone
  for (const u of [...hosts, ...guests]) {
    await prisma.wallet.upsert({
      where: { userId: u.id },
      update: {},
      create: { userId: u.id, balance: 0, currency: "USD" },
    });
  }

  return { hosts, guests };
}

// Listings created per city. Each home-page rail shows ~7 across, so >7 per
// city fills the row and leaves more to scroll (Airbnb-style).
const PER_CITY = 12;

async function seedListings(hosts: { id: string }[]) {
  console.log(`→ Listings (${CITIES.length * PER_CITY})`);
  const categories = await prisma.propertyCategory.findMany();
  const amenities = await prisma.amenity.findMany();
  const popular = amenities.filter((a) => a.isPopular);
  const others = amenities.filter((a) => !a.isPopular);

  const listings = [] as Awaited<ReturnType<typeof prisma.listing.upsert>>[];

  let i = -1;
  for (let cityIndex = 0; cityIndex < CITIES.length; cityIndex++) {
    const place = CITIES[cityIndex]!;
    for (let n = 0; n < PER_CITY; n++) {
      i++;
      const type = LISTING_TYPES[i % LISTING_TYPES.length]!;
      const host = hosts[i % hosts.length]!;
    const bedrooms = intBetween(1, 5);
    // Never more bathrooms than bedrooms — keeps the specs believable.
    const bathrooms = Math.min(intBetween(1, 4), bedrooms);
    const beds = bedrooms + intBetween(0, 2);
    const maxGuests = bedrooms * 2;
    const basePrice = intBetween(40, 480);
    const cleaningFee = intBetween(15, 80);
    const serviceFee = Math.round(basePrice * 0.12);
    const taxRate = 8;

    // Curated, unique title + blurb per city/slot (see listing-content.ts).
    const content = CITY_LISTING_CONTENT[place.city]?.[n];
    const title = content?.title ?? `${type} in ${place.city} No. ${n + 1}`;
    const slug = slugify(`${title}-${i + 1}`);
    const description = composeDescription(content, {
      city: place.city,
      type,
      maxGuests,
      bedrooms,
      beds,
      bathrooms,
    });

    // Category derived from the listing's actual character, not round-robin.
    const categorySlug = categoryForListing({ title, type, city: place.city });
    const category =
      categories.find((c) => c.slug === categorySlug) ?? categories[0]!;

    // Per-listing cover (varied, like Airbnb) plus a gallery that includes the
    // city landmark for local flavour. Each resolved to a hosted ImageKit URL
    // (cached so duplicates upload only once).
    const coverSource = coverFor(cityIndex, n);
    const cityLandmark = CITY_COVERS[place.city] ?? FALLBACK_COVER;
    const gallerySources = [cityLandmark, ...galleryFor(cityIndex, n, 4)].filter(
      (url: string) => url !== coverSource,
    );

    const listing = await prisma.listing.upsert({
      where: { slug },
      update: {
        status: "published",
        publishedAt: new Date(),
      },
      create: {
        slug,
        title,
        summary: `${bedrooms}-bed ${type} • ${place.city}, ${place.country}`,
        description,
        type,
        categoryId: category.id,
        hostId: host.id,
        addressLine: `${intBetween(1, 250)} ${pick(["Marina", "Hill", "Garden", "Old Town", "Riverside"])} St`,
        city: place.city,
        country: place.country,
        latitude: place.lat + (random() - 0.5) * 0.05,
        longitude: place.lng + (random() - 0.5) * 0.05,
        bedrooms,
        beds,
        bathrooms,
        maxGuests,
        basePrice,
        cleaningFee,
        serviceFee,
        taxRate,
        currency: place.currency,
        instantBook: random() > 0.3,
        status: "published",
        isFeatured: n === 0,
        publishedAt: new Date(),
        avgRating: 0,
        reviewCount: 0,
      },
    });

    // Resolve every source image to a hosted ImageKit URL (+ fileId) and
    // replace the listing's images deterministically.
    const coverImg = await resolveImage(coverSource, `${slug}-cover`);
    const galleryImgs = await Promise.all(
      gallerySources.map((url: string, idx: number) =>
        resolveImage(url, `${slug}-${idx + 2}`),
      ),
    );

    await prisma.listingImage.deleteMany({ where: { listingId: listing.id } });
    await prisma.listingImage.createMany({
      data: [
        {
          listingId: listing.id,
          url: coverImg.url,
          providerRef: coverImg.providerRef || null,
          alt: title,
          order: 0,
          isCover: true,
        },
        ...galleryImgs.map((img, idx) => ({
          listingId: listing.id,
          url: img.url,
          providerRef: img.providerRef || null,
          alt: `${title} photo ${idx + 2}`,
          order: idx + 1,
          isCover: false,
        })),
      ],
    });

    // Replace amenities
    await prisma.listingAmenity.deleteMany({
      where: { listingId: listing.id },
    });
    const chosen = [
      ...pickN(popular, Math.min(popular.length, intBetween(4, 6))),
      ...pickN(others, intBetween(4, 8)),
    ];
    await prisma.listingAmenity.createMany({
      data: chosen.map((a) => ({ listingId: listing.id, amenityId: a.id })),
      skipDuplicates: true,
    });

      listings.push(listing);
    }
  }

  return listings;
}

async function seedBookingsAndReviews(
  guests: { id: string; name: string }[],
  listings: {
    id: string;
    basePrice: { toString(): string } | number;
    cleaningFee: { toString(): string } | number;
    serviceFee: { toString(): string } | number;
    taxRate: { toString(): string } | number;
    currency: string;
    hostId: string;
  }[],
) {
  console.log("→ Bookings (100) + Reviews (~70% of completed)");
  const STATUSES: BookingStatus[] = [
    "completed",
    "completed",
    "completed",
    "completed",
    "confirmed",
    "confirmed",
    "pending_payment",
    "pending_request",
    "cancelled_by_guest",
    "checked_in",
  ];

  for (let i = 0; i < 100; i++) {
    const bookingCode = `STB-MOCK-${String(i + 1).padStart(4, "0")}`;
    const guest = guests[i % guests.length]!;
    const listing = listings[i % listings.length]!;
    const status = STATUSES[i % STATUSES.length]!;

    const offsetStart =
      status === "completed" || status === "cancelled_by_guest"
        ? -intBetween(20, 180)
        : status === "confirmed" || status === "pending_payment"
          ? intBetween(7, 90)
          : status === "checked_in"
            ? -intBetween(0, 3)
            : intBetween(15, 120);
    const nights = intBetween(2, 7);

    const checkIn = dayOffset(offsetStart);
    const checkOut = dayOffset(offsetStart + nights);

    const basePrice = Number(listing.basePrice);
    const cleaningFee = Number(listing.cleaningFee);
    const serviceFee = Number(listing.serviceFee);
    const taxRate = Number(listing.taxRate);
    const basePriceTotal = basePrice * nights;
    const taxes = ((basePriceTotal + cleaningFee + serviceFee) * taxRate) / 100;
    const totalAmount = basePriceTotal + cleaningFee + serviceFee + taxes;

    const booking = await prisma.booking.upsert({
      where: { bookingCode },
      update: { status },
      create: {
        bookingCode,
        guestId: guest.id,
        listingId: listing.id,
        checkIn,
        checkOut,
        nights,
        adults: intBetween(1, 4),
        children: intBetween(0, 2),
        basePriceTotal,
        cleaningFee,
        serviceFee,
        taxes,
        totalAmount,
        currency: listing.currency,
        status,
      },
    });

    if (
      status === "confirmed" ||
      status === "completed" ||
      status === "checked_in"
    ) {
      await prisma.payment.deleteMany({ where: { bookingId: booking.id } });
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          userId: guest.id,
          amount: totalAmount,
          currency: listing.currency,
          method: "card",
          provider: "dummy",
          providerRef: `pi_mock_${booking.id.slice(0, 8)}`,
          status: "succeeded",
          capturedAt: new Date(checkIn.getTime() - 24 * 3600 * 1000),
        },
      });
    }

    if (status === "completed" && random() < 0.7) {
      const overall = intBetween(4, 5);
      await prisma.review.upsert({
        where: { bookingId: booking.id },
        update: {},
        create: {
          bookingId: booking.id,
          listingId: listing.id,
          authorId: guest.id,
          subjectId: listing.hostId,
          ratingOverall: overall,
          ratingCleanliness: intBetween(4, 5),
          ratingAccuracy: intBetween(4, 5),
          ratingCheckIn: intBetween(4, 5),
          ratingCommunication: intBetween(4, 5),
          ratingLocation: intBetween(4, 5),
          ratingValue: intBetween(3, 5),
          title: pick([
            "Great stay",
            "Loved it",
            "Would book again",
            "Highly recommend",
            "Perfect getaway",
          ]),
          body: pick(REVIEW_BODIES),
          isPublished: true,
        },
      });
    }
  }

  // Recompute aggregates per listing
  console.log("→ Recompute review aggregates");
  for (const l of listings) {
    const agg = await prisma.review.aggregate({
      where: { listingId: l.id, isPublished: true },
      _avg: { ratingOverall: true },
      _count: { _all: true },
    });
    await prisma.listing.update({
      where: { id: l.id },
      data: {
        avgRating: agg._avg.ratingOverall ?? 0,
        reviewCount: agg._count._all,
      },
    });
  }
}

async function seedWishlists(
  guests: { id: string }[],
  listings: { id: string }[],
) {
  console.log("→ Wishlists");
  for (const g of guests.slice(0, 20)) {
    const existing = await prisma.wishlist.findFirst({
      where: { userId: g.id },
    });
    const wl =
      existing ??
      (await prisma.wishlist.create({
        data: { userId: g.id, name: "My favourites", isDefault: true },
      }));
    const picks = pickN(listings, intBetween(2, 6));
    for (const l of picks) {
      await prisma.wishlistItem.upsert({
        where: { wishlistId_listingId: { wishlistId: wl.id, listingId: l.id } },
        update: {},
        create: { userId: g.id, wishlistId: wl.id, listingId: l.id },
      });
    }
  }
}

async function seedBanners() {
  console.log("→ Banners");
  const banners = [
    {
      page: "home",
      kind: "main",
      title: "Stays that feel like home",
      subtitle: "Discover hand-picked rentals across 50+ destinations",
      imageUrl: COVER_IMAGES[0]!,
      ctaLabel: "Start exploring",
      ctaUrl: "/search",
      position: 0,
    },
    {
      page: "home",
      kind: "main",
      title: "Become a host",
      subtitle: "Earn extra income with your spare space",
      imageUrl: COVER_IMAGES[3]!,
      ctaLabel: "Get started",
      ctaUrl: "/host/become",
      position: 1,
    },
    {
      page: "search",
      kind: "main",
      title: "Last-minute deals up to 30% off",
      subtitle: "Book within 7 days for exclusive prices",
      imageUrl: COVER_IMAGES[7]!,
      ctaLabel: "View deals",
      ctaUrl: "/search?deals=last-minute",
      position: 0,
    },
  ];

  for (const b of banners) {
    // Host the banner artwork on ImageKit too.
    b.imageUrl = (
      await resolveImage(b.imageUrl, `banner-${b.page}-${b.position}`)
    ).url;
    const existing = await prisma.banner.findFirst({
      where: { page: b.page, title: b.title },
    });
    if (existing) {
      await prisma.banner.update({ where: { id: existing.id }, data: b });
    } else {
      await prisma.banner.create({ data: b });
    }
  }
}

async function main() {
  console.log("Seeding rentals mock data…");
  await seedCategories();
  await seedAmenities();
  await seedAdmin();
  const { hosts, guests } = await seedUsers();
  const listings = await seedListings(hosts);
  await seedBookingsAndReviews(
    guests.map((g) => ({ id: g.id, name: g.name })),
    listings.map((l) => ({
      id: l.id,
      basePrice: l.basePrice,
      cleaningFee: l.cleaningFee,
      serviceFee: l.serviceFee,
      taxRate: l.taxRate,
      currency: l.currency,
      hostId: l.hostId,
    })),
  );
  await seedWishlists(guests, listings);
  await seedBanners();
  console.log("✅ Done.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
