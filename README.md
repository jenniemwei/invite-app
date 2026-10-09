# Invitations web prototype

A host workspace and a mobile guest invitation flow in one Next.js application. The interface uses neutral labels without a product name or logo. The project is independent of the native SwiftUI app in `../Invitations`.

## Run locally

Requires Node.js 20.9+ and npm. Tested with Node 25.1.0.

```sh
npm install
npm run dev -- --port 3100
```

Open http://localhost:3100/host. No account, database, or environment file is required in local mode. A fresh data store starts empty; use **Create invitation → Fill with sample details** to create the first event. Sample values live in `src/lib/sample.ts`, never in screen layouts.

The local server persists records in `.data/invitations.json`. A private `.data/invitation-key` derives stable invitation capabilities; preserve both files together. Both paths are ignored by Git and excluded from deployment tracing. Local storage is a single-process demo implementation, not a distributed database.

This workspace is currently preloaded with one fictional dinner and two guests: Sam has confirmed and Jamie is ready to respond. No messages were sent.

## Phone preview

Use the global **Desktop / Phone** control at the top of any page. Phone mode uses the iPhone 17’s 402 × 874-point display dimensions (1206 × 2622 physical pixels at 3×), scaling the entire frame proportionally to fit smaller windows without changing the app’s layout dimensions, with an independently scrolling screen, status bar, and home indicator. The host and guest layouts respond to the frame width using CSS container queries. It is a web layout preview, not an iOS emulator.

The selection is saved in this browser and shared across tabs. Switching modes preserves the current page and unsaved form fields. Navigation resets the phone screen to the top; guest confirmation also scrolls to the top. The preview chrome lives in `src/components/preview-shell.tsx` and never changes invitation URLs or data access.

## Demonstrate the complete journey

1. Create an event; sample-fill is optional.
2. Add Jamie and a personal note. Preview the invitation and copy the private link or open the guest experience in a new tab.
3. Add Sam with a different note and link.
4. In Jamie’s guest tab, choose yes, need time, or cannot attend; optionally write a response note, then confirm.
5. Return to the event’s host workspace and select **Refresh responses**. Only yes adds to the confirmed headcount.
6. Open Sam’s link and confirm that it shows Sam’s note and independent response state.
7. Refresh or reopen a guest link to retrieve the saved answer and change it.

These are real server-persisted responses between browser contexts. There is no Apple App Clip binary, system launch card, or automatic message delivery in this website.

## Use your phone on the same network

Run `npm run dev -- --hostname 0.0.0.0 --port 3100`. On your Mac, find its Wi-Fi IP in System Settings → Network → Wi-Fi → Details. Open `http://YOUR_MAC_IP:3100/host` on the Mac first so copied invitation URLs use that reachable address, then open a guest link on your phone. Both devices must reach the same server; the Mac must remain awake, and the firewall must allow the connection. `localhost` on a phone means the phone, not your Mac.

This mode is for trusted-network demonstrations with sample content. Host controls are intentionally unauthenticated in local mode and available to anyone who can reach the server; this limitation is documented here. Guest-to-host isolation is enforced for the guest endpoints, but local mode does not claim host privacy. Clipboard APIs can be unavailable on plain HTTP on a LAN: select the displayed URL and copy manually. Physical-phone testing has not yet been performed.

## Connect Supabase and deploy

The adapter and SQL schema are implemented. A live Supabase project, credentials, and Vercel deployment have **not** been created or tested.

1. Create a Supabase project and apply `supabase/migrations/001_invitations.sql` in its SQL editor.
2. In Supabase Authentication, create a confirmed host user with an email and password. This prototype provides sign-in/sign-out; self-service registration and password recovery are deferred.
3. Copy `.env.example` to `.env.local`. Set `DATA_MODE=supabase`, your Supabase project URL and publishable key, the **server-only** service-role key, and a stable random `INVITATION_SECRET` of at least 32 characters. Generate the secret with `openssl rand -hex 32`. Never commit credentials or prefix the service-role key/secret with `NEXT_PUBLIC_`.
4. Restart locally and test host login, creating two invitations, guest response, and host readback against the actual database.
5. Import this directory into a separate Vercel project and configure the same environment variables before building. Local mode refuses to run on Vercel rather than silently losing data on ephemeral disk.
6. Open the provided HTTPS URL. Create and share invitations from that origin so copied links work on other devices. A custom domain is optional.
7. Verify the deployed two-device journey and unauthenticated/other-host access before sharing anything beyond sample content.

