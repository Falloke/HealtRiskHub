import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/connect-db";
import { auth } from "@/auth";
import type { SavedSearch } from "@/generated/prisma"; // ใช้ type จาก client เดิม

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // ── ดึงรายการเดียว ────────────────────────────────────────────────
    if (id) {
      let bid: bigint;
      try {
        bid = BigInt(id);
      } catch {
        return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      }

      const row = await prisma.savedSearch.findFirst({
        where: { id: bid, userId: me.id },
      });
      if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json(
        {
          id: Number(row.id),
          searchName: row.searchName,
          diseaseName: row.diseaseName ?? "",
          province: row.province ?? "",
          provinceAlt: row.provinceAlt ?? "",
          startDate: row.startDate ? row.startDate.toISOString().split("T")[0] : "",
          endDate: row.endDate ? row.endDate.toISOString().split("T")[0] : "",
          color: row.color ?? "",
          createdAt: row.createdAt.toISOString(),
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    // ── ดึงรายการทั้งหมด ───────────────────────────────────────────────
    const rows: SavedSearch[] = await prisma.savedSearch.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
    });

    const data = rows.map((r) => ({
      id: Number(r.id), // BigInt -> number
      searchName: r.searchName,
      diseaseName: r.diseaseName ?? "",
      province: r.province ?? "",
      provinceAlt: r.provinceAlt ?? "",
      startDate: r.startDate ? r.startDate.toISOString().split("T")[0] : "",
      endDate: r.endDate ? r.endDate.toISOString().split("T")[0] : "",
      color: r.color ?? "",
      createdAt: r.createdAt.toISOString(),
    }));

    return NextResponse.json(data, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("GET /api/saved-searches error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();

    const created = await prisma.savedSearch.create({
      data: {
        userId: me.id,
        searchName: (body.searchName ?? "").trim(),
        diseaseName: body.disease ?? null,
        province: body.province ?? null,
        provinceAlt: body.diseaseProvince ?? null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        color: body.color ?? null,
      },
    });

    return NextResponse.json(
      {
        id: Number(created.id),
        searchName: created.searchName,
        startDate: created.startDate?.toISOString().split("T")[0] ?? "",
        endDate: created.endDate?.toISOString().split("T")[0] ?? "",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/saved-searches error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ เพิ่มลบรายการ
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const idStr = req.nextUrl.searchParams.get("id");
    if (!idStr) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    let idBig: bigint;
    try {
      idBig = BigInt(idStr);
    } catch {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // ลบเฉพาะของผู้ใช้คนนี้
    const result = await prisma.savedSearch.deleteMany({
      where: { id: idBig, userId: me.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/saved-searches error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
