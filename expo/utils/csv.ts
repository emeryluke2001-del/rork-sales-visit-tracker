import { Location } from "@/types/location";

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
