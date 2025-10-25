// app/api/admin/top-provinces/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = { name: string; cnt: number };

export async function GET() {
  try {
    // ✅ นับเฉพาะคอลัมน์ province อย่างเดียว
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        province AS name,
        COUNT(*)::int AS cnt
      FROM public.saved_searches
      WHERE province IS NOT NULL AND btrim(province) <> ''
      GROUP BY province
      ORDER BY cnt DESC, province ASC
      LIMIT 10
    `;
    return NextResponse.json(rows ?? [], { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/admin/top-provinces] error:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
