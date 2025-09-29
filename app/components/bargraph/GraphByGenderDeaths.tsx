"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useDashboardStore } from "@/store/useDashboardStore";

type DeathData = {
  gender: string;
  value: number;
};

const GraphByGenderDeaths = () => {
  const { province, start_date, end_date } = useDashboardStore();
  const [data, setData] = useState<DeathData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeaths = async () => {
      try {
        const url = `/api/dashBoard/gender-deaths?start_date=${start_date}&end_date=${end_date}&province=${province}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("โหลดข้อมูลผู้เสียชีวิตไม่สำเร็จ");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("❌ Fetch error (deaths):", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDeaths();
  }, [province, start_date, end_date]);

  const getColor = (gender: string) => {
    if (gender === "ชาย") return "#4FC3F7"; // ฟ้าอ่อน
    if (gender === "หญิง") return "#F48FB1"; // ชมพูอ่อน
    return "#BDBDBD";
  };

  return (
    <div className="rounded bg-white p-4 shadow">
      <h4 className="mb-2 font-bold">
        ผู้เสียชีวิตสะสม แยกตามเพศ ({province})
      </h4>
      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="gender" type="category" />
            <Tooltip />
            <Bar dataKey="value" name="จำนวน" label={{ position: "right" }}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.gender)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GraphByGenderDeaths;
