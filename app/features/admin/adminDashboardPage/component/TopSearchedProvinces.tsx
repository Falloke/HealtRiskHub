"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Item = { name: string; cnt: number };

// 🎨 โทนส้มอ่อนสบายตา
const ORANGE = "#F6D7B0";       // สีแท่งกราฟ
const ORANGE_BORDER = "#EBC28A"; // (เผื่อใช้ภายหลังเป็นเส้นขอบ/hover)

export default function TopSearchedProvinces() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setErr(null);
        const res = await fetch("/api/admin/top-provinces", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Item[];
        if (!cancelled) setData(json ?? []);
      } catch (e) {
        console.error("[TopSearchedProvinces] fetch error:", e);
        if (!cancelled) setErr("โหลดข้อมูล Top 10 จังหวัดไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const top10 = useMemo(() => {
    return [...data].sort((a, b) => b.cnt - a.cnt).slice(0, 10);
  }, [data]);

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="mb-2 font-semibold">Top 10 จังหวัดที่ถูกค้นหามากสุด</div>

      {loading ? (
        <div className="text-sm text-gray-500">กำลังโหลด…</div>
      ) : err ? (
        <div className="text-sm text-red-600">{err}</div>
      ) : top10.length === 0 ? (
        <div className="text-sm text-gray-500">ไม่มีข้อมูล</div>
      ) : (
        <>
          <div style={{ width: "100%", height: 360 }}>
            <ResponsiveContainer>
              <BarChart data={top10} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cnt" name="จำนวนครั้งที่ค้นหา" fill={ORANGE} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ตารางจัดอันดับด้านล่าง (โทนส้มอ่อน) */}
          <div className="mt-4 rounded-md border bg-orange-50">
            <div className="border-b px-3 py-2 text-sm font-medium text-orange-900">
              อันดับจังหวัด (พร้อมจำนวนการค้นหา)
            </div>
            <ol className="divide-y">
              {top10.map((it, idx) => (
                <li
                  key={it.name + idx}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-200 text-[12px] font-semibold text-orange-900">
                      {idx + 1}
                    </span>
                    <span className="text-gray-800">{it.name}</span>
                  </div>
                  <span className="tabular-nums text-gray-700">
                    {it.cnt.toLocaleString()}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
