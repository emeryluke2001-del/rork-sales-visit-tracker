/**
 * Theme definitions for Sales Manager.
 *
 * Every screen reads colors through `useTheme()` (providers/ThemeProvider)
 * instead of the static palette, so the whole app can switch between
 * "Original" (cream paper look), "Midnight" (Walmart blue with red accents)
 * and "Emerald" (vivid green fading up into white, yellow accents).
 *
 * Token roles (kept identical across themes):
 * - cream      app background (canvas)
 * - paper      cards, sheets, inputs
 * - navyDeep   darkest surface (export hero, preview panel)
 * - navy       accent tint: icons, links, active tab/drawer tint, accent borders
 * - primary    primary button + active chip background
 * - onPrimary  text/icons sitting on `primary`, `navyDeep` or dark brand buttons
 * - brand      brand green used as a button/badge background
 * - brandText  brand green used as text/icon on `paper`
 * - ink        primary text on `paper`
 * - inkSoft    secondary text
 * - inkMuted   tertiary text
 * - line       hairline borders
 * - amber      chart/accent amber (used on `paper`)
 * - amberSoft  light amber (used on `navyDeep`)
 * - success    positive state
 * - danger     destructive state
 *
 * Optional per theme:
 * - canvasGradient  top-to-bottom gradient behind every screen. When present,
 *   `cream` is "transparent" so the root backdrop shows through.
 */
export type ThemeColors = {
  cream: string;
  paper: string;
  navyDeep: string;
  navy: string;
  primary: string;
  onPrimary: string;
  brand: string;
  brandText: string;
  ink: string;
  inkSoft: string;
  inkMuted: string;
  line: string;
  amber: string;
  amberSoft: string;
  success: string;
  danger: string;
  canvasGradient?: readonly [string, string, ...string[]];
};

/** The original cream/paper look. */
export const lightTheme: ThemeColors = {
  cream: "#FAF7F2",
  paper: "#FFFFFF",
  navyDeep: "#081327",
  navy: "#0E1F3A",
  primary: "#0E1F3A",
  onPrimary: "#FAF7F2",
  brand: "#117342",
  brandText: "#117342",
  ink: "#0F172A",
  inkSoft: "#475569",
  inkMuted: "#94A3B8",
  line: "#E5E1D8",
  amber: "#F59E0B",
  amberSoft: "#FCD34D",
  success: "#059669",
  danger: "#DC2626",
};

/** Midnight look: Walmart-blue canvas with red accents. */
export const midnightTheme: ThemeColors = {
  cream: "#0A3A69",
  paper: "#0F4A85",
  navyDeep: "#062B4F",
  navy: "#F97066",
  primary: "#D64545",
  onPrimary: "#FFF7F5",
  brand: "#22C55E",
  brandText: "#5EEA9E",
  ink: "#F0F6FC",
  inkSoft: "#C3D8EC",
  inkMuted: "#8FABC8",
  line: "#1F5C99",
  amber: "#FFC220",
  amberSoft: "#FCD34D",
  success: "#34D399",
  danger: "#FF6B6B",
};

/** Emerald look: deep-green canvas fading to vivid green at the bottom, yellow buttons. */
export const emeraldTheme: ThemeColors = {
  cream: "transparent",
  paper: "#12502E",
  navyDeep: "#062515",
  navy: "#F5A800",
  primary: "#FFC400",
  onPrimary: "#231A00",
  brand: "#FFB800",
  brandText: "#FFD24D",
  ink: "#F2FBF5",
  inkSoft: "#C2E3CF",
  inkMuted: "#84A992",
  line: "#1F6B41",
  amber: "#FFC400",
  amberSoft: "#FFE45C",
  success: "#34D399",
  danger: "#FF6B6B",
  canvasGradient: ["#0A3A22", "#0D5230", "#0F6B3C", "#11A052", "#00DC58"],
};

export type ThemeId = "original" | "midnight" | "emerald";

export const THEMES: { id: ThemeId; label: string; hint: string }[] = [
  { id: "original", label: "Original", hint: "Cream paper and navy" },
  { id: "midnight", label: "Midnight", hint: "Walmart blue and red" },
  { id: "emerald", label: "Emerald", hint: "Green fade, yellow buttons" },
];

export function getTheme(id: ThemeId): ThemeColors {
  if (id === "midnight") return midnightTheme;
  if (id === "emerald") return emeraldTheme;
  return lightTheme;
}
