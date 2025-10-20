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
  Label,
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
type Data = { label: string; value: number; region: string };

export default function GraphProvinceByPatients() {
  const { province, start_date, end_date } = useDashboardStore();
  const [rows, setRows] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const go = async () => {
      try {
        const url = `/api/dashBoard/province-summary?start_date=${start_date}&end_date=${end_date}&province=${province}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
        const json: Resp = await res.json();
        setRows([
          { label: json.province, value: json.patients, region: json.region },
        ]);
      } catch (e) {
        console.error("❌ Fetch error (province-patients):", e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    setLoading(true);
    go();
  }, [province, start_date, end_date]);

  const yWidth = useMemo(
    () => Math.min(220, Math.max(100, (province?.length ?? 8) * 10 + 16)),
    [province]
  );
  const xMax = useMemo(() => niceMax(rows[0]?.value ?? 0), [rows]);

  return (
    <div className="rounded bg-white p-4 shadow">
      <h4 className="mb-3 font-bold">ผู้ป่วยสะสมจังหวัด {province}</h4>
      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={rows}
            layout="vertical"
            margin={{ top: 8, right: 12, bottom: 8, left: 8 }}
            barSize={22}
          >
            <XAxis type="number" tickFormatter={TH_NUMBER} domain={[0, xMax]}>
              {" "}
            </XAxis>
            <YAxis
              type="category"
              dataKey="label"
              width={56}
              tick={<VerticalProvinceTick />}
            >
              <Label
                value="จังหวัด"
                angle={-90}
                position="insideLeft"
                offset={10}
              />
            </YAxis>
            <Tooltip
              content={<ProvinceCountTooltip seriesName="ผู้ป่วยสะสม" />}
            />
            <Bar
              dataKey="value"
              fill="#FF7043"
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
