// app/api/admin/diseases/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/connect-db";
import { requireAdmin } from "../../_utils/requireAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CodeRow = { code: string };

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;

  const code = req.nextUrl.searchParams.get("code")?.trim();

  if (!code) {
    try {
      const rows = await prisma.$queryRaw<CodeRow[]>`
        (
          SELECT DISTINCT disease_code AS code
          FROM public.disease_details
        )
        UNION
        (
          SELECT DISTINCT disease_code AS code
          FROM public.disease_symptoms
        )
        ORDER BY code ASC
      `;
      const items = rows.map((r) => ({
        code: r.code,
        name_th: null,
        name_en: null,
        is_active: true,
      }));
      return NextResponse.json({ items, total: items.length });
    } catch (err) {
      console.error("[/api/admin/diseases GET list] query error:", err);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  try {
    let name_th: string | null = null;
    let name_en: string | null = null;
    try {
      const row = await prisma.$queryRaw<{ name_th: string | null; name_en: string | null }[]>`
        SELECT name_th, name_en FROM public.diseases WHERE code = ${code} LIMIT 1
      `;
      if (row?.[0]) ({ name_th, name_en } = row[0]);
    } catch {}

    const detailRows = await prisma.$queryRaw<{ description_th: string | null; description_en: string | null }[]>`
      SELECT description_th, description_en
      FROM public.disease_details
      WHERE disease_code = ${code}
      LIMIT 1
    `;
    const details = {
      description_th: detailRows?.[0]?.description_th ?? "",
      description_en: detailRows?.[0]?.description_en ?? "",
    };

    const symptomRows = await prisma.$queryRaw<{ id: number }[]>`
      SELECT symptom_id AS id
      FROM public.disease_symptoms
      WHERE disease_code = ${code}
      ORDER BY symptom_id ASC
    `;
    const prevRows = await prisma.$queryRaw<{ id: number; priority: number | null }[]>`
      SELECT prevention_id AS id, priority
      FROM public.disease_preventions
      WHERE disease_code = ${code}
      ORDER BY COALESCE(priority, 999999), prevention_id
    `;

    return NextResponse.json({
      code, name_th, name_en,
      details,
      symptoms: symptomRows ?? [],
      preventions: prevRows ?? [],
    });
  } catch (err) {
    console.error("[/api/admin/diseases GET one] query error:", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;

  const body = (await req.json()) as {
    code?: string;
    name_th?: string; name_en?: string;
    details?: { description_th?: string; description_en?: string };
    symptomIds?: number[];
    preventions?: { id: number; priority?: number }[];
  };
  const code = body.code?.trim();
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 422 });

  try {
    await prisma.$transaction(async (tx) => {
      // 1) ensure diseases (3 คอลัมน์พอ) — ถ้าตาราง/คอลัมน์ไม่ตรง ให้ข้าม
      try {
        await tx.$executeRaw`
          INSERT INTO public.diseases (code, name_th, name_en)
          VALUES (${code}, ${body.name_th ?? ""}, ${body.name_en ?? null})
          ON CONFLICT (code) DO UPDATE SET
            name_th = EXCLUDED.name_th,
            name_en = EXCLUDED.name_en
        `;
      } catch {}

      // 2) details
      await tx.$executeRaw`
        INSERT INTO public.disease_details (disease_code, description_th, description_en)
        VALUES (${code}, ${body.details?.description_th ?? ""}, ${body.details?.description_en ?? ""})
        ON CONFLICT (disease_code) DO UPDATE SET
          description_th = EXCLUDED.description_th,
          description_en = EXCLUDED.description_en
      `;

      // 3) symptoms
      await tx.$executeRaw`DELETE FROM public.disease_symptoms WHERE disease_code = ${code}`;
      if (body.symptomIds?.length) {
        for (const sid of body.symptomIds) {
          if (Number.isInteger(sid)) {
            await tx.$executeRaw`
              INSERT INTO public.disease_symptoms (disease_code, symptom_id)
              VALUES (${code}, ${sid})
              ON CONFLICT DO NOTHING
            `;
          }
        }
      }

      // 4) preventions
      await tx.$executeRaw`DELETE FROM public.disease_preventions WHERE disease_code = ${code}`;
      if (body.preventions?.length) {
        for (const it of body.preventions) {
          await tx.$executeRaw`
            INSERT INTO public.disease_preventions (disease_code, prevention_id, priority)
            VALUES (${code}, ${it.id}, ${it.priority ?? null})
            ON CONFLICT DO NOTHING
          `;
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/admin/diseases POST] tx error:", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;

  const code = req.nextUrl.searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 422 });

  const body = (await req.json()) as {
    name_th?: string; name_en?: string;
    details?: { description_th?: string; description_en?: string };
    symptomIds?: number[];
    preventions?: { id: number; priority?: number }[];
  };

  try {
    await prisma.$transaction(async (tx) => {
      if (typeof body.name_th !== "undefined" || typeof body.name_en !== "undefined") {
        try {
          await tx.$executeRaw`
            INSERT INTO public.diseases (code, name_th, name_en)
            VALUES (${code}, ${body.name_th ?? ""}, ${body.name_en ?? null})
            ON CONFLICT (code) DO UPDATE SET
              name_th = COALESCE(EXCLUDED.name_th, public.diseases.name_th),
              name_en = COALESCE(EXCLUDED.name_en, public.diseases.name_en)
          `;
        } catch {}
      }

      if (body.details) {
        await tx.$executeRaw`
          INSERT INTO public.disease_details (disease_code, description_th, description_en)
          VALUES (${code}, ${body.details.description_th ?? ""}, ${body.details.description_en ?? ""})
          ON CONFLICT (disease_code) DO UPDATE SET
            description_th = EXCLUDED.description_th,
            description_en = EXCLUDED.description_en
        `;
      }

      if (body.symptomIds) {
        await tx.$executeRaw`DELETE FROM public.disease_symptoms WHERE disease_code = ${code}`;
        for (const sid of body.symptomIds) {
          if (Number.isInteger(sid)) {
            await tx.$executeRaw`
              INSERT INTO public.disease_symptoms (disease_code, symptom_id)
              VALUES (${code}, ${sid})
              ON CONFLICT DO NOTHING
            `;
          }
        }
      }

      if (body.preventions) {
        await tx.$executeRaw`DELETE FROM public.disease_preventions WHERE disease_code = ${code}`;
        for (const it of body.preventions) {
          await tx.$executeRaw`
            INSERT INTO public.disease_preventions (disease_code, prevention_id, priority)
            VALUES (${code}, ${it.id}, ${it.priority ?? null})
            ON CONFLICT DO NOTHING
          `;
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/admin/diseases PUT] tx error:", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin(); if (guard) return guard;

  const code = req.nextUrl.searchParams.get("code")?.trim();
  if (!code) return NextResponse.json({ error: "code is required" }, { status: 422 });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`DELETE FROM public.disease_symptoms WHERE disease_code = ${code}`;
      await tx.$executeRaw`DELETE FROM public.disease_preventions WHERE disease_code = ${code}`;
      await tx.$executeRaw`DELETE FROM public.disease_details   WHERE disease_code = ${code}`;
      try { await tx.$executeRaw`DELETE FROM public.diseases WHERE code = ${code}`; } catch {}
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/admin/diseases DELETE] tx error:", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
