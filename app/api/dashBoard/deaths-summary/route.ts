// app/api/dashBoard/deaths-summary/route.ts
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
      return NextResponse.json(
        {
          totalDeaths: 0,
          avgDeathsPerDay: 0,
          cumulativeDeaths: 0,
        },
        { status: 200 }
      );
    }

    // ผู้เสียชีวิตในช่วงวันที่ (นับเฉพาะที่มี death_date_parsed)
    const [inRange] = await db
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
      ])
      .where("province", "=", province)
      .execute();

    // ผู้เสียชีวิตสะสมทั้งหมด (ของจังหวัดนั้น)
    const [cum] = await db
      .selectFrom("d01_influenza")
      .select((eb) => [
        eb.fn.count("death_date_parsed").as("cumulative_deaths"),
      ])
      .where("province", "=", province)
      .execute();

    return NextResponse.json(
      {
        totalDeaths: Number(inRange?.total_deaths ?? 0),
        avgDeathsPerDay: Number(inRange?.avg_per_day ?? 0),
        cumulativeDeaths: Number(cum?.cumulative_deaths ?? 0),
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ API ERROR (deaths-summary):", error);
    return NextResponse.json(
      {
        totalDeaths: 0,
        avgDeathsPerDay: 0,
        cumulativeDeaths: 0,
      },
      { status: 200 }
    );
  }
}
