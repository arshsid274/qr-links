import { sql } from "@vercel/postgres";

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
