import { NextResponse } from "next/server";
import db from "@/lib/kysely/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await ctx.params; // 👈 ต้อง await
    const upper = code.toUpperCase();

    const row = await db
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

    if (!row) {
      return NextResponse.json(
        { error: "not_found", code: upper },
        { status: 404 }
      );
    }

    return NextResponse.json(row);
  } catch (err) {
    console.error("GET /api/diseases/[code] error:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
