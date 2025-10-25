import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/kysely/db";
import { sql } from "kysely";
import provinces from "@/public/data/Thailand-ProvinceName.json";

type ProvinceRegion = {
  ProvinceNameThai: string;
  Region_VaccineRollout_MOPH: string;
};
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const start_date = params.get("start_date") || "2024-01-01";
    const end_date = params.get("end_date") || "2024-09-09";

    // 🩺 Query: ผู้ป่วย + ผู้เสียชีวิต grouped by province
    const rows = await db
      .selectFrom("d01_influenza")
      .select([
        "province",
        sql<number>`COUNT(*)`.as("patients"),
        sql<number>`COUNT(death_date_parsed)`.as("deaths"),
      ])
      .where("onset_date_parsed", ">=", new Date(start_date))
      .where("onset_date_parsed", "<=", new Date(end_date))
      .groupBy("province")
      .execute();

    // 🗺️ Mapping จังหวัด → ภูมิภาค
    const provinceRegionMap: Record<string, string> = {};
    (provinces as ProvinceRegion[]).forEach((p) => {
      provinceRegionMap[p.ProvinceNameThai] = p.Region_VaccineRollout_MOPH;
    });

    // 🔄 Group by region
    const regionData: Record<string, { patients: number; deaths: number }> = {};
    rows.forEach((r) => {
      const region = provinceRegionMap[r.province] || "ไม่ทราบภูมิภาค";
      if (!regionData[region]) {
        regionData[region] = { patients: 0, deaths: 0 };
      }
      regionData[region].patients += Number(r.patients);
      regionData[region].deaths += Number(r.deaths);
    });

    // 📊 แปลงเป็น array
    const result = Object.keys(regionData).map((region) => ({
      region,
      patients: regionData[region].patients,
      deaths: regionData[region].deaths,
    }));

    return NextResponse.json(result, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ API ERROR (region):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
