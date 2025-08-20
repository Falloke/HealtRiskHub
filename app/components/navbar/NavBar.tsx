"use client";
import { useState } from "react";
import { useEffect } from "react";
import { ChevronDown, LogOut, Search, Settings, User } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore"; // Assuming you have an auth store to get user info

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const name = () => {
    return "Pimonpan Doungtip";
  };
  // <-- สร้าง state
  // const { setUser } = useAuthStore();

  // useEffect(() => {
  //   setUser({ name: "Pimonpan Doungtip", email: "pimonpandt@gmail.com" });
  // }, [setUser]);

  return (
    <nav className="flex items-center justify-between bg-pink-200 px-6 py-4 shadow-md">
      {/* Logo และเมนูซ้าย */}
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-bold text-pink-700">
          HealtRiskHub
        </Link>
        <div className="hidden gap-6 text-sm font-medium text-gray-800 md:flex">
          <Link href="/">หน้าแรก</Link>
          <Link href="/dashBoard">ข้อมูลภาพรวม</Link>
          <Link href="/provincialInfo">ข้อมูลรายจังหวัด</Link>
          <Link href="/compareInfo">เปรียบเทียบข้อมูล</Link>
        </div>
      </div>

      {/* โปรไฟล์ Dropdown */}
      <div className="relative z-50">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-md border bg-white px-4 py-2"
        >
          <span className="text-sm font-medium">{name()}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-60 rounded border bg-white shadow-lg">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-100"
            >
              <User className="h-4 w-4" />
              โปรไฟล์ของฉัน
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-100"
            >
              <Search className="h-4 w-4" />
              ประวัติการค้นหา
            </Link>
            <Link
              href="/search-template"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-100"
            >
              <Settings className="h-4 w-4" />
              สร้างรูปแบบการค้นหา
            </Link>
            <div className="my-1 border-t" />
            <Link
              href="/logout"
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-pink-100"
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
