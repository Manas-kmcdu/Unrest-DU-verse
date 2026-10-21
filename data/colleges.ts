// Single source of truth for the College Wall and /colleges/[slug] pages.
// After any edit run:  node scripts/build-colleges.mjs
// That regenerates assets/colleges-data.js (used by the browser) and every colleges/<slug>/index.html.

export type Campus = "North" | "South";

/** Built-in line-art SVG key, OR a path/URL to a custom image (contains "/" or "."). */
export type BuildingIllustration =
  | "dome"
  | "clock"
  | "arches"
  | "columns"
  | "gate"
  | "tower"
  | "modern"
  | "chhatri"
  | "gothic"
  | (string & {});

export interface College {
  slug: string;
  name: string;
  shortName: string;
  campus: Campus;
  buildingIllustration: BuildingIllustration;
  accentColour: string;
  /** PLACEHOLDER, replace with real counts */
  userCount: number;
  /** Optional. A short paragraph about the college community, shown on /colleges/[slug]. Falls back to a generic line. Only write facts you can stand behind. */
  about?: string;
}

// PLACEHOLDER, replace with real counts.
// userCount values below are seeded, randomised between 40 and 84.
// To go live: delete userCount here and fetch real counts via getCollegeCounts() below.
export const COLLEGES: College[] = [
  { slug: "hindu", name: "Hindu College", shortName: "Hindu", campus: "North", buildingIllustration: "dome", accentColour: "#E29083", userCount: 60 },
  { slug: "kmc", name: "Kirori Mal College", shortName: "KMC", campus: "North", buildingIllustration: "arches", accentColour: "#E2AF83", userCount: 49 },
  { slug: "ramjas", name: "Ramjas College", shortName: "Ramjas", campus: "North", buildingIllustration: "clock", accentColour: "#E2CF83", userCount: 65 },
  { slug: "stephens", name: "St. Stephen's College", shortName: "St. Stephen's", campus: "North", buildingIllustration: "gothic", accentColour: "#E28393", userCount: 81 },
  { slug: "miranda", name: "Miranda House", shortName: "Miranda", campus: "North", buildingIllustration: "gothic", accentColour: "#E283B3", userCount: 43 },
  { slug: "hansraj", name: "Hansraj College", shortName: "Hansraj", campus: "North", buildingIllustration: "columns", accentColour: "#83AFE2", userCount: 44 },
  { slug: "srcc", name: "Shri Ram College of Commerce", shortName: "SRCC", campus: "North", buildingIllustration: "tower", accentColour: "#A683E2", userCount: 74 },
  { slug: "khalsa", name: "Guru Tegh Bahadur Khalsa College", shortName: "Khalsa", campus: "North", buildingIllustration: "gate", accentColour: "#E2BF83", userCount: 46 },
  { slug: "daulat-ram", name: "Daulat Ram College", shortName: "Daulat Ram", campus: "North", buildingIllustration: "clock", accentColour: "#83E2DF", userCount: 63 },
  { slug: "gargi", name: "Gargi College", shortName: "Gargi", campus: "South", buildingIllustration: "chhatri", accentColour: "#E283E2", userCount: 77 },
  { slug: "lsr", name: "Lady Shri Ram College for Women", shortName: "LSR", campus: "South", buildingIllustration: "columns", accentColour: "#E283A3", userCount: 43 },
  { slug: "venky", name: "Sri Venkateswara College", shortName: "Venky", campus: "South", buildingIllustration: "tower", accentColour: "#83E2B3", userCount: 72 },
  { slug: "jmc", name: "Jesus and Mary College", shortName: "Jesus & Mary", campus: "South", buildingIllustration: "dome", accentColour: "#8393E2", userCount: 53 },
  { slug: "deshbandhu", name: "Deshbandhu College", shortName: "Deshbandhu", campus: "South", buildingIllustration: "gate", accentColour: "#A3E283", userCount: 42 },
  { slug: "sri-aurobindo", name: "Sri Aurobindo College", shortName: "Aurobindo", campus: "South", buildingIllustration: "modern", accentColour: "#83CAE2", userCount: 45 },
  { slug: "maitreyi", name: "Maitreyi College", shortName: "Maitreyi", campus: "South", buildingIllustration: "chhatri", accentColour: "#C283E2", userCount: 67 },
  { slug: "motilal-nehru", name: "Motilal Nehru College", shortName: "MNC", campus: "South", buildingIllustration: "modern", accentColour: "#E2A083", userCount: 66 },
  { slug: "aryabhatta", name: "Aryabhatta College", shortName: "Aryabhatta", campus: "South", buildingIllustration: "arches", accentColour: "#83E28B", userCount: 44 },
];

export const getCollege = (slug: string): College | undefined =>
  COLLEGES.find((c) => c.slug === slug);

export const getCollegesByCampus = (campus: Campus | "All"): College[] =>
  campus === "All" ? COLLEGES : COLLEGES.filter((c) => c.campus === campus);

/**
 * Swap point for real data. Replace the body with a fetch to your backend
 * (e.g. Firestore count per college) and return { [slug]: count }.
 * The College Wall reads counts through this shape, so no UI change is needed.
 */
export async function getCollegeCounts(): Promise<Record<string, number>> {
  return Object.fromEntries(COLLEGES.map((c) => [c.slug, c.userCount]));
}
