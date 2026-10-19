import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrendingUp, MapPin, Users, CalendarDays } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLocations } from "@/providers/LocationsProvider";
import { STATUS_META, VisitStatus } from "@/types/location";

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, accent ? { backgroundColor: accent } : null]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function InsightsScreen() {
  const { locations, stats } = useLocations();

  const last30 = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return locations.reduce(
      (acc, l) => acc + l.visits.filter((v) => new Date(v.date).getTime() > cutoff).length,
      0
    );
  }, [locations]);

  const topBusiest = useMemo(() => {
    return [...locations]
      .sort((a, b) => b.visits.length - a.visits.length)
      .slice(0, 5)
      .filter((l) => l.visits.length > 0);
  }, [locations]);

  const statuses: VisitStatus[] = ["prospect", "active", "closed", "cold"];
  const maxStatus = Math.max(1, ...statuses.map((s) => stats.byStatus[s]));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Your route at a glance</Text>

        <View style={styles.grid}>
          <Stat
            icon={<MapPin size={16} color={Colors.navy} />}
            label="Locations"
            value={String(stats.total)}
            accent={Colors.paper}
          />
          <Stat
            icon={<CalendarDays size={16} color={Colors.navy} />}
            label="Visits (7d)"
            value={String(stats.thisWeek)}
            accent={Colors.paper}
          />
          <Stat
            icon={<TrendingUp size={16} color={Colors.navy} />}
            label="Visits (30d)"
            value={String(last30)}
            accent={Colors.paper}
          />
          <Stat
            icon={<Users size={16} color={Colors.navy} />}
            label="Total visits"
            value={String(stats.totalVisits)}
            accent={Colors.paper}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pipeline breakdown</Text>
          <View style={{ gap: 14, marginTop: 16 }}>
            {statuses.map((s) => {
              const meta = STATUS_META[s];
              const count = stats.byStatus[s];
              const pct = count / maxStatus;
              return (
                <View key={s}>
                  <View style={styles.pipelineRow}>
                    <Text style={styles.pipelineLabel}>{meta.label}</Text>
                    <Text style={styles.pipelineCount}>{count}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${Math.max(4, pct * 100)}%`,
                          backgroundColor: meta.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Most visited</Text>
          {topBusiest.length === 0 ? (
            <Text style={styles.empty}>No visits logged yet.</Text>
          ) : (
            <View style={{ marginTop: 8 }}>
              {topBusiest.map((l, idx) => (
                <View key={l.id} style={styles.topRow}>
                  <Text style={styles.topIdx}>{idx + 1}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topName} numberOfLines={1}>
                      {l.businessName}
                    </Text>
                    {l.contactName ? (
                      <Text style={styles.topSub} numberOfLines={1}>
                        {l.contactName}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.topCount}>{l.visits.length}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: "800", color: Colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.inkSoft, marginTop: 4, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  stat: {
    flexGrow: 1,
    flexBasis: "45%",
    backgroundColor: Colors.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: Colors.cream,
  },
  statValue: { fontSize: 24, fontWeight: "800", color: Colors.ink },
  statLabel: { fontSize: 12, color: Colors.inkSoft, marginTop: 2 },
  card: {
    backgroundColor: Colors.paper,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.ink },
  pipelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  pipelineLabel: { fontSize: 13, color: Colors.inkSoft, fontWeight: "600" },
  pipelineCount: { fontSize: 13, color: Colors.ink, fontWeight: "700" },
  barTrack: {
    height: 8,
    backgroundColor: Colors.cream,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  empty: { fontSize: 14, color: Colors.inkMuted, marginTop: 12 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  topIdx: {
    width: 22,
    fontSize: 13,
    fontWeight: "800",
    color: Colors.amber,
  },
  topName: { fontSize: 14, fontWeight: "600", color: Colors.ink },
  topSub: { fontSize: 12, color: Colors.inkSoft, marginTop: 2 },
  topCount: { fontSize: 14, fontWeight: "700", color: Colors.navy },
});
