// app/components/bargraph/GraphDeathsByRegion.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  TH_NUMBER,
  niceMax,
  ProvinceCountTooltip,
  ValueLabelRight,
} from "@/app/components/bargraph/GraphUtils";

type DataRow = {
  province: string;
  patients: number;
  deaths: number;
  region?: string;
};

export default function GraphDeathsByRegion() {
  const { province, start_date, end_date } = useDashboardStore();
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const url = `/api/dashBoard/region-by-province?start_date=${start_date}&end_date=${end_date}&province=${province}`;
        const res = await fetch(url);
        const text = await res.text();
        if (!res.ok) throw new Error(text || "โหลดข้อมูลไม่สำเร็จ");
        const json = text ? JSON.parse(text) : {};
        if (!cancelled)
          setData(Array.isArray(json.topDeaths) ? json.topDeaths : []);
      } catch (err) {
        console.error("❌ Fetch error (deaths by region):", err);
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [province, start_date, end_date]);

  // ปลายแกน X ให้พอดีกับข้อมูล (อิงค่าสูงสุดของ deaths)
  const xMax = useMemo(
    () => niceMax(Math.max(0, ...data.map((d) => Number(d.deaths ?? 0)))),
    [data]
  );

  // ความกว้างแกน Y แบบไดนามิก เพื่อ "ชิดซ้าย" เท่าที่จำเป็น
  const yWidth = useMemo(() => {
    const longest = data.reduce(
      (m, d) => Math.max(m, (d.province ?? "").length),
      0
    );
    return Math.min(180, Math.max(96, longest * 10));
  }, [data]);

  const regionName = data[0]?.region ? ` ${data[0].region}` : "";

  return (
    <div className="rounded bg-white p-4 shadow">
      <h4 className="mb-2 font-bold">ผู้เสียชีวิตสะสมใน{regionName}</h4>

      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            layout="vertical"
            // ชิดซ้าย และเผื่อพื้นที่ด้านขวาเล็กน้อย
            margin={{ top: 8, right: 64, bottom: 16, left: 16 }}
            barCategoryGap="2%"
            barGap={0}
          >
            <XAxis
              type="number"
              tickFormatter={TH_NUMBER}
              tickMargin={8}
              domain={[0, xMax]}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="province"
              width={yWidth}
              interval={0}
              tick={{ fontSize: 14 }}
            />

            {/* Hover: จังหวัด + ผู้เสียชีวิตสะสม : xx ราย */}
            <Tooltip
              content={
                <ProvinceCountTooltip
                  seriesName="ผู้เสียชีวิตสะสม"
                  labelKey="province"
                />
              }
            />

            <Bar
              dataKey="deaths"
              fill="#9C27B0"
              name="ผู้เสียชีวิตสะสม"
              barSize={26}
              radius={[0, 6, 6, 0]}
            >
              {/* ปลายแท่งมีหน่วย "ราย" แบบเดียวกัน */}
              <LabelList dataKey="deaths" content={<ValueLabelRight />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
