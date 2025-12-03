# Evinsk Banking Portal

Modern banking portal built with Next.js, TypeScript, TailwindCSS, Prisma, and Postgres. Includes local development via Docker, seeded demo data, authentication, and a clean UI component system.

## Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Auth**: NextAuth (credentials provider)
- **Database**: Postgres 16 (Docker) + Prisma ORM
- **UI**: shadcn/ui-style components

## Repository Structure
- `nextjs_space/` — main Next.js application
  - `app/` — pages and server components (if present)
  - `components/` — UI components
  - `lib/` — helpers and database client
  - `prisma/` — Prisma schema
  - `scripts/seed.ts` — database seed script
  - `docker-compose.yml` — local Postgres service

## Prerequisites
- Node.js 18+
- Docker Desktop or Docker Engine
- npm (bundled with Node)

## Environment Variables
Create `nextjs_space/.env` with at least:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/evinsk"
NEXTAUTH_SECRET="<random-long-string>"
```

Notes:
- Database is exposed on host port `5433` (Docker maps 5433 -> 5432).
- For LAN access, set `NEXTAUTH_URL` to your host’s LAN IP and port, for example: `http://192.168.1.108:3005`.

## First-Time Setup
1. Start Postgres:
   - From `nextjs_space/`: `docker compose up -d`
   - Verify: `docker ps` should show `evinsk_postgres`.
2. Install dependencies:
   - From `nextjs_space/`: `npm install`
3. Apply Prisma migrations (if any) and generate client:
   - `npx prisma migrate deploy`
   - `npx prisma generate`
4. Seed data (optional for demo accounts):
   - `npx prisma db seed`
   - Seed creates: `john@doe.com / johndoe123` (Admin), plus demo users.

## Running the App
- Local (host only):
  - From `nextjs_space/`: `npm run dev`
  - URL: `http://localhost:3005` (use `-p 3005` if needed)

- Local bound to LAN (accessible from other devices on your network):
  - From `nextjs_space/`: `npm run dev -- -p 3005 --hostname 0.0.0.0`
  - Or use the predefined script setting `NEXTAUTH_URL` and host binding:
    - `npm run dev:lan`
  - Visit from another device: `http://<YOUR_LAN_IP>:3005`

Production-like:
- Build: `npm run build`
- Start (host only): `npm run start`
- Start on LAN: `npm run start:lan`

Package scripts (from `nextjs_space/package.json`):
- `dev` — `next dev`
- `dev:lan` — `NEXTAUTH_URL=http://<LAN_IP>:3005 next dev --hostname 0.0.0.0`
- `build` — `next build`
- `start` — `next start`
- `start:lan` — `NEXTAUTH_URL=http://<LAN_IP>:3005 next start -H 0.0.0.0 -p 3005`
- `lint` — `next lint`

## Admin Credentials (Seed)
- Email: `john@doe.com`
- Password: `johndoe123`

If you don’t want demo users, you can reset the DB to a single admin:
- Clear and reinsert via Prisma scripts or SQL. Ensure you keep the password hash consistent or rehash a new password.

## Database Operations
- Prisma Studio: `npx prisma studio`
- Check connection: `psql -h localhost -p 5433 -U postgres -d evinsk`
- Docker service file: `nextjs_space/docker-compose.yml`

## LAN Access Tips
- Confirm server is bound: `ss -ltnp | grep :3005` should show `0.0.0.0:3005`.
- Confirm host IP: `hostname -I` (pick `192.168.x.x`).
- Test from another device: `curl http://<LAN_IP>:3005`.
- If unreachable:
  - Ensure both devices on same subnet.
  - Check host firewall to allow `tcp/3005`.
  - Verify VPNs and AP isolation are disabled.

## Troubleshooting
- Port in use: change port, e.g. `npm run dev -- -p 3010` or stop the conflicting app.
- Database errors:
  - Ensure Docker Postgres is healthy.
  - Verify `DATABASE_URL` points to `localhost:5433`.
  - Run `npx prisma migrate deploy` then `npx prisma generate`.
- Auth callback/base URL:
  - For LAN, set `NEXTAUTH_URL=http://<LAN_IP>:3005` when running on LAN.

## Scripts Cheat Sheet
From `nextjs_space/`:
- Start DB: `docker compose up -d`
- Stop DB: `docker compose down`
- Migrate: `npx prisma migrate deploy`
- Seed: `npx prisma db seed`
- Dev: `npm run dev`
- Dev (LAN): `npm run dev:lan`
- Build: `npm run build`
- Start: `npm run start`
- Start (LAN): `npm run start:lan`

## Notes on Version Control
- Ensure `.env` files and `node_modules` are ignored. A typical `.gitignore` should exclude:
  - `node_modules/`, `.next/`, `.env`, `.env.*`, `prisma/.env`

## License
Proprietary or add your preferred license here.
