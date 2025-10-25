// app/api/dashBoard/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/kysely/db";
import { sql } from "kysely";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const start_date = params.get("start_date") || "2024-01-01";
    const end_date = params.get("end_date") || "2024-12-31";
    const province = params.get("province") || "";

    // 🗺️ โหลด mapping จังหวัด → ภาค
    const filePath = path.join(
      process.cwd(),
      "public/data/Thailand-ProvinceName.json"
    );

    // 🩺 ผู้ป่วยช่วงวันที่
    let patientQuery = db
      .selectFrom("d01_influenza")
      .select((eb) => [
        eb.fn.countAll().as("total_patients"),
        sql
          .raw(
            `ROUND(COUNT(*) * 1.0 / (DATE '${end_date}' - DATE '${start_date}' + 1))`
          )
          .as("avg_per_day"),
      ])
      .where("onset_date_parsed", ">=", new Date(start_date))
      .where("onset_date_parsed", "<=", new Date(end_date));

    if (province) patientQuery = patientQuery.where("province", "=", province);
    const [patientStats] = await patientQuery.execute();

    // 👥 ผู้ป่วยสะสมทั้งหมด (ไม่จำกัดช่วงเวลา)
    let cumPatientQuery = db
      .selectFrom("d01_influenza")
      .select((eb) => [eb.fn.countAll().as("cumulative_patients")]);
    if (province)
      cumPatientQuery = cumPatientQuery.where("province", "=", province);
    const [cumulativePatients] = await cumPatientQuery.execute();

    // ☠️ ผู้เสียชีวิตช่วงวันที่
    let deathQuery = db
      .selectFrom("d01_influenza")
      .select((eb) => [
        eb.fn
          .count("death_date_parsed")
          .filterWhere("death_date_parsed", ">=", new Date(start_date))
          .filterWhere("death_date_parsed", "<=", new Date(end_date))
          .as("total_deaths"),
        sql
          .raw(
            `ROUND(COUNT(death_date_parsed) * 1.0 / (DATE '${end_date}' - DATE '${start_date}' + 1))`
          )
          .as("avg_per_day"),
      ]);
    if (province) deathQuery = deathQuery.where("province", "=", province);
    const [deathStats] = await deathQuery.execute();

    // ☠️ ผู้เสียชีวิตสะสม (ไม่จำกัดช่วงเวลา)
    let cumDeathQuery = db
      .selectFrom("d01_influenza")
      .select((eb) => [
        eb.fn.count("death_date_parsed").as("cumulative_deaths"),
      ]);
    if (province)
      cumDeathQuery = cumDeathQuery.where("province", "=", province);
    const [cumulativeDeaths] = await cumDeathQuery.execute();

    const data = {
      province: province || null,

      totalPatients: Number(patientStats?.total_patients || 0),
      avgPatientsPerDay: Number(patientStats?.avg_per_day || 0),
      cumulativePatients: Number(cumulativePatients?.cumulative_patients || 0),
      totalDeaths: Number(deathStats?.total_deaths || 0),
      avgDeathsPerDay: Number(deathStats?.avg_per_day || 0),
      cumulativeDeaths: Number(cumulativeDeaths?.cumulative_deaths || 0),
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("❌ API ERROR (/api/dashBoard):", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
