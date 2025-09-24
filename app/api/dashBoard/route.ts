import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/kysely/db";
import { sql } from "kysely";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const start_date = params.get("start_date") || "2024-01-01";
    const end_date = params.get("end_date") || "2024-09-09";
    const province = params.get("province"); // 🔍 จังหวัด (ถ้ามี)

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

    if (province) {
      patientQuery = patientQuery.where("province", "=", province);
    }

    const [patientStats] = await patientQuery.execute();

    // 🧮 ผู้ป่วยสะสมทั้งหมด
    let cumulativePatientQuery = db
      .selectFrom("d01_influenza")
      .select((eb) => [eb.fn.countAll().as("cumulative_patients")]);

    if (province) {
      cumulativePatientQuery = cumulativePatientQuery.where(
        "province",
        "=",
        province
      );
    }

    const [cumulativePatients] = await cumulativePatientQuery.execute();

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

    if (province) {
      deathQuery = deathQuery.where("province", "=", province);
    }

    const [deathStats] = await deathQuery.execute();

    // ☠️ ผู้เสียชีวิตสะสม
    let cumulativeDeathQuery = db
      .selectFrom("d01_influenza")
      .select((eb) => [
        eb.fn.count("death_date_parsed").as("cumulative_deaths"),
      ]);

    if (province) {
      cumulativeDeathQuery = cumulativeDeathQuery.where(
        "province",
        "=",
        province
      );
    }

    const [cumulativeDeaths] = await cumulativeDeathQuery.execute();

    // 🧾 สร้าง JSON response
    const data = {
      totalPatients: Number(patientStats.total_patients),
      avgPatientsPerDay: Number(patientStats.avg_per_day),
      cumulativePatients: Number(cumulativePatients.cumulative_patients),
      totalDeaths: Number(deathStats.total_deaths),
      avgDeathsPerDay: Number(deathStats.avg_per_day),
      cumulativeDeaths: Number(cumulativeDeaths.cumulative_deaths),
    };

    return NextResponse.json(data, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
