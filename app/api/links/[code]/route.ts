import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isValidCode } from "@/lib/generateCode";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Editable: destination, the short code itself, and the mode. Any subset may
// be sent; only provided fields change.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { rows: current } =
    await sql`SELECT * FROM links WHERE code = ${code}`;
  if (current.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const link = current[0];

  let destination = link.destination as string;
  if (body.destination !== undefined) {
    const next = String(body.destination).trim();
    if (!isValidHttpUrl(next)) {
      return NextResponse.json(
        { error: "Destination must be a valid http(s) URL" },
        { status: 400 }
      );
    }
    destination = next;
  }

  let mode = link.mode as string;
  if (body.mode !== undefined) {
    mode = body.mode === "proxy" ? "proxy" : "redirect";
  }

  let newCode = code;
  if (body.code !== undefined) {
    const next = String(body.code).trim();
    if (next !== code) {
      if (!isValidCode(next)) {
        return NextResponse.json(
          { error: "Code may only contain letters, numbers, - and _" },
          { status: 400 }
        );
      }
      const { rows: clash } =
        await sql`SELECT 1 FROM links WHERE code = ${next}`;
      if (clash.length > 0) {
        return NextResponse.json(
          { error: `Code "${next}" is already taken` },
          { status: 409 }
        );
      }
      newCode = next;
    }
  }

  const { rows } = await sql`
    UPDATE links
    SET destination = ${destination},
        code = ${newCode},
        mode = ${mode},
        updated_at = NOW()
    WHERE code = ${code}
    RETURNING *`;

  return NextResponse.json(rows[0]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const { rows } =
    await sql`DELETE FROM links WHERE code = ${code} RETURNING id`;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
