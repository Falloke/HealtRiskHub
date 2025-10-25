"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboardStore } from "@/store/useDashboardStore";

type Disease = { code: string; name_th: string; name_en: string };
type SavedSearch = {
  id: number; searchName: string; diseaseName: string;
  province: string; provinceAlt: string; startDate: string; endDate: string;
  color: string; createdAt: string;
};

export default function HomeSidebar() {
  const { start_date, end_date, setDateRange, diseaseCode, diseaseNameTh, setDisease, setProvince } =
    useDashboardStore();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [savedErr, setSavedErr] = useState<string | null>(null);
  const [canSeeSaved, setCanSeeSaved] = useState(true);

  const labelOf = useCallback((s: SavedSearch) => {
    const parts: string[] = [s.searchName];
    if (s.diseaseName) parts.push(s.diseaseName);
    if (s.startDate && s.endDate) parts.push(`${s.startDate}→${s.endDate}`);
    return parts.join(" • ");
  }, []);

  const applySavedSearch = useCallback((s: SavedSearch) => {
    const d = diseases.find(x => x.name_th === s.diseaseName || x.code === s.diseaseName);
    if (d) setDisease(d.code, d.name_th); else if (s.diseaseName) setDisease("", s.diseaseName);
    const pv = (s.provinceAlt || s.province || "").trim(); if (pv) setProvince(pv);
    setDateRange(s.startDate || "", s.endDate || "");
    router.push("/dashBoard");
  }, [diseases, router, setDateRange, setDisease, setProvince]);

  useEffect(() => { (async () => {
    try {
      const res = await fetch("/api/diseases", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load diseases");
      const data = (await res.json()) as { diseases: Disease[] } | Disease[];
      const rows = Array.isArray(data) ? data : data?.diseases || [];
      setDiseases(rows);
      const qs = searchParams.get("disease");
      if (!diseaseCode && !qs && rows.length) {
        const d01 = rows.find(d => d.code === "D01") ?? rows[0];
        setDisease(d01.code, d01.name_th);
      }
    } catch (e) { console.error(e); }
  })(); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    const qs = searchParams.get("disease");
    if (qs && diseases.length > 0) {
      const d = diseases.find(x => x.code === qs);
      if (d) setDisease(d.code, d.name_th);
    }
  }, [searchParams, diseases, setDisease]);

  useEffect(() => { (async () => {
    try {
      setSavedLoading(true); setSavedErr(null);
      const res = await fetch("/api/saved-searches", { cache: "no-store" });
      if (res.status === 401) { setCanSeeSaved(false); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as SavedSearch[];
      setSavedSearches(json);
    } catch (e) {
      console.error(e);
      setSavedErr("โหลดรายการค้นหาที่บันทึกไว้ไม่สำเร็จ");
    } finally { setSavedLoading(false); }
  })(); }, []);

  const goCreate = () => router.push("/search-template");

  return (
    <aside
      className="
        h-full min-h-0 w-full
        bg-pink-100
        flex flex-col
        px-4 pt-6 pb-0
        overflow-hidden
      "
    >
      {/* ภายในสกรอลล์ได้และกินความสูงที่เหลือทั้งหมด */}
      <div className="flex-1 min-h-0 overflow-auto pr-1 space-y-4 pb-4">
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

        {/* เลือกระยะเวลา */}
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

        {/* การค้นหาที่บันทึกไว้ */}
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
          ) : canSeeSaved && savedSearches.length > 0 ? (
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
                <option value="" disabled>— เลือกการค้นหาที่บันทึก —</option>
                {savedSearches.map((s) => (
                  <option key={s.id} value={s.id}>{labelOf(s)}</option>
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
      </div>
    </aside>
  );
}
