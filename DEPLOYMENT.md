# Deploying TekSkillUp

The app runs as a normal persistent Node.js server (via a Docker image), not
serverless functions. That's a deliberate choice: it uses a file-based SQLite
database and writes admin-uploaded branding assets to local disk, both of
which need a persistent filesystem — something serverless platforms
(Vercel, Netlify) don't give you without first moving to a hosted database
and object storage.

Everything below assumes deploying the `Dockerfile` at the repo root to
either **Fly.io** or **Railway**, both of which support persistent volumes.

## Required environment variables

Set these on whichever platform you deploy to (not committed to git):

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `file:/data/prod.db` | Must point inside the mounted persistent volume. |
| `SESSION_SECRET` | (random 32+ byte string) | Signs session JWTs. Generate with `openssl rand -base64 32`. **Never reuse the dev value.** |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` | Your real public URL. Used to build the Fincra/Paystack checkout redirect links — **must not be localhost**, or checkout will fail exactly like it did in dev. |
| `DATA_DIR` | `/data` | Where the persistent volume is mounted. Already set in `fly.toml`; set it manually in Railway's dashboard. |

Payment gateway keys (Fincra/Paystack) are **not** environment variables —
they're stored in the database via Admin → Settings → Payment, same as in
dev. Configure them there after your first deploy.

## First deploy — Fly.io

1. Install the CLI and log in: `curl -L https://fly.io/install.sh | sh`, then `fly auth login`.
2. From the repo root: `fly launch --no-deploy` — this reads `fly.toml`, lets you confirm/rename the app, and registers it without deploying yet.
3. Create the persistent volume (must match the `source` name in `fly.toml`'s `[[mounts]]`, and pick a region matching `primary_region`):
   ```bash
   fly volumes create tekskillup_data --region iad --size 1
   ```
4. Set secrets:
   ```bash
   fly secrets set SESSION_SECRET="$(openssl rand -base64 32)"
   fly secrets set NEXT_PUBLIC_APP_URL="https://<your-app>.fly.dev"
   ```
5. Deploy: `fly deploy`.
6. Confirm it's up: `fly status`, `fly logs`.

## First deploy — Railway

1. Create a new project from this repo (Railway auto-detects the `Dockerfile`; `railway.json` pins it explicitly).
2. In the service's **Settings → Volumes**, attach a volume mounted at `/data`.
3. In **Variables**, set `DATABASE_URL=file:/data/prod.db`, `DATA_DIR=/data`, `SESSION_SECRET`, and `NEXT_PUBLIC_APP_URL` (use the Railway-generated domain, or your custom domain once attached).
4. Deploy. Railway builds the Dockerfile and starts the container automatically.

## After the first deploy

- **Create your admin account**: register a normal account through the app's
  `/register` page, then promote it:
  - Fly.io: `fly ssh console -C "node scripts/promote-admin.mjs you@example.com"`
  - Railway: `railway run node scripts/promote-admin.mjs you@example.com`

  Don't rely on the seeded `admin@tekskillup.com` / `password123` account from
  dev — that seed script is never run in production (the entrypoint only runs
  `prisma migrate deploy`, never `prisma db seed`), so it won't exist unless
  you run it yourself, and you shouldn't.

- **Configure payment gateways**: Admin → Settings → Payment, enable
  Fincra and/or Paystack, switch each to **Live** mode once you're ready for
  real charges, and enter live keys.

- **Register webhooks with each provider** now that you have a real public
  URL:
  - Fincra dashboard → Settings → Webhooks → `https://yourdomain.com/api/webhooks/fincra`
  - Paystack dashboard → Settings → Webhooks → `https://yourdomain.com/api/webhooks/paystack`

  Without this step, payments will still complete (the checkout-return page
  actively verifies with the gateway as a fallback — see below) but you lose
  the immediate, authoritative confirmation path.

## Ongoing schema changes

When you change `prisma/schema.prisma` going forward, generate a real
migration locally against your dev database — don't use `prisma db push` for
anything you intend to ship, since it doesn't produce a migration file for
`prisma migrate deploy` to replay in production:

```bash
npx prisma migrate dev --name describe_the_change
```

Commit the new file under `prisma/migrations/`. The entrypoint script runs
`prisma migrate deploy` on every boot, so the next deploy applies it
automatically.

## Notes on things that don't horizontally scale

If you ever run more than one instance of this container at once (e.g. Fly.io
autoscaling beyond `min_machines_running = 1`), two in-process mechanisms stop
being fully effective, though neither breaks correctness — they just get
weaker:

- **Rate limiting** (`src/lib/rate-limit.ts`) is an in-memory `Map` per
  process. Multiple instances each track their own counts, so the effective
  limit is `limit × instance count`.
- SQLite itself is single-writer. Fly.io's `auto_stop_machines = "off"` and
  `min_machines_running = 1` in `fly.toml` keep this to one instance
  deliberately — don't raise it without first moving off SQLite.
