/**
 * Standardized site type definitions
 * These match the database site_types table
 */

export const SITE_TYPES = {
  pyramid: {
    id: "pyramid",
    name: "Pyramid",
    description: "Pyramidal structures including step pyramids and true pyramids",
    color: "#f59e0b",
    icon: "pyramid",
  },
  temple: {
    id: "temple",
    name: "Temple",
    description: "Religious and spiritual buildings, shrines, sanctuaries",
    color: "#8b5cf6",
    icon: "temple",
  },
  megalith: {
    id: "megalith",
    name: "Megalith",
    description: "Standing stones, dolmens, menhirs, and megalithic monuments",
    color: "#6366f1",
    icon: "megalith",
  },
  stone_circle: {
    id: "stone_circle",
    name: "Stone Circle",
    description: "Circular stone arrangements, henges, and ring monuments",
    color: "#06b6d4",
    icon: "stone-circle",
  },
  mound: {
    id: "mound",
    name: "Mound",
    description: "Burial mounds, tumuli, barrows, and earthen structures",
    color: "#84cc16",
    icon: "mound",
  },
  tomb: {
    id: "tomb",
    name: "Tomb",
    description: "Burial chambers, passage tombs, crypts, and catacombs",
    color: "#10b981",
    icon: "tomb",
  },
  fortress: {
    id: "fortress",
    name: "Fortress",
    description: "Defensive walls, forts, citadels, and hillforts",
    color: "#78716c",
    icon: "wall",
  },
  city: {
    id: "city",
    name: "Ancient City",
    description: "Ancient cities, settlements, and urban complexes",
    color: "#14b8a6",
    icon: "city",
  },
  cave: {
    id: "cave",
    name: "Cave",
    description: "Caves, rock shelters, grottos with cultural significance",
    color: "#92400e",
    icon: "cave",
  },
  underwater: {
    id: "underwater",
    name: "Underwater",
    description: "Submerged sites, sunken cities, underwater ruins",
    color: "#0891b2",
    icon: "underwater",
  },
  geoglyph: {
    id: "geoglyph",
    name: "Geoglyph",
    description: "Ground drawings, Nazca lines, effigies, and land art",
    color: "#f97316",
    icon: "geoglyph",
  },
  observatory: {
    id: "observatory",
    name: "Observatory",
    description: "Astronomical alignments, calendar sites, solar markers",
    color: "#3b82f6",
    icon: "observatory",
  },
  statue: {
    id: "statue",
    name: "Statue",
    description: "Monumental sculptures, moai, colossi, carved figures",
    color: "#ec4899",
    icon: "statue",
  },
  ruins: {
    id: "ruins",
    name: "Ruins",
    description: "General archaeological ruins and unspecified sites",
    color: "#a1a1aa",
    icon: "ruins",
  },
  unknown: {
    id: "unknown",
    name: "Unknown",
    description: "Unclassified or mysterious sites awaiting categorization",
    color: "#64748b",
    icon: "unknown",
  },
} as const;

export type SiteTypeId = keyof typeof SITE_TYPES;
export type SiteType = (typeof SITE_TYPES)[SiteTypeId];

// Array of all site types for dropdowns/selects
export const SITE_TYPE_LIST = Object.values(SITE_TYPES);

// Get site type by ID with fallback
export function getSiteType(id: string): SiteType {
  return SITE_TYPES[id as SiteTypeId] ?? SITE_TYPES.unknown;
}

// Normalize legacy text to site type ID
export function normalizeSiteType(legacyType: string): SiteTypeId {
  const normalized = legacyType.toLowerCase().trim();

  if (normalized.includes("pyramid")) return "pyramid";
  if (normalized.includes("temple") || normalized.includes("shrine") || normalized.includes("sanctuary")) return "temple";
  if (normalized.includes("circle") || normalized.includes("henge") || normalized.includes("ring")) return "stone_circle";
  if (normalized.includes("megalith") || normalized.includes("dolmen") || normalized.includes("menhir") || normalized.includes("standing")) return "megalith";
  if (normalized.includes("mound") || normalized.includes("tumulus") || normalized.includes("barrow") || normalized.includes("cairn")) return "mound";
  if (normalized.includes("tomb") || normalized.includes("burial") || normalized.includes("passage") || normalized.includes("crypt")) return "tomb";
  if (normalized.includes("wall") || normalized.includes("fort") || normalized.includes("citadel") || normalized.includes("hillfort")) return "fortress";
  if (normalized.includes("city") || normalized.includes("settlement") || normalized.includes("complex")) return "city";
  if (normalized.includes("cave") || normalized.includes("grotto") || normalized.includes("shelter")) return "cave";
  if (normalized.includes("underwater") || normalized.includes("submerged") || normalized.includes("sunken")) return "underwater";
  if (normalized.includes("geoglyph") || normalized.includes("nazca") || normalized.includes("lines") || normalized.includes("effigy")) return "geoglyph";
  if (normalized.includes("observ") || normalized.includes("astronomical") || normalized.includes("align")) return "observatory";
  if (normalized.includes("statue") || normalized.includes("moai") || normalized.includes("sculpture") || normalized.includes("coloss")) return "statue";
  if (normalized.includes("ruin")) return "ruins";

  return "unknown";
}

// Get color for a site type (legacy text or ID)
export function getSiteTypeColor(siteType: string): string {
  const typeId = normalizeSiteType(siteType);
  return SITE_TYPES[typeId].color;
}



