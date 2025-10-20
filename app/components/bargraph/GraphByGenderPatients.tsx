// app/components/bargraph/GraphByGenderPatients.tsx
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

type PatientsData = {
  province: string;
  male: number;
  female: number;
  unknown?: number;
};

export default function GraphByGenderPatients() {
  const { province, start_date, end_date } = useDashboardStore();
  const [data, setData] = useState<PatientsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const url = `/api/dashBoard/gender-patients?start_date=${start_date}&end_date=${end_date}&province=${province}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("โหลดข้อมูลผู้ป่วยไม่สำเร็จ");
        const json = (await res.json()) as PatientsData[];
        setData(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("❌ Fetch error (patients):", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [province, start_date, end_date]);

  // ค่าสูงสุดสำหรับแกน X และเผื่อขอบขวาตามความยาว label "xx,xxx ราย"
  const xMax = useMemo(() => {
    const maxVal = Math.max(
      0,
      ...data.flatMap((r) => [Number(r.male || 0), Number(r.female || 0)])
    );
    return niceMax(maxVal);
  }, [data]);

  const rightMargin = useMemo(() => {
    const text = `${TH_NUMBER(xMax)} ราย`;
    // ประมาณความกว้างตัวหนังสือ ~7.5px/ตัว + buffer
    return Math.min(120, Math.max(40, Math.floor(text.length * 7.5) + 14));
  }, [xMax]);

  return (
    <div className="overflow-hidden rounded bg-white p-4 shadow">
      <h4 className="mb-2 font-bold">ผู้ป่วยสะสมแยกตามเพศ {province}</h4>

      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            layout="vertical"
            // ชิดซ้ายจริง: left เล็ก, YAxis แคบ, เผื่อขวาตามความยาว "xx,xxx ราย"
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

            <YAxis
              dataKey="province"
              type="category"
              width={56}
              tick={<VerticalProvinceTick />} // แนวตั้งเหมือนกราฟอื่น
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

            <Legend
              verticalAlign="bottom"
              align="center"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, lineHeight: "12px" }}
            />

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
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
