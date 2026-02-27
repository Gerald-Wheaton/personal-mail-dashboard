export type ThemeId =
  | "midnight-gold"
  | "forest-noir"
  | "crimson-noir"
  | "ocean-depths"
  | "royal-amethyst"
  | "copper-dusk";

export interface Theme {
  id: ThemeId;
  label: string;
  description: string;
  /** OKLCH CSS color string shown as a preview swatch */
  primaryColor: string;
  bgColor: string;
}

export const THEMES: Theme[] = [
  {
    id: "midnight-gold",
    label: "Midnight Gold",
    description: "Deep blue night with amber highlights",
    primaryColor: "oklch(0.72 0.12 55)",
    bgColor: "oklch(0.14 0.01 255)",
  },
  {
    id: "forest-noir",
    label: "Forest Noir",
    description: "Dark forest depths with emerald glow",
    primaryColor: "oklch(0.72 0.2 145)",
    bgColor: "oklch(0.12 0.03 145)",
  },
  {
    id: "crimson-noir",
    label: "Crimson Noir",
    description: "Shadowy dark with crimson fire",
    primaryColor: "oklch(0.65 0.25 15)",
    bgColor: "oklch(0.13 0.02 15)",
  },
  {
    id: "ocean-depths",
    label: "Ocean Depths",
    description: "Abyssal navy with electric cyan",
    primaryColor: "oklch(0.72 0.16 195)",
    bgColor: "oklch(0.12 0.03 230)",
  },
  {
    id: "royal-amethyst",
    label: "Royal Amethyst",
    description: "Regal indigo with violet luminance",
    primaryColor: "oklch(0.68 0.22 290)",
    bgColor: "oklch(0.13 0.04 285)",
  },
  {
    id: "copper-dusk",
    label: "Copper Dusk",
    description: "Warm charcoal with molten copper",
    primaryColor: "oklch(0.66 0.14 52)",
    bgColor: "oklch(0.14 0.015 45)",
  },
];

export const DEFAULT_THEME: ThemeId = "midnight-gold";
