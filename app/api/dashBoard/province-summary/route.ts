import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/kysely/db";
import { sql } from "kysely";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // ✅ กัน edge
export const dynamic = "force-dynamic"; // ✅ ไม่ cache

type ProvinceRow = {
  ProvinceNameThai: string;
  Region_VaccineRollout_MOPH: string;
};

export async function GET(request: NextRequest) {
  try {
    const p = request.nextUrl.searchParams;
    const start_date = p.get("start_date") || "2024-01-01";
    const end_date = p.get("end_date") || "2024-12-31";
    const province = p.get("province")?.trim();

    if (!province) {
      return NextResponse.json({ error: "ต้องระบุ province" }, { status: 400 });
    }

    // ✅ โหลด mapping จากไฟล์ใน public
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "Thailand-ProvinceName.json"
    );
    const raw = fs.readFileSync(filePath, "utf-8");
    const provinceList = JSON.parse(raw) as ProvinceRow[];

    const region =
      provinceList.find((r) => r.ProvinceNameThai === province)
        ?.Region_VaccineRollout_MOPH || "ไม่ทราบภาค";

    // 🧮 ผู้ป่วยในช่วงวันที่
    const [patientsRow] = await db
      .selectFrom("d01_influenza")
      .select([sql<number>`COUNT(*)`.as("patients")])
      .where("onset_date_parsed", ">=", new Date(start_date))
      .where("onset_date_parsed", "<=", new Date(end_date))
      .where("province", "=", province)
      .execute();

    // ☠️ ผู้เสียชีวิตในช่วงวันที่
    const [deathsRow] = await db
      .selectFrom("d01_influenza")
      .select([sql<number>`COUNT(death_date_parsed)`.as("deaths")])
      .where("death_date_parsed", ">=", new Date(start_date))
      .where("death_date_parsed", "<=", new Date(end_date))
      .where("province", "=", province)
      .execute();

    return NextResponse.json(
      {
        province,
        region,
        patients: Number(patientsRow?.patients ?? 0),
        deaths: Number(deathsRow?.deaths ?? 0),
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ API ERROR (province-bars):", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
