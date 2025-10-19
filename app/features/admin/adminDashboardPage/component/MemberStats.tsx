"use client";

import { useEffect, useState } from "react";

type RoleCounts = { Admin: number; User: number; Other?: number };
type RecentUser = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  createdAt: string; // ISO
};
type Stats = {
  total: number;
  today: number;
  last7days: number;
  byRole: RoleCounts;
  recent: RecentUser[];
};

export default function MemberStats() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setErr(null);
        const res = await fetch("/api/admin/members", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Stats;
        if (!cancelled) setData(json);
      } catch (e) {
        console.error("[MemberStats] fetch error:", e);
        if (!cancelled) setErr("โหลดสถิติสมาชิกไม่สำเร็จ");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="space-y-6">
      {/* แถวสถิติรวม */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {["สมาชิกทั้งหมด", "เพิ่มวันนี้", "เพิ่มใน 7 วัน"].map((label, i) => (
          <div key={label} className="rounded-lg border bg-white p-5">
            <div className="text-sm text-gray-500">{label}</div>
            <div className="mt-1 text-3xl font-semibold">
              {loading
                ? "…"
                : err
                ? "—"
                : i === 0
                ? data?.total ?? 0
                : i === 1
                ? data?.today ?? 0
                : data?.last7days ?? 0}
            </div>
            {i === 0 && err && (
              <div className="mt-1 text-xs text-red-600">{err}</div>
            )}
          </div>
        ))}
      </div>

      {/* การ์ดแยกตามบทบาท */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-5">
          <div className="text-sm text-gray-500">ผู้ดูแลระบบ (Admin)</div>
          <div className="mt-1 text-2xl font-semibold">
            {loading ? "…" : data?.byRole?.Admin ?? 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="text-sm text-gray-500">ผู้ใช้ทั่วไป (User)</div>
          <div className="mt-1 text-2xl font-semibold">
            {loading ? "…" : data?.byRole?.User ?? 0}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="text-sm text-gray-500">อื่น ๆ</div>
          <div className="mt-1 text-2xl font-semibold">
            {loading ? "…" : data?.byRole?.Other ?? 0}
          </div>
        </div>
      </div>

      {/* ผู้ใช้ที่ลงทะเบียนล่าสุด 5 รายการ */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-5 py-3 font-semibold">
          ผู้ใช้ที่ลงทะเบียนล่าสุด
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  ชื่อ - สกุล
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  อีเมล
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  วันที่สมัคร
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-3" colSpan={3}>
                    กำลังโหลด…
                  </td>
                </tr>
              ) : (data?.recent?.length ?? 0) === 0 ? (
                <tr>
                  <td className="px-4 py-3" colSpan={3}>
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                data!.recent.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      {(u.first_name ?? "") + " " + (u.last_name ?? "")}
                    </td>
                    <td className="px-4 py-3">{u.email ?? "-"}</td>
                    <td className="px-4 py-3">
                      {new Date(u.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
