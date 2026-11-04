import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PublicStatus = { is_open: boolean; full: boolean; waitlist_enabled: boolean };

export function useRegistrationStatus() {
  return useQuery({
    queryKey: ["registration-status"],
    queryFn: async (): Promise<PublicStatus> => {
      const { data, error } = await supabase.rpc("registration_public_status");
      if (error) throw error;
      if (!data || typeof data !== "object" || !("is_open" in data)) throw new Error("INVALID_REGISTRATION_STATUS");
      return data as PublicStatus;
    },
    staleTime: 15_000,
    retry: 1,
  });
}
