import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, Trash2 } from "lucide-react-native";
import Colors from "@/constants/colors";

export function dayKeyLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function dayLabel(key: string): string {
  const parts = key.split("-").map(Number);
  const dt = new Date(parts[0], (parts[1] ?? 1) - 1, parts[2] ?? 1);
  if (isNaN(dt.getTime())) return key;
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  if (parts[0] !== new Date().getFullYear()) opts.year = "numeric";
  return dt.toLocaleDateString("en-US", opts);
}

interface Props {
  dayKey: string;
  summary?: string;
  initial: string;
  onSave: (text: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function DayNoteModal({
  dayKey,
  summary,
  initial,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [text, setText] = useState<string>(initial);
  const hasNote = initial.trim().length > 0;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.wrap}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>{dayLabel(dayKey)}</Text>
          {summary ? <Text style={styles.subtitle}>{summary}</Text> : null}
          <Text style={styles.prompt}>
            {hasNote
              ? "Edit your note for this day."
              : "What did you learn today? What worked, what didn't, how to sell better…"}
          </Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Stopped by, met Jane, dropped samples…"
            placeholderTextColor={Colors.inkMuted}
            style={styles.input}
            multiline
            numberOfLines={6}
            autoFocus
            testID="day-note-input"
          />
          <View style={styles.btns}>
            {hasNote ? (
              <Pressable
                onPress={onDelete}
                style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
                testID="day-note-delete"
              >
                <Trash2 size={16} color={Colors.danger} />
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <Pressable
              onPress={() => onSave(text)}
              style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.9 }]}
              testID="day-note-save"
            >
              <Check size={16} color={Colors.cream} strokeWidth={2.5} />
              <Text style={styles.saveText}>Save note</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(8,19,39,0.5)" },
  card: {
    backgroundColor: Colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 10,
  },
  title: { fontSize: 20, fontWeight: "800", color: Colors.ink, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: Colors.inkSoft, fontWeight: "600" },
  prompt: { fontSize: 13, color: Colors.inkMuted, marginTop: 2 },
  input: {
    backgroundColor: Colors.cream,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.ink,
    minHeight: 120,
    textAlignVertical: "top",
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {}),
  },
  btns: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
  },
  deleteText: { color: Colors.danger, fontWeight: "700", fontSize: 14 },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#117342",
  },
  saveText: { color: Colors.cream, fontWeight: "700", fontSize: 15 },
});
