import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Svg, Defs, Pattern, Circle, Rect as SvgRect } from "react-native-svg";
import { useTheme } from "@/providers/ThemeProvider";

/**
 * Opaque per-page canvas for gradient themes: fills the screen with the
 * theme's canvas fade plus the dot texture, so each page paints its own
 * background and no underlying scene bleeds through. Renders null for
 * themes without a canvasGradient (they paint a solid cream instead).
 */
export default function ScreenBackground() {
  const { colors: Colors } = useTheme();
  if (!Colors.canvasGradient) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={Colors.canvasGradient}
        style={StyleSheet.absoluteFill}
      />
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="emeraldDotsPage" width="9" height="9" patternUnits="userSpaceOnUse">
            <Circle cx="2" cy="2" r="0.9" fill="#FFFFFF" fillOpacity="0.55" />
            <Circle cx="6.5" cy="6.5" r="0.7" fill="#0A3D24" fillOpacity="0.18" />
          </Pattern>
        </Defs>
        <SvgRect width="100%" height="100%" fill="url(#emeraldDotsPage)" opacity="0.5" />
      </Svg>
    </View>
  );
}
