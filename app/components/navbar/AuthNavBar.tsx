// E:\HealtRiskHub\app\components\navbar\AuthNavBar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  ChevronDown, LogOut, Search, Settings, User,
  Shield, LayoutDashboard, Users as UsersIcon, Stethoscope
} from "lucide-react";

const AuthNavBar = () => {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const fullName =
    (session?.user?.first_name ?? "") + " " + (session?.user?.last_name ?? "");

  const role = session?.user?.role?.toLowerCase(); // "admin" | "user" | undefined
  const isAdmin = role === "admin";

  return (
    <nav className="flex items-center justify-between bg-pink-200 px-6 py-4 shadow-md">
      {/* ซ้าย: โลโก้ + เมนูหลัก */}
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-bold text-pink-700">
          HealtRiskHub
        </Link>

        <div className="hidden gap-6 text-sm font-medium text-gray-800 md:flex">
          <Link href="/">หน้าแรก</Link>
          <Link href="/dashBoard">ข้อมูลภาพรวม</Link>
          <Link href="/provincialInfo">ข้อมูลรายจังหวัด</Link>
          <Link href="/compareInfo">เปรียบเทียบข้อมูล</Link>

          {/* ⬇️ เมนูเฉพาะแอดมิน บนแถบซ้าย (ถ้าอยากแสดง) */}
          {isAdmin && (
            <>
              <span className="mx-2 text-neutral-400">|</span>
              <Link href="/admin" className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4" />
                หน้าผู้ดูแล
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ขวา: โปรไฟล์ Dropdown */}
      <div className="relative z-50">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md border bg-white px-4 py-2 cursor-pointer"
        >
          <span className="text-sm font-medium">
            {isAdmin ? "System Admin" : fullName.trim() || "บัญชีของฉัน"}
          </span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-64 rounded border bg-white shadow-lg">
            {/* เมนูทั่วไป */}
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-100"
            >
              <User className="h-4 w-4" /> โปรไฟล์ของฉัน
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-100"
            >
              <Search className="h-4 w-4" /> ประวัติการค้นหา
            </Link>
            <Link
              href="/search-template"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-100"
            >
              <Settings className="h-4 w-4" /> สร้างรูปแบบการค้นหา
            </Link>

            {/* กลุ่มเมนูสำหรับแอดมินเท่านั้น */}
            {isAdmin && (
              <>
                <div className="my-1 border-t" />
                <div className="px-4 py-1 text-[11px] font-semibold uppercase text-neutral-500">
                  สำหรับแอดมิน
                </div>
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-100"
                >
                  <LayoutDashboard className="h-4 w-4" /> แดชบอร์ดแอดมิน
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-100"
                >
                  <UsersIcon className="h-4 w-4" /> จัดการผู้ใช้งาน
                </Link>
                <Link
                  href="/admin/diseases"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-100"
                >
                  <Stethoscope className="h-4 w-4" /> จัดการข้อมูลโรค
                </Link>
              </>
            )}

            <div className="my-1 border-t" />
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-pink-100"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" /> ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AuthNavBar;
