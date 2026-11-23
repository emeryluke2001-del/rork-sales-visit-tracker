import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const STORAGE_KEY = "routelog.daynotes.v1";

export type DayNotes = Record<string, string>;

async function loadAll(): Promise<DayNotes> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DayNotes;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    console.log("[DayNotesProvider] load error", e);
    return {};
  }
}

export const [DayNotesProvider, useDayNotes] = createContextHook(() => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["daynotes"],
    queryFn: loadAll,
  });

  const notes: DayNotes = useMemo(() => query.data ?? {}, [query.data]);

  const writeMutation = useMutation({
    mutationFn: async (next: DayNotes) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    },
    onSuccess: (next) => {
      qc.setQueryData(["daynotes"], next);
    },
  });

  const setDayNote = useCallback(
    (dayKey: string, note: string) => {
      const trimmed = note.trim();
      const next: DayNotes = { ...notes };
      if (trimmed.length > 0) {
        next[dayKey] = trimmed;
      } else {
        delete next[dayKey];
      }
      writeMutation.mutate(next);
    },
    [notes, writeMutation]
  );

  const deleteAllNotes = useCallback(() => {
    writeMutation.mutate({});
  }, [writeMutation]);

  const notesCount = useMemo(
    () => Object.values(notes).filter((n) => n.length > 0).length,
    [notes]
  );

  return {
    notes,
    notesCount,
    isLoading: query.isLoading,
    setDayNote,
    deleteAllNotes,
  };
});
