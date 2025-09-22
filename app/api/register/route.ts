import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/schemas/registerSchema"; // ใช้ซ้ำ schema เดิม

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    //  อ่าน body
    const formData = await request.json();

    //  Validate ด้วย Zod
    const parsedData = registerSchema.parse(formData);

    //  Hash password จาก password (ไม่ใช่ confirmPassword)
    const hashedPassword = await bcrypt.hash(parsedData.password, 10);

    //  เตรียม object สำหรับสร้าง user
    const user: Prisma.UserCreateInput = {
      first_name: parsedData.firstName,
      last_name: parsedData.lastName,
      role: "User",
      brith_date: new Date(parsedData.dob).toISOString(),
      position: parsedData.position,
      province: parsedData.province,
      email: parsedData.email,
      password: hashedPassword,
    };

    // ✅ สร้าง user
    const createUser = await prisma.user.create({ data: user });

    return NextResponse.json(
      { id: createUser.id, email: createUser.email }, // ส่งกลับเฉพาะ field ที่จำเป็น
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Duplicate field", details: error.meta },
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
      return NextResponse.json(
        { error: "Known Prisma error", message: error.message },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { error: "Validation error", message: error.message },
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Invalid request", message: error.message },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.json(
      { error: "Unknown error", details: String(error) },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
