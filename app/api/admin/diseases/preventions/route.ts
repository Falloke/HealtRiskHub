// app/api/admin/diseases/preventions/route.ts
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

// GET /api/admin/diseases/preventions?code=D01
// -> { items: { id:number, priority:number|null }[] }
export async function GET(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;
  const code = req.nextUrl.searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 422 });

  const rows = await prisma.$queryRaw<{ id:number; priority:number|null }[]>`
    SELECT prevention_id AS id, priority
    FROM public.disease_preventions
    WHERE disease_code = ${code}
    ORDER BY COALESCE(priority, 999999), prevention_id
  `;
  return NextResponse.json({ items: rows ?? [] });
}

// PUT เดิมของคุณใช้ได้อยู่แล้ว (ลบแล้วใส่ใหม่ตาม priority)
export async function PUT(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;

  const { code, items } = (await req.json()) as {
    code?: string; items?: { id: number; priority?: number }[];
  };
  if (!code?.trim()) return NextResponse.json({ error: "code is required" }, { status: 422 });

  await prisma.$executeRaw`
    DELETE FROM public.disease_preventions WHERE disease_code = ${code}
  `;
  if (items?.length) {
    for (const it of items) {
      await prisma.$executeRaw`
        INSERT INTO public.disease_preventions (disease_code, prevention_id, priority)
        VALUES (${code}, ${it.id}, ${it.priority ?? null})
        ON CONFLICT DO NOTHING
      `;
    }
  }
  return NextResponse.json({ ok: true });
}
