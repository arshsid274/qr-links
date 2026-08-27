import net from "node:net";
import { sql } from "@vercel/postgres";

// Node's fetch aborts each connection attempt after 250ms by default
// (happy-eyeballs auto-family-selection); on slow networks the Neon endpoint
// takes longer than that to answer, which surfaces as "fetch failed ETIMEDOUT".
net.setDefaultAutoSelectFamilyAttemptTimeout?.(5000);

// Re-exported so all queries go through one place; swap this out if the
// database provider ever changes.
export { sql };

export type LinkRow = {
  id: number;
  code: string;
  name: string | null;
  destination: string;
  clicks: number;
  created_at: string;
  updated_at: string;
};
