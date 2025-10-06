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
import { useDashboardStore } from "@/store/useDashboardStore";

type PatientsData = {
  province: string;
  male: number;
  female: number;
  unknown: number;
};

const GraphByGenderPatients = () => {
  const { province, start_date, end_date } = useDashboardStore();
  const [data, setData] = useState<PatientsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const url = `/api/dashBoard/gender-patients?start_date=${start_date}&end_date=${end_date}&province=${province}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("โหลดข้อมูลผู้ป่วยไม่สำเร็จ");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("❌ Fetch error (patients):", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [province, start_date, end_date]);

  return (
    <div className="rounded bg-white p-4 shadow">
      <h4 className="mb-2 font-bold">ผู้ป่วยสะสม แยกตามเพศ ({province})</h4>
      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="province" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="male" fill="#4FC3F7" name="ชาย" />
            <Bar dataKey="female" fill="#F48FB1" name="หญิง" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GraphByGenderPatients;
