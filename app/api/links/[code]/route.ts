import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const body = await req.json().catch(() => null);

  const destination =
    typeof body?.destination === "string" ? body.destination.trim() : "";
  if (!isValidHttpUrl(destination)) {
    return NextResponse.json(
      { error: "destination must be a valid http(s) URL" },
      { status: 400 }
    );
  }

  const { rows } = await sql`
    UPDATE links
    SET destination = ${destination}, updated_at = NOW()
    WHERE code = ${code}
    RETURNING *`;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
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
