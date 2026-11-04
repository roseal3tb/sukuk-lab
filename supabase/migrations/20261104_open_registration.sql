-- Execute once through the Supabase SQL Editor attached to the existing project.
-- This updates only existing registration settings; it does NOT create a new
-- registration database nor weaken access controls. See README for safety checks.
UPDATE public.registration_settings
SET is_open = true,
    capacity = 100,
    waitlist_enabled = true,
    updated_at = now()
WHERE id = 1;

-- Read-only verification. Expected is_open = true.
SELECT id, is_open, capacity, waitlist_enabled, updated_at
FROM public.registration_settings WHERE id = 1;
