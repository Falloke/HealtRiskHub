"use client";

import { Button } from "@/app/components/ui/button";

import dynamic from "next/dynamic";

// dynamic import ไม่ให้ SSR เพื่อหลีกเลี่ยง window is not defined
const HomeMap = dynamic(
  () => import("@/app/features/main/homePage/component/MapClient"),
  {
    ssr: false,
  }
);

const PageDescription = () => {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">
        ระบบวิเคราะห์โรคระบาดระดับจังหวัดในประเทศไทย
      </h1>
      <div className="m-4 flex gap-4">
        <div className="flex-col-2 flex">
          <div className="max-w-2xl text-lg text-black">
            <p className="mb-3">
              ระบบวิเคราะห์โรคระบาดระดับจังหวัดคือระบบเว็บแอปพลิเคชันที่ออกแบบมาเพื่อรวบรวม
              วิเคราะห์ และนำเสนอข้อมูลโรคระบาดในระดับจังหวัดของประเทศไทย
              ผู้ใช้งานสามารถค้นหาเชื้อโรคเพื่อศึกษาลักษณะโรค วิธีป้องกัน
              และดูแนวโน้มการระบาดในแต่ละพื้นที่
              นอกจากนี้ยังสามารถสร้างคำอธิบายกราฟอัตโนมัติด้วย AI
              เพื่อเพิ่มความเข้าใจแก่ผู้ใช้งานที่ไม่มีพื้นฐานด้านข้อมูล
            </p>
            <p className="mt-4 font-bold text-blue-700">แหล่งที่มาของข้อมูล:</p>
            <p>
              กรมควบคุมโรค:{" "}
              <a
                href="https://ddcopendata.ddc.moph.go.th/opendata/file/663"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                https://ddcopendata.ddc.moph.go.th/opendata/file/663
              </a>
              <Button>บันทึก</Button>
              <Button variant="secondary" size="lg">
                ย้อนกลับ
              </Button>
              <Button variant="danger" size="sm">
                ลบ
              </Button>
              <Button variant="outline" size="full">
                เปรียบเทียบข้อมูล
              </Button>
            </p>
          </div>
        </div>
        {/* ----- */}
        <div className="flex w-full flex-col">
          <h2 className="mb-4 text-2xl font-bold">แผนที่โรคระบาด</h2>
          <HomeMap />
        </div>
      </div>
    </div>
  );
};
export default PageDescription;
