import { sql } from "@/lib/db";

// The proxy route — core piece. Instead of redirecting, it fetches the
// destination file (PDF, DOCX, image, zip…) and serves the bytes directly,
// so the QR URL is what the scanner downloads from. Works cleanly for files
// since a single binary response has no relative links/assets to break.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const { rows } =
    await sql`SELECT destination FROM links WHERE code = ${code}`;
  const link = rows[0];
  if (!link) return new Response("Not found", { status: 404 });

  const upstream = await fetch(link.destination, {
    cache: "no-store",
  }).catch(() => null);
  if (!upstream || !upstream.ok) {
    return new Response("Upstream error", { status: 502 });
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";
  const contentDisposition =
    upstream.headers.get("content-disposition") || "attachment";

  // Only count clicks that actually served the file.
  await sql`UPDATE links SET clicks = clicks + 1 WHERE code = ${code}`;

  // Stream the upstream body through instead of buffering it — keeps memory
  // flat and avoids the platform's buffered-response size limit on big files.
  return new Response(upstream.body, {
    headers: {
      "content-type": contentType,
      "content-disposition": contentDisposition,
      "cache-control": "no-store",
    },
  });
}
