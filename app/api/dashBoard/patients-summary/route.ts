// app/api/dashBoard/patients-summary/route.ts
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
      // คืนค่า default 200 เพื่อให้ UI ไม่พัง
      return NextResponse.json(
        {
          totalPatients: 0,
          avgPatientsPerDay: 0,
          cumulativePatients: 0,
        },
        { status: 200 }
      );
    }

    // ผู้ป่วยในช่วงวันที่
    const [inRange] = await db
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
      .where("onset_date_parsed", "<=", new Date(end_date))
      .where("province", "=", province)
      .execute();

    // ผู้ป่วยสะสมทั้งหมด (ของจังหวัดนั้น)
    const [cum] = await db
      .selectFrom("d01_influenza")
      .select((eb) => [eb.fn.countAll().as("cumulative_patients")])
      .where("province", "=", province)
      .execute();

    return NextResponse.json(
      {
        totalPatients: Number(inRange?.total_patients ?? 0),
        avgPatientsPerDay: Number(inRange?.avg_per_day ?? 0),
        cumulativePatients: Number(cum?.cumulative_patients ?? 0),
      },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ API ERROR (patients-summary):", error);
    // คืน default 200 เพื่อลด error ฝั่ง UI
    return NextResponse.json(
      {
        totalPatients: 0,
        avgPatientsPerDay: 0,
        cumulativePatients: 0,
      },
      { status: 200 }
    );
  }
}
