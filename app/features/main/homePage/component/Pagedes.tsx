// E:\HealtRiskHub\app\features\main\homePage\component\Pagedes.tsx
"use client";

import dynamic from "next/dynamic";
import SourceInfo from "app/features/main/dashBoardPage/component/SourceInfo";
import GraphByProvince from "@/app/components/bargraph/GraphByProvince";

const HomeMapInner = dynamic(() => import("./HomeMapInner"), { ssr: false });

export default function PageDescription() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 px-3 md:px-4">
      {/* Hero: ไม่มีเส้น + ไล่สีบาง ๆ */}
      <header className="rounded-xl bg-gradient-to-r from-pink-50 to-white p-5 md:p-6">
        <h1 className="text-xl font-bold text-neutral-900 md:text-2xl">
          ระบบวิเคราะห์โรคระบาดระดับจังหวัดในประเทศไทย
        </h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-neutral-700">
          ระบบเว็บแอปพลิเคชันสำหรับรวบรวม วิเคราะห์ และนำเสนอข้อมูลโรคระบาดในระดับจังหวัด …
        </p>
      </header>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
        {/* Left */}
        <section className="space-y-5">
          <div className="card p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900">
                ผู้ป่วยสะสมรายภูมิภาค
              </h2>
            </div>
            <GraphByProvince />
          </div>

          <div className="card p-4 md:p-5">
            <h2 className="mb-3 text-base font-semibold text-neutral-900">
              แหล่งข้อมูลอ้างอิง
            </h2>
            <SourceInfo />
          </div>
        </section>

        {/* Right — แผนที่ */}
        <aside className="card p-4 md:p-5">
          <h2 className="mb-3 text-base font-semibold text-neutral-900">
            แผนที่โรคระบาด
          </h2>
          <HomeMapInner />
        </aside>
      </div>

      {/* scoped styles: กรอบเรียบ ๆ ไม่มีเอฟเฟกต์สีตอน hover */}
      <style jsx>{`
        .card {
          position: relative;
          border-radius: 12px;        /* rounded-xl */
          background: #fff;
          border: 1px solid #e5e7eb;  /* neutral-200 */
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          transition: box-shadow 0.2s ease; /* แค่เงาเบาๆ */
        }
        .card:hover {
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.07);
        }
      `}</style>
    </div>
  );
}
