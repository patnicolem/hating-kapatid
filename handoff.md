# Handoff — Hating Kapatid

Session reference for resuming work. Update this file at the end of every session.

## Project Overview

**Hating Kapatid** is a group expense-splitting web app ("ambagan made easy") for Filipino groups. Users create expense groups, add members (via email invitations), record shared expenses with flexible splits (equal / amount / percent), and track who owes whom.

**Stack**
- Next.js 16.2.12 (App Router) — NOTE: breaking changes vs older Next.js; read `node_modules/next/dist/docs/` before writing code (see AGENTS.md)
- React 19.2.4
- TypeScript 5.9
- Prisma 7 + PostgreSQL (via `@prisma/adapter-pg`)
- Tailwind CSS v4
- Auth: password + Google OAuth (SSO), sessions via `jose` (JWT in cookies)
- Email: `nodemailer` (used for group invitations)

**Run the app**
```bash
npm install
npm run dev        # http://localhost:3000
```
Other scripts: `build`, `start`, `lint`.

## Repo / Git State

- Branch `main`; remote `origin` = `https://github.com/patnicolem/hating-kapatid.git`
- Working tree clean, up to date with `origin/main`
- 9 commits. Latest: `6517023` — "feat: add user auth, Google SSO, friends, email invites, and persistence" (2026-08-14)

## Database

- PostgreSQL at `db.prisma.io:5432`, database `postgres`, schema `public` (via `DATABASE_URL` in `.env`)
- 5 migrations applied; `npx prisma migrate status` reports **up to date**
- Migrations: `init`, `add_settlements`, `add_group_currency`, `add_friends`, `add_invite_link`
- Schema: `prisma/schema.prisma`; client generated to `lib/generated/prisma` (gitignored)

**Models:** User, Group, GroupMember, GroupInvitation, Expense, ExpenseSplit, Settlement, Friend
**Enums:** GroupRole (OWNER/ADMIN/MEMBER), FriendStatus, InvitationStatus, SplitType (EQUAL/AMOUNT/PERCENT), SettlementStatus (PENDING/COMPLETED/CANCELLED)

## Feature Inventory

### Pages (`app/`)
| Route | Purpose |
|---|---|
| `/login` | Login / register (password) + Google SSO |
| `/` | Dashboard: group list with balances, group invitations, friend requests |
| `/groups` | Group manager: create/edit/delete groups, members, invite by email, expense CRUD, expense summary |
| `/friends` | Add friends by email, accept/decline requests, list friends, pending sent |
| `/settings` | Edit profile (name/email), change password (password users only) |

### API Routes (`app/api/`)
- `auth/{login,register,logout,me,google,google/callback}`
- `friends` (POST add) + `friends/[friendId]/{accept,reject}`
- `groups` (GET/POST) + `groups/[groupId]` (PATCH/DELETE)
- `groups/[groupId]/expenses` (GET/POST) + `.../expenses/[expenseId]` (PATCH/DELETE)
- `groups/[groupId]/members` (POST invite) + `.../members/[memberId]` (DELETE only — admin edit removed)
- `groups/[groupId]/invite-link` (POST, admin-only → `{ url }`)
- `invite/[token]` (GET public preview + POST join, auto-friends with inviter)
- `invitations` (GET) + `invitations/[invitationId]/{accept,reject}`
- `test-db` (ad-hoc POST create group; not part of normal flows)

### Core Logic (`lib/`)
- `balances.ts` — net balance per member, currency formatting
- `expenses/validation.ts` — expense split validation (equal/amount/percent)
- `access.ts` — membership + role checks; `auth.ts`/`session.ts`/`password.ts` — auth; `mappers.ts` — group serialization; `invitations.ts`/`friends.ts`/`mail.ts`/`google.ts`

### Working as of last session
Auth (password + Google SSO), groups CRUD, member invites via email, friends, expense CRUD with splits, per-member net balances, dashboards, settings, responsive layout, dark/light theme.

## Known Gaps / In-Progress

1. **Settlements not exposed** — `Settlement` model + `add_settlements` migration exist, and `lib/expenses/settlement.ts` is a stub, but there are **no settlement API routes and no UI**. Settlement logic is the next logical feature.
2. **Empty stubs** — `lib/expenses/calculations.ts` and `lib/expenses/settlement.ts` are 0-byte placeholder files.
3. **Dead code** — `components/UnderConstruction.tsx` is never imported; safe to remove or use.
4. **Planned refactor** — empty subdirs `components/{expenses,groups,layout,members,settlements}/` suggest splitting the monolithic `app/(main)/groups/page.tsx` (1157 lines) into smaller components.
5. **README.md** is still default create-next-app boilerplate — needs a real project description.

