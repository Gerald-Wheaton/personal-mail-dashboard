export type ThemeId =
  // Dark themes
  | "midnight-gold"
  | "forest-noir"
  | "crimson-noir"
  | "ocean-depths"
  | "royal-amethyst"
  | "copper-dusk"
  // Light themes
  | "shadcn-classic"
  | "soft-rose"
  | "sky"
  | "sage"
  | "lavender"
  | "warm-sand";

export interface Theme {
  id: ThemeId;
  label: string;
  description: string;
  /** OKLCH CSS color string shown as a preview swatch */
  primaryColor: string;
  bgColor: string;
  dark: boolean;
}

export const THEMES: Theme[] = [
  // ── Dark ──────────────────────────────────────────────
  {
    id: "midnight-gold",
    label: "Midnight Gold",
    description: "Deep blue night with amber highlights",
    primaryColor: "oklch(0.72 0.12 55)",
    bgColor: "oklch(0.14 0.01 255)",
    dark: true,
  },
  {
    id: "forest-noir",
    label: "Forest Noir",
    description: "Dark forest depths with emerald glow",
    primaryColor: "oklch(0.72 0.2 145)",
    bgColor: "oklch(0.12 0.03 145)",
    dark: true,
  },
  {
    id: "crimson-noir",
    label: "Crimson Noir",
    description: "Shadowy dark with crimson fire",
    primaryColor: "oklch(0.65 0.25 15)",
    bgColor: "oklch(0.13 0.02 15)",
    dark: true,
  },
  {
    id: "ocean-depths",
    label: "Ocean Depths",
    description: "Abyssal navy with electric cyan",
    primaryColor: "oklch(0.72 0.16 195)",
    bgColor: "oklch(0.12 0.03 230)",
    dark: true,
  },
  {
    id: "royal-amethyst",
    label: "Royal Amethyst",
    description: "Regal indigo with violet luminance",
    primaryColor: "oklch(0.68 0.22 290)",
    bgColor: "oklch(0.13 0.04 285)",
    dark: true,
  },
  {
    id: "copper-dusk",
    label: "Copper Dusk",
    description: "Warm charcoal with molten copper",
    primaryColor: "oklch(0.66 0.14 52)",
    bgColor: "oklch(0.14 0.015 45)",
    dark: true,
  },
  // ── Light ─────────────────────────────────────────────
  {
    id: "shadcn-classic",
    label: "Shadcn Classic",
    description: "Clean black & white, shadcn default",
    primaryColor: "oklch(0.205 0 0)",
    bgColor: "oklch(1 0 0)",
    dark: false,
  },
  {
    id: "soft-rose",
    label: "Soft Rose",
    description: "Blush white with rose-red accents",
    primaryColor: "oklch(0.56 0.22 12)",
    bgColor: "oklch(0.985 0.005 10)",
    dark: false,
  },
  {
    id: "sky",
    label: "Sky",
    description: "Airy light blue with deep navy primary",
    primaryColor: "oklch(0.5 0.18 232)",
    bgColor: "oklch(0.97 0.015 222)",
    dark: false,
  },
  {
    id: "sage",
    label: "Sage",
    description: "Soft green with earthy forest primary",
    primaryColor: "oklch(0.48 0.15 150)",
    bgColor: "oklch(0.97 0.015 148)",
    dark: false,
  },
  {
    id: "lavender",
    label: "Lavender",
    description: "Dreamy purple haze with violet primary",
    primaryColor: "oklch(0.52 0.22 290)",
    bgColor: "oklch(0.97 0.015 290)",
    dark: false,
  },
  {
    id: "warm-sand",
    label: "Warm Sand",
    description: "Toasty beige with amber warmth",
    primaryColor: "oklch(0.55 0.14 55)",
    bgColor: "oklch(0.975 0.015 75)",
    dark: false,
  },
];

export const DEFAULT_THEME: ThemeId = "midnight-gold";
