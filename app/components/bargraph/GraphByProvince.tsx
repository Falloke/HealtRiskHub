// E:\HealtRiskHub\app\components\bargraph\GraphByProvince.tsx
"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useDashboardStore } from "@/store/useDashboardStore";

type RegionData = {
  region: string;
  patients: number;
  deaths: number;
};

export default function GraphByProvince() {
  const { province, start_date, end_date } = useDashboardStore();
  const [data, setData] = useState<RegionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const url = `/api/dashBoard/region?start_date=${encodeURIComponent(
          start_date
        )}&end_date=${encodeURIComponent(end_date)}&province=${encodeURIComponent(
          province || ""
        )}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as RegionData[];
        if (!aborted) setData(json ?? []);
      } catch (e) {
        if (!aborted) setErr("ไม่สามารถโหลดข้อมูลได้");
        console.error("[GraphByProvince] fetch error:", e);
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [province, start_date, end_date]);

  const ChartCard = ({
    title,
    dataKey,
    color,
    height = 320,
  }: {
    title: string;
    dataKey: keyof RegionData;
    color: string;
    height?: number;
  }) => (
    <section className="rounded-lg border bg-white p-4 shadow-sm">
      <h4 className="mb-3 font-bold">{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 8 }}>
          <XAxis type="number" />
          <YAxis type="category" dataKey="region" width={90} />
          <Tooltip />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 4, 4]}>
            {/* ตัวเลขที่ปลายแท่ง (อ่านง่าย ไม่เกะกะ) */}
            <LabelList dataKey={dataKey} position="right" offset={6} fontSize={12} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
        <span className="inline-block h-3 w-3 rounded" style={{ background: color }} />
        <span>{title}</span>
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="rounded-lg border bg-white p-4 text-gray-600">⏳ กำลังโหลดข้อมูล...</div>
      ) : err ? (
        <div className="rounded-lg border bg-white p-4 text-red-600">{err}</div>
      ) : data.length === 0 ? (
        <div className="rounded-lg border bg-white p-4 text-gray-600">
          ไม่มีข้อมูลสำหรับช่วงเวลาที่เลือก
        </div>
      ) : (
        <>
          {/* กราฟบน: ผู้ป่วยสะสม */}
          <ChartCard title="ผู้ป่วยสะสม รายภูมิภาค" dataKey="patients" color="#FF7043" />

          {/* กราฟล่าง: ผู้เสียชีวิตสะสม */}
          <ChartCard title="ผู้เสียชีวิตสะสม รายภูมิภาค" dataKey="deaths" color="#9C27B0" />
        </>
      )}
    </div>
  );
}
