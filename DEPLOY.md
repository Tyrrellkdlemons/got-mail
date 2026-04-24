# Deploy Guide

Got Mail deploys to **Netlify** via **GitHub**. Same pattern as the crypto project batch file.

## One-time setup

### 1. Create the GitHub repo

```
gh repo create got-mail --public --source=. --remote=origin
```

Or manually on github.com, then:

```
git init
git remote add origin https://github.com/<your-user>/got-mail.git
git add .
git commit -m "Initial Got Mail scaffold"
git branch -M main
git push -u origin main
```

### 2. Connect Netlify

1. Log into netlify.com.
2. **Add new site** → **Import an existing project** → **GitHub** → pick your `got-mail` repo.
3. Build settings are auto-detected from `netlify.toml`, but confirm:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Environment variables — add at minimum:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `APP_URL`
   - Provider API keys you use (`BREVO_API_KEY`, `RESEND_API_KEY`, etc.)
5. **Deploy site**.

### 3. Custom domain (optional)

In Netlify: **Domain management** → **Add custom domain** → follow the DNS instructions.

## Daily workflow

### Push code changes

Double-click **`PUSH_TO_GITHUB.bat`** — commits everything in the repo, pushes to `main`. Netlify auto-builds.

### Full build-and-deploy

Double-click **`DEPLOY.bat`** — runs `npm run build` locally to catch errors, then commits and pushes. Netlify rebuilds on its side.

## Database on Netlify

Netlify doesn't host your database. Options:

- **Supabase** (free tier) — drop-in Postgres. Update `DATABASE_URL` in Netlify env.
- **Neon** (free tier) — serverless Postgres, friendly with Prisma.
- **Turso** (free tier) — libSQL (SQLite-compatible), good for small apps.
- **Railway** — Postgres + worker processes for queue.

Update `prisma/schema.prisma` `provider` from `"sqlite"` to `"postgresql"` when switching.

## Queue / worker on Netlify

Netlify is serverless, so for the sending engine you have two options:

1. **Scheduled Netlify Function** — runs every minute, picks ready batches from the DB queue. Simple, good for <10k/day.
2. **Separate worker** on Railway/Fly.io/Render — one small always-on container that polls the DB queue. Recommended for higher volume.

Both are documented in `src/lib/queue/worker.ts`.

## Environment variables

See `.env.example` for the full list. Production bare minimum:

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<random 32+ chars>
APP_URL=https://yourdomain.com
```

Plus at least one provider key.

## Rollback

On Netlify → **Deploys** tab → click any previous deploy → **Publish deploy**. Instant rollback.
