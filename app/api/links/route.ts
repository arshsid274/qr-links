import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateCode } from "@/lib/generateCode";

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET() {
  const { rows } = await sql`SELECT * FROM links ORDER BY created_at DESC`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : null;
  const destination =
    typeof body?.destination === "string" ? body.destination.trim() : "";

  if (!isValidHttpUrl(destination)) {
    return NextResponse.json(
      { error: "destination must be a valid http(s) URL" },
      { status: 400 }
    );
  }

  const code = generateCode();
  const { rows } = await sql`
    INSERT INTO links (code, name, destination)
    VALUES (${code}, ${name || null}, ${destination})
    RETURNING *`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
  return NextResponse.json(
    { ...rows[0], qrUrl: `${baseUrl}/r/${code}` },
    { status: 201 }
  );
}
