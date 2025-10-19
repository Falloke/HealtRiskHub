// app/api/_utils/requireAdmin.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** ถ้าไม่ใช่แอดมิน: คืน NextResponse, ถ้าใช่: คืน null */
export async function requireAdmin() {
  try {
    const s = await auth();

    type MaybeRoleUser = {
      role?: unknown;
      role_name?: unknown;
      Role?: unknown;
    };

    const u = (s?.user ?? {}) as MaybeRoleUser;

    const roleRaw =
      typeof u.role === "string"
        ? u.role
        : typeof u.role_name === "string"
        ? u.role_name
        : typeof u.Role === "string"
        ? u.Role
        : null;

    const ok = typeof roleRaw === "string" && roleRaw.toLowerCase() === "admin";
    if (!ok) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
