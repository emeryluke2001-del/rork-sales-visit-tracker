import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check } from "lucide-react-native";
import Colors from "@/constants/colors";
import { STATUS_META, VisitStatus, Location } from "@/types/location";

export type LocationFormValue = Omit<Location, "id" | "createdAt" | "updatedAt" | "visits">;

interface Props {
  initial?: Partial<LocationFormValue>;
  onSubmit: (value: LocationFormValue) => void;
  submitLabel: string;
}

const STATUSES: VisitStatus[] = ["prospect", "active", "closed", "cold"];

export default function LocationForm({ initial, onSubmit, submitLabel }: Props) {
  const [businessName, setBusinessName] = useState<string>(initial?.businessName ?? "");
  const [address, setAddress] = useState<string>(initial?.address ?? "");
  const [contactName, setContactName] = useState<string>(initial?.contactName ?? "");
  const [contactPhone, setContactPhone] = useState<string>(initial?.contactPhone ?? "");
  const [contactEmail, setContactEmail] = useState<string>(initial?.contactEmail ?? "");
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");
  const [tagsText, setTagsText] = useState<string>((initial?.tags ?? []).join(", "));
  const [status, setStatus] = useState<VisitStatus>(initial?.status ?? "prospect");

  const valid = businessName.trim().length > 0;

  const handleSubmit = () => {
    if (!valid) return;
    onSubmit({
      businessName: businessName.trim(),
      address: address.trim(),
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      notes: notes.trim(),
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      status,
      latitude: initial?.latitude,
      longitude: initial?.longitude,
      lastVisited: initial?.lastVisited,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field label="Business Name" required>
          <TextInput
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Acme Coffee Roasters"
            placeholderTextColor={Colors.inkMuted}
            style={styles.input}
            testID="input-businessName"
          />
        </Field>

        <Field label="Address">
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="123 Main St, Austin TX"
            placeholderTextColor={Colors.inkMuted}
            style={styles.input}
          />
        </Field>

        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>CONTACT</Text>
        </View>

        <Field label="Contact Name">
          <TextInput
            value={contactName}
            onChangeText={setContactName}
            placeholder="Jane Doe"
            placeholderTextColor={Colors.inkMuted}
            style={styles.input}
          />
        </Field>

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Field label="Phone">
              <TextInput
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="(555) 123-4567"
                placeholderTextColor={Colors.inkMuted}
                style={styles.input}
                keyboardType="phone-pad"
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Email">
              <TextInput
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="jane@acme.com"
                placeholderTextColor={Colors.inkMuted}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Field>
          </View>
        </View>

        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>STATUS</Text>
        </View>
        <View style={styles.statusRow}>
          {STATUSES.map((s) => {
            const meta = STATUS_META[s];
            const active = status === s;
            return (
              <Pressable
                key={s}
                onPress={() => setStatus(s)}
                style={[
                  styles.statusChip,
                  active && { backgroundColor: meta.bg, borderColor: meta.color },
                ]}
                testID={`status-${s}`}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    active && { color: meta.color, fontWeight: "700" },
                  ]}
                >
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Field label="Tags (comma separated)">
          <TextInput
            value={tagsText}
            onChangeText={setTagsText}
            placeholder="coffee, downtown, weekly"
            placeholderTextColor={Colors.inkMuted}
            style={styles.input}
            autoCapitalize="none"
          />
        </Field>

        <Field label="Notes">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Prefers Tuesday mornings. Buyer is new."
            placeholderTextColor={Colors.inkMuted}
            style={[styles.input, styles.textarea]}
            multiline
            numberOfLines={5}
          />
        </Field>

        <Pressable
          onPress={handleSubmit}
          disabled={!valid}
          style={({ pressed }) => [
            styles.submit,
            !valid && { opacity: 0.4 },
            pressed && { opacity: 0.9 },
          ]}
          testID="submit-location"
        >
          <Check size={18} color={Colors.cream} strokeWidth={2.5} />
          <Text style={styles.submitText}>{submitLabel}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={{ color: Colors.danger }}> *</Text> : null}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 60, gap: 4 },
  field: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.inkSoft,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.ink,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {}),
  },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  row2: { flexDirection: "row", gap: 10 },
  sectionLabel: { marginTop: 8, marginBottom: 10 },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.inkMuted,
    letterSpacing: 1.2,
  },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  statusChipText: { fontSize: 13, color: Colors.inkSoft, fontWeight: "600" },
  submit: {
    marginTop: 16,
    backgroundColor: Colors.navy,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  submitText: { color: Colors.cream, fontSize: 15, fontWeight: "700" },
});
