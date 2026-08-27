// Creates the links table. Run with: npm run db:init
// (reads POSTGRES_URL from .env.local via node --env-file)
import net from "node:net";
import { sql } from "@vercel/postgres";

// Same slow-network fix as lib/db.ts: give connection attempts more than
// the 250ms default before Node's happy-eyeballs logic aborts them.
net.setDefaultAutoSelectFamilyAttemptTimeout?.(5000);

await sql`
  CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name TEXT,
    destination TEXT NOT NULL,
    mode VARCHAR(10) NOT NULL DEFAULT 'redirect',
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

// Bring an already-created table up to date (idempotent).
await sql`ALTER TABLE links ALTER COLUMN code TYPE VARCHAR(50)`;
await sql`ALTER TABLE links ADD COLUMN IF NOT EXISTS mode VARCHAR(10) NOT NULL DEFAULT 'redirect'`;

console.log("links table ready");
process.exit(0);
