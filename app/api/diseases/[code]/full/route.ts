import { NextResponse } from "next/server";
import db from "@/lib/kysely/db";
import { sql } from "kysely";

export const dynamic = "force-dynamic";

// Next.js 15+: params เป็น Promise ต้อง await
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await ctx.params;
    const upper = code.toUpperCase();

    // 1) ข้อมูลพื้นฐาน + คำอธิบาย
    const base = await db
      .selectFrom("diseases as d")
      .leftJoin("disease_details as dd", "dd.disease_code", "d.code")
      .select([
        "d.code",
        "d.name_th",
        "d.name_en",
        "dd.description_th",
        "dd.description_en",
      ])
      .where("d.code", "=", upper)
      .executeTakeFirst();

    if (!base) {
      return NextResponse.json({
        code: upper,
        name_th: "",
        name_en: "",
        description_th: null,
        description_en: null,
        symptoms: [],
        preventions: [],
      });
    }

    // 2) อาการ: รวมแบบ DISTINCT แยกซับเควรี (กัน cross-product)
    const symptomsRow = await db
      .selectFrom("disease_symptoms as ds")
      .innerJoin("symptoms as s", "s.id", "ds.symptom_id")
      .where("ds.disease_code", "=", upper)
      .select(
        sql<string>`STRING_AGG(DISTINCT s.name_th, '•' ORDER BY s.name_th)`.as(
          "symptoms"
        )
      )
      .executeTakeFirst();

    const symptoms =
      symptomsRow?.symptoms?.toString().split("•").filter(Boolean) ?? [];

    // 3) วิธีป้องกัน: ตัดซ้ำก่อน แล้วค่อย aggregate ตาม priority
    //    (DISTINCT บนชุด (prevention_id, name_th, priority) จากนั้นสั่ง ORDER BY)
    const preventionsRow = await db
      .selectFrom(
        db
          .selectFrom("disease_preventions as dp")
          .innerJoin("preventions as p", "p.id", "dp.prevention_id")
          .where("dp.disease_code", "=", upper)
          .select(["dp.prevention_id", "p.name_th", "dp.priority"])
          .distinct() // กันข้อมูลซ้ำในแมป
          .as("x")
      )
      .select(
        sql<string>`STRING_AGG(x.name_th, '•' ORDER BY x.priority NULLS LAST, x.name_th)`.as(
          "preventions"
        )
      )
      .executeTakeFirst();

    const preventions =
      preventionsRow?.preventions?.toString().split("•").filter(Boolean) ?? [];

    return NextResponse.json({
      code: base.code,
      name_th: base.name_th,
      name_en: base.name_en,
      description_th: base.description_th,
      description_en: base.description_en,
      symptoms,
      preventions,
    });
  } catch (err) {
    console.error("GET /api/diseases/[code]/full error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
