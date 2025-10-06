//app/api/dashBoard/gender-patients/route.ts
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

    // 📊 Query ผู้ป่วย grouped by gender
    const rows = await db
      .selectFrom("d01_influenza")
      .select(["gender", sql<number>`COUNT(*)`.as("patients")])
      .where("onset_date_parsed", ">=", new Date(start_date))
      .where("onset_date_parsed", "<=", new Date(end_date))
      .where("province", "=", province)
      .groupBy("gender")
      .execute();

    console.log("rows gender stats:", rows); // ✅ Debug ดูค่า gender จริง

    let male = 0,
      female = 0,
      unknown = 0;
    rows.forEach((r) => {
      const g = (r.gender || "").trim();
      if (g === "M" || g === "ชาย") male = Number(r.patients);
      else if (g === "F" || g === "หญิง") female = Number(r.patients);
      else unknown += Number(r.patients);
    });

    return NextResponse.json([{ province, male, female, unknown }]);
  } catch (err) {
    console.error("❌ API ERROR (gender-patients):", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
