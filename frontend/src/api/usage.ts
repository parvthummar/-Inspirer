import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";

export type Usage = {
  plan_name: string;
  credits_total: number;
  credits_used: number;
  period_start: string;
  resets_at: string;
  breakdown: { kind: "plans" | "replies" | "builds"; count: number; credits: number }[];
  by_project: { project_id: string; name: string; credits: number }[];
};

export function useUsage() {
  return useQuery({
    queryKey: ["usage"],
    queryFn: () => apiFetch<Usage>("/api/usage"),
    staleTime: 30_000,
  });
}
