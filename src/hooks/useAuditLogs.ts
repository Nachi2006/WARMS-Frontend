import useSWR from "swr";
import { api } from "@/lib/api";
import type { AuditLogResponse } from "@/types";

export function useAuditLogs(limit = 50, offset = 0) {
  const { data, error, isLoading, mutate } = useSWR<AuditLogResponse[]>(
    `/admin/audit-logs?limit=${limit}&offset=${offset}`,
    () => api.get<AuditLogResponse[]>(`/admin/audit-logs?limit=${limit}&offset=${offset}`)
  );

  return { logs: data ?? [], error, isLoading, mutate };
}
