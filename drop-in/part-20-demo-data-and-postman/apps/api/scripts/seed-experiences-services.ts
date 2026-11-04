// Idempotent seeder for the Experiences & Services tabs.
//
// Run with:  pnpm --filter api exec tsx scripts/seed-experiences-services.ts
//
// Goals:
//   • ≥7 items in every Experiences city rail
//   • ≥7 items in every Services category rail (makeup, chefs, …)
//   • Category-matched, presentation-ready cover photos (Unsplash → ImageKit)
//   • Clear, guest-facing titles & descriptions
//
// Existing rows (matched by slug) are refreshed with better images/copy so
// re-runs improve the catalogue without duplicates.
import sharp from "sharp";
import prisma from "../utils/prisma.js";
import { imageKitUpload } from "../config/imagekit.js";

// =============================================================================
// Curated free-license photo pools (Unsplash)
// Keys are category (or experience category). Values are Unsplash photo path ids.
// =============================================================================

/** Experience category → visually matching photos */
const EXP_IMAGE_POOL: Record<string, string[]> = {
  food_drink: [
    "photo-1504674900247-0877df9cc836", // plated meal
    "photo-1414235077428-338989a2e8c0", // restaurant table
    "photo-1556910103-1c02745aae4d", // cooking class
    "photo-1555939594-58d7cb561ad1", // street food grill
    "photo-1517248135467-4c7edcad34c4", // café interior
    "photo-1504754524776-8f4f37790ca0", // breakfast spread
    "photo-1476224203421-9ac39bcb3327", // food market produce
  ],
  culture: [
    "photo-1533105079780-92b9be482077", // city skyline tour
    "photo-1469474968028-56623f02e42e", // landmark landscape
    "photo-1452626212852-811d58933cae", // camera / photo walk
    "photo-1523906834658-6e24ef2386f9", // historic street
    "photo-1552832230-c0197dd311b5", // architecture
    "photo-1513635269975-59663e0ac1ad", // old town square
    "photo-1502602898657-3e91760cbb34", // European city
  ],
  outdoors: [
    "photo-1551632811-561732d1e306", // hiking trail
    "photo-1464822759023-fed622ff2c3b", // mountain peak
    "photo-1506905925346-21bda4d32df4", // alpine ridge
    "photo-1470071459604-3b5ec3a7fe05", // foggy hills
    "photo-1441974231531-c6227db76b6e", // forest path
    "photo-1501785888041-af3ef285b470", // lake mountains
    "photo-1476514525535-07fb3b4ae5f1", // scenic boat lake
  ],
  water: [
    "photo-1502680390469-be75c86b636f", // surfing
    "photo-1530549387789-4c1017266635", // open water swim
    "photo-1507525428034-b723cf961d3e", // beach
    "photo-1528543606781-2f6e6857f318", // kayaking
    "photo-1544551763-46a013bb70d5", // paddle / ocean
    "photo-1437622368342-7a3d73a34c8f", // sea life / water
    "photo-1505118380757-91f5f5632de0", // yacht / marina
  ],
  wellness: [
    "photo-1571019613454-1cb2f99b2d8b", // yoga / fitness
    "photo-1545205597-3d9d02c29597", // meditation
    "photo-1544367567-0f2fcb009e0b", // yoga pose
    "photo-1506126613408-eca07ce68773", // yoga outdoors
    "photo-1518611012118-696072aa579a", // stretch / wellness
    "photo-1599901860904-17e6ed7083a0", // spa stones
    "photo-1540555700478-4be289fbecef", // spa setting
  ],
  nightlife: [
    "photo-1514525253161-7a46d19cd819", // concert lights
    "photo-1470229722913-7c0e2dbbafd3", // stage show
    "photo-1492684223066-81342ee5ff30", // event crowd
    "photo-1516450360452-9312f5e86fc7", // night party
    "photo-1566417713940-fe7c737a9ef2", // cocktails bar
    "photo-1572116469696-31de0f17cc34", // night city lights
    "photo-1429962714451-bb934ecdc4ec", // live music
  ],
};

