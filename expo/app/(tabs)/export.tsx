import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Copy,
  FileSpreadsheet,
  Share2,
  Check,
  ExternalLink,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useLocations } from "@/providers/LocationsProvider";
import { locationsToCSV } from "@/utils/csv";

export default function ExportScreen() {
  const { locations } = useLocations();
  const [copied, setCopied] = useState<boolean>(false);

  const csv = useMemo(() => locationsToCSV(locations), [locations]);
  const preview = useMemo(() => {
    const lines = csv.split("\n").slice(0, 6);
    return lines.join("\n");
  }, [csv]);

  const hapticLight = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
  };

  const onCopy = async () => {
    hapticLight();
    try {
      await Clipboard.setStringAsync(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.log("[export] copy error", e);
      Alert.alert("Copy failed", "Could not copy CSV to clipboard.");
    }
  };

  const onShare = async () => {
    hapticLight();
    try {
      if (Platform.OS === "web") {
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `route-log-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
      const filename = `route-log-${new Date().toISOString().slice(0, 10)}.csv`;
      const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? "";
      const uri = dir + filename;
      await FileSystem.writeAsStringAsync(uri, csv);
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(uri, {
          mimeType: "text/csv",
          dialogTitle: "Export to Google Sheets",
          UTI: "public.comma-separated-values-text",
        });
      } else {
        Alert.alert("Not available", "Sharing is not available on this device.");
      }
    } catch (e) {
      console.log("[export] share error", e);
      Alert.alert("Export failed", "Could not create CSV file.");
    }
  };

  const onOpenSheets = async () => {
    hapticLight();
    try {
      if (Platform.OS === "web") {
        window.open("https://sheets.new", "_blank");
      } else {
        const { Linking } = await import("react-native");
        await Linking.openURL("https://sheets.new");
      }
    } catch (e) {
      console.log("[export] open sheets error", e);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Export</Text>
        <Text style={styles.subtitle}>
          {locations.length} location{locations.length === 1 ? "" : "s"} ready to send to Google
          Sheets
        </Text>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <FileSpreadsheet size={26} color={Colors.amber} />
          </View>
          <Text style={styles.heroTitle}>CSV · Google Sheets compatible</Text>
          <Text style={styles.heroText}>
            Export every business, contact, status, notes, and visit count. Paste directly into a
            new Google Sheet or share the file from your device.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onCopy}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}
            disabled={locations.length === 0}
            testID="copy-csv"
          >
            {copied ? (
              <Check size={18} color={Colors.cream} strokeWidth={2.5} />
            ) : (
              <Copy size={18} color={Colors.cream} strokeWidth={2.5} />
            )}
            <Text style={styles.primaryBtnText}>
              {copied ? "Copied to clipboard" : "Copy CSV"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onShare}
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.9 }]}
            disabled={locations.length === 0}
            testID="share-csv"
          >
            <Share2 size={18} color={Colors.navy} strokeWidth={2.5} />
            <Text style={styles.secondaryBtnText}>
              {Platform.OS === "web" ? "Download CSV" : "Share as file"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onOpenSheets}
            style={({ pressed }) => [styles.linkBtn, pressed && { opacity: 0.85 }]}
          >
            <ExternalLink size={14} color={Colors.inkSoft} />
            <Text style={styles.linkBtnText}>Open a blank Google Sheet (sheets.new)</Text>
          </Pressable>
        </View>

        <View style={styles.steps}>
          <Text style={styles.stepsTitle}>How to send to Google Sheets</Text>
          <Step n={1} text="Tap Copy CSV above." />
          <Step n={2} text="Open sheets.new (or any sheet)." />
          <Step
            n={3}
            text="Click cell A1, paste, then choose File → Import → Split text to columns (comma)."
          />
        </View>

        <View style={styles.previewWrap}>
          <Text style={styles.previewLabel}>Preview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={styles.previewText}>
              {locations.length === 0
                ? "Add a location first to see your CSV export."
                : preview}
            </Text>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: "800", color: Colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.inkSoft, marginTop: 4, marginBottom: 20 },
  hero: {
    backgroundColor: Colors.navy,
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(245,158,11,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  heroTitle: { fontSize: 17, fontWeight: "700", color: Colors.cream },
  heroText: {
    fontSize: 13,
    color: "rgba(250,247,242,0.75)",
    marginTop: 6,
    lineHeight: 19,
  },
  actions: { gap: 10, marginBottom: 20 },
  primaryBtn: {
    backgroundColor: Colors.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
  },
  primaryBtnText: { color: Colors.cream, fontSize: 15, fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
  },
  secondaryBtnText: { color: Colors.navy, fontSize: 15, fontWeight: "700" },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  linkBtnText: { fontSize: 13, color: Colors.inkSoft, fontWeight: "600" },
  steps: {
    backgroundColor: Colors.paper,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 20,
    gap: 12,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.ink,
    marginBottom: 4,
  },
  stepRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.amber,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: { fontSize: 11, fontWeight: "800", color: Colors.navyDeep },
  stepText: { flex: 1, fontSize: 13, color: Colors.inkSoft, lineHeight: 19 },
  previewWrap: {
    backgroundColor: Colors.navyDeep,
    borderRadius: 16,
    padding: 16,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.amberSoft,
    letterSpacing: 1,
    marginBottom: 10,
  },
  previewText: {
    fontSize: 11,
    color: "rgba(250,247,242,0.85)",
    fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
    lineHeight: 16,
  },
});
