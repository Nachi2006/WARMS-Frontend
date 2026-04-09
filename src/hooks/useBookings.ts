import useSWR from "swr";
import { api } from "@/lib/api";
import type { BookingResponse } from "@/types";

export function useBookings() {
  const { data, error, isLoading, mutate } = useSWR<BookingResponse[]>(
    "/user/bookings",
    () => api.get<BookingResponse[]>("/user/bookings")
  );

  return { bookings: data ?? [], error, isLoading, mutate };
}