## Environment Variables (names only — values in `.env`, gitignored)

`DATABASE_URL`, `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_COOKIE_SECURE`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `APP_URL`

## Useful Commands

```bash
npm run dev        # dev server
npm run lint       # eslint (target: 0 warnings)
npm run build      # production build
npm run start      # serve production build
npx prisma migrate status   # check DB vs migrations
npx prisma migrate dev      # create + apply migration (after schema change)
```

## Session Notes

- Add a dated entry here at the end of each session summarizing what changed, what's next, and any blockers.

- **2026-08-14 — Auto-friend on group invite acceptance.** `lib/invitations.ts` `acceptGroupInvitation` now runs in a `prisma.$transaction` and creates an `ACCEPTED` friendship between the inviter and the accepting user (resolves any pending request; no-op if already accepted). Friends-page standalone add flow intentionally left two-step. Verified: `npm run lint` clean (pre-existing `roboto` warning only) and `npx tsc --noEmit` passes. Next: consider settling expenses feature (model exists, no API/UI).

- **2026-08-14 — Fixed React "script tag" hydration warning + lint cleanup.** Added `components/InlineScript.tsx` (from Next.js 16 guide `preventing-flash-before-hydration.md`: `type="text/javascript"` on server / `text/plain` on client + `suppressHydrationWarning`) and used it for the theme-init script in `app/layout.tsx`; added `suppressHydrationWarning` to `<html>`. Removed unused `Roboto` font import (fixed the last lint warning). `npm run lint` now clean (0 warnings), `npx tsc --noEmit` passes.

- **2026-08-14 — Fixed theme hydration mismatch (Sun/Moon swap).** `Header.tsx` and `ThemeToggle.tsx` read `document`/`localStorage` in a lazy `useState` initializer, so the client's first render (dark → Sun) disagreed with the server (light → Moon). Created shared hook `lib/useTheme.ts` using `useSyncExternalStore` (server snapshot `false`, `storage` + custom `hk-theme-change` event subscription) and refactored both components to use it. `toggle` updates the `<html>` class, localStorage, and dispatches the custom event. Verified `npm run lint` and `npx tsc --noEmit` pass.

- **2026-08-14 — Removed member-edit (admins can only delete).** Rewrote `components/MemberList.tsx` to a delete-only list, dropped `updateMember`/`onUpdateMember` prop and unused `Member` import from `app/(main)/groups/page.tsx`, and removed the `PATCH` handler + `toMember` import from `app/api/groups/[groupId]/members/[memberId]/route.ts`. `npm run lint` + `npx tsc --noEmit` clean.

- **2026-08-14 — Group invite links (multi-use, admin-only, auto-friend on join).** Schema: `GroupInvitation.email` → `String?` and new `token String? @unique`; migration `20260814215250_add_invite_link` applied via `migrate diff`/`migrate deploy` (note: `migrate dev` needs a TTY and fails in this shell). Extracted `ensureFriendship(tx, inviterId, userId)` in `lib/invitations.ts` (idempotent: upgrades PENDING→ACCEPTED, else creates ACCEPTED; no-op if same user). New routes: `POST /api/groups/[groupId]/invite-link` (admin-only, reuses the existing pending link row and returns `{ url }`), `GET/POST /api/invite/[token]` (public preview + authenticated join via `ensureFriendship`), and public page `app/invite/[token]/page.tsx` (login CTA carries `next`). `app/(main)/groups/page.tsx` has an admin-only "Copy invite link" (`Link2`) button calling `copyInviteLink()`. Login `next` support: `getNextPath()` + redirect on `/login`, and `oauth_next` cookie flow in `app/api/auth/google/route.ts` → `app/api/auth/google/callback/route.ts`. Smoke-tested against the dev server: create link (200 `{url}`), public GET preview (200 group+inviter), join as existing member (200 `{groupId}`), and no duplicate friend row created (idempotent). Restarting the dev server is required after a Prisma client regen (old server 500s with `Unknown argument 'token'`).

- **2026-08-14 — Smoke-test notes.** Pat = `cmsrm4g0g0000rcdd4bekvclo` (patmalubago@gmail.com), Trisha = `cmsro3r4c00029gddmr3rw68y` (patriciammalubago@gmail.com). Both are members of group `cmsrm4moq0001rcddfer35hez` (now named "Taiwan 2027"; Pat is OWNER). Pat↔Trisha ACCEPTED friendship existed already (rows in both directions from earlier two-step testing); invite-link join correctly added no duplicates. A third test user `cmsszuux10000h4ddnfua5ssw` is ACCEPTED-friends with Pat and Trisha from manual browser testing. Session cookie values for re-testing live in `C:\Users\Pat\AppData\Local\Temp\opencode\{pat,trisha}.txt`.