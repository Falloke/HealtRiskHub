"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardStore } from "@/store/useDashboardStore";

type AgeData = { ageRange: string; patients: number };

const GraphPatientsByAge = () => {
  const { province, start_date, end_date } = useDashboardStore();
  const [data, setData] = useState<AgeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⛔ ถ้า province ยังว่างไม่ต้องยิง
    if (!province) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `/api/dashBoard/age-group?start_date=${start_date}&end_date=${end_date}&province=${encodeURIComponent(
          province
        )}`;
        const res = await fetch(url, { cache: "no-store" });

        // 🔍 log ข้อความ error จาก server เพื่อหาเหตุ 400/500
        const text = await res.text();
        if (!res.ok) {
          console.error("API failed:", url, res.status, text);
          throw new Error("โหลดข้อมูลไม่สำเร็จ");
        }

        const json: AgeData[] = text ? JSON.parse(text) : [];
        setData(json);
      } catch (err) {
        console.error("❌ Fetch error (age-group):", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [province, start_date, end_date]);

  return (
    <div className="rounded bg-white p-4 shadow">
      <h4 className="mb-2 font-bold">
        ผู้ป่วยสะสมรายช่วงอายุ ({province || "—"})
      </h4>
      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="ageRange" type="category" />
            <Tooltip />
            <Bar dataKey="patients" fill="#FF7043" name="ผู้ป่วยสะสม" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GraphPatientsByAge;
