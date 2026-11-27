import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NotebookPen, Plus } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import type { ThemeColors } from "@/constants/theme";
import { useDayNotes } from "@/providers/DayNotesProvider";
import DrawerMenuButton from "@/components/DrawerMenuButton";
import DayNoteModal, { dayKeyLocal, dayLabel } from "@/components/DayNoteModal";
import { useLocations } from "@/providers/LocationsProvider";
import { useJobs } from "@/providers/JobsProvider";
import { formatMoney } from "@/types/job";

export default function NotesScreen() {
  const { colors: Colors } = useTheme();
  const styles = makeStyles(Colors);
  const { notes, setDayNote } = useDayNotes();
  const { locations } = useLocations();
  const { jobs } = useJobs();
  const [noteDay, setNoteDay] = useState<string | null>(null);

  const notesList = useMemo(
    () =>
      Object.entries(notes)
        .filter(([, text]) => text.trim().length > 0)
        .sort((a, b) => (a[0] < b[0] ? 1 : -1)),
    [notes]
  );

  const activityFor = (key: string): string => {
    const visits = locations.reduce(
      (acc, l) => acc + l.visits.filter((v) => dayKeyLocal(new Date(v.date)) === key).length,
      0
    );
    const jobsDone = jobs.filter((j) => {
      if (j.stage !== "completed" && j.stage !== "paid") return false;
      const src = j.completedDate
        ? new Date(j.completedDate + "T12:00:00")
        : new Date(j.updatedAt);
      return !isNaN(src.getTime()) && dayKeyLocal(src) === key;
    });
    const paid = jobsDone.reduce((a: number, j) => a + (j.stage === "paid" ? j.amount : 0), 0);
    const bits: string[] = [];
    if (visits) bits.push(`${visits} visit${visits === 1 ? "" : "s"}`);
    if (jobsDone.length) bits.push(`${jobsDone.length} job${jobsDone.length === 1 ? "" : "s"}`);
    if (paid > 0) bits.push(`${formatMoney(paid)} paid`);
    return bits.length > 0 ? bits.join(" · ") : "No activity recorded";
  };

  const todayKey = dayKeyLocal(new Date());

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerRow}>
        <DrawerMenuButton />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notes</Text>
          <Text style={styles.subtitle}>What you learned on each day</Text>
        </View>
        <Pressable
          onPress={() => setNoteDay(todayKey)}
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.85 }]}
          testID="add-day-note-button"
        >
          <Plus size={20} color={Colors.onPrimary} strokeWidth={2.5} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notesList.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <NotebookPen size={26} color={Colors.navy} />
            </View>
            <Text style={styles.emptyTitle}>No day notes yet</Text>
            <Text style={styles.emptyText}>
              Tap + to jot down what you learned today — what worked, what didn&apos;t, and how
              to sell better. Past days can be noted from the Day Report in Insights.
            </Text>
          </View>
        ) : (
          notesList.map(([key, text]) => (
            <Pressable
              key={key}
              onPress={() => setNoteDay(key)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              testID={`note-row-${key}`}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.noteDay}>{dayLabel(key)}</Text>
                <Text style={styles.noteActivity}>{activityFor(key)}</Text>
              </View>
              <Text style={styles.noteText}>{text}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      {noteDay ? (
        <DayNoteModal
          key={noteDay}
          dayKey={noteDay}
          summary={activityFor(noteDay)}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingLeft: 12,
    paddingRight: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: { fontSize: 24, fontWeight: "800", color: Colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 12, color: Colors.inkSoft, marginTop: 2 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  content: { padding: 20, paddingBottom: 100, gap: 12 },
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
    gap: 10,
  },
  noteDay: { fontSize: 15, fontWeight: "800", color: Colors.ink },
  noteActivity: { fontSize: 12, color: Colors.inkMuted, fontWeight: "600" },
  noteText: { fontSize: 14, color: Colors.inkSoft, lineHeight: 20 },
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
