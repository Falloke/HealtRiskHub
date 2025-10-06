"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useDashboardStore } from "@/store/useDashboardStore";

type TrendData = {
  month: string;
  male: number;
  female: number;
};

const GraphByGenderTrend = () => {
  const GraphByGenderTrend = () => {
    const { province, start_date, end_date } = useDashboardStore();
    const [data, setData] = useState<TrendData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchTrend = async () => {
        try {
          const url = `/api/dashBoard/gender-trend?start_date=${start_date}&end_date=${end_date}&province=${province}`;
          const res = await fetch(url);
          const text = await res.text(); // ✅ debug ได้เสมอ

          if (!res.ok) {
            console.error("gender-trend API failed:", res.status, text);
            throw new Error("โหลดข้อมูลแนวโน้มไม่สำเร็จ");
          }

          const json = text ? JSON.parse(text) : [];
          setData(json);
        } catch (err) {
          console.error("❌ Fetch error (trend):", err);
          setData([]);
        } finally {
          setLoading(false);
        }
      };

      fetchTrend();
    }, [province, start_date, end_date]);
    return (
      <div className="rounded bg-white p-4 shadow">
        <h4 className="mb-2 font-bold">
          จำนวนผู้ป่วยจำแนกตามเพศ (รายเดือน) — {province}
        </h4>
        {loading ? (
          <p>⏳ กำลังโหลด...</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="male"
                stroke="#4FC3F7"
                name="ชาย"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="female"
                stroke="#F48FB1"
                name="หญิง"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };
};
export default GraphByGenderTrend;
