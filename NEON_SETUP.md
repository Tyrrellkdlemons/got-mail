# Neon Database Setup — Got Mail

A Neon Postgres project has been created for Got Mail:

- **Project name:** `got-mail`
- **Region:** AWS US West 2 (Oregon) — closest to California
- **Postgres version:** 17
- **Database:** `neondb`
- **Role:** `neondb_owner`
- **Host (pooled):** `ep-square-firefly-akibved5-pooler.c-3.us-west-2.aws.neon.tech`
- **Free plan includes:** 0.5 GB storage · autoscaling up to 2 CU · scales to zero when idle · 10 branches per project

## Grab the connection string

1. Open https://console.neon.tech/app/projects/steep-hall-70703569
2. Click **Connect** at the top right.
3. Ensure **Connection pooling** is ON (it is by default).
4. Click **Copy snippet**. You'll get a string like:
   ```
   postgresql://neondb_owner:<PASSWORD>@ep-square-firefly-akibved5-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

## Paste into `.env`

```
DATABASE_URL="postgresql://neondb_owner:<PASSWORD>@ep-square-firefly-akibved5-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require&pgbouncer=true"
DIRECT_URL="postgresql://neondb_owner:<PASSWORD>@ep-square-firefly-akibved5.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require"
```

Notes:
- `DATABASE_URL` uses the **pooled** host (ends with `-pooler`) with `pgbouncer=true`. Good for normal queries.
- `DIRECT_URL` uses the **direct** host (no `-pooler`) and is used by Prisma Migrate. Set it to the same connection string but drop `-pooler` from the hostname.
- If you'd rather have the pooler decide, you can reuse the pooled URL for both — but migrations will be a touch slower.

## Run migrations against Neon

```bash
# Switch prisma to postgres (see prisma/schema.prisma header)
npx prisma migrate dev --name init
npx prisma db seed
```

## Add these to Netlify env vars too

When you wire Netlify up (`DEPLOY.md`), paste the same two vars into **Site settings → Environment variables**.

## Branching (optional, free)

Neon free plan gives you 10 branches. You can spin a throwaway branch for preview deploys:

```bash
# in CI
neonctl branches create --name preview-$BRANCH --project-id steep-hall-70703569
```

…and wire the preview `DATABASE_URL` into the preview deploy. See `DEPLOY.md` for the pattern.

## Project IDs for reference

- `got-mail` project id: `steep-hall-70703569`
- Production branch created by default

**Do not commit the connection string.** `.env` is in `.gitignore`. Secrets live in local env files and Netlify env vars only.