/** Service category → professional, presentation-ready photos */
const SVC_IMAGE_POOL: Record<string, string[]> = {
  photography: [
    "photo-1542038784456-1ea8e935640e", // photographer at work
    "photo-1452587925148-ce544e77e70d", // camera lens
    "photo-1492691527719-9d1e07e534b4", // wedding / couple shoot
    "photo-1516035069371-29a1b244cc32", // camera gear
    "photo-1471341971476-ae15ff5dd4ea", // studio lights
    "photo-1554048612-065ec212057a", // lifestyle photography
    "photo-1606216794074-735e91aa2c92", // portrait session
  ],
  chefs: [
    "photo-1556911220-bff31c812dba", // private kitchen cooking
    "photo-1577219491135-ce391730fb2c", // chef plating
    "photo-1556912998-c57cc6b63cd7", // kitchen prep
    "photo-1414235077428-338989a2e8c0", // fine dining table
    "photo-1600565193348-f74bd3c7ccdf", // chef hands plating
    "photo-1504674900247-0877df9cc836", // gourmet dish
    "photo-1467003909585-2f8a72700288", // elegant plated course
  ],
  massage: [
    "photo-1544161515-4ab6ce6db874", // massage spa
    "photo-1519823551278-64ac92734fb1", // spa treatment
    "photo-1540555700478-4be289fbecef", // spa room
    "photo-1599901860904-17e6ed7083a0", // hot stones
    "photo-1600334129128-685c5582fd35", // massage therapy
    "photo-1515377905703-c4788e51af15", // wellness massage
    "photo-1570172619644-dfd03ed5d881", // spa facial / calm
  ],
  training: [
    "photo-1571902943202-507ec2618e8f", // gym training
    "photo-1518611012118-696072aa579a", // workout stretch
    "photo-1534438327276-14e5300c3a48", // gym weights
    "photo-1571019614242-c5c5dee9f50b", // personal trainer
    "photo-1517836357463-d25dfeac3438", // strength training
    "photo-1434682881908-b43d0467b798", // outdoor run coach
    "photo-1540497077202-7c8a3999166f", // fitness class
  ],
  makeup: [
    "photo-1487412947147-5cebf100ffc2", // makeup brushes detail
    "photo-1522335789203-aabd1fc54bc9", // makeup palette
    "photo-1596462502278-27bfdc403348", // cosmetics flatlay
    "photo-1512496015851-a90fb38ba796", // beauty makeup
    "photo-1526045478516-99145907023c", // makeup artist work
    "photo-1560066984-138dadb4c035", // beauty salon
    "photo-1570172619644-dfd03ed5d881", // skincare / glam prep
  ],
  hair: [
    "photo-1560066984-138dadb4c035", // salon styling
    "photo-1522337360788-8b13dee7a37e", // hair styling tools
    "photo-1562322140-8baeececf3df", // hair cut / salon
    "photo-1521590832167-7bcbfaa6381f", // hairdresser at work
    "photo-1634449571010-02389ed0fdb5", // hair color / blowout
    "photo-1492106087820-71f1a00d2b11", // styled hair portrait
    "photo-1519699047748-de8e457a634e", // curly hair beauty
  ],
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
const fallbackUrl = (key: string) =>
  `https://picsum.photos/seed/staybnb-${encodeURIComponent(key)}/1200/900`;

// =============================================================================
// Cities (same set as home / experiences rails)
// =============================================================================

const CITIES = [
  { city: "Dubai", country: "United Arab Emirates" },
  { city: "Abu Dhabi", country: "United Arab Emirates" },
  { city: "Doha", country: "Qatar" },
  { city: "Riyadh", country: "Saudi Arabia" },
  { city: "Istanbul", country: "Turkey" },
  { city: "London", country: "United Kingdom" },
  { city: "Paris", country: "France" },
  { city: "Kuala Lumpur", country: "Malaysia" },
] as const;

// =============================================================================
// Experiences — ≥7 templates so every city rail is full
// =============================================================================

type ExpTpl = {
  name: string;
  category: keyof typeof EXP_IMAGE_POOL;
  hours: number;
  price: [number, number];
  /** Short guest-facing pitch used in description */
  pitch: string;
  includes: string[];
};

const EXPERIENCE_TEMPLATES: ExpTpl[] = [
  {
    name: "Old town food walk",
    category: "food_drink",
    hours: 3,
    price: [45, 95],
    pitch:
      "Taste signature street dishes with a local host who knows every stall, spice shop and hidden café.",
    includes: ["Local host guide", "All tastings included", "Walking route map"],
  },
  {
    name: "Sunrise photography tour",
    category: "culture",
    hours: 2.5,
    price: [35, 80],
    pitch:
      "Chase golden-hour light at the city’s best viewpoints. Phone or camera welcome — pro tips included.",
    includes: ["Photo spots map", "Composition tips", "Small group"],
  },
  {
    name: "Traditional cooking class",
    category: "food_drink",
    hours: 3.5,
    price: [55, 120],
    pitch:
      "Shop for ingredients, cook a multi-course menu from scratch, then sit down to the meal you made.",
    includes: ["Ingredients", "Recipes to take home", "Full meal"],
  },
  {
    name: "Hidden gems city tour",
    category: "culture",
    hours: 4,
    price: [30, 75],
    pitch:
      "Skip the tourist checklist. Explore neighbourhoods, stories and photo spots only locals share.",
    includes: ["Local host", "Skip-the-line tips", "Flexible pace"],
  },
  {
    name: "Desert & coast adventure",
    category: "outdoors",
    hours: 6,
    price: [80, 180],
    pitch:
      "A full day outdoors — dramatic landscapes, guided activity and time to soak in the views.",
    includes: ["Guide", "Safety briefing", "Light refreshments"],
  },
  {
    name: "Sunset kayak session",
    category: "water",
    hours: 2,
    price: [40, 90],
    pitch:
      "Paddle calm water as the sky turns gold. Stable kayaks, instruction and life jackets provided.",
    includes: ["Kayak & paddle", "Life jacket", "Instructor"],
  },
  {
    name: "Rooftop yoga at dawn",
    category: "wellness",
    hours: 1.5,
    price: [25, 55],
    pitch:
      "Start the day with breathwork and a gentle flow above the city. All levels welcome; mats provided.",
    includes: ["Yoga mat", "Instructor", "All levels welcome"],
  },
  {
    name: "Local market tasting",
    category: "food_drink",
    hours: 2.5,
    price: [35, 70],
    pitch:
      "Wander a working market with a food-obsessed host — spices, sweets, produce and stories in every aisle.",
    includes: ["Market tastings", "Local host", "Take-home spice tips"],
  },
  {
    name: "Night lights & live music",
    category: "nightlife",
    hours: 3,
    price: [40, 95],
    pitch:
      "An evening out with a local — skyline views, a signature drink stop and live music where the city actually goes.",
    includes: ["Local host", "Venue recommendations", "Flexible itinerary"],
  },
  {
    name: "Coastal wellness walk",
    category: "wellness",
    hours: 2,
    price: [28, 60],
    pitch:
      "Mindful walking, light mobility and sea air — a reset between busy travel days.",
    includes: ["Guided walk", "Breathing practice", "Stretch sequence"],
  },
];

// =============================================================================
// Services — ≥7 named offerings per category (rails are by category)
// =============================================================================

type SvcTpl = {
  name: string;
  category: keyof typeof SVC_IMAGE_POOL;
  unit: "per_person" | "per_group" | "per_hour";
  price: [number, number];
  pitch: string;
  includes: string[];
  durationMinutes: number;
  minGuests: number;
  maxGuests: number;
  locationType: "guest_location" | "provider_location" | "either";
  minLeadHours: number;
};

const SERVICE_TEMPLATES: SvcTpl[] = [
  // —— Photography (7) ——
  {
    name: "Vacation photo session",
    category: "photography",
    unit: "per_group",
    price: [120, 320],
    pitch:
      "A relaxed lifestyle shoot at your hotel or a scenic landmark — edited digital gallery included.",
    includes: [
      "Professional photographer",
      "Edited digital gallery",
      "Location scouting tips",
    ],
    durationMinutes: 120,
    minGuests: 1,
    maxGuests: 8,
    locationType: "either",
    minLeadHours: 24,
  },
  {
    name: "Couple portrait shoot",
    category: "photography",
    unit: "per_group",
    price: [140, 350],
    pitch:
      "Intimate couple portraits with natural light direction and a refined edit set for sharing and print.",
    includes: [
      "Couple posing guidance",
      "Edited highlight set",
      "Outfit advice",
    ],
    durationMinutes: 90,
    minGuests: 2,
    maxGuests: 2,
    locationType: "either",
    minLeadHours: 24,
  },
  {
    name: "Family lifestyle photos",
    category: "photography",
    unit: "per_group",
    price: [150, 380],
    pitch:
      "Warm, unposed family moments — kids welcome. Perfect for holiday cards and trip albums.",
    includes: [
      "Family photographer",
      "Kid-friendly pacing",
      "Edited gallery",
    ],
    durationMinutes: 90,
    minGuests: 2,
    maxGuests: 10,
    locationType: "either",
    minLeadHours: 24,
  },
  {
    name: "Golden hour city shoot",
    category: "photography",
    unit: "per_group",
    price: [130, 340],
    pitch:
      "Chase last light at the city’s best backdrops. Ideal for travellers who want standout trip photos.",
    includes: [
      "Golden-hour timing",
      "Iconic locations",
      "Edited digital gallery",
    ],
    durationMinutes: 120,
    minGuests: 1,
    maxGuests: 6,
    locationType: "either",
    minLeadHours: 24,
  },
  {
    name: "Hotel room content shoot",
    category: "photography",
    unit: "per_group",
    price: [110, 280],
    pitch:
      "Clean, social-ready photos in your stay — wardrobe flatlays, room details and you on-brand.",
    includes: [
      "Content photographer",
      "Social-ready crops",
      "Quick turnaround edit",
    ],
    durationMinutes: 90,
    minGuests: 1,
    maxGuests: 4,
    locationType: "guest_location",
    minLeadHours: 12,
  },
  {
    name: "Proposal photography",
    category: "photography",
    unit: "per_group",
    price: [200, 480],
    pitch:
      "Discrete coverage of the moment — planning support, candid reaction shots and a keepsake gallery.",
    includes: [
      "Discrete photographer",
      "Timing coordination",
      "Full edited gallery",
    ],
    durationMinutes: 120,
    minGuests: 2,
    maxGuests: 4,
    locationType: "either",
    minLeadHours: 48,
  },
  {
    name: "Solo travel portrait session",
    category: "photography",
    unit: "per_group",
    price: [100, 260],
    pitch:
      "Look like you belong in the destination — natural portraits for your feed, dating profile or portfolio.",
    includes: [
      "Portrait direction",
      "Location suggestions",
      "Edited portrait set",
    ],
    durationMinutes: 75,
    minGuests: 1,
    maxGuests: 1,
    locationType: "either",
    minLeadHours: 24,
  },

  // —— Chefs (7) ——
  {
    name: "Private chef dinner",
    category: "chefs",
    unit: "per_person",
    price: [60, 150],
    pitch:
      "A multi-course dinner cooked in your kitchen — menu planning, shopping, plating and full cleanup.",
    includes: [
      "Private chef for the full session",
      "Grocery shopping for the menu",
      "Cooking and plating",
      "Kitchen cleanup",
    ],
    durationMinutes: 180,
    minGuests: 2,
    maxGuests: 12,
    locationType: "guest_location",
    minLeadHours: 48,
  },
  {
    name: "Chef's tasting menu night",
    category: "chefs",
    unit: "per_person",
    price: [85, 190],
    pitch:
      "Five refined courses with wine-pairing suggestions — restaurant energy, home comfort.",
    includes: [
      "5-course tasting menu",
      "Ingredient sourcing",
      "Plating & service",
      "Full cleanup",
    ],
    durationMinutes: 210,
    minGuests: 2,
    maxGuests: 8,
    locationType: "guest_location",
    minLeadHours: 48,
  },
  {
    name: "Brunch by a private chef",
    category: "chefs",
    unit: "per_person",
    price: [45, 110],
    pitch:
      "Leisurely weekend brunch at home — fresh pastries, eggs your way, juices and a tidy kitchen after.",
    includes: [
      "Brunch menu",
      "Fresh ingredients",
      "Cooking & plating",
      "Cleanup",
    ],
    durationMinutes: 150,
    minGuests: 2,
    maxGuests: 10,
    locationType: "guest_location",
    minLeadHours: 36,
  },
  {
    name: "In-villa BBQ chef",
    category: "chefs",
    unit: "per_person",
    price: [55, 140],
    pitch:
      "Live-fire grilling on your terrace — marinades, sides, and a host who handles the heat and the mess.",
    includes: [
      "BBQ chef",
      "Marinated proteins & sides",
      "Grill service",
      "Cleanup",
    ],
    durationMinutes: 180,
    minGuests: 4,
    maxGuests: 16,
    locationType: "guest_location",
    minLeadHours: 48,
  },
  {
    name: "Romantic dinner for two",
    category: "chefs",
    unit: "per_person",
    price: [90, 200],
    pitch:
      "Candlelit three-course menu for couples — discreet service, special-occasion plating, zero stress.",
    includes: [
      "3-course couple’s menu",
      "Table styling tips",
      "Private chef service",
      "Cleanup",
    ],
    durationMinutes: 180,
    minGuests: 2,
    maxGuests: 2,
    locationType: "guest_location",
    minLeadHours: 48,
  },
  {
    name: "Family feast catering",
    category: "chefs",
    unit: "per_person",
    price: [50, 120],
    pitch:
      "Generous shared plates for families and friend groups — kid-friendly options available on request.",
    includes: [
      "Family-style menu",
      "Shopping & prep",
      "Serving",
      "Kitchen cleanup",
    ],
    durationMinutes: 200,
    minGuests: 4,
    maxGuests: 16,
    locationType: "guest_location",
    minLeadHours: 48,
  },
  {
    name: "Healthy meal prep chef",
    category: "chefs",
    unit: "per_person",
    price: [40, 95],
    pitch:
      "Batch-cook balanced meals for your stay — labelled containers, macros-aware options, fridge-ready.",
    includes: [
      "Meal-prep plan",
      "Grocery shopping",
      "Portioned containers",
      "Cleanup",
    ],
    durationMinutes: 150,
    minGuests: 1,
    maxGuests: 6,
    locationType: "guest_location",
    minLeadHours: 36,
  },

  // —— Massage (7) ——
  {
    name: "In-home massage",
    category: "massage",
    unit: "per_hour",
    price: [70, 140],
    pitch:
      "A full body massage in the comfort of your stay — table, oils and a licensed therapist come to you.",
    includes: [
      "Licensed therapist",
      "Massage table & linens",
      "Premium oils",
    ],
    durationMinutes: 60,
    minGuests: 1,
    maxGuests: 2,
    locationType: "guest_location",
    minLeadHours: 12,
  },
  {
    name: "Couples massage at your stay",
    category: "massage",
    unit: "per_hour",
    price: [120, 220],
    pitch:
      "Side-by-side relaxation for two — dual therapists, soft lighting setup and unhurried pacing.",
    includes: [
      "Two therapists",
      "Tables & linens",
      "Aromatherapy oils",
    ],
    durationMinutes: 75,
    minGuests: 2,
    maxGuests: 2,
    locationType: "guest_location",
    minLeadHours: 24,
  },
  {
    name: "Deep tissue recovery session",
    category: "massage",
    unit: "per_hour",
    price: [80, 160],
    pitch:
      "Target tight shoulders, hips and back after flights or long days. Firm pressure, clear communication.",
    includes: [
      "Deep-tissue specialist",
      "Focus assessment",
      "Table & oils",
    ],
    durationMinutes: 60,
    minGuests: 1,
    maxGuests: 1,
    locationType: "guest_location",
    minLeadHours: 12,
  },
  {
    name: "Prenatal massage visit",
    category: "massage",
    unit: "per_hour",
    price: [85, 165],
    pitch:
      "Pregnancy-safe techniques and side-lying comfort — calm, careful care from a trained therapist.",
    includes: [
      "Prenatal-trained therapist",
      "Support pillows",
      "Gentle oils",
    ],
    durationMinutes: 60,
    minGuests: 1,
    maxGuests: 1,
    locationType: "guest_location",
    minLeadHours: 24,
  },
  {
    name: "Hot stone massage",
    category: "massage",
    unit: "per_hour",
    price: [90, 175],
    pitch:
      "Heated stones melt tension while hands work deeper layers — spa ritual without leaving home.",
    includes: [
      "Hot stone kit",
      "Therapist",
      "Table & linens",
    ],
    durationMinutes: 75,
    minGuests: 1,
    maxGuests: 1,
    locationType: "guest_location",
    minLeadHours: 24,
  },
  {
    name: "Sports massage for athletes",
    category: "massage",
    unit: "per_hour",
    price: [85, 170],
    pitch:
      "Pre- or post-event work for runners, gym-goers and active travellers — mobility-focused.",
    includes: [
      "Sports massage therapist",
      "Mobility focus",
      "Table setup",
    ],
    durationMinutes: 60,
    minGuests: 1,
    maxGuests: 1,
    locationType: "guest_location",
    minLeadHours: 12,
  },
  {
    name: "Aromatherapy relaxation massage",
    category: "massage",
    unit: "per_hour",
    price: [75, 150],
    pitch:
      "Soft pressure and essential-oil blends chosen for calm sleep after long travel days.",
    includes: [
      "Aromatherapy oils",
      "Relaxation massage",
      "Table & linens",
    ],
    durationMinutes: 60,
    minGuests: 1,
    maxGuests: 1,
    locationType: "guest_location",
    minLeadHours: 12,
  },

  // —— Training (7) ——
  {
    name: "Personal training session",
    category: "training",
    unit: "per_hour",
    price: [40, 110],
    pitch:
      "1:1 coaching tailored to your goals — hotel gym, park or villa patio. Efficient, motivating, travel-friendly.",
    includes: [
      "Certified trainer",
      "Custom workout",
      "Form coaching",
    ],
    durationMinutes: 60,
    minGuests: 1,
    maxGuests: 2,
    locationType: "either",
    minLeadHours: 12,
  },
  {
    name: "HIIT hotel-gym workout",
    category: "training",
    unit: "per_hour",
    price: [45, 115],
    pitch:
      "High-intensity intervals that fit a short stay — minimal equipment, maximum sweat, clear coaching.",
    includes: [
      "HIIT programming",
      "Trainer on-site",
      "Cool-down stretch",
    ],
    durationMinutes: 45,
    minGuests: 1,
    maxGuests: 4,
    locationType: "either",
    minLeadHours: 12,
  },
  {
    name: "Morning run with a coach",
    category: "training",
    unit: "per_hour",
    price: [35, 90],
    pitch:
      "Explore the city on foot with pacing advice — scenic routes, intervals optional, all levels.",
    includes: [
      "Running coach",
      "Route planning",
      "Pacing guidance",
    ],
    durationMinutes: 60,
    minGuests: 1,
    maxGuests: 6,
    locationType: "either",
    minLeadHours: 12,
  },
  {
    name: "Mobility & stretch session",
    category: "training",
    unit: "per_hour",
    price: [40, 95],
    pitch:
      "Undo plane stiffness with guided mobility — hips, spine and shoulders for freer movement all day.",
    includes: [
      "Mobility coach",
      "Mat-based flow",
      "Travel-friendly routine",
    ],
    durationMinutes: 50,
    minGuests: 1,
    maxGuests: 4,
    locationType: "either",
    minLeadHours: 12,
  },
  {
    name: "Partner workout session",
    category: "training",
    unit: "per_hour",
    price: [55, 130],
    pitch:
      "Train together with partner drills that stay fun and effective — great for couples or friends.",
    includes: [
      "Duo programming",
      "Trainer",
      "Shared workout plan",
    ],
    durationMinutes: 60,
    minGuests: 2,
    maxGuests: 2,
    locationType: "either",
    minLeadHours: 12,
  },
  {
    name: "Boxing fundamentals coaching",
    category: "training",
    unit: "per_hour",
    price: [50, 125],
    pitch:
      "Footwork, jab-cross and pad work — a high-energy session that burns stress and builds confidence.",
    includes: [
      "Boxing coach",
      "Pads / gloves (on request)",
      "Technique focus",
    ],
    durationMinutes: 55,
    minGuests: 1,
    maxGuests: 2,
    locationType: "either",
    minLeadHours: 24,
  },
  {
    name: "Post-flight recovery workout",
    category: "training",
    unit: "per_hour",
    price: [40, 100],
    pitch:
      "Gentle activation after long-haul flights — circulation, core and easy strength so you feel human again.",
    includes: [
      "Recovery-focused coach",
      "Low-impact plan",
      "Breathing reset",
    ],
    durationMinutes: 45,
    minGuests: 1,
    maxGuests: 3,
    locationType: "either",
    minLeadHours: 6,
  },

  // —— Makeup (7) ——
  {
    name: "Event makeup artist",
    category: "makeup",
    unit: "per_person",
    price: [50, 130],
    pitch:
      "Camera-ready makeup for dinners, galas and celebrations — long-wear products and a refined finish.",
    includes: [
      "Professional makeup artist",
      "Long-wear products",
      "Lashes on request",
    ],
    durationMinutes: 75,
    minGuests: 1,
    maxGuests: 4,
    locationType: "guest_location",
    minLeadHours: 24,
  },
  {
    name: "Bridal trial makeup",
    category: "makeup",
    unit: "per_person",
    price: [80, 180],
    pitch:
      "A full bridal trial so your big-day look is locked — photos, product notes and timing plan included.",
    includes: [
      "Bridal makeup artist",
      "Trial look + photos",
      "Product notes",
    ],
    durationMinutes: 90,
    minGuests: 1,
    maxGuests: 1,
    locationType: "guest_location",
    minLeadHours: 48,
  },
  {
    name: "Natural glam makeup",
    category: "makeup",
    unit: "per_person",
    price: [55, 135],
    pitch:
      "Soft-focus glow for daytime events and photos — skin-first, flattering in every light.",
    includes: [
      "Skin prep",
      "Natural glam look",
      "Touch-up kit tips",
    ],
    durationMinutes: 60,
    minGuests: 1,
    maxGuests: 3,
    locationType: "guest_location",
    minLeadHours: 24,
  },
  {
    name: "Editorial evening makeup",
    category: "makeup",
    unit: "per_person",
    price: [70, 160],
    pitch:
      "Bold liner, sculpted cheekbones and statement colour — for nights that deserve a strong look.",
    includes: [
      "Editorial artist",
      "Statement look",
      "HD-ready finish",
    ],
    durationMinutes: 80,
    minGuests: 1,
    maxGuests: 2,
    locationType: "guest_location",
    minLeadHours: 24,
  },
  {
    name: "Group party makeup",
    category: "makeup",
    unit: "per_person",
    price: [45, 110],
    pitch:
      "Coordinated glam for friend groups and hens — efficient chairs, consistent style, fun energy.",
    includes: [
      "Group booking slots",
      "Coordinated looks",
      "Travel to your stay",
    ],
    durationMinutes: 60,
    minGuests: 3,
    maxGuests: 8,
    locationType: "guest_location",
    minLeadHours: 36,
  },
  {
    name: "Photoshoot makeup & touch-ups",
    category: "makeup",
    unit: "per_person",
    price: [65, 150],
    pitch:
      "On-set makeup that lasts under lights — base, eyes and on-location touch-ups through the shoot.",
    includes: [
      "Photoshoot MUA",
      "Touch-up kit on site",
      "Camera-ready finish",
    ],
    durationMinutes: 90,
    minGuests: 1,
    maxGuests: 4,
    locationType: "either",
    minLeadHours: 24,
  },
  {
    name: "Quick glam for dinner plans",
    category: "makeup",
    unit: "per_person",
    price: [40, 95],
    pitch:
      "A polished 45-minute look when you’re short on time — fresh skin, defined eyes, soft lip.",
    includes: [
      "Express makeup",
      "Long-wear essentials",
      "At-home service",
    ],
    durationMinutes: 45,
    minGuests: 1,
    maxGuests: 2,
    locationType: "guest_location",
    minLeadHours: 6,
  },

  // —— Hair (7) ——
  {
    name: "Mobile hair styling",
    category: "hair",
    unit: "per_person",
    price: [45, 120],
    pitch:
      "Blowouts and event styles at your door — tools, products and a stylist who travels to you.",
    includes: [
      "Mobile stylist",
      "Tools & products",
      "Heat protection",
    ],
    durationMinutes: 75,
    minGuests: 1,
    maxGuests: 4,
    locationType: "guest_location",
    minLeadHours: 24,
  },
  {
    name: "Bridal hair trial",
    category: "hair",
    unit: "per_person",
    price: [75, 170],
    pitch:
      "Trial your wedding hairstyle with pins, veil placement and photos so the big day is stress-free.",
    includes: [
      "Bridal stylist",
      "Trial style + photos",
      "Veil / accessory placement",
    ],
    durationMinutes: 90,
    minGuests: 1,
    maxGuests: 1,
    locationType: "guest_location",
    minLeadHours: 48,
  },
  {
    name: "Soft glam blowout",
    category: "hair",
    unit: "per_person",
    price: [40, 100],
    pitch:
      "Salon-smooth volume and movement that lasts through dinner, photos and dancing.",
    includes: [
      "Professional blowout",
      "Styling products",
      "At-home service",
    ],
    durationMinutes: 60,
    minGuests: 1,
    maxGuests: 3,
    locationType: "guest_location",
    minLeadHours: 12,
  },
  {
    name: "Updo for formal events",
    category: "hair",
    unit: "per_person",
    price: [55, 140],
    pitch:
      "Classic or modern updos secured for humidity and long evenings — pins that actually hold.",
    includes: [
      "Event updo",
      "Long-hold pins",
      "Finishing spray",
    ],
    durationMinutes: 75,
    minGuests: 1,
    maxGuests: 3,
    locationType: "guest_location",
    minLeadHours: 24,
  },
  {
    name: "Beach waves styling",
    category: "hair",
    unit: "per_person",
    price: [40, 105],
    pitch:
      "Effortless texture for coastal days and rooftop nights — soft waves without the crunch.",
    includes: [
      "Wave styling",
      "Texture products",
      "Heat tools provided",
    ],
    durationMinutes: 55,
    minGuests: 1,
    maxGuests: 3,
    locationType: "guest_location",
    minLeadHours: 12,
  },
  {
    name: "Grooms haircut & style",
    category: "hair",
    unit: "per_person",
    price: [35, 90],
    pitch:
      "Sharp cut and finish before the event — clean lines, product advice and a photo-ready look.",
    includes: [
      "Cut & style",
      "Grooming products",
      "Mobile service",
    ],
    durationMinutes: 45,
    minGuests: 1,
    maxGuests: 2,
    locationType: "guest_location",
    minLeadHours: 24,
  },
  {
    name: "Group party hair styling",
    category: "hair",
    unit: "per_person",
    price: [40, 100],
    pitch:
      "Efficient chair time for groups getting ready together — coordinated styles, shared energy.",
    includes: [
      "Group slots",
      "Stylist on location",
      "Tools & products",
    ],
    durationMinutes: 60,
    minGuests: 3,
    maxGuests: 8,
    locationType: "guest_location",
    minLeadHours: 36,
  },
];

const HOST_EMAILS = [
  "amira.host@gurfah.dev",
  "omar.host@gurfah.dev",
  "layla.host@gurfah.dev",
  "james.host@gurfah.dev",
  "chloe.host@gurfah.dev",
  "aisyah.host@gurfah.dev",
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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function hashSeed(s: string, salt: number): number {
  return (
    ([...s].reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), salt) >>> 0)
  );
}

