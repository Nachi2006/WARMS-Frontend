import useSWR from "swr";
import { api } from "@/lib/api";
import type { AnnouncementResponse } from "@/types";

export function useAnnouncements() {
  const { data, error, isLoading, mutate } = useSWR<AnnouncementResponse[]>(
    "/announcements",
    () => api.get<AnnouncementResponse[]>("/announcements")
  );

  return { announcements: data ?? [], error, isLoading, mutate };
}
