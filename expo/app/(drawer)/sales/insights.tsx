import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TrendingUp, MapPin, Users, CalendarDays, DollarSign, Wallet } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLocations } from "@/providers/LocationsProvider";
import { useJobs } from "@/providers/JobsProvider";
import { STATUS_META, VisitStatus } from "@/types/location";
import { Job, formatMoney } from "@/types/job";
import DrawerMenuButton from "@/components/DrawerMenuButton";

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        {icon}
      </View>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function shortMonth(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short" });
}

export default function InsightsScreen() {
  const { locations, stats } = useLocations();
  const { jobs } = useJobs();

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

  const income = useMemo(() => {
    const now = new Date();
    const thisMonth = monthKey(now);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = monthKey(lastMonthDate);
    const year = now.getFullYear();

    let paidThisMonth = 0;
    let paidLastMonth = 0;
    let paidThisYear = 0;
    let outstanding = 0;
    const byMonth = new Map<string, number>();

    const completedOf = (j: Job): Date =>
      j.completedDate ? new Date(j.completedDate + "T12:00:00") : new Date(j.updatedAt);

    for (const j of jobs) {
      if (j.stage === "paid") {
        const d = completedOf(j);
        const mk = monthKey(d);
        byMonth.set(mk, (byMonth.get(mk) ?? 0) + j.amount);
        if (mk === thisMonth) paidThisMonth += j.amount;
        if (mk === lastMonth) paidLastMonth += j.amount;
        if (d.getFullYear() === year) paidThisYear += j.amount;
      }
      if (j.stage === "completed") {
        outstanding += j.amount;
      }
    }

    const months: { label: string; total: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: shortMonth(d), total: byMonth.get(monthKey(d)) ?? 0 });
    }

    return { paidThisMonth, paidLastMonth, paidThisYear, outstanding, months };
  }, [jobs]);

  const maxMonth = Math.max(1, ...income.months.map((m) => m.total));
  const hasAnyIncome = income.months.some((m) => m.total > 0);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <DrawerMenuButton />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Insights</Text>
            <Text style={styles.subtitle}>Your route at a glance</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <Stat
            icon={<MapPin size={16} color={Colors.navy} />}
            label="Locations"
            value={String(stats.total)}
          />
          <Stat
            icon={<CalendarDays size={16} color={Colors.navy} />}
            label="Visits (7d)"
            value={String(stats.thisWeek)}
          />
          <Stat
            icon={<TrendingUp size={16} color={Colors.navy} />}
            label="Visits (30d)"
            value={String(last30)}
          />
          <Stat
            icon={<Users size={16} color={Colors.navy} />}
            label="Total visits"
            value={String(stats.totalVisits)}
          />
        </View>

        <View style={[styles.card, styles.incomeCard]}>
          <Text style={styles.cardTitle}>Income</Text>
          <View style={{ gap: 14, marginTop: 16 }}>
            <View style={styles.incomeRow}>
              <View style={[styles.incomeIcon, { backgroundColor: "#DCFCE7" }]}>
                <DollarSign size={16} color="#117342" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.incomeLabel}>Paid this month</Text>
                <Text style={[styles.incomeValue, { color: "#117342" }]}>
                  {formatMoney(income.paidThisMonth)}
                </Text>
              </View>
            </View>
            <View style={styles.incomeRow}>
              <View style={[styles.incomeIcon, { backgroundColor: "#FEF3C7" }]}>
                <DollarSign size={16} color="#92400E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.incomeLabel}>Paid last month</Text>
                <Text style={[styles.incomeValue, { color: "#92400E" }]}>
                  {formatMoney(income.paidLastMonth)}
                </Text>
              </View>
            </View>
            <View style={styles.incomeRow}>
              <View style={[styles.incomeIcon, { backgroundColor: "#E0E7FF" }]}>
                <TrendingUp size={16} color="#0E1F3A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.incomeLabel}>Paid this year</Text>
                <Text style={[styles.incomeValue, { color: "#0E1F3A" }]}>
                  {formatMoney(income.paidThisYear)}
                </Text>
              </View>
            </View>
            <View style={styles.incomeRow}>
              <View style={[styles.incomeIcon, { backgroundColor: "#FEE2E2" }]}>
                <Wallet size={16} color={Colors.danger} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.incomeLabel}>Outstanding (completed, unpaid)</Text>
                <Text style={[styles.incomeValue, { color: Colors.danger }]}>
                  {formatMoney(income.outstanding)}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.chartTitle}>Paid income · last 12 months</Text>
          <View style={styles.chart}>
            {income.months.map((m, i) => {
              const h = Math.max(m.total > 0 ? 6 : 3, (m.total / maxMonth) * 96);
              const isLast = i === income.months.length - 1;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barValue}>
                    {m.total >= 1000 ? `${(m.total / 1000).toFixed(1)}k` : m.total > 0 ? Math.round(m.total) : ""}
                  </Text>
                  <View
                    style={[
                      styles.bar,
                      { height: h, backgroundColor: m.total > 0 ? (isLast ? "#117342" : Colors.amber) : Colors.line },
                    ]}
                  />
                  <Text style={[styles.barLabel, isLast && { color: Colors.ink, fontWeight: "700" }]}>
                    {m.label}
                  </Text>
                </View>
              );
            })}
          </View>
          {!hasAnyIncome ? (
            <Text style={styles.chartEmpty}>
              No paid jobs yet — mark a job as Paid to see income here.
            </Text>
          ) : null}
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
  headerRow: { flexDirection: "row", alignItems: "flex-start", gap: 4, marginBottom: 16, marginLeft: -8 },
  title: { fontSize: 28, fontWeight: "800", color: Colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: Colors.inkSoft, marginTop: 2 },
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
  incomeCard: { borderWidth: 2, borderColor: "#117342" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.ink },
  incomeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  incomeIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  incomeLabel: { fontSize: 12, color: Colors.inkSoft, fontWeight: "600" },
  incomeValue: { fontSize: 20, fontWeight: "800", marginTop: 2 },
  chartTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.inkMuted,
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 140,
  },
  barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 4 },
  bar: { width: "100%", borderRadius: 4 },
  barValue: { fontSize: 8, color: Colors.inkSoft, fontWeight: "600" },
  barLabel: { fontSize: 9, color: Colors.inkMuted },
  chartEmpty: { fontSize: 12, color: Colors.inkMuted, marginTop: 10 },
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
