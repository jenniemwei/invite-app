# Verification — October 7, 2026

## Passed

- Production Next.js 16.4.0 build, including TypeScript validation.
- ESLint: no errors or warnings.
- Vitest: **14 tests passed**. Coverage includes response deadlines, maybe follow-up rules, headcount assumptions, repeat responses, persisted guest separation, host ownership, invalid/revoked links, corrupt-store preservation, and mutation-origin validation through local/proxy hostnames.
- Playwright: **2 browser tests passed** (the complete invitation journey and global phone preview). It creates two distinct personal invitations; tests maybe → yes, decline, reload persistence, invalid-link recovery, and correct host headcount.
- A separate smoke check against the actual **production server** at `127.0.0.1:3100` passed invitation loading, response submission, and host readback. This caught and fixed a local hostname normalization mismatch in origin validation.
- Visually inspected desktop host and 390px-wide guest screenshots. Guest layout has no horizontal overflow with the root text size doubled. This is not a full accessibility audit.
- `npm audit --omit=dev`: **0 production dependency vulnerabilities reported** at verification time.

Screenshots: `verification/host-home.png`, `verification/host-overview.png`, `verification/guest-mobile.png`.

## Prepared local demo

One fictional “Dinner at mine” event with Jamie and Sam. Sam is confirmed; Jamie remains unanswered so the guest flow can be demonstrated. No message was sent. Data lives in the project's private `.data` folder, separate from browser-test data in `.data-e2e`.

The current preview server listens only on `127.0.0.1:3100`. Use the README's LAN instructions to run it for an iPhone on the same network.

## Not yet verified or configured

- Live Supabase provisioning, migration execution, host login/session lifecycle, RLS enforcement against an actual database, and deployed data access. The adapter and schema are implemented; these need live integration checks after credentials are supplied.
- Vercel deployment, a public URL, and custom DNS. No hosting project was created or changed.
- A physical phone, Safari, VoiceOver, or the full browser/accessibility matrix. Browser mobile emulation is not physical-device verification.
- Apple App Clip invocation or native-app synchronization. This is an independent web prototype.

## Dependency note

The full npm audit reports 5 high-severity development-tool entries from a single `braces` advisory propagated through the Next.js ESLint dependency chain (GHSA-vfj7-8cjw-p6xm). The suggested automatic fix downgrades the Next.js lint configuration across major versions. No forced downgrade was applied. Production dependencies have no reported advisories; review the lint-tool update path before production hardening.

## Global phone preview update

- Production build and ESLint pass after adding the global preview shell.
- Browser checks verify the 390px app container, one-column mobile host layouts, preserved form input when toggling, successful creation from the phone frame, and mode persistence across navigation, refresh, and guest pages.
- The existing full invitation journey still passes.
- Visually reviewed the running production host home and event overview inside the phone frame. A 390px browser window has no horizontal page overflow.
- Screenshots: `verification/phone-preview-host.png`, `verification/phone-preview-event.png`.
