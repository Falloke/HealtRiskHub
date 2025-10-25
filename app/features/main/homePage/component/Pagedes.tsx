// E:\HealtRiskHub\app\features\main\homePage\component\Pagedes.tsx
"use client";

import dynamic from "next/dynamic";
import SourceInfo from "app/features/main/dashBoardPage/component/SourceInfo";
import GraphByProvince from "@/app/components/bargraph/GraphByProvince";

const HomeMapInner = dynamic(() => import("./HomeMapInner"), { ssr: false });

// เก็บคำอธิบายเป็นข้อความดิบ (กัน <p> ซ้อน <p>)
const DESC_FULL_TEXT =
  "ระบบเว็บแอปพลิเคชันติดตามแบบเชิงรอบ วิเคราะห์ และนำเสนอข้อมูลโรคระบาดในระดับจังหวัดของประเทศไทย ผู้ใช้งานสามารถค้นหาเชื้อโรคเพื่อศึกษาลักษณะโรค วิธีป้องกัน และดูแนวโน้มการระบาดในแต่ละพื้นที่ นอกจากนี้ยังสามารถสร้างคำอธิบายกราฟอัตโนมัติด้วย AI เพื่อช่วยให้ผู้ใช้งานที่ไม่มีพื้นฐานด้านข้อมูลเข้าใจได้ง่ายขึ้น";

export default function PageDescription() {
  // เว้นพื้นที่จาก navbar/footer ให้คอนเทนต์ด้านในพอดี
  const INNER_OFFSET_PX = 220;

  return (
    <div
      className="mx-auto flex w-full max-w-[1320px] flex-col overflow-hidden"
      style={{ height: `calc(100vh - ${INNER_OFFSET_PX}px)` }}
    >
      {/* Header (ไม่มีกรอบ/เงา — เป็นแถบไล่สีโล่ง ๆ) */}
      <header className="flex-none rounded-xl bg-gradient-to-r from-pink-100 via-pink-50 to-white px-5 py-4 md:px-6 md:py-5">
        <h1 className="text-[18px] font-extrabold tracking-tight text-pink-700 md:text-[20px]">
          ระบบวิเคราะห์โรคระบาดระดับจังหวัดในประเทศไทย
        </h1>
        <div className="mt-1 max-w-5xl text-[15px] leading-7 text-neutral-800 md:text-[16px]">
          {DESC_FULL_TEXT}
        </div>
      </header>

      {/* เนื้อหาหลัก */}
      <div className="mt-3 grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[7fr_5fr]">
        {/* ซ้าย: กราฟ + แหล่งข้อมูล (3 : 1) */}
        <section className="grid min-h-0 grid-rows-[3fr_1fr] gap-3">
          {/* การ์ดกราฟ (มีกรอบ/เงา) */}
          <div className="card min-h-0 p-3.5 md:p-4">
            <div className="h-[calc(100%-0rem)] min-h-0">
              <GraphByProvince compact />
            </div>
          </div>

          {/* การ์ดแหล่งที่มาข้อมูล (ตัด columns-* ออก กันแตกบรรทัด) */}
          <div className="card min-h-0 p-3 md:p-3.5">
            <div className="h-full min-h-0 overflow-auto text-[14px] leading-6">
              <SourceInfo />
            </div>
          </div>
        </section>

        {/* ขวา: แผนที่ */}
        <aside className="card min-h-0 p-3.5 md:p-4">
          <h2 className="mb-2 text-base font-semibold text-neutral-900 md:text-lg">
            แผนที่โรคระบาด
          </h2>
          <div className="h-[calc(100%-1.75rem)] min-h-0">
            <HomeMapInner className="h-full" />
          </div>
        </aside>
      </div>

      <style jsx>{`
        .card {
          position: relative;
          border-radius: 12px;
          background: #fff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </div>
  );
}
