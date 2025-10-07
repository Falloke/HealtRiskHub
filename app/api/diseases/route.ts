import { NextResponse } from "next/server";
import prisma from "@/lib/connect-db";

// ดึงชื่อโรคจากตาราง diseases โดยไม่พึ่ง Prisma model
export async function GET() {
  try {
    const rows = await prisma.$queryRaw<
      { code: string; name_th: string; name_en: string }[]
    >`SELECT code, name_th, name_en
       FROM public.diseases
       ORDER BY code ASC`;

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/diseases error:", err);
    // ส่งข้อความที่อ่านง่ายกลับไปเพื่อไม่ให้หน้าแตกเงียบ ๆ
    return NextResponse.json(
      { error: "failed to load diseases" },
      { status: 500 }
    );
  }
}