// =============================================================================
// Image pipeline — category-keyed, deterministic ImageKit names
// =============================================================================

type Uploaded = { url: string; fileId: string };
const uploaded = new Map<string, Uploaded>();

async function download(url: string): Promise<Buffer> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function ensureCategoryImage(
  kind: "exp" | "svc",
  category: string,
  index: number,
): Promise<Uploaded> {
  const pool =
    kind === "exp"
      ? EXP_IMAGE_POOL[category] ?? EXP_IMAGE_POOL.culture!
      : SVC_IMAGE_POOL[category] ?? SVC_IMAGE_POOL.photography!;
  const photoId = pool[index % pool.length]!;
  const key = `${kind}-${category}-${index % pool.length}`;
  const cached = uploaded.get(key);
  if (cached) return cached;

  // Without Image Kit (or with SEED_SKIP_IMAGEKIT=1) keep the source photo's
  // URL, like the listing seeder does, so the seed needs no keys.
  if (
    process.env["SEED_SKIP_IMAGEKIT"] === "1" ||
    !process.env["IMAGEKIT_PRIVATE_KEY"]
  ) {
    const entry = { url: unsplash(photoId), fileId: "" };
    uploaded.set(key, entry);
    return entry;
  }

  let raw: Buffer;
  try {
    raw = await download(unsplash(photoId));
  } catch {
    console.warn(`  ! unsplash fetch failed for ${key}, using picsum fallback`);
    raw = await download(fallbackUrl(key));
  }

  const webp = await sharp(raw)
    .resize(1200, 900, { fit: "cover" })
    .webp({ quality: 82 })
    .toBuffer();

  const fileName = `staybnb-${kind}-${category}-${String(index % pool.length).padStart(2, "0")}.webp`;
  const result = await imageKitUpload({
    file: webp,
    fileName,
    folder: kind === "exp" ? "/experiences/seed" : "/services/seed",
    useUniqueFileName: false,
  });

  const entry = { url: result.url, fileId: result.fileId };
  uploaded.set(key, entry);
  console.log(`  ↑ imagekit ${category} [${index % pool.length}] ${result.url}`);
  return entry;
}

