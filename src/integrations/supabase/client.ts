import { createClient } from "@supabase/supabase-js";

// Only use PUBLIC / PUBLISHABLE credentials in browser code.
// Never expose Supabase service_role or sb_secret keys here.
function createPublicClient() {
  const url = import.meta.env['VITE_SUPABASE_URL'] as string | undefined;
  const key = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] as string | undefined;
  if (!url || !key) {
    throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are required on the deployment");
  }
  return createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}

// Lazy initialization prevents a missing public env var from crashing SSR startup.
let cached: ReturnType<typeof createPublicClient> | undefined;
export const supabase = new Proxy({} as ReturnType<typeof createPublicClient>, {
  get(_target, property, receiver) {
    cached ??= createPublicClient();
    return Reflect.get(cached, property, receiver);
  },
});
