import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Plus, Briefcase, Pencil, Trash2 } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import type { ThemeColors } from "@/constants/theme";
import { useJobs } from "@/providers/JobsProvider";
import { useLocations } from "@/providers/LocationsProvider";
import { Job, JobStage, STAGE_META, STAGE_ORDER, formatMoney } from "@/types/job";
import * as Haptics from "expo-haptics";
import DrawerMenuButton from "@/components/DrawerMenuButton";

const FILTERS: { key: "all" | JobStage; label: string }[] = [
  { key: "all", label: "All" },
  ...STAGE_ORDER.map((s) => ({ key: s as "all" | JobStage, label: STAGE_META[s].label })),
];

function StageChip({
  stage,
  onPress,
}: {
  stage: JobStage;
  onPress: () => void;
}) {
  const { colors: Colors } = useTheme();
  const styles = makeStyles(Colors);
  const meta = STAGE_META[stage];
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={[styles.stageChip, { backgroundColor: meta.bg }]}
      testID={`stage-chip-${stage}`}
    >
      <Text style={[styles.stageChipText, { color: meta.color }]}>{meta.label}</Text>
    </Pressable>
  );
}

export default function JobsScreen() {
  const { colors: Colors } = useTheme();
  const styles = makeStyles(Colors);
  const { jobs, updateJob, deleteJob } = useJobs();
  const { locations } = useLocations();
  const [filter, setFilter] = useState<"all" | JobStage>("all");

  const accountName = useMemo(() => {
    const map: Record<string, string> = {};
    for (const l of locations) map[l.id] = l.businessName;
    return map;
  }, [locations]);

  const visible = useMemo(() => {
    const filtered = jobs.filter((j) => filter === "all" || j.stage === filter);
    const open = filtered.filter((j) => j.stage !== "paid");
    const paid = filtered.filter((j) => j.stage === "paid");
    return [...open, ...paid];
  }, [jobs, filter]);

  const haptic = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
  };

  const promptStageChange = (job: Job) => {
    Alert.alert(
      "Set stage",
      job.title,
      [
        ...STAGE_ORDER.map((s) => ({
          text: STAGE_META[s].label + (job.stage === s ? " ✓" : ""),
          onPress: () => {
            const patch: Partial<Job> = { stage: s };
            if ((s === "completed" || s === "paid") && !job.completedDate) {
              patch.completedDate = new Date().toISOString().slice(0, 10);
            }
            updateJob(job.id, patch);
          },
        })),
        { text: "Cancel", style: "cancel" as const },
      ]
    );
  };

  const confirmDelete = (job: Job) => {
    Alert.alert("Delete job?", `"${job.title}" will be removed permanently.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteJob(job.id),
      },
    ]);
  };

  const outstanding = useMemo(
    () => jobs.filter((j) => j.stage === "completed").reduce((a, j) => a + j.amount, 0),
    [jobs]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
          <DrawerMenuButton />
          <View style={{ flex: 1 }}>
            <Text style={styles.hello}>Jobs</Text>
            <Text style={styles.subhello}>
              {jobs.length} job{jobs.length === 1 ? "" : "s"} · {formatMoney(outstanding)} outstanding
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => {
            haptic();
            router.push("/job/new");
          }}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
          testID="add-job-button"
        >
          <Plus size={20} color={Colors.onPrimary} strokeWidth={2.5} />
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(i) => i.key}
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingVertical: 12 }}
        renderItem={({ item }) => {
          const active = filter === item.key;
          return (
            <Pressable
              onPress={() => {
                haptic();
                setFilter(item.key);
              }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={visible}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const meta = STAGE_META[item.stage];
          return (
            <View style={styles.card}>
              <Pressable
                onPress={() => router.push(`/job/${item.id}`)}
                style={({ pressed }) => [pressed && { opacity: 0.8 }]}
                testID={`job-card-${item.id}`}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.cardSub} numberOfLines={1}>
                      {item.accountId ? accountName[item.accountId] ?? "Account" : "No account"}
                      {item.completedDate ? ` · done ${item.completedDate}` : item.scheduledDate ? ` · sched ${item.scheduledDate}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.amount}>{formatMoney(item.amount)}</Text>
                </View>
              </Pressable>
              <View style={styles.cardFooter}>
                <StageChip stage={item.stage} onPress={() => promptStageChange(item)} />
                <View style={styles.cardActions}>
                  <Pressable
                    onPress={() => router.push(`/job/edit/${item.id}`)}
                    hitSlop={10}
                    style={styles.iconBtn}
                    testID={`edit-job-${item.id}`}
                  >
                    <Pencil size={16} color={Colors.inkSoft} />
                  </Pressable>
                  <Pressable
                    onPress={() => confirmDelete(item)}
                    hitSlop={10}
                    style={styles.iconBtn}
                    testID={`delete-job-${item.id}`}
                  >
                    <Trash2 size={16} color={Colors.danger} />
                  </Pressable>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Briefcase size={28} color={Colors.navy} />
            </View>
            <Text style={styles.emptyTitle}>
              {jobs.length === 0 ? "No jobs yet" : "Nothing in this stage"}
            </Text>
            <Text style={styles.emptyText}>
              {jobs.length === 0
                ? "Tap + to add your first job. Link it to an account to track income."
                : "Try a different stage filter."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 12,
    paddingRight: 20,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 8,
  },
  hello: { fontSize: 24, fontWeight: "800", color: Colors.ink, letterSpacing: -0.5 },
  subhello: { fontSize: 12, color: Colors.inkSoft, marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.navy,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.inkSoft, fontWeight: "600" },
  chipTextActive: { color: Colors.onPrimary },
  listContent: { paddingHorizontal: 20, paddingBottom: 100, gap: 12, paddingTop: 4 },
  card: {
    backgroundColor: Colors.paper,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: Colors.ink },
  cardSub: { fontSize: 12, color: Colors.inkSoft, marginTop: 3 },
  amount: { fontSize: 15, fontWeight: "800", color: Colors.brandText },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stageChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  stageChipText: { fontSize: 12, fontWeight: "700" },
  cardActions: { flexDirection: "row", gap: 8 },
  iconBtn: { padding: 6 },
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
