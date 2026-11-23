import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Location, Visit, VisitStatus } from "@/types/location";

const STORAGE_KEY = "routelog.locations.v1";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function loadAll(): Promise<Location[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Location[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.log("[LocationsProvider] load error", e);
    return [];
  }
}

async function saveAll(items: Location[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const [LocationsProvider, useLocations] = createContextHook(() => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["locations"],
    queryFn: loadAll,
  });

  const locations: Location[] = useMemo(() => query.data ?? [], [query.data]);

  const writeMutation = useMutation({
    mutationFn: async (next: Location[]) => {
      await saveAll(next);
      return next;
    },
    onSuccess: (next) => {
      locationsRef.current = next;
      qc.setQueryData(["locations"], next);
    },
  });

  // Latest committed data, so rapid successive writes never work from a stale array.
  const locationsRef = useRef<Location[]>([]);
  useEffect(() => {
    locationsRef.current = locations;
  }, [locations]);

  const write = useCallback(
    (updater: (prev: Location[]) => Location[]) => {
      const next = updater(locationsRef.current);
      locationsRef.current = next;
      writeMutation.mutate(next);
    },
    [writeMutation]
  );

  const addLocation = useCallback(
    (
      input: Omit<Location, "id" | "createdAt" | "updatedAt" | "visits">,
      firstVisitNote?: string
    ) => {
      const now = new Date().toISOString();
      const visits: Visit[] = [];
      let lastVisited = input.lastVisited;
      const note = firstVisitNote?.trim();
      if (note && note.length > 0) {
        const visit: Visit = { id: uid(), date: now, note };
        visits.push(visit);
        lastVisited = visit.date;
      }
      const loc: Location = {
        ...input,
        id: uid(),
        createdAt: now,
        updatedAt: now,
        visits,
        lastVisited,
      };
      write((prev) => [loc, ...prev]);
      return loc;
    },
    [write]
  );

  const updateLocation = useCallback(
    (id: string, patch: Partial<Location>) => {
      write((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l
        )
      );
    },
    [write]
  );

  const deleteLocation = useCallback(
    (id: string) => {
      write((prev) => prev.filter((l) => l.id !== id));
    },
    [write]
  );

  const addVisit = useCallback(
    (id: string, note: string) => {
      const visit: Visit = {
        id: uid(),
        date: new Date().toISOString(),
        note,
      };
      write((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                visits: [visit, ...l.visits],
                lastVisited: visit.date,
                updatedAt: visit.date,
              }
            : l
        )
      );
    },
    [write]
  );

  const deleteVisit = useCallback(
    (locationId: string, visitId: string) => {
      write((prev) =>
        prev.map((l) => {
          if (l.id !== locationId) return l;
          const remaining = l.visits.filter((v) => v.id !== visitId);
          return {
            ...l,
            visits: remaining,
            lastVisited: remaining[0]?.date,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    [write]
  );

  const deleteAllData = useCallback(() => {
    write(() => []);
  }, [write]);

  const stats = useMemo(() => {
    const byStatus: Record<VisitStatus, number> = {
      prospect: 0,
      active: 0,
      closed: 0,
      cold: 0,
    };
    for (const l of locations) byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
    const totalVisits = locations.reduce((acc, l) => acc + l.visits.length, 0);
    const thisWeek = locations.reduce((acc, l) => {
      const wk = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return acc + l.visits.filter((v) => new Date(v.date).getTime() > wk).length;
    }, 0);
    return { byStatus, totalVisits, thisWeek, total: locations.length };
  }, [locations]);

  return {
    locations,
    isLoading: query.isLoading,
    addLocation,
    updateLocation,
    deleteLocation,
    addVisit,
    deleteVisit,
    deleteAllData,
    stats,
  };
});

export function useLocationById(id: string | undefined) {
  const { locations } = useLocations();
  return useMemo(() => locations.find((l) => l.id === id), [locations, id]);
}
