"use client";

import { useEffect, useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";

type DeathsSummary = {
  totalDeaths: number;
  avgDeathsPerDay: number;
  cumulativeDeaths: number;
};

const TotalDeath = () => {
  const { province, start_date, end_date } = useDashboardStore();
  const [data, setData] = useState<DeathsSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!province) {
      setData(null);
      return;
    }

    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `/api/dashBoard/deaths-summary?start_date=${start_date}&end_date=${end_date}&province=${encodeURIComponent(
          province
        )}`;
        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();
        if (!res.ok) {
          console.error("deaths-summary failed:", res.status, text);
          throw new Error("โหลดข้อมูลไม่สำเร็จ");
        }
        const json: DeathsSummary = text ? JSON.parse(text) : null;
        if (!cancelled) setData(json);
      } catch (e) {
        console.error("❌ TotalDeath fetch error:", e);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [province, start_date, end_date]);

  return (
    <div className="rounded bg-gray-100 p-4 shadow">
      <h2 className="text-xl font-semibold">
        จำนวนผู้เสียชีวิต {province ? `(${province})` : ""}
      </h2>

      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : !data ? (
        <p className="text-gray-700">ไม่พบข้อมูลผู้เสียชีวิตในช่วงเวลานี้</p>
      ) : (
        <>
          <p className="text-3xl font-bold text-gray-800">
            {data.totalDeaths?.toLocaleString?.() ?? "-"} ราย
          </p>
          <p className="text-sm">
            เฉลี่ยวันละ {data.avgDeathsPerDay?.toLocaleString?.() ?? "-"} คน/วัน
          </p>
          <p className="text-sm">
            สะสม{" "}
            <span className="font-semibold">
              {data.cumulativeDeaths?.toLocaleString?.() ?? "-"}
            </span>{" "}
            ราย
          </p>
        </>
      )}
    </div>
  );
};

export default TotalDeath;
