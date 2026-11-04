-- SUKUK LAB — security migration applied to live project on 2026-11-04.
-- Safe to review and reconcile. Never grant visitors direct SELECT on applicants.
-- Admin users must be explicitly created in Supabase Auth and assigned admin.
BEGIN;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname='app_role') THEN
   CREATE TYPE public.app_role AS ENUM ('admin');
 END IF;
END $$;
CREATE TABLE IF NOT EXISTS public.user_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 role public.app_role NOT NULL,
 UNIQUE(user_id,role)
);
ALTER TABLE public.registration_settings ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_roles FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.applications FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.registration_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, UPDATE ON public.applications TO authenticated;
GRANT SELECT, UPDATE ON public.registration_settings TO authenticated;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid,_role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $fn$ SELECT _user_id = (SELECT auth.uid()) AND EXISTS
(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $fn$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
 USING (user_id=(SELECT auth.uid()));
DROP POLICY IF EXISTS "Admins read applications" ON public.applications;
CREATE POLICY "Admins read applications" ON public.applications FOR SELECT TO authenticated
 USING (public.has_role((SELECT auth.uid()),'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins update applications" ON public.applications;
CREATE POLICY "Admins update applications" ON public.applications FOR UPDATE TO authenticated
 USING (public.has_role((SELECT auth.uid()),'admin'::public.app_role))
 WITH CHECK (public.has_role((SELECT auth.uid()),'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins read settings" ON public.registration_settings;
CREATE POLICY "Admins read settings" ON public.registration_settings FOR SELECT TO authenticated
 USING (public.has_role((SELECT auth.uid()),'admin'::public.app_role));
DROP POLICY IF EXISTS "Admins update settings" ON public.registration_settings;
CREATE POLICY "Admins update settings" ON public.registration_settings FOR UPDATE TO authenticated
 USING (public.has_role((SELECT auth.uid()),'admin'::public.app_role))
 WITH CHECK (public.has_role((SELECT auth.uid()),'admin'::public.app_role));
CREATE OR REPLACE FUNCTION public.guard_application_status_capacity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $fn$
DECLARE max_seats integer; active_count integer;
BEGIN
 IF new.status IN ('pending','accepted') AND old.status NOT IN ('pending','accepted') THEN
   SELECT capacity INTO max_seats FROM public.registration_settings WHERE id=1 FOR UPDATE;
   IF max_seats IS NULL THEN RAISE EXCEPTION 'REGISTRATION_CLOSED'; END IF;
   SELECT count(*) INTO active_count FROM public.applications
    WHERE status IN ('pending','accepted') AND id<>new.id;
   IF active_count >= max_seats THEN RAISE EXCEPTION 'CAPACITY_FULL'; END IF;
 END IF;
 RETURN new;
END $fn$;
REVOKE ALL ON FUNCTION public.guard_application_status_capacity() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS guard_application_status_capacity_trigger ON public.applications;
CREATE TRIGGER guard_application_status_capacity_trigger BEFORE UPDATE OF status
 ON public.applications FOR EACH ROW EXECUTE FUNCTION public.guard_application_status_capacity();
REVOKE ALL ON FUNCTION public.registration_public_status() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.registration_public_status() TO anon,authenticated;
REVOKE ALL ON FUNCTION public.submit_application(
 text,text,text,text,text,text,text,text,text,boolean,boolean,boolean
) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.submit_application(
 text,text,text,text,text,text,text,text,text,boolean,boolean,boolean
) TO anon,authenticated;
COMMIT;
