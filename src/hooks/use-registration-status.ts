import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PublicStatus = { is_open: boolean; full: boolean; waitlist_enabled: boolean };

export function useRegistrationStatus() {
  return useQuery({
    queryKey: ["registration-status"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("registration_public_status");
      if (error) throw error;
      return data as unknown as PublicStatus;
    },
  });
}
