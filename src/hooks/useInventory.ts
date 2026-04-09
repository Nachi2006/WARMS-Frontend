import useSWR from "swr";
import { api } from "@/lib/api";
import type { InventoryItemResponse } from "@/types";

export function useInventory() {
  const { data, error, isLoading, mutate } = useSWR<InventoryItemResponse[]>(
    "/inventory",
    () => api.get<InventoryItemResponse[]>("/inventory")
  );

  return { items: data ?? [], error, isLoading, mutate };
}
