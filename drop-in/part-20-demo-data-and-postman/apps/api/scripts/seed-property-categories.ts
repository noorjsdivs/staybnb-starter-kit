// Idempotent seeder for property categories.
//
// Run with:  pnpm --filter api exec tsx scripts/seed-property-categories.ts
//
// Safe to run repeatedly — uses upsert keyed on `slug`. The list mirrors
// `apps/web/src/config/home-data.ts:POPULAR_CATEGORIES` so the home strip,
// the all-categories grid and the listing filter all line up. `iconUrl`
// stores the Lucide icon component name; the web client maps it via
// `apps/web/src/lib/category-icons.ts`.
import prisma from "../utils/prisma.js";

const CATEGORIES = [
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
];

async function main() {
  console.log(`→ Seeding ${CATEGORIES.length} property categories…`);
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i]!;
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
  const count = await prisma.propertyCategory.count();
  console.log(`✓ Done. ${count} categories in DB.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
