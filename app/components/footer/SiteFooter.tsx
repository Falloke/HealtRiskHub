"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "หน้าแรก" },
  { href: "/dashBoard", label: "ข้อมูลภาพรวม" },
  { href: "/provincialInfo", label: "ข้อมูลรายจังหวัด" },
  { href: "/compareInfo", label: "เปรียบเทียบข้อมูล" },
] as const;

export default function SiteFooter() {
  const pathname = usePathname();

  return (
    <footer className="border-t border-pink-200 bg-pink-200 text-gray-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:py-5">
        {/* ซ้าย: โลโก้ + คำอธิบาย */}
        <div className="max-w-xl">
          <Link href="/" aria-label="กลับหน้าแรก" className="inline-block">
            <h2 className="text-2xl font-extrabold tracking-tight text-pink-700 hover:opacity-90">
              HealtRiskHub
            </h2>
          </Link>
          <p className="mt-1 text-xs leading-5 text-gray-800">
            ระบบเว็บแอปพลิเคชันติดตามแบบเชิงรอบ วิเคราะห์
            และนำเสนอข้อมูลโรคระบาดในระดับจังหวัดของประเทศไทย
          </p>
        </div>

        {/* ขวา: ลิขสิทธิ์ + เมนู */}
        <div className="flex flex-col items-start sm:items-end">
          <p className="text-xs text-gray-800">
            Copyright © {new Date().getFullYear()} Create By Pimonpan D. Tossapon T.
          </p>

          <nav
            className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
            aria-label="ลิงก์ส่วนท้าย"
          >
            {NAV_LINKS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`transition hover:opacity-90 ${
                    active
                      ? "font-semibold text-pink-900 underline underline-offset-4"
                      : "text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
