"use client";

import HomePage from "@/app/features/main/homePage/Index";
import HomeSidebar from "@/app/components/sidebar/HomeSidebar";

export default function HomePageRender() {
  return (
    // ลบ padding ทั้งรอบจาก <main class="p-6"> ด้วย -m-6
    <div className="-m-6 flex">
      {/* Sidebar จะชิดซ้ายสุด, ส่วนสูงเต็มหน้าจอหลัง navbar */}
      <HomeSidebar />

      {/* คืน padding ให้เฉพาะฝั่งเนื้อหา */}
      <section className="min-w-0 flex-1 p-6">
        <HomePage />
      </section>
    </div>
  );
}
