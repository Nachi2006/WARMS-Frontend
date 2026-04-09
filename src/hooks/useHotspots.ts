import useSWR from "swr";
import { api } from "@/lib/api";
import type { HotspotResponse } from "@/types";

export function useHotspots() {
  const { data, error, isLoading } = useSWR<HotspotResponse[]>(
    "/geospatial/hotspots",
    () => api.get<HotspotResponse[]>("/geospatial/hotspots")
  );

  return { hotspots: data ?? [], error, isLoading };
}
