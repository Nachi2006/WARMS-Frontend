import useSWR from "swr";
import { api } from "@/lib/api";
import type { HotspotResponse } from "@/types";

export function useHotspots() {
  const { data, error, isLoading } = useSWR<HotspotResponse[]>(
    "/geospatial/hotspots",
    async () => {
      const res = await api.get<HotspotResponse[] | { data: HotspotResponse[] }>("/geospatial/hotspots");
      // Handle both direct array and { data: [...] } formats
      return Array.isArray(res) ? res : res?.data ?? [];
    }
  );

  return { hotspots: Array.isArray(data) ? data : [], error, isLoading };
}
