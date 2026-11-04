// Idempotent seeder for the UI language registry.
//
// Run with:  pnpm --filter api exec tsx scripts/seed-languages.ts
//
// Keep in sync with `apps/web/src/i18n/config.ts` — that file is the
// compile-time source of truth for routing; this table is the runtime
// registry (admin toggles, account-settings options, switcher metadata).
import prisma from "../utils/prisma.js";

const LANGUAGES = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
    isDefault: true,
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    direction: "rtl",
    isDefault: false,
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    direction: "rtl",
    isDefault: false,
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    direction: "ltr",
    isDefault: false,
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    direction: "ltr",
    isDefault: false,
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    direction: "ltr",
    isDefault: false,
  },
  {
    code: "bn",
    name: "Bangla",
    nativeName: "বাংলা",
    direction: "ltr",
    isDefault: false,
  },
];

async function main() {
  console.log(`→ Seeding ${LANGUAGES.length} languages…`);
  for (let i = 0; i < LANGUAGES.length; i++) {
    const l = LANGUAGES[i]!;
    await prisma.language.upsert({
      where: { code: l.code },
      update: {
        name: l.name,
        nativeName: l.nativeName,
        direction: l.direction,
        isDefault: l.isDefault,
        order: i,
        isActive: true,
      },
      create: { ...l, order: i, isActive: true },
    });
  }
  const count = await prisma.language.count();
  console.log(`✓ Done. ${count} languages in DB.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
