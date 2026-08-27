// Creates the links table. Run with: npm run db:init
// (reads POSTGRES_URL from .env.local via node --env-file)
import { sql } from "@vercel/postgres";

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
