# Sikh ID admin dashboard

Internal dashboard for managing the whole Sikh Group ecosystem: member base,
segments, and email campaigns. Runs as a separate Next.js app from the
member-facing dashboard, on its own port, protected by a single admin key.

## Pages

- `/overview` — headline stats (total members, average completion, fully
  complete profiles, new signups), a completion distribution chart, and
  top industries/interests across the member base.
- `/users` — searchable, filterable member list (by name/email/Sikh ID and
  completion range).
- `/segments` — the segment builder: pick completion range, industries,
  interests, and platform opt-ins, preview the live match count, then save.
  Segments re-evaluate against current data every time they're used —
  never a frozen snapshot.
- `/campaigns` — compose a subject + HTML body, pick a saved segment, send.
  Queues one job per member onto the same BullMQ queue the backend's
  campaign worker already consumes.

## Setup

```bash
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_BASE_URL
npm install
npm run dev                        # http://localhost:3001
```

Log in with the same `ADMIN_API_KEY` value set in `vps-backend/.env`.

## New backend endpoints this dashboard needs

Two additions were made to `vps-backend` to support this:
- `GET /api/v1/admin/stats` — headline numbers + completion distribution
- `GET /api/v1/admin/users` — paginated, searchable member list

Both are admin-key protected via the same `requireAdmin` middleware as
segments and campaigns. If you already deployed the backend from before,
pull these two files in:
`src/controllers/admin.controller.js`, `src/routes/admin.routes.js`,
and the two lines wiring them into `src/app.js`.

## Deploying alongside the rest

Same pattern as the member dashboard — build and run under PM2 on its own
subdomain, e.g. `admin.thesikhgroup.com`:

```bash
npm run build
pm2 start npm --name sikh-id-admin -- start
```

Consider putting this subdomain behind an extra layer (VPN, IP allowlist,
or at minimum HTTP basic auth in Nginx) in addition to the admin key —
the admin key alone is enough to send email to your whole member base.
