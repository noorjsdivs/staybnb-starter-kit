/**
 * Curated, royalty-free (Unsplash license) image sets for seeded listings,
 * plus a cached resolver that uploads each unique source URL to ImageKit
 * exactly once and stores the result in the DB.
 *
 * The on-disk cache (scripts/.imagekit-cache.json) keeps re-seeds fast and
 * idempotent: a source URL already uploaded is reused, never re-uploaded.
 *
 * Set SEED_SKIP_IMAGEKIT=1 to skip uploads entirely and seed the raw source
 * URLs (useful for offline work).
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { uploadRemoteImage, type UploadedImage } from "../utils/imagekitUpload.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = resolve(__dirname, ".imagekit-cache.json");

const IK = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1280&h=860&fit=crop&q=80`;

/** Signature exterior cover per seeded city (keyed by CITIES[].city). */
export const CITY_COVERS: Record<string, string> = {
  Lisbon: IK("1585208798174-6cedd86e019a"),
  Barcelona: IK("1583422409516-2895a77efded"),
  Paris: IK("1502602898657-3e91760cbb34"),
  Rome: IK("1552832230-c0197dd311b5"),
  Amsterdam: IK("1534351590666-13e3e96b5017"),
  Reykjavík: IK("1529963183134-61a90db47eaf"),
  Marrakesh: IK("1597212618440-806262de4f6b"),
  Tokyo: IK("1540959733332-eab4deabeeaf"),
  Bali: IK("1537996194471-e657df975ab4"),
  "Cape Town": IK("1580060839134-75a5edca2e99"),
  "New York": IK("1496442226666-8d4d0e62e6e9"),
  Aspen: IK("1551524559-8af4e6624178"),
  Tulum: IK("1512100356356-de1b84283e18"),
  Dubai: IK("1512453979798-5ea266f8880c"),
  Sydney: IK("1506973035872-a4ec16b8e8d9"),
};

/** Interior/feature shots used for card carousels and detail galleries. */
export const GALLERY_POOL: string[] = [
  IK("1586023492125-27b2c045efd7"), // living room
  IK("1567767292278-a4f21aa2d36e"), // living room 2
  IK("1505693416388-ac5ce068fe85"), // bedroom
  IK("1522708323590-d24dbb6b0267"), // bedroom 2
  IK("1556911220-bff31c812dba"), // kitchen
  IK("1556909212-d5b604d0c90d"), // kitchen 2
  IK("1620626011761-996317b8d101"), // bathroom
  IK("1571003123894-1f0594d2b5d9"), // pool
  IK("1540541338287-41700207dee6"), // pool 2
  IK("1502672260266-1c1ef2d93688"), // balcony / terrace
  IK("1568605114967-8130f3a36994"), // modern exterior
  IK("1512917774080-9991f1c4c750"), // designer exterior
];

export const FALLBACK_COVER = GALLERY_POOL[10]!;

type Cache = Record<string, UploadedImage>;

let cache: Cache | null = null;
function loadCache(): Cache {
  if (cache) return cache;
  cache = existsSync(CACHE_PATH)
    ? (JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Cache)
    : {};
  return cache;
}
function saveCache() {
  if (cache) writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

const skipUpload = process.env["SEED_SKIP_IMAGEKIT"] === "1";

/**
 * Resolve a source image URL to a hosted ImageKit image. Uploads once and
 * caches the result. On failure (or when skipped) falls back to the source
 * URL with no providerRef so seeding never breaks.
 */
export async function resolveImage(
  sourceUrl: string,
  fileName: string,
): Promise<UploadedImage> {
  if (skipUpload) return { url: sourceUrl, providerRef: "" };

  const c = loadCache();
  const hit = c[sourceUrl];
  if (hit) return hit;

  try {
    const uploaded = await uploadRemoteImage(sourceUrl, "listings", fileName);
    c[sourceUrl] = uploaded;
    saveCache();
    return uploaded;
  } catch (err) {
    console.warn(
      `  ⚠️  ImageKit upload failed for ${fileName}; using source URL.`,
      (err as Error).message,
    );
    return { url: sourceUrl, providerRef: "" };
  }
}

/**
 * Per-listing cover — a varied interior/exterior shot (like Airbnb cards show
 * the home itself, not a city landmark). Keyed off (cityIndex, n) so the first
 * listing of every city (n=0, used for the "Top destinations" tile) still gets
 * a distinct image instead of collapsing onto the same pool slot.
 */
export function coverFor(cityIndex: number, n: number): string {
  return GALLERY_POOL[(cityIndex * 5 + n * 7 + 2) % GALLERY_POOL.length]!;
}

/** Deterministically pick `count` varied gallery shots for a listing. */
export function galleryFor(cityIndex: number, n: number, count = 4): string[] {
  const out: string[] = [];
  const base = cityIndex * 3 + n * 5;
  for (let k = 0; k < count; k++) {
    out.push(GALLERY_POOL[(base + k * 2 + 1) % GALLERY_POOL.length]!);
  }
  return out;
}
