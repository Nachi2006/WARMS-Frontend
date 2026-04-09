import useSWR from "swr";
import { api } from "@/lib/api";
import type { ComplaintResponse } from "@/types";

export function useMyComplaints() {
  const { data, error, isLoading, mutate } = useSWR<ComplaintResponse[]>(
    "/complaints/my",
    () => api.get<ComplaintResponse[]>("/complaints/my")
  );

  return { complaints: data ?? [], error, isLoading, mutate };
}

export function useAllComplaints() {
  const { data, error, isLoading, mutate } = useSWR<ComplaintResponse[]>(
    "/complaints",
    () => api.get<ComplaintResponse[]>("/complaints")
  );

  return { complaints: data ?? [], error, isLoading, mutate };
}
