import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import JobForm from "@/components/JobForm";
import { useJobs } from "@/providers/JobsProvider";

export default function NewJobScreen() {
  const { addJob } = useJobs();
  const { accountId } = useLocalSearchParams<{ accountId?: string }>();

  return (
    <JobForm
      submitLabel="Add Job"
      initial={accountId ? { accountId } : undefined}
      onSubmit={(value) => {
        addJob(value);
        router.back();
      }}
    />
  );
}