async function imagesFor(
  kind: "exp" | "svc",
  category: string,
  count: number,
  startOffset: number,
): Promise<{ urls: string[]; refs: string[] }> {
  const picks = await Promise.all(
    Array.from({ length: count }, (_, i) =>
      ensureCategoryImage(kind, category, startOffset + i),
    ),
  );
  return {
    urls: picks.map((p) => p.url),
    refs: picks.map((p) => p.fileId).filter(Boolean),
  };
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  let hosts = await prisma.user.findMany({
    where: { email: { in: HOST_EMAILS } },
    select: { id: true },
  });
  // Fall back to the standard demo hosts (host1…host10@staybnb.test) that
  // `pnpm seed` creates, when the photo seeder's hosts aren't there.
  if (hosts.length === 0) {
    hosts = await prisma.user.findMany({
      where: { email: { startsWith: "host", endsWith: "@staybnb.test" } },
      select: { id: true },
      orderBy: { email: "asc" },
    });
  }
  if (hosts.length === 0) {
    throw new Error(
      "No seed hosts found — run scripts/seed-home-listings.ts first.",
    );
  }

  let createdExp = 0;
  let updatedExp = 0;
  let createdSvc = 0;
  let updatedSvc = 0;

  // ---- Experiences: every template × every city (≥7 per city rail) ---------
  for (let c = 0; c < CITIES.length; c++) {
    const { city, country } = CITIES[c]!;
    for (let t = 0; t < EXPERIENCE_TEMPLATES.length; t++) {
      const tpl = EXPERIENCE_TEMPLATES[t]!;
      const title = `${tpl.name} in ${city}`;
      const slug = slugify(title);
      const rand = mulberry32(hashSeed(slug, 11));
      const [minP, maxP] = tpl.price;
      const pricePerPerson = Math.round(minP + rand() * (maxP - minP));
      const { urls, refs } = await imagesFor(
        "exp",
        tpl.category,
        3,
        t * 2 + c,
      );
      const description = [
        tpl.pitch,
        `Join a local host for this ${tpl.hours}-hour experience in ${city}, ${country}.`,
        "Small groups, all skill levels welcome — just bring comfortable shoes and your curiosity.",
      ].join(" ");

      const existing = await prisma.experience.findUnique({
        where: { slug },
        select: { id: true },
      });

      const data = {
        title,
        description,
        category: tpl.category,
        hostId: hosts[(c + t) % hosts.length]!.id,
        city,
        country,
        durationHours: tpl.hours,
        maxGroupSize: 6 + Math.floor(rand() * 8),
        minGuests: 1,
        pricePerPerson,
        currency: "USD",
        images: urls,
        imageProviderRefs: refs,
        includes: tpl.includes,
        minLeadHours: 24,
        maxAdvanceDays: 90,
        defaultStartTimes: ["10:00", "14:00"],
        instantBook: true,
        cancellationPolicy: "moderate",
        serviceFeePct: 12,
        taxRate: 0,
        avgRating: Math.round((4.62 + rand() * 0.35) * 100) / 100,
        reviewCount: 14 + Math.floor(rand() * 380),
        isOriginal: rand() > 0.72,
        isActive: true,
      };

      if (existing) {
        await prisma.experience.update({
          where: { slug },
          data: {
            title: data.title,
            description: data.description,
            category: data.category,
            images: data.images,
            imageProviderRefs: data.imageProviderRefs,
            includes: data.includes,
            durationHours: data.durationHours,
            pricePerPerson: data.pricePerPerson,
            isActive: true,
          },
        });
        updatedExp++;
        console.log(`  ~ exp: ${title}`);
      } else {
        await prisma.experience.create({
          data: { slug, ...data },
        });
        createdExp++;
        console.log(`  ✓ exp: ${title}`);
      }
    }
  }

  // ---- Services: every named offering, city rotated for geographic spread --
  for (let s = 0; s < SERVICE_TEMPLATES.length; s++) {
    const tpl = SERVICE_TEMPLATES[s]!;
    // Spread each category’s 7 offerings across cities
    const { city, country } = CITIES[s % CITIES.length]!;
    // Ensure uniqueness when same name might collide: name already unique per category
    const title = `${tpl.name} in ${city}`;
    const slug = slugify(title);
    const rand = mulberry32(hashSeed(slug, 13));
    const [minP, maxP] = tpl.price;
    const priceFrom = Math.round(minP + rand() * (maxP - minP));
    const { urls, refs } = await imagesFor(
      "svc",
      tpl.category,
      2,
      s,
    );
    const description = [
      tpl.pitch,
      `Book a vetted professional for ${tpl.name.toLowerCase()} during your stay in ${city}, ${country}.`,
      "Flexible scheduling, transparent pricing and top-rated providers.",
    ].join(" ");

    const isChef = tpl.category === "chefs";
    const packageDefault = {
      name: isChef
        ? "Signature menu"
        : tpl.category === "photography"
          ? "Full session"
          : "Standard session",
      description: `Default option for ${tpl.name.toLowerCase()}.`,
      durationMinutes: tpl.durationMinutes,
      price: priceFrom,
      priceMode: (tpl.unit === "per_group" ? "fixed" : "per_person") as
        | "fixed"
        | "per_person",
      isDefault: true,
      sortOrder: 0,
    };
    const packagePremium = {
      name: isChef ? "Extended tasting experience" : "Extended session",
      description: "Longer premium option with extra time.",
      durationMinutes: Math.round(tpl.durationMinutes * 1.35),
      price: Math.round(priceFrom * 1.4),
      priceMode: packageDefault.priceMode,
      isDefault: false,
      sortOrder: 1,
    };

    const existing = await prisma.service.findUnique({
      where: { slug },
      select: { id: true, packages: { select: { id: true }, take: 1 } },
    });

    if (existing) {
      await prisma.service.update({
        where: { slug },
        data: {
          title,
          description,
          category: tpl.category,
          priceFrom,
          priceUnit: tpl.unit,
          images: urls,
          imageProviderRefs: refs,
          durationMinutes: tpl.durationMinutes,
          minGuests: tpl.minGuests,
          maxGuests: tpl.maxGuests,
          locationType: tpl.locationType,
          minLeadHours: tpl.minLeadHours,
          includes: tpl.includes,
          isActive: true,
        },
      });
      updatedSvc++;
      console.log(`  ~ svc: ${title}`);
    } else {
      await prisma.service.create({
        data: {
          slug,
          title,
          description,
          category: tpl.category,
          hostId: hosts[s % hosts.length]!.id,
          city,
          country,
          priceFrom,
          priceUnit: tpl.unit,
          currency: "USD",
          images: urls,
          imageProviderRefs: refs,
          durationMinutes: tpl.durationMinutes,
          minGuests: tpl.minGuests,
          maxGuests: tpl.maxGuests,
          locationType: tpl.locationType,
          minLeadHours: tpl.minLeadHours,
          maxAdvanceDays: 90,
          bufferMinutes: 30,
          slotIntervalMinutes: 30,
          instantBook: true,
          cancellationPolicy: "moderate",
          includes: tpl.includes,
          serviceFeePct: 12,
          taxRate: 0,
          avgRating: Math.round((4.62 + rand() * 0.35) * 100) / 100,
          reviewCount: 10 + Math.floor(rand() * 240),
          isFeatured: rand() > 0.7,
          isActive: true,
          weeklyHours: {
            create: Array.from({ length: 7 }, (_, dayOfWeek) => ({
              dayOfWeek,
              startTime: isChef ? "11:00" : "09:00",
              endTime: isChef ? "22:00" : "20:00",
              isClosed: dayOfWeek === 0 && isChef,
            })),
          },
          packages: {
            create: [packageDefault, packagePremium],
          },
        },
      });
      createdSvc++;
      console.log(`  ✓ svc: ${title}`);
    }
  }

  // Safety: if any category still has <7 active services (e.g. old city-only
  // rows), clone extra variants into remaining cities until each has ≥7.
  const categories = Object.keys(SVC_IMAGE_POOL);
  for (const category of categories) {
    const count = await prisma.service.count({
      where: { category, isActive: true },
    });
    if (count >= 7) continue;

    const baseTpls = SERVICE_TEMPLATES.filter((t) => t.category === category);
    let n = count;
    let cityIdx = 0;
    while (n < 7) {
      const tpl = baseTpls[n % baseTpls.length]!;
      const { city, country } = CITIES[cityIdx % CITIES.length]!;
      cityIdx++;
      // Distinct title for fill-ins that would collide with existing slugs
      const title = `${tpl.name} in ${city}`;
      let slug = slugify(title);
      if (await prisma.service.findUnique({ where: { slug } })) {
        slug = slugify(`${tpl.name} ${city} ${n + 1}`);
      }
      if (await prisma.service.findUnique({ where: { slug } })) {
        n++;
        continue;
      }
      const rand = mulberry32(hashSeed(slug, 17));
      const [minP, maxP] = tpl.price;
      const priceFrom = Math.round(minP + rand() * (maxP - minP));
      const { urls, refs } = await imagesFor("svc", category, 2, n + 10);
      const description = [
        tpl.pitch,
        `Available in ${city}, ${country}. Vetted professionals, clear pricing, easy booking.`,
      ].join(" ");

      await prisma.service.create({
        data: {
          slug,
          title: `${tpl.name} in ${city}`,
          description,
          category,
          hostId: hosts[n % hosts.length]!.id,
          city,
          country,
          priceFrom,
          priceUnit: tpl.unit,
          currency: "USD",
          images: urls,
          imageProviderRefs: refs,
          durationMinutes: tpl.durationMinutes,
          minGuests: tpl.minGuests,
          maxGuests: tpl.maxGuests,
          locationType: tpl.locationType,
          minLeadHours: tpl.minLeadHours,
          maxAdvanceDays: 90,
          bufferMinutes: 30,
          slotIntervalMinutes: 30,
          instantBook: true,
          cancellationPolicy: "moderate",
          includes: tpl.includes,
          serviceFeePct: 12,
          taxRate: 0,
          avgRating: Math.round((4.6 + rand() * 0.35) * 100) / 100,
          reviewCount: 8 + Math.floor(rand() * 200),
          isFeatured: false,
          isActive: true,
          weeklyHours: {
            create: Array.from({ length: 7 }, (_, dayOfWeek) => ({
              dayOfWeek,
              startTime: category === "chefs" ? "11:00" : "09:00",
              endTime: category === "chefs" ? "22:00" : "20:00",
              isClosed: false,
            })),
          },
          packages: {
            create: [
              {
                name: "Standard session",
                description: `Default option for ${tpl.name.toLowerCase()}.`,
                durationMinutes: tpl.durationMinutes,
                price: priceFrom,
                priceMode:
                  tpl.unit === "per_group" ? "fixed" : "per_person",
                isDefault: true,
                sortOrder: 0,
              },
            ],
          },
        },
      });
      createdSvc++;
      n++;
      console.log(`  ✓ svc fill: ${title}`);
    }
  }

  // Refresh category-matched images on any remaining active rows that were
  // not in the expanded catalogue (older city×template seeds).
  console.log("\n── Refreshing images on legacy rows ──");
  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, category: true },
  });
  for (let i = 0; i < allServices.length; i++) {
    const svc = allServices[i]!;
    if (!SVC_IMAGE_POOL[svc.category]) continue;
    const { urls, refs } = await imagesFor("svc", svc.category, 2, i);
    await prisma.service.update({
      where: { id: svc.id },
      data: { images: urls, imageProviderRefs: refs },
    });
  }
  const allExps = await prisma.experience.findMany({
    where: { isActive: true },
    select: { id: true, category: true },
  });
  for (let i = 0; i < allExps.length; i++) {
    const exp = allExps[i]!;
    if (!EXP_IMAGE_POOL[exp.category]) continue;
    const { urls, refs } = await imagesFor("exp", exp.category, 3, i);
    await prisma.experience.update({
      where: { id: exp.id },
      data: { images: urls, imageProviderRefs: refs },
    });
  }
  console.log(
    `  refreshed images: ${allServices.length} services, ${allExps.length} experiences`,
  );

  // Report section sizes
  console.log("\n── Experiences by city ──");
  for (const { city } of CITIES) {
    const n = await prisma.experience.count({
      where: { city, isActive: true },
    });
    console.log(`  ${city}: ${n}${n < 7 ? "  ⚠ below 7" : ""}`);
  }
  console.log("\n── Services by category ──");
  for (const category of categories) {
    const n = await prisma.service.count({
      where: { category, isActive: true },
    });
    console.log(`  ${category}: ${n}${n < 7 ? "  ⚠ below 7" : ""}`);
  }

  console.log(
    `\n✓ Done. experiences +${createdExp}/~${updatedExp}, services +${createdSvc}/~${updatedSvc}.`,
  );
  console.log(
    "  Tip: run seed-service-booking-criteria.ts / seed-experience-booking-criteria.ts / seed-reviews.ts if you want criteria & reviews backfilled for new rows.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
