// app/components/bargraph/GraphByGenderDeaths.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  TH_NUMBER,
  niceMax,
  VerticalProvinceTick,
} from "@/app/components/bargraph/GraphUtils";

type APIRow = { gender: string; value: number };
type ChartRow = {
  province: string;
  male: number;
  female: number;
  unknown?: number;
};

export default function GraphByGenderDeaths() {
  const { province, start_date, end_date } = useDashboardStore();
  const [rows, setRows] = useState<ChartRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const url = `/api/dashBoard/gender-deaths?start_date=${start_date}&end_date=${end_date}&province=${province}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("โหลดข้อมูลผู้เสียชีวิตไม่สำเร็จ");
        const json = (await res.json()) as APIRow[];

        // 👉 แปลงเป็นแถวเดียวแบบเดียวกับผู้ป่วย
        const male = Number(json.find((r) => r.gender === "ชาย")?.value ?? 0);
        const female = Number(
          json.find((r) => r.gender === "หญิง")?.value ?? 0
        );
        const unknown = Number(
          json.find((r) => r.gender === "ไม่ระบุ")?.value ?? 0
        );

        setRows([{ province: province || "รวม", male, female, unknown }]);
      } catch (err) {
        console.error("❌ Fetch error (gender-deaths):", err);
        setRows([
          { province: province || "รวม", male: 0, female: 0, unknown: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [province, start_date, end_date]);

  // สเกลแกน X และกันล้นขวา (เหมือนผู้ป่วย)
  const xMax = useMemo(() => {
    const maxVal = Math.max(
      0,
      ...rows.flatMap((r) => [
        Number(r.male || 0),
        Number(r.female || 0),
        Number(r.unknown || 0),
      ])
    );
    return niceMax(maxVal);
  }, [rows]);

  const rightMargin = useMemo(() => {
    const text = `${TH_NUMBER(xMax)} ราย`;
    return Math.min(120, Math.max(40, Math.floor(text.length * 7.5) + 14));
  }, [xMax]);

  return (
    <div className="overflow-hidden rounded bg-white p-4 shadow">
      <h4 className="mb-2 font-bold">ผู้เสียชีวิตสะสมแยกตามเพศ {province}</h4>

      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 4, right: rightMargin, bottom: 28, left: 8 }}
            barCategoryGap="12%"
            barGap={4}
          >
            <XAxis
              type="number"
              tickFormatter={TH_NUMBER}
              allowDecimals={false}
              domain={[0, xMax]}
              tickMargin={8}
            />

            {/* ✅ เหมือนฝั่งผู้ป่วย */}
            <YAxis
              dataKey="province"
              type="category"
              width={56}
              tick={<VerticalProvinceTick />}
            />

            <Tooltip
              formatter={(value: any, name: any) => [
                `${TH_NUMBER(Number(value))} ราย`,
                name === "male"
                  ? "ชาย"
                  : name === "female"
                    ? "หญิง"
                    : "ไม่ระบุ",
              ]}
              labelFormatter={() => province}
              wrapperStyle={{ zIndex: 10 }}
              contentStyle={{ borderRadius: 8, padding: 10 }}
              offset={10}
            />

            {/* ✅ เพิ่ม legend ให้เหมือนกัน */}
            <Legend
              verticalAlign="bottom"
              align="center"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, lineHeight: "12px" }}
            />

            {/* Bar สี/ขนาดเท่ากันกับผู้ป่วย */}
            <Bar
              dataKey="male"
              name="ชาย"
              fill="#4FC3F7"
              barSize={14}
              radius={[4, 4, 4, 4]}
            >
              <LabelList
                dataKey="male"
                position="right"
                content={(p: any) => {
                  const val = Number(p.value ?? 0);
                  const x = Number(p.x ?? 0) + Number(p.width ?? 0) + 6;
                  const y = Number(p.y ?? 0) + Number(p.height ?? 0) / 2 + 4;
                  return (
                    <text x={x} y={y} fontSize={12} fill="#374151">
                      {TH_NUMBER(val)} ราย
                    </text>
                  );
                }}
              />
            </Bar>

            <Bar
              dataKey="female"
              name="หญิง"
              fill="#F48FB1"
              barSize={14}
              radius={[4, 4, 4, 4]}
            >
              <LabelList
                dataKey="female"
                position="right"
                content={(p: any) => {
                  const val = Number(p.value ?? 0);
                  const x = Number(p.x ?? 0) + Number(p.width ?? 0) + 6;
                  const y = Number(p.y ?? 0) + Number(p.height ?? 0) / 2 + 4;
                  return (
                    <text x={x} y={y} fontSize={12} fill="#374151">
                      {TH_NUMBER(val)} ราย
                    </text>
                  );
                }}
              />
            </Bar>

            {/* ถ้ามี “ไม่ระบุเพศ” ให้โชว์เหมือนกัน */}
            {rows.some((r) => (r.unknown ?? 0) > 0) && (
              <Bar
                dataKey="unknown"
                name="ไม่ระบุ"
                fill="#BDBDBD"
                barSize={14}
                radius={[4, 4, 4, 4]}
              >
                <LabelList
                  dataKey="unknown"
                  position="right"
                  content={(p: any) => {
                    const val = Number(p.value ?? 0);
                    const x = Number(p.x ?? 0) + Number(p.width ?? 0) + 6;
                    const y = Number(p.y ?? 0) + Number(p.height ?? 0) / 2 + 4;
                    return (
                      <text x={x} y={y} fontSize={12} fill="#374151">
                        {TH_NUMBER(val)} ราย
                      </text>
                    );
                  }}
                />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
