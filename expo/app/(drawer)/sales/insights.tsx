import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TrendingUp,
  MapPin,
  Users,
  CalendarDays,
  DollarSign,
  Wallet,
  ChevronDown,
  ChevronUp,
  NotebookPen,
} from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import type { ThemeColors } from "@/constants/theme";
import { useLocations } from "@/providers/LocationsProvider";
import { useJobs } from "@/providers/JobsProvider";
import { useDayNotes } from "@/providers/DayNotesProvider";
import { STATUS_META, VisitStatus } from "@/types/location";
import { Job, formatMoney } from "@/types/job";
import DrawerMenuButton from "@/components/DrawerMenuButton";
import DayNoteModal, { dayKeyLocal, dayLabel } from "@/components/DayNoteModal";
import ScreenBackground from "@/components/ScreenBackground";

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const { colors: Colors } = useTheme();
  const styles = makeStyles(Colors);
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

interface DayRow {
  key: string;
  visits: number;
  jobs: number;
  paid: number;
}

export default function InsightsScreen() {
  const { colors: Colors } = useTheme();
  const styles = makeStyles(Colors);
  const { locations, stats } = useLocations();
  const { jobs } = useJobs();
  const { notes, setDayNote } = useDayNotes();
  const [reportOpen, setReportOpen] = useState<boolean>(false);
  const [noteDay, setNoteDay] = useState<string | null>(null);

  const last30 = useMemo(() => {
    const cutoff = new Date().getTime() - 30 * 24 * 60 * 60 * 1000;
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

  const dayRows = useMemo<DayRow[]>(() => {
    const map = new Map<string, DayRow>();
    const bump = (key: string): DayRow => {
      let row = map.get(key);
      if (!row) {
        row = { key, visits: 0, jobs: 0, paid: 0 };
        map.set(key, row);
      }
      return row;
    };
    for (const l of locations) {
      for (const v of l.visits) {
        const d = new Date(v.date);
        if (!isNaN(d.getTime())) bump(dayKeyLocal(d)).visits += 1;
      }
    }
    for (const j of jobs) {
      if (j.stage !== "completed" && j.stage !== "paid") continue;
      const src = j.completedDate
        ? new Date(j.completedDate + "T12:00:00")
        : new Date(j.updatedAt);
      if (isNaN(src.getTime())) continue;
      const row = bump(dayKeyLocal(src));
      row.jobs += 1;
      if (j.stage === "paid") row.paid += j.amount;
    }
    return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1));
  }, [locations, jobs]);

  const summaryFor = (key: string): string => {
    const r = dayRows.find((d) => d.key === key);
    if (!r) return "No activity recorded";
    const bits: string[] = [];
    if (r.visits) bits.push(`${r.visits} visit${r.visits === 1 ? "" : "s"}`);
    if (r.jobs) bits.push(`${r.jobs} job${r.jobs === 1 ? "" : "s"} done`);
    if (r.paid > 0) bits.push(`${formatMoney(r.paid)} paid`);
    return bits.length > 0 ? bits.join(" · ") : "No activity recorded";
  };

  const notesList = useMemo(
    () =>
      Object.entries(notes)
        .filter(([, text]) => text.trim().length > 0)
        .sort((a, b) => (a[0] < b[0] ? 1 : -1)),
    [notes]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenBackground />
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
              <View style={[styles.incomeIcon, { backgroundColor: "rgba(52,211,153,0.16)" }]}>
                <DollarSign size={16} color={Colors.brandText} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.incomeLabel}>Paid this month</Text>
                <Text style={[styles.incomeValue, { color: Colors.brandText }]}>
                  {formatMoney(income.paidThisMonth)}
                </Text>
              </View>
            </View>
            <View style={styles.incomeRow}>
              <View style={[styles.incomeIcon, { backgroundColor: "rgba(251,191,36,0.16)" }]}>
                <DollarSign size={16} color={Colors.amber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.incomeLabel}>Paid last month</Text>
                <Text style={[styles.incomeValue, { color: Colors.ink }]}>
                  {formatMoney(income.paidLastMonth)}
                </Text>
              </View>
            </View>
            <View style={styles.incomeRow}>
              <View style={[styles.incomeIcon, { backgroundColor: "rgba(99,102,241,0.16)" }]}>
                <TrendingUp size={16} color={Colors.navy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.incomeLabel}>Paid this year</Text>
                <Text style={[styles.incomeValue, { color: Colors.ink }]}>
                  {formatMoney(income.paidThisYear)}
                </Text>
              </View>
            </View>
            <View style={styles.incomeRow}>
              <View style={[styles.incomeIcon, { backgroundColor: "rgba(239,68,68,0.16)" }]}>
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
                      { height: h, backgroundColor: m.total > 0 ? (isLast ? Colors.brand : Colors.amber) : Colors.line },
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

        <View style={[styles.card, styles.reportCard]}>
          <Pressable
            onPress={() => setReportOpen((o) => !o)}
            style={styles.reportHeader}
            testID="day-report-toggle"
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <CalendarDays size={16} color={Colors.navy} />
              <Text style={styles.cardTitle}>Day Report</Text>
            </View>
            {reportOpen ? (
              <ChevronUp size={18} color={Colors.inkMuted} />
            ) : (
              <ChevronDown size={18} color={Colors.inkMuted} />
            )}
          </Pressable>
          <Text style={styles.reportSub}>
            Days with visits or finished jobs. Tap a day to attach a note about what you
            learned.
          </Text>
          {reportOpen ? (
            dayRows.length === 0 ? (
              <Text style={styles.empty}>
                Nothing reported yet — log a visit or finish a job.
              </Text>
            ) : (
              <View style={{ marginTop: 12 }}>
                <View style={styles.reportHeadRow}>
                  <Text style={[styles.reportHeadCell, { flex: 2 }]}>Day</Text>
                  <Text style={[styles.reportHeadCell, { flex: 1, textAlign: "center" }]}>
                    Visits
                  </Text>
                  <Text style={[styles.reportHeadCell, { flex: 1, textAlign: "center" }]}>
                    Jobs
                  </Text>
                  <Text style={[styles.reportHeadCell, { flex: 1.2, textAlign: "right" }]}>
                    Paid
                  </Text>
                </View>
                {dayRows.map((r) => (
                  <Pressable
                    key={r.key}
                    onPress={() => setNoteDay(r.key)}
                    style={styles.reportRow}
                    testID={`day-row-${r.key}`}
                  >
                    <View style={{ flex: 2, flexDirection: "row", alignItems: "center", gap: 5 }}>
                      <Text style={styles.reportDay} numberOfLines={1}>
                        {dayLabel(r.key)}
                      </Text>
                      {notes[r.key] ? <NotebookPen size={12} color={Colors.brandText} /> : null}
                    </View>
                    <Text style={[styles.reportCell, { flex: 1, textAlign: "center" }]}>
                      {r.visits || "—"}
                    </Text>
                    <Text style={[styles.reportCell, { flex: 1, textAlign: "center" }]}>
                      {r.jobs || "—"}
                    </Text>
                    <Text style={[styles.reportPaid, { flex: 1.2 }]}>
                      {r.paid > 0 ? formatMoney(r.paid) : ""}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )
          ) : null}
        </View>

        {notesList.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Day Notes</Text>
            <View style={{ marginTop: 8 }}>
              {notesList.map(([key, text]) => (
                <Pressable
                  key={key}
                  onPress={() => setNoteDay(key)}
                  style={styles.noteRow}
                  testID={`note-row-${key}`}
                >
                  <View style={styles.noteIcon}>
                    <NotebookPen size={14} color={Colors.brandText} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noteDay}>{dayLabel(key)}</Text>
                    <Text style={styles.noteText} numberOfLines={3}>
                      {text}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

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

      {noteDay ? (
        <DayNoteModal
          key={noteDay}
          dayKey={noteDay}
          summary={summaryFor(noteDay)}
          initial={notes[noteDay] ?? ""}
          onSave={(text) => {
            setDayNote(noteDay, text);
            setNoteDay(null);
          }}
          onDelete={() => {
            setDayNote(noteDay, "");
            setNoteDay(null);
          }}
          onClose={() => setNoteDay(null)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
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
  incomeCard: { borderWidth: 2, borderColor: Colors.brand },
  reportCard: { borderWidth: 2, borderColor: Colors.navy },
  reportHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  reportSub: { fontSize: 12, color: Colors.inkMuted, marginTop: 6, lineHeight: 17 },
  reportHeadRow: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.line,
  },
  reportHeadCell: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.inkMuted,
    letterSpacing: 0.6,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  reportDay: { fontSize: 14, fontWeight: "700", color: Colors.ink, flexShrink: 1 },
  reportCell: { fontSize: 14, color: Colors.inkSoft, fontWeight: "600" },
  reportPaid: { fontSize: 13, color: Colors.brandText, fontWeight: "800", textAlign: "right" },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  noteIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(52,211,153,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  noteDay: { fontSize: 13, fontWeight: "700", color: Colors.ink },
  noteText: { fontSize: 13, color: Colors.inkSoft, marginTop: 3, lineHeight: 18 },
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
