// app/api/diseases/route.ts
import db from "@/lib/kysely/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await db
      .selectFrom("diseases")
      .select(["code", "name_th", "name_en"])
      .orderBy("code asc")
      .execute();

    return NextResponse.json({ diseases: rows });
  } catch (e) {
    console.error("GET /api/diseases error:", e);
    return NextResponse.json(
      { error: "Failed to fetch diseases" },
      { status: 500 }
    );
  }
}
