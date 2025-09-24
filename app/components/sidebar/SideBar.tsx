"use client";

import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

interface Province {
  ProvinceNo: number;
  ProvinceNameThai: string;
  Region_VaccineRollout_MOPH: string;
}

const Sidebar = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [province, setProvince] = useState("");
  const [start_date, setStartDate] = useState<string>("");
  const [end_date, setEndDate] = useState<string>("");
  const [isProvinceLocked, setIsProvinceLocked] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // 🧭 โหลดค่าเริ่มต้นจาก URL
  useEffect(() => {
    const p = searchParams.get("province") ?? "";
    if (!isProvinceLocked) {
      setProvince(p);
    }

    // ส่วนนี้ยังต้องอัปเดตตามปกติ
    const s = searchParams.get("start_date") ?? "";
    const e = searchParams.get("end_date") ?? "";
    setStartDate(s);
    setEndDate(e);
  }, [searchParams, isProvinceLocked]);

  // 📍โหลดรายการจังหวัด
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("/data/Thailand-ProvinceName.json");
        if (!res.ok) throw new Error("Failed to load provinces");
        const data: Province[] = await res.json();
        setProvinces(data);
      } catch (error) {
        console.error("Error loading provinces:", error);
      }
    };

    fetchProvinces();
  }, []);
  useEffect(() => {
    // ดึงค่าจาก URL เฉพาะเมื่อ province ยังไม่ถูก lock
    const s = searchParams.get("start_date") ?? "";
    const e = searchParams.get("end_date") ?? "";
    setStartDate(s);
    setEndDate(e);

    if (!isProvinceLocked) {
      const p = searchParams.get("province") ?? "";
      setProvince(p);
    }
  }, [searchParams, isProvinceLocked]); // 🆕 เพิ่ม dependency `isProvinceLocked`

  // 📤 กดปุ่มค้นหาเพื่ออัปเดต URL
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (start_date) params.set("start_date", start_date);
    if (end_date) params.set("end_date", end_date);
    if (province) params.set("province", province);
    setIsProvinceLocked(true); // 🆕 ล็อก province

    router.push(`?${params.toString()}`);
  };

  return (
    <aside className="flex w-full max-w-xs flex-col gap-4 bg-pink-100 px-4 py-6">
      {/* จังหวัด */}
      <div>
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="w-full rounded-full bg-white px-4 py-2 text-sm outline-none"
        >
          <option value="">-- เลือกจังหวัด --</option>
          {provinces.map((p) => (
            <option key={p.ProvinceNo} value={p.ProvinceNameThai}>
              {p.ProvinceNameThai}
            </option>
          ))}
        </select>
        {province && (
          <p className="text-sm text-gray-700">
            จังหวัดที่เลือก: <strong>{province}</strong>
          </p>
        )}
      </div>

      {/* วันที่ */}
      <div>
        <label className="mb-1 block text-sm">เลือกระยะเวลา</label>
        <div className="relative mb-2">
          <input
            type="date"
            value={start_date}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-full px-4 py-2 pl-10 text-sm outline-none"
          />
          <CalendarIcon className="absolute top-2.5 left-3 h-4 w-4 text-gray-500" />
        </div>
        <div className="relative">
          <input
            type="date"
            value={end_date}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-full px-4 py-2 pl-10 text-sm outline-none"
          />
          <CalendarIcon className="absolute top-2.5 left-3 h-4 w-4 text-gray-500" />
        </div>
      </div>

      {/* ปุ่มค้นหา */}
      <button
        onClick={handleSearch}
        className="rounded-full bg-pink-600 py-2 text-sm font-medium text-white hover:bg-pink-700"
      >
        ค้นหา
      </button>
      <button
        onClick={() => {
          setProvince("");
          setIsProvinceLocked(false);
        }}
        className="rounded-full border bg-white py-2 text-sm text-gray-700"
      >
        รีเซ็ตจังหวัด
      </button>

      <button className="rounded-full border bg-white py-2 text-sm text-gray-700">
        การค้นหาที่ได้บันทึกไว้
      </button>
    </aside>
  );
};

export default Sidebar;
