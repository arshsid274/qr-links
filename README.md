# QR Links

Dynamic QR codes: every QR encodes a permanent short URL (`/r/<code>`) that
serves a file, and you can swap which file it serves any time — without
reprinting the QR.

## How it works

- The dashboard (`/`) creates links: a name + destination file URL (PDF, DOCX,
  image, zip…) → a short code + downloadable QR code (PNG).
- Scanning the QR hits `/r/<code>`, which fetches the destination file
  server-side, counts the click, and streams the bytes back to the scanner —
  no redirect, a single binary response.
- Edit a destination inline in the table; the printed QR keeps working.
- The dashboard and API are gated by a single admin password; the proxy route
  stays public.

## Local setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in `POSTGRES_URL` (from the
   Vercel Postgres/Neon integration). Leave `ADMIN_PASSWORD` empty locally to
   skip the login gate.
3. Create the table: `npm run db:init` (or run `schema.sql` in your database
   console).
4. `npm run dev` → http://localhost:3000

## Deploy (Vercel)

1. Push this repo to GitHub and import it in Vercel.
2. In the Vercel project: Storage → add a Postgres (Neon) database — this sets
   `POSTGRES_URL` automatically.
3. Add env vars: `ADMIN_PASSWORD` (dashboard password) and
   `NEXT_PUBLIC_BASE_URL` (e.g. `https://your-app.vercel.app`).
4. Deploy, then create the `links` table once by running `schema.sql` in the
   database's query console (or `npm run db:init` locally with the production
   `POSTGRES_URL` in `.env.local`).

> `NEXT_PUBLIC_BASE_URL` is baked into the QR codes — set it to your final
> domain before printing anything.

## Ideas for later

- Custom QR styling (logo, colors) via `qr-code-styling`
- Scan analytics (device/location) via a logging table
- SVG export for print
- Bulk create via CSV upload
