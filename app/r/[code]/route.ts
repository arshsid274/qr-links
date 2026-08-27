import { sql } from "@/lib/db";

// The redirect engine: /r/[code] → 302 to the current destination.
// This URL is what gets baked into the QR code, so the QR never changes
// even when the destination does.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const { rows } =
    await sql`SELECT destination FROM links WHERE code = ${code}`;
  if (rows.length === 0) {
    return new Response("Not found", { status: 404 });
  }

  await sql`UPDATE links SET clicks = clicks + 1 WHERE code = ${code}`;

  return Response.redirect(rows[0].destination, 302);
}
