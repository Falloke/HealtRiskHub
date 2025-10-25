// E:\HealtRiskHub\app\components\navbar\NavBar.tsx
"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    // ใช้ header ตัวจริงของหน้า พร้อม id/data-app ให้ตัวคำนวณไปอ้างอิง
    <header id="app-navbar" data-app="navbar" className="sticky top-0 inset-x-0 z-50">
      {/* สูงนิ่ง 64px = h-16 ให้ตรงกับตัวคำนวณใน page.tsx */}
      <nav
        aria-label="แถบนำทางหลัก"
        className="h-16 flex items-center justify-between bg-pink-200/95 px-6 shadow-md backdrop-blur supports-[backdrop-filter]:bg-pink-200/80"
      >
        {/* Logo และเมนูซ้าย */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-pink-700 hover:opacity-90">
            HealtRiskHub
          </Link>
          <div className="hidden gap-6 text-sm font-medium text-gray-800 md:flex">
            <Link href="/" className="hover:opacity-90">หน้าแรก</Link>
            <Link href="/dashBoard" className="hover:opacity-90">ข้อมูลภาพรวม</Link>
            <Link href="/provincialInfo" className="hover:opacity-90">ข้อมูลรายจังหวัด</Link>
            <Link href="/compareInfo" className="hover:opacity-90">เปรียบเทียบข้อมูล</Link>
          </div>
        </div>

        {/* ปุ่มเข้าสู่ระบบ/สมัครสมาชิก */}
        <div className="flex items-center gap-3 text-sm font-medium">
          <Link href="/login" className="hover:opacity-90">เข้าสู่ระบบ</Link>
          <Link href="/register" className="hover:opacity-90">สมัครสมาชิก</Link>
        </div>
      </nav>
    </header>
  );
}
