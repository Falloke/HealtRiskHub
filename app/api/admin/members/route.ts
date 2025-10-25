import { NextResponse } from "next/server";
import prisma from "@/lib/connect-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// helper: ดึงค่า int จาก $queryRaw (เลี่ยง any)
async function oneInt(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<number | null> {
  try {
    const rows = (await prisma.$queryRaw(strings, ...values)) as Array<
      Record<string, number>
    >;
    const key = Object.keys(rows?.[0] ?? {})[0];
    return rows?.[0]?.[key] ?? 0;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    // รวมทั้งหมด (ตาราง users และ "User" รองรับทั้งสองแบบ)
    const totalA = await oneInt`
      SELECT COUNT(*)::int AS total
      FROM public.users
      WHERE "deletedAt" IS NULL
    `;
    const total =
      totalA ??
      ((await oneInt`
        SELECT COUNT(*)::int AS total
        FROM public."User"
        WHERE "deletedAt" IS NULL
      `) ?? 0);

    // วันนี้
    const todayA = await oneInt`
      SELECT COUNT(*)::int AS today
      FROM public.users
      WHERE "deletedAt" IS NULL
        AND "createdAt" >= date_trunc('day', now())
    `;
    const today =
      todayA ??
      ((await oneInt`
        SELECT COUNT(*)::int AS today
        FROM public."User"
        WHERE "deletedAt" IS NULL
          AND "createdAt" >= date_trunc('day', now())
      `) ?? 0);

    // 7 วันล่าสุด
    const last7A = await oneInt`
      SELECT COUNT(*)::int AS last7days
      FROM public.users
      WHERE "deletedAt" IS NULL
        AND "createdAt" >= (now() - INTERVAL '7 days')
    `;
    const last7days =
      last7A ??
      ((await oneInt`
        SELECT COUNT(*)::int AS last7days
        FROM public."User"
        WHERE "deletedAt" IS NULL
          AND "createdAt" >= (now() - INTERVAL '7 days')
      `) ?? 0);

    // นับตามบทบาท
    const byRoleRows =
      (await prisma.$queryRaw<Array<{ role: string; cnt: number }>>`
        SELECT COALESCE(role, 'Other') AS role, COUNT(*)::int AS cnt
        FROM public.users
        WHERE "deletedAt" IS NULL
        GROUP BY 1
      `.catch(async () => {
        return prisma.$queryRaw<Array<{ role: string; cnt: number }>>`
          SELECT COALESCE(role, 'Other') AS role, COUNT(*)::int AS cnt
          FROM public."User"
          WHERE "deletedAt" IS NULL
          GROUP BY 1
        `;
      })) ?? [];
    const byRole = byRoleRows.reduce(
      (acc, r) => {
        const key = (r.role || "Other") as "Admin" | "User" | "Other";
        acc[key] = (acc[key] ?? 0) + (r.cnt ?? 0);
        return acc;
      },
      {} as { Admin: number; User: number; Other?: number }
    );
    if (byRole.Admin == null) byRole.Admin = 0;
    if (byRole.User == null) byRole.User = 0;
    if (byRole.Other == null) byRole.Other = 0;

    // ผู้ใช้ล่าสุด 5 รายการ
    const recent =
      (await prisma.$queryRaw<
        Array<{ id: number; first_name: string | null; last_name: string | null; email: string | null; createdAt: Date }>
      >`
        SELECT id::int AS id, first_name, last_name, email, "createdAt"
        FROM public.users
        WHERE "deletedAt" IS NULL
        ORDER BY "createdAt" DESC
        LIMIT 5
      `.catch(async () => {
        return prisma.$queryRaw<
          Array<{ id: number; first_name: string | null; last_name: string | null; email: string | null; createdAt: Date }>
        >`
          SELECT id::int AS id, first_name, last_name, email, "createdAt"
          FROM public."User"
          WHERE "deletedAt" IS NULL
          ORDER BY "createdAt" DESC
          LIMIT 5
        `;
      })) ?? [];

    return NextResponse.json({
      total,
      today,
      last7days,
      byRole,
      recent: recent.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[/api/admin/members] error:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
