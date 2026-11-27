export type VisitStatus = "prospect" | "active" | "closed" | "cold";

export interface Visit {
  id: string;
  date: string;
  note: string;
}

export interface Location {
  id: string;
  businessName: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
  status: VisitStatus;
  tags: string[];
  latitude?: number;
  longitude?: number;
  lastVisited?: string;
  visits: Visit[];
  isAccount?: boolean;
  accountSince?: string;
  createdAt: string;
  updatedAt: string;
}

/** Translucent washes + saturated mid-tone text: readable on every theme. */
export const STATUS_META: Record<VisitStatus, { label: string; color: string; bg: string }> = {
  prospect: { label: "Prospect", color: "#4F46E5", bg: "rgba(79,70,229,0.14)" },
  active: { label: "Active", color: "#059669", bg: "rgba(5,150,105,0.14)" },
  closed: { label: "Closed", color: "#B45309", bg: "rgba(180,83,9,0.14)" },
  cold: { label: "Cold", color: "#64748B", bg: "rgba(100,116,139,0.14)" },
};
