# ROADMAP — INTERACT 2026

Status of the PRD v2 rebuild. Foundation, RBAC, Super Admin dashboard and the participant dashboard are done.
Remaining slices are ordered by dependency. Every slice is permission-gated via `lib/rbac.ts` (`assertPermission` / `assertEventScope`).

## Done (Slices 0–6)

- Single `User` identity model; legacy Users/Registrants/Events/EventRegistrations schema removed.
- Only session mechanism is `auth_token` (`lib/authCookie.ts`).
- PRD §20 permission matrix in `lib/rbac-data.ts` (pure) + `lib/rbac.ts` (Prisma-backed). SUPER_ADMIN bypasses all permission/scope checks.
- Seed: `npx -p tsx tsx scripts/seed-rbac.ts` (idempotent: 27 permissions, 9 roles, colleges, test events, demo users incl. teams/invites/orders). Wipe data first via `scripts/wipe.ts` (FK-safe ordering).
- Super Admin dashboard live at `/admin` (shadcn template shell).
- Participant dashboard live at `/dashboard`: overview + announcements + live results + certificates, registrations with QR digital passes (`qrcode`), teams (create/invite), invites (accept/reject), orders (submit UPI payment), profile.
- Coordinator dashboard live at `/coordinator`: assigned-events overview with per-event stats, event detail (config/registrations/participants-by-college/announcements/results), scoped announcements API `POST /api/announcements`.
- QR attendance live at `/attendance`: staff check-in/out by QR token (`POST /api/attendance/scan`, `Attendance.checkedBy` FK) with daily stats and today's scan table; blocks unconfirmed registrations; scoped.
- Judging & results live at `/judge`: judges submit per-entry final scores (`POST /api/judging/score`, `results.score`), coordinator publishes `POST /api/judging/publish` (compute standings → Result rows WINNER/RUNNER_UP, `results.manage`), live results on coordinator + judge + participant dashboard; shared `lib/judging.ts`.
- Certificates live at `/certificates` (CERTIFICATE_ADMIN workspace): issue per participant/event/type (`POST /api/certificates`, `certificates.manage`), PDF via `jspdf` (`/api/certificates/[certificateId]/download`), participant downloads on `/dashboard`, public `/verify/[token]` page; `certificates.download` added to CERTIFICATE_ADMIN role.
- Payments v2 live at `/payments` (FINANCE_ADMIN workspace): ledger of orders + per-registration payments, summary stats (collected/awaiting/successful/refunded), verify (`POST /api/payments/[orderId]/verify`, `payments.verify`) and reject (`POST /api/payments/[orderId]/reject` with reason, `payments.manage`). Order verification extracted to `lib/orderVerification.ts`, shared by the legacy `/api/admin/orders/[orderId]/verify` route; verifying auto-creates CONFIRMED registration + attendee + QRPass + SUCCESS payment. `FINANCE_ADMIN` home → `/payments`.
- Identity/QR service `lib/participantService.ts` — admin verify creates Payment + Participant + Attendee + QRPass per registration.
- Route guarding via `middleware.ts` + page guards; role homes verified; public navbar/footer hidden on all app shells (incl. `/certificates`, `/payments`).

## Slice 7 — College admin dashboard

- College code meet access, participant roster management, document/eligibility verification.

## Open follow-ups

- Final audit & reporting pages polish; ROADMAP itself will track test coverage.
- `UploadThing` / email SMTP config are still env-gated placeholders.