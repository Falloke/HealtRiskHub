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

type GenderRow = { gender: string; value: number };
type Row = { label: string; value: number };

export default function GraphProvinceByDeaths() {
  const { province, start_date, end_date } = useDashboardStore();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const url = `/api/dashBoard/gender-deaths?start_date=${start_date}&end_date=${end_date}&province=${province}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("โหลดข้อมูลผู้เสียชีวิตไม่สำเร็จ");
        const json: GenderRow[] = await res.json();
        const total = (json ?? []).reduce(
          (s, r) => s + Number(r.value ?? 0),
          0
        );
        setRows([{ label: province || "รวม", value: total }]);
      } catch (e) {
        console.error("❌ Fetch error (deaths total):", e);
        setRows([{ label: province || "รวม", value: 0 }]);
      } finally {
        setLoading(false);
      }
    })();
  }, [province, start_date, end_date]);

  const yWidth = useMemo(
    () => Math.min(220, Math.max(100, (province?.length ?? 8) * 10 + 16)),
    [province]
  );
  const xMax = useMemo(() => niceMax(rows[0]?.value ?? 0), [rows]);

  return (
    <div className="rounded bg-white p-4 shadow">
      <h4 className="mb-3 font-bold">ผู้เสียชีวิตสะสมจังหวัด {province}</h4>
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
            <XAxis type="number" tickFormatter={TH_NUMBER} domain={[0, xMax]} />
            <YAxis
              type="category"
              dataKey="label"
              width={36}
              tick={<VerticalProvinceTick />}
            >
              {/* <Label
                value="จังหวัด"
                angle={-90}
                position="insideLeft"
                offset={10}
              /> */}
            </YAxis>
            <Tooltip
              content={<ProvinceCountTooltip seriesName="ผู้เสียชีวิตสะสม" />}
            />
            <Bar
              dataKey="value"
              fill="#8594A1
              " // สีต่างจากผู้ป่วย แต่รูปแบบเหมือนกันทั้งหมด
              radius={[0, 6, 6, 0]}
              name="ผู้เสียชีวิตสะสม"
            >
              <LabelList dataKey="value" content={<ValueLabelRight />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
