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

type DataRow = { province: string; patients: number; deaths: number };

const GraphPatientsByRegion = () => {
  const { province, start_date, end_date } = useDashboardStore();
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `/api/dashBoard/region-by-province?start_date=${start_date}&end_date=${end_date}&province=${province}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const json = await res.json();
        setData(json.topPatients || []);
      } catch (err) {
        console.error("❌ Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [province, start_date, end_date]);

  return (
    <div className="rounded bg-white p-4 shadow">
      <h4 className="mb-2 font-bold">ผู้ป่วยสะสม ({province} → ตามภูมิภาค)</h4>
      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="province" type="category" />
            <Tooltip />
            <Bar dataKey="patients" fill="#FF7043" name="ผู้ป่วยสะสม" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GraphPatientsByRegion;
