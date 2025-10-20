"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboardStore } from "@/store/useDashboardStore";

type Disease = {
  code: string;       // เช่น D01
  name_th: string;    // ชื่อไทย
  name_en: string;    // อังกฤษ
};

type SavedSearch = {
  id: number;
  searchName: string;
  diseaseName: string;  // ชื่อโรค (ไทย) หรือ code เดิม
  province: string;     // (มีมาก็เก็บไว้เฉยๆ ไม่แสดงใน HomeSidebar)
  provinceAlt: string;
  startDate: string;
  endDate: string;
  color: string;
  createdAt: string;
};

export default function HomeSidebar() {
  // --- store จากหน้า dashboard ---
  const {
    start_date,
    end_date,
    setDateRange,
    diseaseCode,
    diseaseNameTh,
    setDisease,
    setProvince, // เผื่อ apply จาก saved-search (มี province ติดมา)
  } = useDashboardStore();

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- states ---
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [savedErr, setSavedErr] = useState<string | null>(null);
  const [canSeeSaved, setCanSeeSaved] = useState(true); // ถ้า 401 จะ false

  // --- helper ---
  const labelOf = useCallback((s: SavedSearch) => {
    const parts: string[] = [s.searchName];
    if (s.diseaseName) parts.push(s.diseaseName);
    if (s.startDate && s.endDate) parts.push(`${s.startDate}→${s.endDate}`);
    return parts.join(" • ");
  }, []);

  const applySavedSearch = useCallback(
    (s: SavedSearch) => {
      // 1) โรค: map จากชื่อไทย/หรือ code ที่เซฟมา
      const found = diseases.find(
        (d) => d.name_th === s.diseaseName || d.code === s.diseaseName
      );
      if (found) setDisease(found.code, found.name_th);
      else if (s.diseaseName) setDisease("", s.diseaseName);

      // 2) จังหวัด (ถ้ามี ไม่แสดงใน UI แต่ยังตั้งค่าไว้ให้หน้าอื่นใช้งาน)
      const pv = (s.provinceAlt || s.province || "").trim();
      if (pv) setProvince(pv);

      // 3) ช่วงวันที่
      setDateRange(s.startDate || "", s.endDate || "");

      // 4) ไปหน้า Overview
      router.push("/dashBoard");
    },
    [diseases, router, setDateRange, setDisease, setProvince]
  );

  // ---- โหลดโรค ----
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/diseases", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load diseases");
        const data = (await res.json()) as { diseases: Disease[] } | Disease[];
        const rows = Array.isArray(data) ? data : data?.diseases || [];
        setDiseases(rows);

        // ตั้ง default ถ้าไม่มีใน store และ URL ไม่ได้ระบุ
        const qsDisease = searchParams.get("disease");
        if (!diseaseCode && !qsDisease && rows.length) {
          const d01 = rows.find((d) => d.code === "D01") ?? rows[0];
          setDisease(d01.code, d01.name_th);
        }
      } catch (e) {
        console.error("Error loading diseases:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- sync ?disease=... จาก URL ----
  useEffect(() => {
    const qsDisease = searchParams.get("disease");
    if (qsDisease && diseases.length > 0) {
      const found = diseases.find((d) => d.code === qsDisease);
      if (found) setDisease(found.code, found.name_th);
    }
  }, [searchParams, diseases, setDisease]);

  // ---- โหลด saved searches (ซ่อนถ้า 401) ----
  useEffect(() => {
    (async () => {
      try {
        setSavedLoading(true);
        setSavedErr(null);
        const res = await fetch("/api/saved-searches", { cache: "no-store" });

        if (res.status === 401) {
          setCanSeeSaved(false);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = (await res.json()) as SavedSearch[];
        setSavedSearches(json);
      } catch (e) {
        console.error("load saved searches error:", e);
        // แสดง error เฉพาะผู้ที่ดูได้ (ล็อกอินแล้ว)
        setSavedErr("โหลดรายการค้นหาที่บันทึกไว้ไม่สำเร็จ");
      } finally {
        setSavedLoading(false);
      }
    })();
  }, []);

  const goCreate = () => router.push("/search-template");

  return (
    <aside className="flex w-full max-w-xs flex-col gap-4 bg-pink-100 px-4 py-6">
      {/* เลือกโรค */}
      <div>
        <label className="mb-1 block text-sm">เลือกโรค</label>
        <select
          value={diseaseCode}
          onChange={(e) => {
            const code = e.target.value;
            const d = diseases.find((x) => x.code === code);
            setDisease(code, d?.name_th ?? "");
          }}
          className="w-full rounded-full bg-white px-4 py-2 text-sm outline-none"
        >
          {diseases.length === 0 && <option value="">กำลังโหลด...</option>}
          {diseases.map((d) => (
            <option key={d.code} value={d.code}>
              {d.code} — {d.name_th} ({d.name_en})
            </option>
          ))}
        </select>
        {diseaseNameTh && (
          <p className="mt-1 text-sm text-gray-700">
            โรคที่เลือก: <strong>{diseaseNameTh}</strong>
          </p>
        )}
      </div>

      {/* ระยะเวลา */}
      <div>
        <label className="mb-1 block text-sm">เลือกระยะเวลา</label>
        <div className="relative mb-2">
          <input
            type="date"
            value={start_date}
            onChange={(e) => setDateRange(e.target.value, end_date)}
            className="w-full rounded-full bg-white px-4 py-2 pl-10 text-sm outline-none"
          />
          <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>
        <div className="relative">
          <input
            type="date"
            value={end_date}
            onChange={(e) => setDateRange(start_date, e.target.value)}
            className="w-full rounded-full bg-white px-4 py-2 pl-10 text-sm outline-none"
          />
          <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>
      </div>

      {/* การค้นหาที่บันทึกไว้ (ซ่อนถ้าไม่ได้ล็อกอิน) */}
      {canSeeSaved && (
        <div className="border-t border-pink-200 pt-3">
          <label className="mb-1 block text-sm">การค้นหาที่บันทึกไว้</label>

          {savedLoading ? (
            <div className="w-full rounded-full bg-white px-4 py-2 text-sm text-gray-500">
              กำลังโหลด...
            </div>
          ) : savedErr ? (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {savedErr}
            </div>
          ) : savedSearches.length > 0 ? (
            <div className="flex items-center gap-2">
              <select
                defaultValue=""
                onChange={(e) => {
                  const id = Number(e.target.value);
                  if (!id) return;
                  const s = savedSearches.find((x) => x.id === id);
                  if (!s) return;
                  applySavedSearch(s);
                }}
                className="w-full flex-1 rounded-full bg-white px-4 py-2 text-sm outline-none"
                aria-label="เลือกการค้นหาที่บันทึกไว้"
              >
                <option value="" disabled>
                  — เลือกการค้นหาที่บันทึก —
                </option>
                {savedSearches.map((s) => (
                  <option key={s.id} value={s.id}>
                    {labelOf(s)}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={goCreate}
                title="สร้างการค้นหาใหม่"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-pink-500 text-white shadow-sm transition hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={goCreate}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-pink-600 ring-1 ring-pink-300 transition hover:bg-pink-50"
            >
              <Plus className="h-4 w-4" />
              สร้างการค้นหา
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
