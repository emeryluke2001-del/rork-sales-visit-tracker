import React, { useMemo } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import {
  Phone,
  Mail,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Navigation,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLocationById, useLocations } from "@/providers/LocationsProvider";
import { STATUS_META } from "@/types/location";

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const location = useLocationById(id);
  const { deleteLocation, deleteVisit } = useLocations();

  const meta = useMemo(
    () => (location ? STATUS_META[location.status] : null),
    [location]
  );

  if (!location || !meta) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Location not found</Text>
      </View>
    );
  }

  const openMaps = () => {
    const q = encodeURIComponent(location.address || location.businessName);
    const url = Platform.select({
      ios: `http://maps.apple.com/?q=${q}`,
      android: `geo:0,0?q=${q}`,
      default: `https://maps.google.com/?q=${q}`,
    });
    if (url) Linking.openURL(url).catch(() => {});
  };

  const callPhone = () => {
    if (!location.contactPhone) return;
    Linking.openURL(`tel:${location.contactPhone}`).catch(() => {});
  };

  const email = () => {
    if (!location.contactEmail) return;
    Linking.openURL(`mailto:${location.contactEmail}`).catch(() => {});
  };

  const confirmDelete = () => {
    Alert.alert("Delete location?", `${location.businessName} will be removed permanently.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteLocation(location.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: location.businessName,
          headerRight: () => (
            <Pressable
              onPress={() => router.push(`/location/edit/${location.id}`)}
              hitSlop={12}
              style={{ marginRight: 6 }}
              testID="edit-location"
            >
              <Pencil size={19} color={Colors.navy} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.cream }}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={[styles.badge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={styles.heroName}>{location.businessName}</Text>
          {location.contactName ? (
            <Text style={styles.heroContact}>{location.contactName}</Text>
          ) : null}

          {location.tags.length > 0 ? (
            <View style={styles.tagsRow}>
              {location.tags.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>#{t}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.quickRow}>
          <QuickBtn
            icon={<Phone size={18} color={Colors.navy} />}
            label="Call"
            onPress={callPhone}
            disabled={!location.contactPhone}
          />
          <QuickBtn
            icon={<Mail size={18} color={Colors.navy} />}
            label="Email"
            onPress={email}
            disabled={!location.contactEmail}
          />
          <QuickBtn
            icon={<Navigation size={18} color={Colors.navy} />}
            label="Directions"
            onPress={openMaps}
            disabled={!location.address}
          />
        </View>

        {(location.address || location.contactPhone || location.contactEmail) && (
          <View style={styles.card}>
            {location.address ? (
              <Pressable style={styles.detailRow} onPress={openMaps}>
                <MapPin size={16} color={Colors.inkSoft} />
                <Text style={styles.detailText}>{location.address}</Text>
              </Pressable>
            ) : null}
            {location.contactPhone ? (
              <Pressable style={styles.detailRow} onPress={callPhone}>
                <Phone size={16} color={Colors.inkSoft} />
                <Text style={styles.detailText}>{location.contactPhone}</Text>
              </Pressable>
            ) : null}
            {location.contactEmail ? (
              <Pressable style={styles.detailRow} onPress={email}>
                <Mail size={16} color={Colors.inkSoft} />
                <Text style={styles.detailText}>{location.contactEmail}</Text>
              </Pressable>
            ) : null}
          </View>
        )}

        {location.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>NOTES</Text>
            <Text style={styles.notesText}>{location.notes}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.visitHeader}>
            <Text style={styles.cardLabel}>VISIT HISTORY · {location.visits.length}</Text>
            <Pressable
              onPress={() => router.push(`/visit/new?id=${location.id}`)}
              style={styles.addVisitBtn}
              testID="add-visit"
            >
              <Plus size={14} color={Colors.cream} strokeWidth={2.5} />
              <Text style={styles.addVisitText}>Log visit</Text>
            </Pressable>
          </View>
          {location.visits.length === 0 ? (
            <View style={styles.emptyVisits}>
              <Calendar size={18} color={Colors.inkMuted} />
              <Text style={styles.emptyVisitsText}>
                No visits yet. Log your first stop here.
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 4 }}>
              {location.visits.map((v) => (
                <View key={v.id} style={styles.visitRow}>
                  <View style={styles.dot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.visitDate}>{formatFullDate(v.date)}</Text>
                    {v.note ? <Text style={styles.visitNote}>{v.note}</Text> : null}
                  </View>
                  <Pressable
                    onPress={() =>
                      Alert.alert("Delete visit?", undefined, [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () => deleteVisit(location.id, v.id),
                        },
                      ])
                    }
                    hitSlop={10}
                  >
                    <Trash2 size={15} color={Colors.inkMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable onPress={confirmDelete} style={styles.deleteBtn} testID="delete-location">
          <Trash2 size={16} color={Colors.danger} />
          <Text style={styles.deleteText}>Delete location</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

function QuickBtn({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.quickBtn,
        disabled && { opacity: 0.4 },
        pressed && { opacity: 0.85 },
      ]}
    >
      {icon}
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60, gap: 14 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.cream },
  notFoundText: { color: Colors.inkSoft },
  hero: {
    backgroundColor: Colors.paper,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  badgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  heroName: { fontSize: 22, fontWeight: "800", color: Colors.ink, letterSpacing: -0.3 },
  heroContact: { fontSize: 14, color: Colors.inkSoft, marginTop: 4 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.cream,
    borderRadius: 10,
  },
  tagText: { fontSize: 11, color: Colors.inkSoft, fontWeight: "600" },
  quickRow: { flexDirection: "row", gap: 10 },
  quickBtn: {
    flex: 1,
    backgroundColor: Colors.paper,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 6,
  },
  quickLabel: { fontSize: 12, color: Colors.navy, fontWeight: "700" },
  card: {
    backgroundColor: Colors.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.inkMuted,
    letterSpacing: 1,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  detailText: { flex: 1, fontSize: 14, color: Colors.ink },
  notesText: { fontSize: 14, color: Colors.ink, lineHeight: 21 },
  visitHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  addVisitBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.navy,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addVisitText: { color: Colors.cream, fontSize: 12, fontWeight: "700" },
  emptyVisits: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  emptyVisitsText: { fontSize: 13, color: Colors.inkMuted },
  visitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.amber,
    marginTop: 6,
  },
  visitDate: { fontSize: 13, color: Colors.ink, fontWeight: "600" },
  visitNote: { fontSize: 13, color: Colors.inkSoft, marginTop: 3, lineHeight: 19 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  deleteText: { color: Colors.danger, fontSize: 14, fontWeight: "700" },
});
