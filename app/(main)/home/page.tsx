"use client";

import HomePage from "@/app/features/main/homePage/Index";
import HomeSidebar from "@/app/components/sidebar/HomeSidebar";
import { useEffect, useMemo, useState } from "react";

type Insets = { top: number; bottom: number };

export default function HomePageRender() {
  const [insets, setInsets] = useState<Insets>({ top: 64, bottom: 128 });

  const measure = useMemo(
    () => () => {
      // วัดความสูงจริงจาก #app-navbar และ #app-footer (ที่แก้ไปแล้ว)
      const nav = document.getElementById("app-navbar");
      const footer = document.getElementById("app-footer");
      const top = Math.ceil(nav?.getBoundingClientRect().height ?? 64);
      const bottom = Math.ceil(footer?.getBoundingClientRect().height ?? 128);
      setInsets({ top, bottom });
    },
    []
  );

  useEffect(() => {
    // ล็อกสกรอลล์ของ body เฉพาะหน้านี้
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // วัดครั้งแรก + เมื่อรีไซส์/เปลี่ยน layout
    measure();
    const roNavbar = new ResizeObserver(measure);
    const roFooter = new ResizeObserver(measure);
    const nav = document.getElementById("app-navbar");
    const footer = document.getElementById("app-footer");
    if (nav) roNavbar.observe(nav);
    if (footer) roFooter.observe(footer);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      document.body.style.overflow = prevOverflow;
      roNavbar.disconnect();
      roFooter.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [measure]);

  return (
    // กรอบหลัก fixed กำหนด top/bottom จากค่าที่วัดได้จริง
    <div
      className="fixed z-0 flex w-full items-stretch overflow-hidden"
      style={{ top: insets.top, bottom: insets.bottom, left: 0, right: 0 }}
    >
      {/* Sidebar กว้างคงที่ สูงเต็มกรอบ */}
      <aside className="h-full w-[300px] shrink-0">
        <HomeSidebar />
      </aside>

      {/* เนื้อหา สูงเต็ม ใช้สกรอลล์ภายใน HomePage เอง */}
      <main className="h-full min-w-0 flex-1 overflow-hidden px-5 py-4">
        <HomePage />
      </main>
    </div>
  );
}
