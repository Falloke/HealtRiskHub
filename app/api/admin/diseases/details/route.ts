// app/api/admin/diseases/details/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/connect-db";
import { requireAdmin } from "../../../_utils/requireAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DetailRow = { description_th: string | null; description_en: string | null };

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;

  const code = req.nextUrl.searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 422 });

  const rows = await prisma.$queryRaw<DetailRow[]>`
    SELECT description_th, description_en
    FROM public.disease_details
    WHERE disease_code = ${code}
    LIMIT 1
  `;
  const r = rows[0] ?? { description_th: "", description_en: "" };
  return NextResponse.json({
    description_th: r.description_th ?? "",
    description_en: r.description_en ?? "",
  });
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;

  const code = req.nextUrl.searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 422 });

  const { description_th, description_en } = (await req.json()) as {
    description_th?: string; description_en?: string;
  };

  // upsert ด้วย ON CONFLICT; ใช้ execute/returning พร้อม type ที่เจาะจงเพื่อเลี่ยง any
  const upserted = await prisma.$queryRaw<
    { disease_code: string; description_th: string | null; description_en: string | null }[]
  >`
    INSERT INTO public.disease_details (disease_code, description_th, description_en)
    VALUES (${code}, ${description_th ?? ""}, ${description_en ?? ""})
    ON CONFLICT (disease_code)
    DO UPDATE SET
      description_th = EXCLUDED.description_th,
      description_en = EXCLUDED.description_en
    RETURNING disease_code, description_th, description_en
  `;
  return NextResponse.json(upserted[0]);
}
