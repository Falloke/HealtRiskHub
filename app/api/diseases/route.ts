// E:\HealtRiskHub\app\api\diseases\route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect-db";

export const dynamic = "force-dynamic";

type DiseaseRow = { code: string; name_th: string; name_en: string };

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<DiseaseRow[]>`
      SELECT code, name_th, name_en
      FROM "public"."diseases"
      ORDER BY code ASC
    `;
    // ให้รูปแบบตรงกับที่ Sidebar ใช้
    return NextResponse.json({ diseases: rows }, { status: 200 });
  } catch (err) {
    console.error("GET /api/diseases error:", err);
    return NextResponse.json({ error: "failed to load diseases" }, { status: 500 });
  }
}
