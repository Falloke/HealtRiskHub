"use client";
import { Button } from "@/app/components/ui/button";
import dynamic from "next/dynamic";
import SourceInfo from "app/features/main/dashBoardPage/component/SourceInfo";
import GraphByProvince from "@/app/components/bargraph/GraphByProvince";

const HomeMapInner = dynamic(() => import("./HomeMapInner"), { ssr: false });

const PageDescription = () => {
  console.log("📌 Rerender description");

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
            <GraphByProvince />
            <SourceInfo />
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
          </div>
        </div>
        {/* ----- */}
        <div className="flex w-full flex-col">
          <h2 className="mb-4 text-2xl font-bold">แผนที่โรคระบาด</h2>
          <HomeMapInner />

          {/* <MapClient /> */}
        </div>
      </div>
    </div>
  );
};
export default PageDescription;
