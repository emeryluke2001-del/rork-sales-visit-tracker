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
  createdAt: string;
  updatedAt: string;
}

export const STATUS_META: Record<VisitStatus, { label: string; color: string; bg: string }> = {
  prospect: { label: "Prospect", color: "#0E1F3A", bg: "#E0E7FF" },
  active: { label: "Active", color: "#065F46", bg: "#D1FAE5" },
  closed: { label: "Closed", color: "#92400E", bg: "#FEF3C7" },
  cold: { label: "Cold", color: "#475569", bg: "#E2E8F0" },
};
