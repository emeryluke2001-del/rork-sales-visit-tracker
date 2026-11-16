export type JobStage = "quoted" | "scheduled" | "in_progress" | "completed" | "paid";

export const STAGE_ORDER: JobStage[] = [
  "quoted",
  "scheduled",
  "in_progress",
  "completed",
  "paid",
];

export const STAGE_META: Record<JobStage, { label: string; color: string; bg: string }> = {
  quoted: { label: "Quoted", color: "#0E1F3A", bg: "#E0E7FF" },
  scheduled: { label: "Scheduled", color: "#1D4ED8", bg: "#DBEAFE" },
  in_progress: { label: "In Progress", color: "#92400E", bg: "#FEF3C7" },
  completed: { label: "Completed", color: "#065F46", bg: "#D1FAE5" },
  paid: { label: "Paid", color: "#117342", bg: "#DCFCE7" },
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
