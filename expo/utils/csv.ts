import { Location } from "@/types/location";
import { Job, STAGE_META } from "@/types/job";

function esc(v: string | number | undefined | null): string {
  if (v === undefined || v === null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return "\"" + s.replace(/"/g, '""') + "\"";
  }
  return s;
}

export function locationsToCSV(locations: Location[]): string {
  const headers = [
    "Business Name",
    "Address",
    "Contact Name",
    "Phone",
    "Email",
    "Status",
    "Is Account",
    "Tags",
    "Notes",
    "Last Visited",
    "Total Visits",
    "Latitude",
    "Longitude",
    "Created",
  ];
  const rows = locations.map((l) =>
    [
      esc(l.businessName),
      esc(l.address),
      esc(l.contactName),
      esc(l.contactPhone),
      esc(l.contactEmail),
      esc(l.status),
      esc(l.isAccount ? "Yes" : "No"),
      esc(l.tags.join("; ")),
      esc(l.notes),
      esc(l.lastVisited ?? ""),
      esc(l.visits.length),
      esc(l.latitude ?? ""),
      esc(l.longitude ?? ""),
      esc(l.createdAt),
    ].join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export function jobsToCSV(jobs: Job[], accountNameById: Record<string, string>): string {
  const headers = [
    "Job Title",
    "Account",
    "Description",
    "Amount",
    "Stage",
    "Scheduled Date",
    "Completed Date",
    "Notes",
    "Created",
  ];
  const rows = jobs.map((j) =>
    [
      esc(j.title),
      esc(j.accountId ? accountNameById[j.accountId] ?? "" : ""),
      esc(j.description),
      esc(j.amount.toFixed(2)),
      esc(STAGE_META[j.stage].label),
      esc(j.scheduledDate ?? ""),
      esc(j.completedDate ?? ""),
      esc(j.notes),
      esc(j.createdAt),
    ].join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}
