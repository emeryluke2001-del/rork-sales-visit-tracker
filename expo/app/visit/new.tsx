import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLocationById, useLocations } from "@/providers/LocationsProvider";

export default function NewVisitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const location = useLocationById(id);
  const { addVisit } = useLocations();
  const [note, setNote] = useState<string>("");

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Location not found</Text>
      </View>
    );
  }

  const save = () => {
    addVisit(location.id, note.trim());
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.subtitle}>Visiting</Text>
        <Text style={styles.title}>{location.businessName}</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>

        <Text style={styles.label}>What happened?</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Met with Jane, demoed product, follow up next Tuesday..."
          placeholderTextColor={Colors.inkMuted}
          style={styles.textarea}
          multiline
          autoFocus
          testID="visit-note-input"
        />

        <Pressable
          onPress={save}
          style={({ pressed }) => [styles.save, pressed && { opacity: 0.9 }]}
          testID="save-visit"
        >
          <Check size={18} color={Colors.cream} strokeWidth={2.5} />
          <Text style={styles.saveText}>Log Visit</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: 20, gap: 6 },
  subtitle: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.amber,
    letterSpacing: 1.2,
  },
  title: { fontSize: 24, fontWeight: "800", color: Colors.ink, letterSpacing: -0.4 },
  date: { fontSize: 13, color: Colors.inkSoft, marginBottom: 18 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.inkSoft,
    letterSpacing: 0.3,
    marginTop: 8,
    marginBottom: 8,
  },
  textarea: {
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: Colors.ink,
    minHeight: 160,
    textAlignVertical: "top",
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {}),
  },
  save: {
    marginTop: 18,
    backgroundColor: Colors.navy,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  saveText: { color: Colors.cream, fontSize: 15, fontWeight: "700" },
});
