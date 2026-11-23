import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
} from "react-native";
import { Check, ChevronDown } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLocations } from "@/providers/LocationsProvider";
import { Job, JobStage, STAGE_META, STAGE_ORDER } from "@/types/job";

export type JobFormValue = Omit<Job, "id" | "createdAt" | "updatedAt">;

interface Props {
  initial?: Partial<JobFormValue>;
  onSubmit: (value: JobFormValue) => void;
  submitLabel: string;
}

export default function JobForm({ initial, onSubmit, submitLabel }: Props) {
  const { locations } = useLocations();
  const accounts = useMemo(() => locations.filter((l) => l.isAccount), [locations]);

  const [accountId, setAccountId] = useState<string | undefined>(initial?.accountId);
  const [title, setTitle] = useState<string>(initial?.title ?? "");
  const [description, setDescription] = useState<string>(initial?.description ?? "");
  const [amountText, setAmountText] = useState<string>(
    initial?.amount !== undefined ? String(initial.amount) : ""
  );
  const [stage, setStage] = useState<JobStage>(initial?.stage ?? "quoted");
  const [scheduledDate, setScheduledDate] = useState<string>(initial?.scheduledDate ?? "");
  const [completedDate, setCompletedDate] = useState<string>(initial?.completedDate ?? "");
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const account = accounts.find((a) => a.id === accountId);
  const valid = title.trim().length > 0;

  // Keystrokes like "111720" become "1117-20"; digits auto-shape into YYYY-MM-DD.
  const formatDateInput = (raw: string): string => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)]
      .filter(Boolean)
      .join("-");
  };

  const submit = () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    const amount = parseFloat(amountText.replace(/[^0-9.-]/g, "")) || 0;
    onSubmit({
      accountId,
      title: title.trim(),
      description: description.trim(),
      amount,
      stage,
      scheduledDate: scheduledDate.trim() || undefined,
      completedDate: completedDate.trim() || undefined,
      notes: notes.trim(),
    });
  };

  const pickAccount = (id: string | undefined) => {
    setAccountId(id);
    setPickerOpen(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Linked Account</Text>
          <Pressable
            onPress={() => setPickerOpen(true)}
            style={[styles.input, styles.pickerInput]}
            testID="job-account-picker"
          >
            <Text style={[styles.pickerText, !account && { color: Colors.inkMuted }]} numberOfLines={1}>
              {account ? account.businessName : accounts.length === 0 ? "No accounts yet — add one in Accounts" : "Choose an account"}
            </Text>
            <ChevronDown size={16} color={Colors.inkMuted} />
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>
            Job Title<Text style={{ color: Colors.danger }}> *</Text>
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Replace signage, service call, delivery..."
            placeholderTextColor={Colors.inkMuted}
            style={styles.input}
            testID="input-job-title"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What exactly is being done"
            placeholderTextColor={Colors.inkMuted}
            style={styles.input}
            multiline
          />
        </View>

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Amount ($)</Text>
            <TextInput
              value={amountText}
              onChangeText={setAmountText}
              placeholder="0.00"
              placeholderTextColor={Colors.inkMuted}
              style={styles.input}
              keyboardType="decimal-pad"
              testID="input-job-amount"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Scheduled Date</Text>
            <TextInput
              value={scheduledDate}
              onChangeText={(t) => setScheduledDate(formatDateInput(t))}
              placeholder="2026-11-20"
              placeholderTextColor={Colors.inkMuted}
              style={styles.input}
              autoCapitalize="none"
              testID="input-job-scheduled"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Completed Date</Text>
          <TextInput
            value={completedDate}
            onChangeText={(t) => setCompletedDate(formatDateInput(t))}
            placeholder="2026-11-25 (set automatically when completed)"
            placeholderTextColor={Colors.inkMuted}
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.sectionLabelText}>STAGE</Text>
        <View style={styles.stageRow}>
          {STAGE_ORDER.map((s) => {
            const meta = STAGE_META[s];
            const active = stage === s;
            return (
              <Pressable
                key={s}
                onPress={() => {
                  setStage(s);
                  if ((s === "completed" || s === "paid") && !completedDate) {
                    setCompletedDate(new Date().toISOString().slice(0, 10));
                  }
                }}
                style={[
                  styles.stageChip,
                  active && { backgroundColor: meta.bg, borderColor: meta.color },
                ]}
                testID={`stage-${s}`}
              >
                <Text
                  style={[
                    styles.stageChipText,
                    active && { color: meta.color, fontWeight: "700" },
                  ]}
                >
                  {meta.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Materials needed, follow-up, who approved..."
            placeholderTextColor={Colors.inkMuted}
            style={[styles.input, styles.textarea]}
            multiline
            testID="input-job-notes"
          />
        </View>

        <Pressable
          onPress={submit}
          disabled={!valid || submitting}
          style={({ pressed }) => [
            styles.submit,
            (!valid || submitting) && { opacity: 0.4 },
            pressed && { opacity: 0.9 },
          ]}
          testID="submit-job"
        >
          <Check size={18} color={Colors.cream} strokeWidth={2.5} />
          <Text style={styles.submitText}>{submitLabel}</Text>
        </Pressable>

        <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose account</Text>
              <FlatList
                style={{ maxHeight: 320 }}
                data={accounts}
                keyExtractor={(a) => a.id}
                ListEmptyComponent={
                  <Text style={styles.modalEmpty}>
                    No accounts yet. Add one from the Accounts tab.
                  </Text>
                }
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => pickAccount(item.id)}
                    style={[styles.modalRow, item.id === accountId && styles.modalRowActive]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalRowTitle} numberOfLines={1}>
                        {item.businessName}
                      </Text>
                      {item.contactName ? (
                        <Text style={styles.modalRowSub} numberOfLines={1}>
                          {item.contactName}
                        </Text>
                      ) : null}
                    </View>
                    {item.id === accountId ? <Check size={16} color="#117342" /> : null}
                  </Pressable>
                )}
              />
              {accountId ? (
                <Pressable onPress={() => pickAccount(undefined)} style={styles.modalClear}>
                  <Text style={styles.modalClearText}>Clear linked account</Text>
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
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
  pickerInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pickerText: { flex: 1, fontSize: 15, color: Colors.ink },
  row2: { flexDirection: "row", gap: 10, marginBottom: 14 },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.inkMuted,
    letterSpacing: 1.2,
    marginTop: 8,
    marginBottom: 10,
  },
  stageRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  stageChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.paper,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  stageChipText: { fontSize: 13, color: Colors.inkSoft, fontWeight: "600" },
  submit: {
    marginTop: 16,
    backgroundColor: "#117342",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  submitText: { color: Colors.cream, fontSize: 15, fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(8,19,39,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.paper,
    borderRadius: 18,
    padding: 18,
    width: "100%",
    maxWidth: 420,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: Colors.ink, marginBottom: 12 },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  modalRowActive: { backgroundColor: "#DCFCE7" },
  modalRowTitle: { fontSize: 15, fontWeight: "600", color: Colors.ink },
  modalRowSub: { fontSize: 12, color: Colors.inkSoft, marginTop: 2 },
  modalEmpty: { fontSize: 14, color: Colors.inkSoft, paddingVertical: 12, lineHeight: 20 },
  modalClear: { alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.line, marginTop: 8 },
  modalClearText: { fontSize: 13, color: Colors.danger, fontWeight: "600" },
});
