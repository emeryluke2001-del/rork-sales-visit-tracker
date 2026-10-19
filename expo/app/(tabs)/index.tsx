import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Clock,
  SlidersHorizontal,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLocations } from "@/providers/LocationsProvider";
import { Location, STATUS_META, VisitStatus } from "@/types/location";
import * as Haptics from "expo-haptics";

const FILTERS: { key: "all" | VisitStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "prospect", label: "Prospect" },
  { key: "active", label: "Active" },
  { key: "closed", label: "Closed" },
  { key: "cold", label: "Cold" },
];

function formatRelative(iso?: string): string {
  if (!iso) return "Not visited";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function LocationCard({ item, onPress }: { item: Location; onPress: () => void }) {
  const meta = STATUS_META[item.status];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      testID={`location-card-${item.id}`}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.businessName}
          </Text>
          {item.contactName ? (
            <Text style={styles.cardContact} numberOfLines={1}>
              {item.contactName}
            </Text>
          ) : null}
        </View>
        <View style={[styles.badge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      {item.address ? (
        <View style={styles.row}>
          <MapPin size={13} color={Colors.inkMuted} />
          <Text style={styles.rowText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      ) : null}

      {item.contactPhone ? (
        <View style={styles.row}>
          <Phone size={13} color={Colors.inkMuted} />
          <Text style={styles.rowText} numberOfLines={1}>
            {item.contactPhone}
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.row}>
          <Clock size={13} color={Colors.inkMuted} />
          <Text style={styles.footerText}>{formatRelative(item.lastVisited)}</Text>
        </View>
        <Text style={styles.footerText}>
          {item.visits.length} visit{item.visits.length === 1 ? "" : "s"}
        </Text>
      </View>
    </Pressable>
  );
}

export default function LocationsScreen() {
  const { locations, stats } = useLocations();
  const [query, setQuery] = useState<string>("");
  const [filter, setFilter] = useState<"all" | VisitStatus>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return locations.filter((l) => {
      if (filter !== "all" && l.status !== filter) return false;
      if (!q) return true;
      return (
        l.businessName.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.contactName.toLowerCase().includes(q) ||
        l.notes.toLowerCase().includes(q) ||
        l.tags.join(" ").toLowerCase().includes(q)
      );
    });
  }, [locations, query, filter]);

  const onAdd = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    router.push("/location/new");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Route Log</Text>
          <Text style={styles.subhello}>
            {stats.total} location{stats.total === 1 ? "" : "s"} · {stats.thisWeek} visit
            {stats.thisWeek === 1 ? "" : "s"} this week
          </Text>
        </View>
        <Pressable
          onPress={onAdd}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
          testID="add-location-button"
        >
          <Plus size={20} color={Colors.cream} strokeWidth={2.5} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Search size={16} color={Colors.inkMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search businesses, contacts, notes"
          placeholderTextColor={Colors.inkMuted}
          style={styles.searchInput}
          testID="search-input"
        />
      </View>

      <View style={styles.filterRow}>
        <SlidersHorizontal size={14} color={Colors.inkSoft} />
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(i) => i.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 16 }}
          renderItem={({ item }) => {
            const active = filter === item.key;
            return (
              <Pressable
                onPress={() => setFilter(item.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <LocationCard
            item={item}
            onPress={() => router.push(`/location/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MapPin size={28} color={Colors.navy} />
            </View>
            <Text style={styles.emptyTitle}>
              {locations.length === 0 ? "No locations yet" : "Nothing matches"}
            </Text>
            <Text style={styles.emptyText}>
              {locations.length === 0
                ? "Tap the + button to add your first stop on the route."
                : "Try a different search or filter."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  hello: { fontSize: 28, fontWeight: "800", color: Colors.ink, letterSpacing: -0.5 },
  subhello: { fontSize: 13, color: Colors.inkSoft, marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.navy,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.navy,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  searchWrap: {
    marginHorizontal: 20,
    backgroundColor: Colors.paper,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.ink,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {}),
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 20,
    paddingVertical: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  chipActive: { backgroundColor: Colors.navy, borderColor: Colors.navy },
  chipText: { fontSize: 13, color: Colors.inkSoft, fontWeight: "600" },
  chipTextActive: { color: Colors.cream },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  card: {
    backgroundColor: Colors.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: Colors.ink },
  cardContact: { fontSize: 13, color: Colors.inkSoft, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowText: { fontSize: 13, color: Colors.inkSoft, flex: 1 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  footerText: { fontSize: 12, color: Colors.inkMuted, fontWeight: "500" },
  empty: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: Colors.ink, marginBottom: 6 },
  emptyText: { fontSize: 14, color: Colors.inkSoft, textAlign: "center", lineHeight: 20 },
});
