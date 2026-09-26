import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";

type Health = { status: string; database: string };

export function useHealth() {
  return useQuery({ queryKey: ["health"], queryFn: () => apiFetch<Health>("/api/health") });
}
