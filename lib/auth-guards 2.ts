// E:\HealtRiskHub\lib\auth-guards.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true as const, session };
}

export async function requireAdmin() {
  const session = await auth();
  const role = session?.user?.role?.toLowerCase();
  if (!session?.user) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (role !== "admin") {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const, session };
}
