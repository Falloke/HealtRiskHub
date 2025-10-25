import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/kysely/db";
import { sql } from "kysely";
import provinces from "@/public/data/Thailand-ProvinceName.json";

type ProvinceRegion = {
  ProvinceNameThai: string;
  Region_VaccineRollout_MOPH: string;
};

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const start_date = params.get("start_date") || "2024-01-01";
    const end_date = params.get("end_date") || "2024-12-31";
    const selectedProvince = params.get("province");

    if (!selectedProvince) {
      return NextResponse.json({ error: "ต้องระบุ province" }, { status: 400 });
    }

    const provinceList = provinces as ProvinceRegion[];
    const region = provinceList.find(
      (p) => p.ProvinceNameThai === selectedProvince
    )?.Region_VaccineRollout_MOPH;

    if (!region) {
      return NextResponse.json(
        { error: "ไม่พบภูมิภาคของจังหวัดนี้" },
        { status: 404 }
      );
    }

    const provincesInRegion = provinceList
      .filter((p) => p.Region_VaccineRollout_MOPH === region)
      .map((p) => p.ProvinceNameThai);

    // นับผู้ป่วย/เสียชีวิตในภาคเดียวกัน (รวมจังหวัดที่เลือก)
    const rows = await db
      .selectFrom("d01_influenza")
      .select([
        "province",
        sql<number>`COUNT(*)`.as("patients"),
        sql<number>`COUNT(death_date_parsed)`.as("deaths"),
      ])
      .where("onset_date_parsed", ">=", new Date(start_date))
      .where("onset_date_parsed", "<=", new Date(end_date))
      .where("province", "in", provincesInRegion)
      .groupBy("province")
      .execute();

    const normalized = rows.map((r) => ({
      province: r.province,
      patients: Number(r.patients),
      deaths: Number(r.deaths),
      region,
    }));

    // ข้อมูลของจังหวัดที่เลือก (ถ้าไม่มีใน rows ให้เป็นศูนย์)
    const selectedRow = normalized.find(
      (x) => x.province === selectedProvince
    ) ?? { province: selectedProvince, patients: 0, deaths: 0, region };

    // Top 5 ของภาค (ตัดจังหวัดที่เลือกออกก่อน)
    const others = normalized.filter((x) => x.province !== selectedProvince);

    const topPatients = [...others]
      .sort((a, b) => b.patients - a.patients)
      .slice(0, 5);
    const topDeaths = [...others]
      .sort((a, b) => b.deaths - a.deaths)
      .slice(0, 5);

    return NextResponse.json(
      { region, selected: selectedRow, topPatients, topDeaths },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ API ERROR (region-by-province):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
