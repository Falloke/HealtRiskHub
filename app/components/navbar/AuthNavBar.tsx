"use client";

import { useState } from "react";
import { ChevronDown, LogOut, Search, Settings, User } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
  const [open, setOpen] = useState(false);

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
      <div className="relative">
        <div className="flex">
          <div className="flex-col-2 flex">
            <button>เข้าสู่ระบบ</button>
            <button>สมัครสมาชิก</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
