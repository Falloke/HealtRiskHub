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

type AgeData = { ageRange: string; deaths: number };

const GraphDeathsByAge = () => {
  const { province, start_date, end_date } = useDashboardStore();
  const [data, setData] = useState<AgeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `/api/dashBoard/age-group-deaths?start_date=${start_date}&end_date=${end_date}&province=${province}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("❌ Fetch error:", err);
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
        ผู้เสียชีวิตสะสมรายช่วงอายุ ({province})
      </h4>
      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="ageRange" type="category" />
            <Tooltip />
            <Bar dataKey="deaths" fill="#9C27B0" name="ผู้เสียชีวิตสะสม" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GraphDeathsByAge;
