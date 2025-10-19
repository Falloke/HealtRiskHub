// app/features/admin/diseasesPage/component/DiseaseEditor.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type DetailPayload = { description_th: string; description_en: string };
type SymItem = { id: number };

// ---- helpers ----
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

type Props = { code: string };

export default function DiseaseEditor({ code }: Props) {
  // details
  const [detail, setDetail] = useState<DetailPayload>({ description_th: "", description_en: "" });
  const [dLoading, setDLoading] = useState(false);
  const [dSaving, setDSaving] = useState(false);
  const [dErr, setDErr] = useState<string | null>(null);

  // symptoms
  const [symSelected, setSymSelected] = useState<number[]>([]);
  const [sLoading, setSLoading] = useState(false);
  const [sSaving, setSSaving] = useState(false);
  const [sErr, setSErr] = useState<string | null>(null);

  // create new disease (C)
  const [newCode, setNewCode] = useState("");
  const [newNameTH, setNewNameTH] = useState("");
  const [cSaving, setCSaving] = useState(false);
  const [cErr, setCErr] = useState<string | null>(null);
  const [cOk, setCOk] = useState<string | null>(null);

  const title = useMemo(() => `จัดการรหัสโรค: ${code}`, [code]);

  // helpers โหลดข้อมูล
  async function loadDetails(currentCode: string) {
    try {
      setDLoading(true);
      setDErr(null);
      const res = await fetch(`/api/admin/diseases/details?code=${encodeURIComponent(currentCode)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const dj = (await res.json()) as Partial<DetailPayload>;
      setDetail({
        description_th: dj.description_th ?? "",
        description_en: dj.description_en ?? "",
      });
    } catch (e: unknown) {
      setDErr("โหลดรายละเอียดไม่สำเร็จ");
      console.error("[DiseaseEditor] load details:", getErrorMessage(e));
    } finally {
      setDLoading(false);
    }
  }

  async function loadSymptoms(currentCode: string) {
    try {
      setSLoading(true);
      setSErr(null);
      const res = await fetch(`/api/admin/diseases/symptoms?code=${encodeURIComponent(currentCode)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const sj = (await res.json()) as { items: SymItem[] };
      setSymSelected((sj.items ?? []).map((x) => Number(x.id)));
    } catch (e: unknown) {
      setSErr("โหลดรายการอาการไม่สำเร็จ");
      console.error("[DiseaseEditor] load symptoms:", getErrorMessage(e));
    } finally {
      setSLoading(false);
    }
  }

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (cancel) return;
      await loadDetails(code);
      if (cancel) return;
      await loadSymptoms(code);
    })();
    return () => {
      cancel = true;
    };
  }, [code]);

  // UPDATE: details
  async function saveDetails() {
    try {
      setDSaving(true);
      setDErr(null);
      const res = await fetch(`/api/admin/diseases/details?code=${encodeURIComponent(code)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detail),
      });
      const txt = await res.text().catch(() => "");
      if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);
      alert("บันทึกรายละเอียดแล้ว");
    } catch (e: unknown) {
      setDErr("บันทึกรายละเอียดไม่สำเร็จ");
      console.error("[DiseaseEditor] save details:", getErrorMessage(e));
    } finally {
      setDSaving(false);
    }
  }

  // UPDATE: symptoms
  async function saveSymptoms() {
    try {
      setSSaving(true);
      setSErr(null);
      const res = await fetch(`/api/admin/diseases/symptoms?code=${encodeURIComponent(code)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: symSelected }),
      });
      const txt = await res.text().catch(() => "");
      if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);
      alert("บันทึกอาการแล้ว");
      // โหลดซ้ำเพื่อความชัวร์
      await loadSymptoms(code);
    } catch (e: unknown) {
      setSErr("บันทึกอาการไม่สำเร็จ");
      console.error("[DiseaseEditor] save symptoms:", getErrorMessage(e));
    } finally {
      setSSaving(false);
    }
  }

  // CREATE: new disease (stay on this page)
  async function createDisease() {
    setCOk(null);
    setCErr(null);
    try {
      setCSaving(true);
      if (!newCode.trim()) throw new Error("กรุณาระบุรหัสโรค");

      const res = await fetch(`/api/admin/diseases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode.trim(),
          name_th: newNameTH || "",
          details: { description_th: "", description_en: "" },
          symptomIds: [],
          preventions: [],
        }),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);

      setCOk(`สร้างรหัส ${newCode.trim()} สำเร็จ`);
      setNewCode("");
      setNewNameTH("");
      // ไม่เปลี่ยนหน้า / ไม่เปลี่ยนรหัสปัจจุบัน
    } catch (e: unknown) {
      setCErr(getErrorMessage(e) || "สร้างรายการไม่สำเร็จ");
      console.error("[DiseaseEditor] createDisease:", getErrorMessage(e));
    } finally {
      setCSaving(false);
    }
  }

  // DELETE: current disease
  async function deleteCurrent() {
    if (!confirm(`ยืนยันลบโรค ${code} พร้อมรายละเอียด/อาการ/การป้องกันทั้งหมด?`)) return;
    try {
      const res = await fetch(`/api/admin/diseases?code=${encodeURIComponent(code)}`, { method: "DELETE" });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);
      alert("ลบแล้ว");
      // อยู่หน้านี้ต่อไป เคลียร์ state ภายใน
      setDetail({ description_th: "", description_en: "" });
      setSymSelected([]);
    } catch (e: unknown) {
      alert("ลบไม่สำเร็จ");
      console.error("[DiseaseEditor] deleteCurrent:", getErrorMessage(e));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + Delete */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button
          type="button"
          onClick={deleteCurrent}
          className="rounded bg-red-600 px-3 py-2 text-white transition hover:bg-red-700"
        >
          ลบโรคนี้
        </button>
      </div>

      {/* CREATE box */}
      <section className="rounded border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">สร้างโรคใหม่ (Create)</h3>
        </div>

        {cErr && <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-600">{cErr}</div>}
        {cOk && <div className="mb-3 rounded-md bg-green-50 p-3 text-sm text-green-700">{cOk}</div>}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="w-full rounded border p-2"
            placeholder="รหัสโรค เช่น D02"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
          />
          <input
            className="w-full rounded border p-2"
            placeholder="ชื่อไทย (ถ้ามี)"
            value={newNameTH}
            onChange={(e) => setNewNameTH(e.target.value)}
          />
          <button
            type="button"
            onClick={createDisease}
            disabled={cSaving || !newCode.trim()}
            className="rounded bg-pink-600 px-4 py-2 text-white transition hover:bg-pink-700 disabled:opacity-60"
          >
            {cSaving ? "กำลังสร้าง…" : "สร้างโรคใหม่"}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          สร้างเสร็จแล้วจะอยู่หน้านี้ต่อ (ไม่เปลี่ยนหน้า) — ไปแก้รายละเอียด/อาการของรหัสที่สร้างใหม่ในภายหลังได้
        </p>
      </section>

      {/* DETAILS */}
      <section className="rounded border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">รายละเอียด</h3>
          {dLoading && <span className="text-xs text-gray-500">กำลังโหลด…</span>}
        </div>

        {dErr && <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-600">{dErr}</div>}

        <div className="space-y-3">
          <label className="block text-sm font-medium">รายละเอียด (ไทย)</label>
          <textarea
            className="w-full rounded border p-2"
            rows={4}
            placeholder="รายละเอียด (ไทย)"
            value={detail.description_th}
            onChange={(e) => setDetail((v) => ({ ...v, description_th: e.target.value }))}
          />

          <label className="block text-sm font-medium">รายละเอียด (อังกฤษ)</label>
          <textarea
            className="w-full rounded border p-2"
            rows={4}
            placeholder="รายละเอียด (อังกฤษ)"
            value={detail.description_en}
            onChange={(e) => setDetail((v) => ({ ...v, description_en: e.target.value }))}
          />

          <button
            type="button"
            onClick={saveDetails}
            disabled={dSaving}
            className="rounded bg-pink-600 px-4 py-2 text-white transition hover:bg-pink-700 disabled:opacity-60"
          >
            {dSaving ? "กำลังบันทึก…" : "บันทึกรายละเอียด"}
          </button>
        </div>
      </section>

      {/* SYMPTOMS */}
      <section className="rounded border bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">อาการ</h3>
          {sLoading && <span className="text-xs text-gray-500">กำลังโหลด…</span>}
        </div>

        {sErr && <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-600">{sErr}</div>}

        <div className="space-y-2">
          <label className="block text-sm text-gray-700">
            ป้อนรหัสอาการ (คั่นด้วยเครื่องหมายจุลภาค) เช่น <code>1,2,3,5</code>
          </label>
          <input
            className="w-full rounded border p-2"
            placeholder="เช่น 1,2,3,5"
            value={symSelected.join(",")}
            onChange={(e) => {
              const ids = e.target.value
                .split(",")
                .map((x) => Number(x.trim()))
                .filter((x) => Number.isInteger(x) && x > 0); // กันค่าผิด เช่น 0/NaN
              setSymSelected(ids);
            }}
          />
          <div className="text-xs text-gray-500">
            อาการปัจจุบัน: {symSelected.length > 0 ? symSelected.join(", ") : "—"}
          </div>

          <button
            type="button"
            onClick={saveSymptoms}
            disabled={sSaving}
            className="mt-2 rounded bg-pink-600 px-4 py-2 text-white transition hover:bg-pink-700 disabled:opacity-60"
          >
            {sSaving ? "กำลังบันทึก…" : "บันทึกอาการ"}
          </button>
        </div>
      </section>
    </div>
  );
}
