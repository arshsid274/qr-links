import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateCode, isValidCode } from "@/lib/generateCode";

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
  const mode = body?.mode === "proxy" ? "proxy" : "redirect";
  const customCode =
    typeof body?.code === "string" ? body.code.trim() : "";

  if (!isValidHttpUrl(destination)) {
    return NextResponse.json(
      { error: "Destination must be a valid http(s) URL" },
      { status: 400 }
    );
  }

  let code: string;
  if (customCode) {
    if (!isValidCode(customCode)) {
      return NextResponse.json(
        { error: "Code may only contain letters, numbers, . - and _" },
        { status: 400 }
      );
    }
    const { rows: existing } =
      await sql`SELECT 1 FROM links WHERE code = ${customCode}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Code "${customCode}" is already taken` },
        { status: 409 }
      );
    }
    code = customCode;
  } else {
    // Retry on the astronomically unlikely random collision.
    code = generateCode();
    for (let i = 0; i < 5; i++) {
      const { rows: existing } =
        await sql`SELECT 1 FROM links WHERE code = ${code}`;
      if (existing.length === 0) break;
      code = generateCode();
    }
  }

  const { rows } = await sql`
    INSERT INTO links (code, name, destination, mode)
    VALUES (${code}, ${name || null}, ${destination}, ${mode})
    RETURNING *`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
  return NextResponse.json(
    { ...rows[0], qrUrl: `${baseUrl}/r/${code}` },
    { status: 201 }
  );
}
