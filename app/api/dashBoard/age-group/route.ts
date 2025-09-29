import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/kysely/db";
import { sql } from "kysely";

// กลุ่มอายุ
const ageGroups = [
  { label: "0-4", min: 0, max: 4 },
  { label: "5-9", min: 5, max: 9 },
  { label: "10-14", min: 10, max: 14 },
  { label: "15-19", min: 15, max: 19 },
  { label: "20-24", min: 20, max: 24 },
  { label: "25-44", min: 25, max: 44 },
  { label: "45-59", min: 45, max: 59 },
  { label: "60+", min: 60, max: 200 }, // เผื่อกรณีอายุมากกว่า 100
];

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const start_date = params.get("start_date") || "2024-01-01";
    const end_date = params.get("end_date") || "2024-12-31";
    const province = params.get("province");

    if (!province) {
      return NextResponse.json({ error: "ต้องระบุ province" }, { status: 400 });
    }

    // 📍 ดึงข้อมูลผู้ป่วยของจังหวัดนั้น
    const rows = await db
      .selectFrom("d01_influenza")
      .select([sql<number>`COUNT(*)`.as("patients"), "age_y"])
      .where("onset_date_parsed", ">=", new Date(start_date))
      .where("onset_date_parsed", "<=", new Date(end_date))
      .where("province", "=", province)
      .groupBy("age_y")
      .execute();

    // 📊 Map age → group
    const grouped: Record<string, number> = {};
    ageGroups.forEach((g) => (grouped[g.label] = 0));

    rows.forEach((row) => {
      const age = Number(row.age_y);
      const group = ageGroups.find((g) => age >= g.min && age <= g.max);
      if (group) {
        grouped[group.label] += Number(row.patients);
      }
    });

    const result = Object.entries(grouped).map(([ageRange, patients]) => ({
      ageRange,
      patients,
    }));

    return NextResponse.json(result, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ API ERROR (age-group):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
