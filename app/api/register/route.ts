// E:\HealtRiskHub\app\api\register\route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/connect-db";           // ✅ ใช้ singleton
import bcrypt from "bcryptjs";
import { registerSchema } from "@/schemas/registerSchema";
import { Prisma } from "@/generated/prisma/client";
import { ZodError } from "zod";

export const dynamic = "force-dynamic"; // กัน cache route handler

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ validate ด้วย Zod
    const data = registerSchema.parse(body);

    // ✅ normalize
    const email = data.email.trim().toLowerCase();
    const brithDate = new Date(data.dob);        // ❌ ไม่ต้อง .toISOString()
    const passwordHash = await bcrypt.hash(data.password, 10);

    const created = await prisma.user.create({
      data: {
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        role: "User",
        brith_date: brithDate,                   // ✅ เป็น Date object
        position: data.position.trim(),
        province: data.province,                 // มาจาก select แล้ว
        email,
        password: passwordHash,
      },
      select: { id: true, email: true },
    });

    return NextResponse.json({ id: created.id, email: created.email }, { status: 201 });
  } catch (err: unknown) {
    // ❗ Zod validation error
    if (err instanceof ZodError) {
      return NextResponse.json({ error: "VALIDATION", details: err.flatten() }, { status: 422 });
    }
    // ❗ Prisma unique constraint (เช่น email ซ้ำ)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "EMAIL_TAKEN" }, { status: 409 });
    }
    console.error("REGISTER_API_ERROR:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
