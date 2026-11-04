-- SUKUK LAB: align database fields with the existing public registration form.
-- Run this AFTER drizzle/migrations/0000_migration.sql on the intended Supabase
-- project. This migration does not overwrite or delete any existing application.
-- Opening registration requires successful setup AND a real end-to-end test.
BEGIN;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS study_year text,
  ADD COLUMN IF NOT EXISTS sukuk_knowledge text,
  ADD COLUMN IF NOT EXISTS motivation text,
  ADD COLUMN IF NOT EXISTS learning_goal text,
  ADD COLUMN IF NOT EXISTS ithmar_member boolean,
  ADD COLUMN IF NOT EXISTS can_attend_all_days boolean;

-- The legacy six-argument overload must not silently bypass the new questions.
DROP FUNCTION IF EXISTS public.submit_application(text,text,text,text,text,boolean);

CREATE OR REPLACE FUNCTION public.submit_application(
  _full_name text,
  _email text,
  _phone text,
  _university text,
  _major text,
  _study_year text,
  _sukuk_knowledge text,
  _motivation text,
  _learning_goal text,
  _ithmar_member boolean,
  _can_attend_all_days boolean,
  _consent boolean
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  s public.registration_settings;
  taken integer;
  new_status public.application_status;
BEGIN
  -- Serialize attempts through the one settings row to enforce capacity safely.
  SELECT * INTO s FROM public.registration_settings WHERE id = 1 FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'REGISTRATION_CLOSED'; END IF;
  IF NOT s.is_open THEN RAISE EXCEPTION 'REGISTRATION_CLOSED'; END IF;

  _full_name := btrim(coalesce(_full_name, ''));
  _email := lower(btrim(coalesce(_email, '')));
  _phone := regexp_replace(coalesce(_phone, ''), '[[:space:]()\-]', '', 'g');
  _university := btrim(coalesce(_university, ''));
  _major := btrim(coalesce(_major, ''));
  _study_year := btrim(coalesce(_study_year, ''));
  _sukuk_knowledge := btrim(coalesce(_sukuk_knowledge, ''));
  _motivation := btrim(coalesce(_motivation, ''));
  _learning_goal := btrim(coalesce(_learning_goal, ''));

  IF _consent IS DISTINCT FROM true THEN RAISE EXCEPTION 'CONSENT_REQUIRED'; END IF;
  IF length(_full_name) NOT BETWEEN 5 AND 120 OR
     array_length(regexp_split_to_array(_full_name, '[[:space:]]+'), 1) < 3
  THEN RAISE EXCEPTION 'INVALID_NAME'; END IF;
  IF length(_email) > 255 OR _email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  THEN RAISE EXCEPTION 'INVALID_EMAIL'; END IF;
  IF _phone !~ '^\+?[0-9]{9,15}$' THEN RAISE EXCEPTION 'INVALID_PHONE'; END IF;
  IF length(_university) NOT BETWEEN 2 AND 150 THEN RAISE EXCEPTION 'INVALID_UNIVERSITY'; END IF;
  IF length(_major) NOT BETWEEN 2 AND 150 THEN RAISE EXCEPTION 'INVALID_MAJOR'; END IF;
  IF length(_study_year) NOT BETWEEN 2 AND 80 THEN RAISE EXCEPTION 'INVALID_YEAR'; END IF;
  IF length(_sukuk_knowledge) NOT BETWEEN 5 AND 600 THEN RAISE EXCEPTION 'INVALID_KNOWLEDGE'; END IF;
  IF length(_motivation) NOT BETWEEN 10 AND 1200 THEN RAISE EXCEPTION 'INVALID_MOTIVATION'; END IF;
  IF length(_learning_goal) NOT BETWEEN 10 AND 1200 THEN RAISE EXCEPTION 'INVALID_LEARNING_GOAL'; END IF;
  IF _ithmar_member IS NULL THEN RAISE EXCEPTION 'INVALID_MEMBERSHIP'; END IF;
  IF _can_attend_all_days IS NULL THEN RAISE EXCEPTION 'INVALID_ATTENDANCE'; END IF;

  IF EXISTS (SELECT 1 FROM public.applications WHERE lower(email) = _email)
  THEN RAISE EXCEPTION 'DUPLICATE_EMAIL'; END IF;

  SELECT count(*) INTO taken
  FROM public.applications WHERE status IN ('pending', 'accepted');

  IF taken >= s.capacity THEN
    IF NOT s.waitlist_enabled THEN RAISE EXCEPTION 'CAPACITY_FULL'; END IF;
    new_status := 'waitlisted';
  ELSE
    new_status := 'pending';
  END IF;

  INSERT INTO public.applications (
    full_name, email, phone, university, major,
    study_year, sukuk_knowledge, motivation, learning_goal,
    ithmar_member, can_attend_all_days, consent, status
  ) VALUES (
    _full_name, _email, _phone, _university, _major,
    _study_year, _sukuk_knowledge, _motivation, _learning_goal,
    _ithmar_member, _can_attend_all_days, true, new_status
  );
  RETURN new_status::text;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'DUPLICATE_EMAIL';
END;
$$;

-- Public visitors can submit, not inspect or modify applications.
REVOKE ALL ON FUNCTION public.submit_application(
  text,text,text,text,text,text,text,text,text,boolean,boolean,boolean
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_application(
  text,text,text,text,text,text,text,text,text,boolean,boolean,boolean
) TO anon, authenticated;

-- Existing RLS policies in the baseline restrict application reads to admins.
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- User-requested opening; apply only after end-to-end verification in Supabase.
-- To open after verification, execute the separate 20261104_open_registration.sql.
COMMIT;