RLS is enabled on all four tables and direct access for `anon` and `authenticated` roles is revoked. All data operations pass through Next.js server endpoints. The server validates the host session and event ownership, or resolves a guest’s token hash to exactly one invitation. The service-role key intentionally bypasses RLS and must remain server-only; never expose unrestricted database operations to the client. Host access is checked again in every mutation and data read, not just in the layout.

Tokens are HMAC-derived capabilities using a random invitation UUID and a server secret. Only the SHA-256 token hash is stored in the database. The host can regenerate a link without storing its raw token. Protect the secret and do not change it after creating invitations: rotating it requires reissuing links and updating their hashes. A forwarded link transfers access; it is not identity verification. Revoked invitations are rejected by the service; revocation controls are not yet in the UI.

## Code structure

- `src/app/host`: host navigation and server-composed pages.
- `src/app/i/[token]`: mobile guest entry with generic metadata.
- `src/app/api`: JSON endpoints with validation, origin checks, and authorization.
- `src/components`: replaceable forms, invitation rendering, completion, and UI primitives.
- `src/lib/domain.ts`: domain models, validation, counting and deadline rules.
- `src/lib/server/service.ts`: invitation-scoped and host-scoped operations.
- `src/lib/server/repository.ts`: replaceable data interface, local JSON and Supabase adapters.
- `src/lib/server/auth.ts`: Supabase host sessions; explicit open local demo identity.
- `src/lib/sample.ts`: sample content with relative dates.
- `src/app/globals.css`: lightweight colors, font, spacing, and radius tokens with responsive layouts. Tailwind is configured; no comprehensive design system.
- `supabase/migrations`: persistent schema and access restrictions.
- `tests` / `e2e`: domain/service tests and desktop-to-mobile browser journey.

## Rules and limitations

Events, guest invitations/personal notes, delivery records, and responses are separate concepts. Follow-up and counting assumptions live on the response. Only yes counts; silence never becomes yes. Maybe requires a future follow-up no later than the event’s response cutoff. New acceptance at/after the cutoff is rejected; an already confirmed guest may keep their yes, and declining remains available. Changing away from maybe clears the follow-up date. Event times retain their time zone; form inputs use the device’s local time.

Saving displays completion only after server success. Repeat responses update one record. The prototype uses last-write-wins when multiple devices change the same invitation; production versioning, conflict UX, distributed transactions, rate limiting, and operational monitoring remain future work. The local adapter queues file mutations and atomically replaces its JSON file; corrupt files cause an error rather than being reset.

Guest metadata is generic; sensitive URLs should not enter analytics. Referrer suppression, no-index headers, and no-store responses are configured, but infrastructure access logs may still include URL paths. This prototype has no analytics or third-party media assets.

Accessibility includes semantic controls, visible labels, keyboard focus, live error/status messages, reduced-motion support, scrollable mobile layouts, and no fixed text heights. A full VoiceOver and browser/device audit remains outstanding. The guest experience is a normal browser page and does not pretend to invoke Apple’s system UI.

Deferred: editing/deleting events or guest details after creation, invitation reissue/revocation UI, automatic reminders, automated texting, PDFs/printing, scanning, analytics, polished branding, Apple invocation configuration, and synchronization with the separate native project.

## Verification commands

```sh
npm run test
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

The browser test uses installed Google Chrome, starts an isolated server at port 3101, and stores disposable data in `.data-e2e`. It covers two personal links, maybe/yes/no, changed responses, persistence after refresh, invalid links, and host headcount. Screenshots are saved in `verification/`. See `VALIDATION.md` for actual results and unverified integrations.
