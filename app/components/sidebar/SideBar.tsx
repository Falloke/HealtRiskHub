"use client";

import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDashboardStore } from "@/store/useDashboardStore";

interface Province {
  ProvinceNo: number;
  ProvinceNameThai: string;
  Region_VaccineRollout_MOPH: string;
}

type Disease = {
  code: string;
  name_th: string;
  name_en: string;
};

const Sidebar = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);

  const {
    province,
    start_date,
    end_date,
    setProvince,
    setDateRange,
    diseaseCode,
    diseaseNameTh,
    setDisease,
  } = useDashboardStore();

  const router = useRouter();
  const searchParams = useSearchParams();

  // 📍โหลดรายการจังหวัด (เหมือนเดิม)
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

  // 🦠 โหลดรายการโรคจากฐานข้อมูล (ผ่าน Kysely API)
  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const res = await fetch("/api/diseases", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load diseases");
        const data = (await res.json()) as { diseases: Disease[] };
        setDiseases(data.diseases || []);

        // ตั้งค่า default ถ้ายังไม่มีค่าใน store: ใช้ D01 (ไข้หวัดใหญ่)
        const qsDisease = searchParams.get("disease");
        if (!diseaseCode && !qsDisease) {
          const d01 = data.diseases.find((d) => d.code === "D01");
          if (d01) setDisease(d01.code, d01.name_th);
        }
      } catch (error) {
        console.error("Error loading diseases:", error);
      }
    };
    fetchDiseases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔄 ซิงค์ค่าจาก URL -> store (รองรับเปิดลิงก์ที่มี ?disease=...)
  useEffect(() => {
    const qsDisease = searchParams.get("disease");
    if (qsDisease && diseases.length > 0) {
      const found = diseases.find((d) => d.code === qsDisease);
      if (found) setDisease(found.code, found.name_th);
    }
  }, [searchParams, diseases, setDisease]);

  // 📤 ปุ่มค้นหา อัปเดต URL รวม disease
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (start_date) params.set("start_date", start_date);
    if (end_date) params.set("end_date", end_date);
    if (province) params.set("province", province);
    if (diseaseCode) params.set("disease", diseaseCode);

    router.push(`?${params.toString()}`);
  };

  return (
    <aside className="flex w-full max-w-xs flex-col gap-4 bg-pink-100 px-4 py-6">
      {/* 🦠 เลือกโรค */}
      <div>
        <label className="mb-1 block text-sm">เลือกโรค</label>
        <select
          value={diseaseCode}
          onChange={(e) => {
            const code = e.target.value;
            const d = diseases.find((x) => x.code === code);
            setDisease(code, d?.name_th ?? "");
          }}
          className="w-full rounded-full bg-white px-4 py-2 text-sm outline-none"
        >
          {diseases.length === 0 && <option value="">กำลังโหลด...</option>}
          {diseases.map((d) => (
            <option key={d.code} value={d.code}>
              {d.code} — {d.name_th} ({d.name_en})
            </option>
          ))}
        </select>
        {diseaseNameTh && (
          <p className="text-sm text-gray-700">
            โรคที่เลือก: <strong>{diseaseNameTh}</strong>
          </p>
        )}
      </div>

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
            onChange={(e) => setDateRange(e.target.value, end_date)}
            className="w-full rounded-full px-4 py-2 pl-10 text-sm outline-none"
          />
          <CalendarIcon className="absolute top-2.5 left-3 h-4 w-4 text-gray-500" />
        </div>
        <div className="relative">
          <input
            type="date"
            value={end_date}
            onChange={(e) => setDateRange(start_date, e.target.value)}
            className="w-full rounded-full px-4 py-2 pl-10 text-sm outline-none"
          />
          <CalendarIcon className="absolute top-2.5 left-3 h-4 w-4 text-gray-500" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
