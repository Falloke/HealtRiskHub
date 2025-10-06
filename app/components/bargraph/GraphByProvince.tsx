"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDashboardStore } from "@/store/useDashboardStore"; // ✅ import store

type RegionData = {
  region: string;
  patients: number;
  deaths: number;
};

const GraphByProvince = () => {
  const { province, start_date, end_date } = useDashboardStore(); // ✅ ดึงค่าจาก store
  const [data, setData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);

  const [region, setRegion] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `/api/dashBoard/region?start_date=${start_date}&end_date=${end_date}&province=${province}`;
        const res = await fetch(url);

        if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("❌ Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [province, start_date, end_date]); // ✅ ตอนนี้ตัวแปรถูกประกาศแล้ว

  return (
    <div className="rounded-md bg-white p-4 shadow-md">
      <h4 className="mb-2 font-bold">ผู้ป่วยสะสม รายภูมิภาค</h4>
      {loading ? (
        <p>⏳ กำลังโหลดข้อมูล...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" />
            <YAxis type="category" dataKey="region" />
            <Tooltip />
            <Legend />
            <Bar dataKey="patients" fill="#FF7043" name="ผู้ป่วยสะสม" />
            <Bar dataKey="deaths" fill="#9C27B0" name="ผู้เสียชีวิตสะสม" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GraphByProvince;
