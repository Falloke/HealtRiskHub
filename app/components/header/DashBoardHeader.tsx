"use client";
import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
interface Province {
  ProvinceNo: number;
  ProvinceNameThai: string;
  Region_VaccineRollout_MOPH: string;
}

const DashboardHeader = () => {
  const searchParams = useSearchParams();
  const province = searchParams.get("province") || ""; // fallback ว่าง/ดีฟอลต์
  const router = useRouter();

  const diseaseName = "โรคไข้หวัดใหญ่"; // ปรับตาม state/props ของคุณ
  const [start_date, setStartDate] = useState<string>("");
  const [end_date, setEndDate] = useState<string>("");

  // ตั้งค่าจาก URL ครั้งแรก
  useEffect(() => {
    const s = searchParams.get("start_date") ?? "";
    const e = searchParams.get("end_date") ?? "";

    setStartDate(s);
    setEndDate(e);
  }, [searchParams]);

  // เมื่อเปลี่ยน param ใน URL ให้เซ็ต input
  const handleDateChange = (type: "start" | "end", value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (type === "start") {
      params.set("start_date", value);
    } else {
      params.set("end_date", value);
    }

    // 🆕 ใส่ province กลับเข้าไปใน URL ด้วย (ถ้ามี)
    if (province) {
      params.set("province", province);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold text-green-800">รายงานสถานการณ์</h2>
      <h3 className="text-xl font-bold text-green-900">
        {diseaseName} {province && `ในจังหวัด ${province}`}
      </h3>

      <div className="flex">
        <div className="relative mb-2 flex">
          <input
            type="date"
            value={start_date}
            onChange={(e) => handleDateChange("start", e.target.value)}
            className="w-full rounded-full px-4 py-2 pl-10 text-sm outline-none"
          />
          <CalendarIcon className="absolute top-2.5 left-3 h-4 w-4 text-gray-500" />
        </div>
        <div className="relative">
          <input
            type="date"
            value={end_date}
            onChange={(e) => handleDateChange("end", e.target.value)}
            className="w-full rounded-full px-4 py-2 pl-10 text-sm outline-none"
          />
          <CalendarIcon className="absolute top-2.5 left-3 h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
};
export default DashboardHeader;
