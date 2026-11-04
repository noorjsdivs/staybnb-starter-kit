/**
 * Derives a sensible PropertyCategory slug for a listing from its title,
 * type and city — instead of the old round-robin assignment that produced
 * "Yurt" apartments in Sydney and "Chef's Kitchen" bush cabins.
 *
 * Rules are ordered: the first match wins, so put the most specific first.
 * Falls back to a type-based mapping when no themed rule matches.
 */

export interface CategoryInput {
  title: string;
  type: string; // ListingType
  city: string;
}

type Rule = { match: RegExp; slug: string; cities?: string[] };

// Themed rules, most specific first.
const RULES: Rule[] = [
  { match: /ryokan/i, slug: "ryokan" },
  { match: /ski-in|slope-view|snowmass|après-ski|gondola/i, slug: "skiing" },
  { match: /houseboat/i, slug: "boats" },
  { match: /boat dock|harbourside deck/i, slug: "sailing" },
  { match: /glamping/i, slug: "camp" },
  { match: /desert|dunes|palmeraie/i, slug: "desert" },
  {
    match: /northern lights|turf-roofed|geothermal|corrugated-iron|tin cottage/i,
    slug: "arctic",
  },
  { match: /wine slopes|vineyard/i, slug: "vineyard" },
  { match: /farmhouse|ranch/i, slug: "farm" },
  { match: /olive grove|rice-field|rice terraces|countryside/i, slug: "countryside" },
  { match: /fynbos|bush cabin|cloud forest|waterfalls|forest/i, slug: "nature" },
  {
    match: /jungle|bamboo|palm|lotus|black-sand|frangipani/i,
    slug: "tropical",
    cities: ["Bali", "Tulum", "Marrakesh"],
  },
  {
    match:
      /beach|bay\b|surf|coast|ocean|cenote|reef|seafront|sand\b|kite|playa/i,
    slug: "beachfront",
  },
  {
    match:
      /17th-century|1680|victorian|federation|miner'?s|sandstone|convent|historic|century|old (vesturbær|yanaka|jumeirah|mellah|mouraria)|île saint-louis/i,
    slug: "historical",
  },
  { match: /skyline|burj-view|panoramas|fuji sunsets|overlooking|glimpses?/i, slug: "views" },
  { match: /penthouse|mansion|emirates hills|red mountain/i, slug: "mansion" },
  { match: /garden|courtyard|hofje|botanical|bougainvillea|wisteria|ivy-clad|vine-draped/i, slug: "garden" },
  { match: /canal|riverside|amstel|river\b|pond|creek(side)?|harbour|wharf|waterfront/i, slug: "lakefront" },
  { match: /rooftop|downtown|city bowl|neon|market|souks?|arcade/i, slug: "city" },
];

// Fallback by listing type when no themed rule fires.
const TYPE_FALLBACK: Record<string, string> = {
  house: "house",
  apartment: "flat",
  villa: "villa",
  loft: "flat",
  cottage: "house",
  cabin: "cabin",
  guesthouse: "bed",
  room: "room",
};

// Alpine towns: generic cabins/cottages read as chalets.
const ALPINE_CITIES = new Set(["Aspen"]);

export function categoryForListing(input: CategoryInput): string {
  const { title, type, city } = input;

  for (const rule of RULES) {
    if (rule.cities && !rule.cities.includes(city)) continue;
    if (rule.match.test(title)) return rule.slug;
  }

  if (ALPINE_CITIES.has(city) && (type === "cabin" || type === "cottage")) {
    return "chalet";
  }

  return TYPE_FALLBACK[type] ?? "house";
}
