//app/api/dashBoard/gender-trend/route.ts
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

    // 📊 query นับผู้ป่วย grouped by เดือน + เพศ
    const monthExpr = sql<string>`TO_CHAR(onset_date_parsed, 'YYYY-MM')`;
    const rows = await db
      .selectFrom("d01_influenza")
      .select([
        monthExpr.as("month"),
        "gender",
        sql<number>`COUNT(*)`.as("count"),
      ])
      .where("onset_date_parsed", ">=", new Date(start_date))
      .where("onset_date_parsed", "<=", new Date(end_date))
      .where("province", "=", province)
      .groupBy(monthExpr) // ✅
      .groupBy("gender")
      .orderBy(monthExpr)
      .execute();

    // 🛠️ แปลงเป็น { month, male, female }
    const monthlyData: Record<string, { male: number; female: number }> = {};

    rows.forEach((r) => {
      const month = r.month;
      if (!monthlyData[month]) {
        monthlyData[month] = { male: 0, female: 0 };
      }
      const g = (r.gender || "").trim();
      if (g === "M" || g === "ชาย") monthlyData[month].male += Number(r.count);
      else if (g === "F" || g === "หญิง")
        monthlyData[month].female += Number(r.count);
    });

    const result = Object.keys(monthlyData).map((m) => ({
      month: m,
      male: monthlyData[m].male,
      female: monthlyData[m].female,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ API ERROR (gender-trend):", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
