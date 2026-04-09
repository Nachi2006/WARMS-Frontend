import useSWR from "swr";
import { api } from "@/lib/api";
import type { IncidentResponse } from "@/types";

export function useRangerIncidents() {
  const { data, error, isLoading, mutate } = useSWR<IncidentResponse[]>(
    "/ranger/incidents",
    () => api.get<IncidentResponse[]>("/ranger/incidents")
  );

  return { incidents: data ?? [], error, isLoading, mutate };
}
