import { sql } from "@/lib/db";

// The QR route. Two behaviors depending on the link's mode:
//
//   redirect (default) — 302 to the destination. Correct for websites and
//     for files you want opened in the phone's browser. This is what makes a
//     scanned QR actually take you to the site.
//   proxy             — fetch the destination server-side and stream the bytes
//     back under the QR's own URL. Use for files (PDF, image, zip) you want
//     served/downloaded from your domain instead of exposing the real link.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const { rows } =
    await sql`SELECT destination, mode FROM links WHERE code = ${code}`;
  const link = rows[0];
  if (!link) return new Response("Not found", { status: 404 });

  if (link.mode === "proxy") {
    const upstream = await fetch(link.destination, { cache: "no-store" }).catch(
      () => null
    );
    if (!upstream || !upstream.ok) {
      return new Response("Upstream error", { status: 502 });
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    const contentDisposition =
      upstream.headers.get("content-disposition") || "attachment";

    await sql`UPDATE links SET clicks = clicks + 1 WHERE code = ${code}`;

    // Stream through instead of buffering — flat memory, no size cap on files.
    return new Response(upstream.body, {
      headers: {
        "content-type": contentType,
        "content-disposition": contentDisposition,
        "cache-control": "no-store",
      },
    });
  }

  await sql`UPDATE links SET clicks = clicks + 1 WHERE code = ${code}`;
  return Response.redirect(link.destination, 302);
}
