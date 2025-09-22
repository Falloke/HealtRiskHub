"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icons } from "@/app/icons";

type Row = {
  id: number;
  searchName: string;
  diseaseName: string;
  province: string;
  provinceAlt: string;
  startDate: string;
  endDate: string;
  color: string;
  createdAt: string;
};

function fmtMMDDYYYY(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export default function SearchPanel() {
  const sp = useSearchParams();
  const createdId = useMemo(() => Number(sp.get("id") ?? ""), [sp]);

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/api/saved-searches", {
          method: "GET",
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e?.error || "load failed");
        }
        const data: Row[] = await res.json();
        setRows(data);
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message || "โหลดข้อมูลล้มเหลว");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  async function handleDelete(id: number) {
    const ok = window.confirm("ต้องการลบรายการนี้หรือไม่?");
    if (!ok) return;

    // optimistic UI
    const prev = rows;
    setRows((r) => r.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/saved-searches?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        // rollback ถ้าลบไม่สำเร็จ
        setRows(prev);
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "ลบไม่สำเร็จ");
      }
    } catch {
      setRows(prev);
      alert("ลบไม่สำเร็จ");
    }
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-pink-600">การค้นหาที่สร้างไว้</h2>
        <Link
          href="/search-template"
          className="rounded-md bg-pink-500 px-4 py-2 text-white hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
        >
          + สร้างการค้นหา
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-white p-6 text-gray-600">กำลังโหลด...</div>
      ) : err ? (
        <div className="rounded-xl border bg-white p-6 text-red-600">
          {err === "Unauthorized" ? "กรุณาเข้าสู่ระบบก่อน" : `เกิดข้อผิดพลาด: ${err}`}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-gray-600">
          ยังไม่มีรายการ — เลือกจาก{" "}
          <Link href="/history" className="text-pink-600 underline">ประวัติการค้นหา</Link>{" "}
          หรือไปที่{" "}
          <Link href="/search-template" className="text-pink-600 underline">สร้างการค้นหา</Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="min-w-full table-fixed">
            <thead className="bg-pink-50 text-left text-sm text-gray-600">
              <tr>
                <th className="w-36 px-4 py-3">วันที่ค้นหา</th>
                <th className="px-4 py-3">ชื่อการค้นหา</th>
                <th className="w-40 px-4 py-3">โรค</th>
                <th className="w-64 px-4 py-3">จังหวัด</th>
                <th className="w-56 px-4 py-3">ระยะเวลา</th>
                <th className="w-14 px-4 py-3 text-right">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => {
                const highlight = createdId && r.id === createdId;
                return (
                  <tr key={r.id} className={`hover:bg-pink-50/40 ${highlight ? "bg-pink-50" : ""}`}>
                    <td className="px-4 py-3 text-sm text-gray-700">{fmtMMDDYYYY(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: r.color || "#9CA3AF" }}
                        />
                        <span className="truncate font-medium text-gray-800">{r.searchName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.diseaseName || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="line-clamp-1">
                        {r.province}
                        {r.province && r.provinceAlt ? " - " : ""}
                        {r.provinceAlt}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {fmtMMDDYYYY(r.startDate)} - {fmtMMDDYYYY(r.endDate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="inline-flex items-center justify-center rounded-full p-2 hover:bg-red-50"
                        title="ลบรายการนี้"
                        aria-label="ลบ"
                      >
                        <Icons name="Delete" size={18} colorClass="bg-gray-500 hover:bg-red-600" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
