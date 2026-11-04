# SUKUK LAB — Prelaunch UX/UI · QA · Senior Engineering Review
**Date:** 2026-11-04 (Asia/Riyadh)  
**Review base:** `main` commit `3d0fdd2417cb7f1f65353e0b8519671a932d9a22`  
**QA patch branch:** `qa/prelaunch-hardening-20261104`  
**Production:** Vercel READY for the base merge (not evidence of backend functionality).

## Decision

**Conditional / NOT READY for public applications** until the following release blockers are closed with live evidence. The brochure/landing design and content have strong coverage of the requested program, but passing a build alone does not validate registration or data privacy.

## Source of truth / intentional exceptions

1. `Sukuk-Lab-Proposal.pdf`: program facts, five objectives, three-day agenda, case study, audience, outcome and 100-participant target.
2. `SukukLab-Brochure-A5.pdf`: layout reference and partner/logo placement. Cover shows Sukuk Capital as lead sponsor and the Financial Academy as hosting partner.
3. `SUKUK LAB BLACK.pdf`: brand palette `#121212`, `#1E1E1E`, `#C9A24A`, `#E8E8E8`, `#F6F4EE`.
4. **User-approved changes:** event dates **8–10 November 2026** in place of the proposal's 25–27 October; case study remains a **third experience card**, NOT a standalone page section; hero illustration uses only the gold brand symbol without lettering; footer quick links form two close columns.

## Proposal alignment

| Requirement | State | Evidence / caveat |
|---|---|---|
| Program identity and slogan | PASS | Main hero and about section |
| Three consecutive days, Riyadh | PASS with intentional user-date revision | `src/lib/program.ts`; Nov 8, 9, 10 |
| Audience, majors, no prerequisite knowledge | PASS | Audience section |
| Objectives (5) | PASS | `objectives`; fourth objective now explicitly mentions case study |
| Dialogue/workshop/case study trio | PASS | `experiences` maps to three cards; no standalone case-study section |
| Detailed three-day agenda | PASS | `programAgenda`; coupon, maturity, YTM, risks; 3–5 minute presentations |
| Outputs (4) | PASS | `outcomes`; attendance certificate statement per proposal |
| 100 target + waiting list | CODE PRESENT; NOT LIVE VERIFIED | Database settings and application RPC must be inspected |
| Sponsor and host | DOCUMENTED; verify before external publication | Cover supports labels; logos require final event approval |
| Registration questions | NEEDS APPROVAL | Year, sukuk knowledge, motivation, learning goal, Ithmar membership, and commitment were added to UI but not enumerated in proposal |

## Engineering / functional audit

- `main` was merged in PR #1; Vercel has a READY **production** deployment. This confirms build/deployment readiness, not live database behavior.
- Public submit uses a `SECURITY DEFINER` RPC with 12 inputs; a **separate migration file** adds corresponding columns. The base migration still has a six-argument function. Verify that the alignment migration ran on the real production database and that the old overload was removed there.
- `applications` enables RLS in migration source. Anonymous users have RPC execute but no direct `SELECT` grant; administrators read/update via roles. **Actual effective policies and auth roles require live Supabase inspection.**
- Capacity is enforced within a row lock in SQL source; waitlist is designed to start after pending+accepted reaches capacity. Test simultaneous submissions with a disposable development database, not real applicant data.
- Register page now hides the otherwise unusable form when seats are exhausted and waitlist is off.
- Client-side Zod validations and consent error focus have been improved; the data-use disclosure is concise, but an approved full privacy notice/retention period/rights contact is not present.
- Admin login now handles connection exceptions and resets the busy indicator.
- Admin applications query now paginates beyond the default 1,000-row limit; exports include all loaded approved fields and escape formula-prefix values in CSV.
- Closed mobile menu links now leave keyboard tab order.
- Source-controlled `.env` includes project URL and publishable/anon-style keys only per key-name audit; no service-role key name was detected. Still avoid putting any secret credentials in Vite-prefixed variables.
- Missing spam/bot/rate-limit protection for the public RPC: **release blocker** if open to broad audiences.
- SQL migration source is reviewed; no destructive/production data writes were performed in this QA pass.

## UI/visual audit

- Good visual system: charcoal/dark hero, ivory editorial content, gold accent used sparingly, gold-only certificate logo traced from the user-provided mark.
- `prefers-reduced-motion` implemented; one-time reveal animation and mobile breakpoints are present. Manual keyboard/VoiceOver/browser-device exploration is still required.
- Third Case Study card and two-column footer preserved. Footer grid adjusted to keep columns visually adjacent.
- CSS is sizeable (~1400 lines, many `!important` overrides). Refactoring is recommended for maintainability but must be isolated and screenshot-regression tested, not rushed before launch.
- Performance (Lighthouse Core Web Vitals), real contrast audit with browser rendering, tested forms on actual iOS/Android and keyboard focus-trapping in admin modal are **not yet measured**; do not invent grades.
- Open Graph references a large Twitter card without a verified raster social image; an OG image is an optional polish task.

## Release blockers (P0)

1. **Connect to production Supabase and confirm schema, RPC overload, RLS, registration status, capacity, and admin roles read-only**, without exposing or exporting applicant PII.
2. **Complete consent/privacy approval:** identify an official contact channel, retention policy, and rights/complaint process; do not improvise organizational legal terms.
3. **Protect the publicly executable registration RPC against abuse/rate-limiting**, e.g. CAPTCHA verified server-side or platform throttling; client-only honeypot is insufficient.
4. **Run a controlled end-to-end registration test with a disposable email** in a test project: one success, duplicate rejection, closed mode, full/waitlist, unauthorized read denied, admin view/update/export. Remove test records afterwards.
5. Confirm final event date, partner/sponsor approval, and whether all optional form questions are intended.

## QA fixes included on this branch

- Registration capacity/waitlist conditional rendering, checkbox error semantics, fieldset focus, data-use disclosure.
- Robust admin login error handling and complete paginated applicant export.
- Mobile navigation keyboard focus safety.
- Fourth objective references the proposal's real-world case study explicitly.
- Gold-only hero symbol traced from the uploaded icon rather than approximated.
- CI runs on QA and main for TypeScript, build, Vitest, and ESLint.
- Source-content and launch-regression tests; user-facing case study remains one card.
- Documentation corrected to reflect the already merged PR and production deployment.

**Release policy:** No merge of this QA branch into `main` and no production database migration/registration opening should be done until a final live backend test and stakeholder approval. Keep personal applicant data private in any screenshots, logs, issues or test reports.
