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
    code VARCHAR(10) UNIQUE NOT NULL,
    name TEXT,
    destination TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

console.log("links table ready");
process.exit(0);
