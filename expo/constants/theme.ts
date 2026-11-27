/**
 * Theme definitions for Sales Manager.
 *
 * Every screen reads colors through `useTheme()` (providers/ThemeProvider)
 * instead of the static palette, so the whole app can switch between
 * "Original" (cream paper look) and "Midnight" (medium dark blue look).
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

/** Medium dark blue look: dark blue canvas, light text, tuned accents. */
export const midnightTheme: ThemeColors = {
  cream: "#1A3055",
  paper: "#24406B",
  navyDeep: "#122544",
  navy: "#9DBCF2",
  primary: "#2E5FAE",
  onPrimary: "#F2F6FF",
  brand: "#16A34A",
  brandText: "#4ADE80",
  ink: "#E9EFFA",
  inkSoft: "#B7C6E4",
  inkMuted: "#8195BD",
  line: "#31497A",
  amber: "#FBBF24",
  amberSoft: "#FCD34D",
  success: "#34D399",
  danger: "#F87171",
};

export type ThemeId = "original" | "midnight";

export const THEMES: { id: ThemeId; label: string; hint: string }[] = [
  { id: "original", label: "Original", hint: "Cream paper and navy" },
  { id: "midnight", label: "Midnight", hint: "Medium dark blue" },
];

export function getTheme(id: ThemeId): ThemeColors {
  return id === "midnight" ? midnightTheme : lightTheme;
}
