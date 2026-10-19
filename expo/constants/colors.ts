const palette = {
  navy: "#0E1F3A",
  navyDeep: "#081327",
  amber: "#F59E0B",
  amberSoft: "#FCD34D",
  cream: "#FAF7F2",
  paper: "#FFFFFF",
  ink: "#0F172A",
  inkSoft: "#475569",
  inkMuted: "#94A3B8",
  line: "#E5E1D8",
  success: "#059669",
  danger: "#DC2626",
};

export default {
  ...palette,
  light: {
    text: palette.ink,
    background: palette.cream,
    tint: palette.navy,
    tabIconDefault: palette.inkMuted,
    tabIconSelected: palette.navy,
  },
};
