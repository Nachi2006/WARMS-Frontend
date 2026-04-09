import useSWR from "swr";
import { api } from "@/lib/api";
import type { AdminUserResponse } from "@/types";

export function useAdminUsers() {
  const { data, error, isLoading, mutate } = useSWR<AdminUserResponse[]>(
    "/admin/users",
    () => api.get<AdminUserResponse[]>("/admin/users")
  );

  return { users: data ?? [], error, isLoading, mutate };
}
