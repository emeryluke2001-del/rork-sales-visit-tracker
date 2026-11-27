import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import JobForm from "@/components/JobForm";
import { useJobById, useJobs } from "@/providers/JobsProvider";
import { useTheme } from "@/providers/ThemeProvider";
import type { ThemeColors } from "@/constants/theme";

export default function EditJobScreen() {
  const { colors: Colors } = useTheme();
  const styles = makeStyles(Colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = useJobById(id);
  const { updateJob } = useJobs();

  if (!job) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Job not found</Text>
      </View>
    );
  }

  return (
    <JobForm
      submitLabel="Save Changes"
      initial={job}
      onSubmit={(value) => {
        updateJob(job.id, value);
        router.back();
      }}
    />
  );
}

const makeStyles = (Colors: ThemeColors) =>
  StyleSheet.create({
    empty: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.cream },
    emptyText: { color: Colors.inkSoft },
  });
