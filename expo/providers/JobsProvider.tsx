import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Job } from "@/types/job";

const JOBS_KEY = "rork.jobs.v1";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function loadJobs(): Promise<Job[]> {
  try {
    const raw = await AsyncStorage.getItem(JOBS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Job[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.log("[JobsProvider] load error", e);
    return [];
  }
}

async function saveJobs(jobs: Job[]): Promise<void> {
  await AsyncStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

export const [JobsProvider, useJobs] = createContextHook(() => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["jobs"],
    queryFn: loadJobs,
  });

  const jobs: Job[] = useMemo(() => query.data ?? [], [query.data]);

  const writeMutation = useMutation({
    mutationFn: async (next: Job[]) => {
      await saveJobs(next);
      return next;
    },
    onSuccess: (next) => {
      jobsRef.current = next;
      qc.setQueryData(["jobs"], next);
    },
  });

  // Latest committed data, so rapid successive writes never work from a stale array.
  const jobsRef = useRef<Job[]>([]);
  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  const write = useCallback(
    (updater: (prev: Job[]) => Job[]) => {
      const next = updater(jobsRef.current);
      jobsRef.current = next;
      writeMutation.mutate(next);
    },
    [writeMutation]
  );

  const addJob = useCallback(
    (input: Omit<Job, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const job: Job = { ...input, id: uid(), createdAt: now, updatedAt: now };
      write((prev) => [job, ...prev]);
      return job;
    },
    [write]
  );

  const updateJob = useCallback(
    (id: string, patch: Partial<Job>) => {
      write((prev) =>
        prev.map((j) =>
          j.id === id ? { ...j, ...patch, updatedAt: new Date().toISOString() } : j
        )
      );
    },
    [write]
  );

  const deleteJob = useCallback(
    (id: string) => {
      write((prev) => prev.filter((j) => j.id !== id));
    },
    [write]
  );

  const deleteAllJobs = useCallback(() => {
    write(() => []);
  }, [write]);

  const jobsByAccount = useMemo(() => {
    const map: Record<string, Job[]> = {};
    for (const j of jobs) {
      if (j.accountId) {
        (map[j.accountId] ??= []).push(j);
      }
    }
    return map;
  }, [jobs]);

  return { jobs, isLoading: query.isLoading, addJob, updateJob, deleteJob, deleteAllJobs, jobsByAccount };
});

export function useJobById(id: string | undefined) {
  const { jobs } = useJobs();
  return useMemo(() => jobs.find((j) => j.id === id), [jobs, id]);
}
