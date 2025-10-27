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
  VerticalProvinceTick,
  ValueLabelRight,
  ProvinceCountTooltip,
  niceMax,
} from "./GraphUtils";

type Resp = { province: string; region: string; patients: number };
type Row = { province: string; region?: string; value: number };

export default function GraphProvinceByPatients() {
  const { province, start_date, end_date } = useDashboardStore();
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const url = `/api/dashBoard/province-summary?start_date=${start_date}&end_date=${end_date}&province=${province}`;
        const res = await fetch(url);
        const text = await res.text();
        if (!res.ok) throw new Error(text || "โหลดข้อมูลไม่สำเร็จ");
        const json: Resp = text ? JSON.parse(text) : ({} as any);
        if (!cancelled && json?.province) {
          setData([
            {
              province: json.province,
              region: json.region,
              value: json.patients,
            },
          ]);
        } else if (!cancelled) {
          setData([]);
        }
      } catch (e) {
        console.error("❌ Fetch error (province-patients):", e);
        if (!cancelled) setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [province, start_date, end_date]);

  const xMax = useMemo(
    () => niceMax(Math.max(0, ...data.map((d) => Number(d.value ?? 0)))),
    [data]
  );

  return (
    <div className="rounded bg-white p-4 shadow">
      <h4 className="mb-3 font-bold">ผู้ป่วยสะสมจังหวัด {province}</h4>

      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 12, bottom: 8, left: 8 }}
            barSize={22}
          >
            <XAxis type="number" tickFormatter={TH_NUMBER} domain={[0, xMax]} />
            <YAxis
              type="category"
              dataKey="province"
              width={36}
              interval={0}
              tick={<VerticalProvinceTick />}
            />

            <Tooltip
              content={
                <ProvinceCountTooltip
                  seriesName="ผู้ป่วยสะสม"
                  labelKey="province"
                />
              }
            />

            <Bar
              dataKey="value"
              fill="#2185D5"
              radius={[0, 6, 6, 0]}
              name="ผู้ป่วยสะสม"
            >
              <LabelList dataKey="value" content={<ValueLabelRight />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
