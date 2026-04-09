import useSWR from "swr";
import { api } from "@/lib/api";
import type { UserResponse } from "@/types";

export function useAuth() {
  const { data, error, isLoading } = useSWR<UserResponse>(
    "/auth/me",
    () => api.get<UserResponse>("/auth/me"),
    { revalidateOnFocus: false }
  );

  return {
    user: data ?? null,
    error,
    isLoading,
  };
}
