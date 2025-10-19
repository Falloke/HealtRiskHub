// app/api/admin/diseases/symptoms/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/connect-db";
import { auth } from "@/auth";

async function requireAdmin() {
  const s = await auth();
  if (s?.user?.role?.toLowerCase?.() !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/diseases/symptoms?code=D01
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const code = req.nextUrl.searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 422 });

  const rows = await prisma.$queryRaw<{ id: number }[]>`
    SELECT symptom_id AS id
    FROM public.disease_symptoms
    WHERE disease_code = ${code}
    ORDER BY symptom_id ASC
  `;
  return NextResponse.json({ items: rows ?? [] });
}

// PUT /api/admin/diseases/symptoms?code=D01
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const code = req.nextUrl.searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 422 });

  const { items } = (await req.json()) as { items?: number[] };

  await prisma.$executeRaw`DELETE FROM public.disease_symptoms WHERE disease_code = ${code}`;
  if (items?.length) {
    for (const sid of items) {
      if (Number.isInteger(sid)) {
        await prisma.$executeRaw`
          INSERT INTO public.disease_symptoms (disease_code, symptom_id)
          VALUES (${code}, ${sid})
          ON CONFLICT DO NOTHING
        `;
      }
    }
  }
  return NextResponse.json({ ok: true });
}
