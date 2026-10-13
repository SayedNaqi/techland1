# TechLand Backend — PostgreSQL + Docker + Express + JWT + bcrypt

Secure replacement for the previous browser-localStorage demo:
- **Admin login** → `POST /api/admin/login` — password verified with **bcrypt** (12 rounds), session is a short-lived **JWT** (12h). Nothing secret stays in the browser except the token. Bootstrap `admin / admin123` has `must_change_password=true` — change it in Admin → Settings (calls `POST /api/admin/change-credentials`, re-hashed server-side).
- **User profiles** → `POST /api/auth/register|login` — stored in **PostgreSQL** `users`, passwords bcrypt-hashed. No demo hash, no per-browser accounts.
- **Admin stats** → `GET /api/admin/stats` — real `COUNT(*)` / `SUM()` queries on Postgres (users, transactions, revenue, pending), not browser data.

## Quick start (Windows / PowerShell)

> Host port **5433** is used because a local PostgreSQL service usually occupies 5432 on Windows. Inside docker the backend still talks to `postgres:5432`.

```powershell
# 1) strong secret (run once, put in backend/.env or $env:JWT_SECRET)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 2) start everything (postgres + migrate + api)
docker compose up -d --build
docker compose logs -f backend   # wait for: [api] TechLand backend listening on :4000

# 3) health checks
Invoke-RestMethod http://localhost:4000/health
Invoke-RestMethod http://localhost:4000/api/health   # { ok:true, db:'up' }

# 4) connect the frontend (new terminal, repo root)
Copy-Item .env.example .env   # contains VITE_API_URL=http://localhost:4000
npm install
npm run dev                   # http://localhost:3000 — admin + payment pages now use the API
```

Without `VITE_API_URL` the frontend keeps the old demo localStorage mode. With it, it uses JWT + Postgres.

## Manual run (without docker, needs the compose postgres up)

```powershell
Copy-Item backend/.env.example backend/.env   # edit JWT_SECRET + DATABASE_URL (host port 5433)
cd backend; npm install
$env:DATABASE_URL="postgres://techland:techland_dev_password@localhost:5433/techland"
$env:JWT_SECRET="<long-random-hex>"
node scripts/migrate.js   # schema + bootstrap admin (skipped if admins exist)
node src/index.js         # :4000
```

## API reference

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health`, `/api/health` | — | liveness, DB check |
| POST | `/api/auth/register` | — | `{name,email,password≥8}` → `{user,token}` |
| POST | `/api/auth/login` | — | `{email,password}` → `{user,token}` |
| GET | `/api/auth/me` | user JWT | current profile |
| POST | `/api/admin/login` | — (rate-limited) | `{username,password}` → `{token,admin,mustChangePassword}` |
| GET | `/api/admin/me` | admin JWT | |
| POST | `/api/admin/change-credentials` | admin JWT | `{username?,newPassword≥8?}` |
| GET | `/api/admin/stats` | admin JWT | real counts + revenue |
| GET | `/api/admin/users?limit&q` | admin JWT | |
| PATCH | `/api/admin/users/:id/subscription` | admin JWT | `{planId?,status}` |
| DELETE | `/api/admin/users/:id` | admin JWT | |
| GET | `/api/admin/transactions` | admin JWT | review queue |
| PATCH | `/api/admin/transactions/:id/status` | admin JWT | approve/reject/refund + syncs user subscription |
| GET/POST | `/api/admin/opportunities|guides|visa-topics` | admin JWT | CMS CRUD (upsert by slug) |
| GET | `/api/admin/plans` | admin JWT | all plans incl. inactive |
| POST | `/api/admin/plans` | admin JWT | create `{id, priceUSD, nameEn, ...}` |
| PUT | `/api/admin/plans/:id` | admin JWT | update price/names/features/flags (future payments use new price; history keeps old amounts) |
| GET | `/api/admin/videos` | admin JWT | all videos (movies & series) |
| POST | `/api/admin/videos` | admin JWT | create `{slug, kind, titleEn, parts:[{embedUrl ok.ru/VK watch or embed link}]}` — links auto-normalized, other hosts rejected |
| PUT/DELETE | `/api/admin/videos/:slug` | admin JWT | update / delete |
| POST | `/api/admin/upload/video-file` | admin JWT | multipart `file` (.mp4/.webm/.mov/.m3u8, ≤MAX_UPLOAD_MB) → `{url: /media/...}` for native-player parts; served with Range support |
| GET/POST | `/api/admin/ads` | admin JWT | ad banners per slot |
| PUT/DELETE | `/api/admin/ads/:id` | admin JWT | update / delete |
| DELETE | `/api/admin/plans/:id` | admin JWT | history preserved (transactions keep plan_id) |
| DELETE | `/api/admin/:content/:slug` | admin JWT | |
| GET/PUT | `/api/admin/settings` | admin JWT | singleton site settings |
| POST | `/api/payments/hesabpay` | user JWT | `{planId,reference}` → pending tx |
| GET | `/api/payments/mine` | user JWT | own history |
| GET | `/api/public/{opportunities,guides,visa-topics,settings,settings/qr,plans}` | — | public catalog |

Plans: `plan-monthly` $5.99 · `plan-quarterly` $14.99 · `plan-yearly` $49.99 · `plan-lifetime` $149.99 (amounts stored as integer cents).

## Security notes

- bcrypt cost 12, JWT secrets ≥32 chars, login rate-limits, helmet, CORS allowlist (`FRONTEND_ORIGIN`), zod validation, parameterized SQL only.
- Change the bootstrap admin password immediately; `mustChangePassword` is returned on login until you do.
- Use HTTPS + `JWT_SECRET` from a vault in production; this compose file is for dev/self-host.
