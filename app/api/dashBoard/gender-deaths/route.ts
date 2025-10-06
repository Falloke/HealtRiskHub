//app/api/dashBoard/gender-deaths/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/kysely/db";
import { sql } from "kysely";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const start_date = params.get("start_date") || "2024-01-01";
    const end_date = params.get("end_date") || "2024-12-31";
    const province = params.get("province");

    if (!province) {
      return NextResponse.json({ error: "ต้องระบุ province" }, { status: 400 });
    }

    const rows = await db
      .selectFrom("d01_influenza")
      .select(["gender", sql<number>`COUNT(death_date_parsed)`.as("deaths")])
      .where("death_date_parsed", ">=", new Date(start_date))
      .where("death_date_parsed", "<=", new Date(end_date))
      .where("province", "=", province)
      .groupBy("gender")
      .execute();

    let male = 0,
      female = 0;
    rows.forEach((r) => {
      const g = (r.gender || "").trim();
      if (g === "M" || g === "ชาย") male = Number(r.deaths);
      else if (g === "F" || g === "หญิง") female = Number(r.deaths);
    });

    // ✅ ส่งออกเฉพาะ ชาย/หญิง
    return NextResponse.json([
      { gender: "ชาย", value: male },
      { gender: "หญิง", value: female },
    ]);
  } catch (err) {
    console.error("❌ API ERROR (gender-deaths):", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
