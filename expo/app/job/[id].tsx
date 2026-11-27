import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import ScreenBackground from "@/components/ScreenBackground";
import { Calendar, Pencil, Trash2, Building2 } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import type { ThemeColors } from "@/constants/theme";
import { useJobById, useJobs } from "@/providers/JobsProvider";
import { useLocationById } from "@/providers/LocationsProvider";
import { STAGE_META, STAGE_ORDER, formatMoney } from "@/types/job";

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function JobDetailScreen() {
  const { colors: Colors } = useTheme();
  const styles = makeStyles(Colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = useJobById(id);
  const { updateJob, deleteJob } = useJobs();
  const account = useLocationById(job?.accountId);

  if (!job) {
    return (
      <View style={styles.notFound}>
        <ScreenBackground />
        <Text style={styles.notFoundText}>Job not found</Text>
      </View>
    );
  }

  const meta = STAGE_META[job.stage];

  const setStage = (s: (typeof STAGE_ORDER)[number]) => {
    const patch: Partial<typeof job> = { stage: s };
    if ((s === "completed" || s === "paid") && !job.completedDate) {
      patch.completedDate = new Date().toISOString().slice(0, 10);
    }
    updateJob(job.id, patch);
  };

  const confirmDelete = () => {
    Alert.alert("Delete job?", `"${job.title}" will be removed permanently.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteJob(job.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: job.title,
          headerRight: () => (
            <Pressable
              onPress={() => router.push(`/job/edit/${job.id}`)}
              hitSlop={12}
              style={{ marginRight: 6 }}
              testID="edit-job"
            >
              <Pencil size={19} color={Colors.navy} />
            </Pressable>
          ),
        }}
      />
      <ScreenBackground />
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.cream }}
        contentContainerStyle={styles.content}
      >
        <View style={styles.hero}>
          <View style={[styles.badge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={styles.heroTitle}>{job.title}</Text>
          <Text style={styles.heroAmount}>{formatMoney(job.amount)}</Text>
        </View>

        <Pressable
          onPress={() => account && router.push(`/account/${account.id}`)}
          disabled={!account}
          style={({ pressed }) => [styles.card, !account && { opacity: 0.6 }, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.row}>
            <Building2 size={16} color={Colors.inkSoft} />
            <Text style={styles.rowText}>
              {account ? account.businessName : "No linked account"}
            </Text>
          </View>
        </Pressable>

        {job.description ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>DESCRIPTION</Text>
            <Text style={styles.bodyText}>{job.description}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>DATES</Text>
          <View style={styles.row}>
            <Calendar size={15} color={Colors.inkSoft} />
            <Text style={styles.rowText}>Scheduled: {fmtDate(job.scheduledDate)}</Text>
          </View>
          <View style={styles.row}>
            <Calendar size={15} color={Colors.inkSoft} />
            <Text style={styles.rowText}>Completed: {fmtDate(job.completedDate)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>STAGE</Text>
          <View style={styles.stageRow}>
            {STAGE_ORDER.map((s) => {
              const sm = STAGE_META[s];
              const active = job.stage === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setStage(s)}
                  style={[styles.stageChip, active && { backgroundColor: sm.bg, borderColor: sm.color }]}
                  testID={`set-stage-${s}`}
                >
                  <Text style={[styles.stageChipText, active && { color: sm.color, fontWeight: "700" }]}>
                    {sm.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {job.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>NOTES</Text>
            <Text style={styles.bodyText}>{job.notes}</Text>
          </View>
        ) : null}

        <Pressable onPress={confirmDelete} style={styles.deleteBtn} testID="delete-job-page">
          <Trash2 size={16} color={Colors.danger} />
          <Text style={styles.deleteText}>Delete job</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const makeStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
  content: { padding: 20, paddingBottom: 60, gap: 14 },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.cream },
  notFoundText: { color: Colors.inkSoft },
  hero: {
    backgroundColor: Colors.paper,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  heroTitle: { fontSize: 22, fontWeight: "800", color: Colors.ink, letterSpacing: -0.3 },
  heroAmount: { fontSize: 26, fontWeight: "800", color: Colors.brandText },
  card: {
    backgroundColor: Colors.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 8,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.inkMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowText: { flex: 1, fontSize: 14, color: Colors.ink },
  bodyText: { fontSize: 14, color: Colors.ink, lineHeight: 21 },
  stageRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  stageChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  stageChipText: { fontSize: 13, color: Colors.inkSoft, fontWeight: "600" },
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
