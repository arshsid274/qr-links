export const AUTH_COOKIE = "qr_admin";

// Read the configured admin password, tolerating a stray trailing newline or
// spaces — a very common artifact of pasting the value into a hosting
// dashboard. Returns "" when unset.
export function getAdminPassword(): string {
  return (process.env.ADMIN_PASSWORD ?? "").trim();
}

// The cookie stores a hash of the password, not the password itself.
export async function passwordHash(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
