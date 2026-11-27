export type JobStage = "quoted" | "scheduled" | "in_progress" | "completed" | "paid";

export const STAGE_ORDER: JobStage[] = [
  "quoted",
  "scheduled",
  "in_progress",
  "completed",
  "paid",
];

/** Translucent washes + saturated mid-tone text: readable on every theme. */
export const STAGE_META: Record<JobStage, { label: string; color: string; bg: string }> = {
  quoted: { label: "Quoted", color: "#4F46E5", bg: "rgba(79,70,229,0.14)" },
  scheduled: { label: "Scheduled", color: "#1D4ED8", bg: "rgba(37,99,235,0.14)" },
  in_progress: { label: "In Progress", color: "#B45309", bg: "rgba(180,83,9,0.14)" },
  completed: { label: "Completed", color: "#059669", bg: "rgba(5,150,105,0.14)" },
  paid: { label: "Paid", color: "#047857", bg: "rgba(5,150,105,0.14)" },
};

export interface Job {
  id: string;
  accountId?: string;
  title: string;
  description: string;
  amount: number;
  stage: JobStage;
  scheduledDate?: string;
  completedDate?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function formatMoney(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
