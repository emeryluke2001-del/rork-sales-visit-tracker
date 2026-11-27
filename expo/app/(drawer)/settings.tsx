import { router } from "expo-router";
import {
  Check,
  ChevronRight,
  Moon,
  Shield,
  Sprout,
  Sun,
} from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { THEMES, getTheme, type ThemeColors, type ThemeId } from "@/constants/theme";
import { useTheme } from "@/providers/ThemeProvider";
import DrawerMenuButton from "@/components/DrawerMenuButton";
import ScreenBackground from "@/components/ScreenBackground";

function ThemeSwatch({ colors }: { colors: ThemeColors }) {
  return (
    <View style={styles.swatchRow}>
      {[colors.cream, colors.paper, colors.navy, colors.primary, colors.brand].map(
        (c, i) =>
          i === 0 && colors.canvasGradient ? (
            <LinearGradient
              key={i}
              colors={colors.canvasGradient}
              style={styles.swatch}
            />
          ) : (
            <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
          )
      )}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors: Colors, themeId, setThemeId } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: Colors.cream }]}>
      <ScreenBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <DrawerMenuButton />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: Colors.ink }]}>Settings</Text>
            <Text style={[styles.subtitle, { color: Colors.inkSoft }]}>Theme and app info</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: Colors.inkSoft }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: Colors.paper, borderColor: Colors.line }]}>
          {THEMES.map((theme, index) => {
            const selected = themeId === theme.id;
            return (
              <Pressable
                key={theme.id}
                onPress={() => setThemeId(theme.id as ThemeId)}
                style={[
                  styles.themeRow,
                  index < THEMES.length - 1
                    ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.line }
                    : null,
                ]}
                testID={`theme-option-${theme.id}`}
              >
                <View
                  style={[
                    styles.themeIcon,
                    { backgroundColor: selected ? Colors.brand : Colors.cream },
                  ]}
                >
                  {theme.id === "midnight" ? (
                    <Moon size={18} color={selected ? Colors.onPrimary : Colors.navy} />
                  ) : theme.id === "emerald" ? (
                    <Sprout size={18} color={selected ? Colors.onPrimary : Colors.navy} />
                  ) : (
                    <Sun size={18} color={selected ? Colors.onPrimary : Colors.navy} />
                  )}
                </View>
                <View style={styles.themeInfo}>
                  <Text style={[styles.themeLabel, { color: Colors.ink }]}>{theme.label}</Text>
                  <Text style={[styles.themeHint, { color: Colors.inkMuted }]}>{theme.hint}</Text>
                  <ThemeSwatch colors={getTheme(theme.id)} />
                </View>
                <View
                  style={[
                    styles.radio,
                    {
                      borderColor: selected ? Colors.brand : Colors.line,
                      backgroundColor: selected ? Colors.brand : "transparent",
                    },
                  ]}
                >
                  {selected ? <Check size={14} color={Colors.onPrimary} strokeWidth={3} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: Colors.inkSoft }]}>About</Text>
        <View style={[styles.card, { backgroundColor: Colors.paper, borderColor: Colors.line }]}>
          <Pressable
            onPress={() => router.push("/privacy")}
            style={styles.linkRow}
            testID="settings-privacy-link"
          >
            <View style={[styles.linkIcon, { backgroundColor: "rgba(17,115,66,0.10)" }]}>
              <Shield size={18} color={Colors.brandText} />
            </View>
            <Text style={[styles.linkLabel, { color: Colors.ink }]}>Privacy Policy</Text>
            <ChevronRight size={18} color={Colors.inkMuted} />
          </Pressable>
        </View>
        <Text style={[styles.footer, { color: Colors.inkMuted }]}>
          Sales Manager keeps everything on this device. No account, no cloud.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: -8,
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 12, marginTop: 2 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  themeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  themeInfo: { flex: 1, gap: 2 },
  themeLabel: { fontSize: 15, fontWeight: "700" },
  themeHint: { fontSize: 12, marginBottom: 6 },
  swatchRow: { flexDirection: "row", gap: 4 },
  swatch: { width: 22, height: 14, borderRadius: 4 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  linkLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
  footer: { fontSize: 12, textAlign: "center", marginTop: 16 },
});
