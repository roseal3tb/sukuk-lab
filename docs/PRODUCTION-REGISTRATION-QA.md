# SUKUK LAB — Production registration & privacy QA
Date: 2026-11-04. Supabase project: Sukuk-lab. No applicant details or secrets are included.

## Applied and verified on the connected live Supabase project
- Existing public applications and registration_settings tables had RLS enabled **without any policies**: public readers couldn't access applicant rows, but the dashboard also couldn't read them.
- Created protected user_roles table and admin-only SELECT/UPDATE policies for applications and settings. Regular authenticated users cannot read other applicants.
- Explicit SQL GRANT/REVOKE separates the public registration RPC from private applicant data.
- Linked has_role() to auth.uid() so callers cannot check arbitrary identities.
- Added updated_at expected by Admin UI.
- Protected transitions from waitlisted/rejected to accepted/pending with an atomic capacity guard.
- Existing public RPC with 12 registration fields verified as anon under a transaction: **pending**.
- Capacity=1 simulation inside a ROLLBACK transaction: first request **pending**, second request **waitlisted**; an attempt to promote the waitlisted record above capacity raised **CAPACITY_FULL**.
- Verified after tests: **0 stored applicants**, **100 capacity**, waitlist on, registration open, RLS policies = 5.
- Security advisor no longer reports tables with RLS but no policies. The remaining security-definer advisor warnings on registration_public_status and submit_application are intentional public RPC endpoints and should remain under security review and anti-abuse controls.

## Cannot be assumed complete yet
- There are **0 users in Auth** and **0 assigned admin roles**. The dashboard cannot be signed into until an authorized administrator is created.
- No fully operational anti-bot/CAPTCHA integration. Configure server-side verified CAPTCHA or equivalent protection before public marketing; never place the verification secret in Vite/browser code.
- Approve a definitive privacy notice, contact channel, rights request process and retention schedule. The current form's short data-use disclosure does not replace an organization's official privacy policy.
- Run a browser-level signup and privileged admin login test with an authorized test account after that account is created, then delete the disposable test record.

## How the organizer provisions administration safely
1. In Supabase Dashboard > Authentication > Users, create/invite **their own trusted account**. Do not share its password or token with the assistant.
2. Assign admin role to the exact verified user ID using a protected SQL admin session:
```sql
insert into public.user_roles(user_id,role)
values ('YOUR-AUTH-USER-UUID'::uuid,'admin'::public.app_role)
on conflict (user_id,role) do nothing;
```
3. Sign into /admin and check role-gated access to applications, settings, and the export.
4. Verify unauthenticated visitors cannot access private data. Do not make user_roles writable to ordinary users.

## Files
- `supabase/migrations/20261104_secure_registration_rls_admin_and_capacity.sql`: reviewed schema/policies/access protections, synced to live changes.
- `src/styles.css`: partner logo grid layout (same caption height and image area), without changing source logos.
- Register page already has checkbox consent plus a short explanatory data-use disclosure.

## Release decision
Website rendering and source changes can be reviewed now; **full secure public registration is still conditional on creating the admin account, approved privacy wording and effective server-side bot protection**. Changes in the GitHub PR should be reviewed before merging into main.
