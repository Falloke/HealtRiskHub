import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from '@/generated/prisma/client'
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    //รับ requset จากต้นทาง = ข้อมูล register
    const formData = await request.json();

    // นำ password มาเข้ารหัส ด้วย bcrypt 
    const hashedPassword = await bcrypt.hash(formData.confirmPassword, 10);

    const user: Prisma.UserCreateInput = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: "User",
        brith_date: new Date(formData.dob).toISOString(),
        position: formData.position,
        province: formData.province,
        email: formData.email,
        password: hashedPassword,
    }

    // Pass 'user' object into query

    try {
        const createUser = await prisma.user.create({ data: user });
        return NextResponse.json(formData, {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                // Unique constraint failed → Conflict
                return NextResponse.json(
                    { error: "Duplicate field", details: error.meta },
                    { status: 409, headers: { "Content-Type": "application/json" } }
                );
            } else {
                // Known Prisma error → Bad Request
                return NextResponse.json(
                    { error: "Known Prisma error", message: error.message },
                    { status: 400, headers: { "Content-Type": "application/json" } }
                );
            }
        } else if (error instanceof Prisma.PrismaClientValidationError) {
            // Validation error → Unprocessable Entity
            return NextResponse.json(
                { error: "Validation error", message: error.message },
                { status: 422, headers: { "Content-Type": "application/json" } }
            );
        } else {
            // Unknown error → Internal Server Error
            return NextResponse.json(
                { error: "Unknown error", details: String(error) },
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }
    }

}