import { NextResponse } from "next/server";
import prisma from "@/lib/connect-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
  id: number;
  slug: string | null;
  name: string | null;
  agency: string | null;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
};

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<Row[]>`
      SELECT
        id::int AS id,
        slug,
        name,
        agency,
        logo_url,
        website_url,
        description
      FROM public.data_sources
      WHERE status::text = 'active'
      ORDER BY COALESCE(priority, 0) DESC, name ASC NULLS LAST
    `;
    return NextResponse.json({ items: rows ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[/api/data-sources] error:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
