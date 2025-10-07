"use client";

import { useEffect, useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";

type PatientsSummary = {
  totalPatients: number;
  avgPatientsPerDay: number;
  cumulativePatients: number;
};

const TotalPatient = () => {
  const { province, start_date, end_date } = useDashboardStore();
  const [data, setData] = useState<PatientsSummary | null>(null);
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
        const url = `/api/dashBoard/patients-summary?start_date=${start_date}&end_date=${end_date}&province=${encodeURIComponent(
          province
        )}`;
        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();
        if (!res.ok) {
          console.error("patients-summary failed:", res.status, text);
          throw new Error("โหลดข้อมูลไม่สำเร็จ");
        }
        const json: PatientsSummary = text ? JSON.parse(text) : null;
        if (!cancelled) setData(json);
      } catch (e) {
        console.error("❌ TotalPatient fetch error:", e);
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
    <div className="rounded-md bg-pink-100 p-4 shadow-md">
      <h4 className="text-lg font-bold">
        จำนวนผู้ป่วย {province ? `(${province})` : ""}
      </h4>

      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : !data ? (
        <p className="text-gray-700">ไม่พบข้อมูลผู้ป่วยในช่วงเวลานี้</p>
      ) : (
        <>
          <p className="text-xl font-bold text-red-600">
            {data.totalPatients?.toLocaleString?.() ?? "-"} ราย
          </p>
          <p>
            เฉลี่ยวันละ {data.avgPatientsPerDay?.toLocaleString?.() ?? "-"}{" "}
            คน/วัน
          </p>
          <p className="mt-1 font-semibold">
            สะสม {data.cumulativePatients?.toLocaleString?.() ?? "-"} ราย
          </p>
        </>
      )}
    </div>
  );
};

export default TotalPatient;
