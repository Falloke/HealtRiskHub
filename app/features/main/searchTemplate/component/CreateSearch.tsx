// E:\HealtRiskHub\app\features\main\searchTemplate\component\CreateSearch.tsx
"use client";

import { HexColorPicker } from "react-colorful";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { makeSearchCreateSchema } from "@/schemas/searchCreateSchema";

type Errors = Partial<
  Record<
    | "searchName"
    | "province"
    | "startDate"
    | "endDate"
    | "disease"
    | "diseaseOther"
    | "diseaseProvince"
    | "color",
    string
  >
>;

type ProvinceItem = {
  ProvinceNo: number;
  ProvinceNameThai: string;
  Region_VaccineRollout_MOPH?: string | null;
};

type Disease = {
  code: string;       // D01
  name_th: string;    // ไข้หวัดใหญ่
  name_en: string;    // Influenza
};

// สีอัตโนมัติของโรค (อิงชื่อภาษาไทยที่ฐานข้อมูลมี)
const DISEASE_COLOR: Record<string, string> = {
  "ไข้หวัดใหญ่": "#E89623",
  "ไข้เลือดออก": "#EF4444",
  "โรคฝีดาษลิง": "#8B5CF6",
};

const SearchCreate = () => {
  const router = useRouter();

  // ---------- Provinces from JSON ----------
  const [provinces, setProvinces] = useState<string[]>([]);
  const [provLoading, setProvLoading] = useState(true);
  const [provErr, setProvErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setProvLoading(true);
        setProvErr(null);
        const res = await fetch("/data/Thailand-ProvinceName.json", { cache: "force-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ProvinceItem[] = await res.json();
        const names = data.map((p) => p.ProvinceNameThai).filter(Boolean);
        if (!names.length) throw new Error("empty province list");
        setProvinces(names);
      } catch (e) {
        console.error("โหลดจังหวัดล้มเหลว:", e);
        setProvErr("โหลดรายชื่อจังหวัดไม่สำเร็จ");
      } finally {
        setProvLoading(false);
      }
    })();
  }, []);
  // ----------------------------------------

  // ---------- Diseases from DB ----------
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [dzLoading, setDzLoading] = useState(true);
  const [dzErr, setDzErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setDzLoading(true);
        setDzErr(null);
        const res = await fetch("/api/diseases", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { diseases: Disease[] } | Disease[];
        // รองรับทั้งรูป `{ diseases: [...] }` และ `[...]`
        const rows = Array.isArray(json) ? json : json?.diseases || [];
        setDiseases(rows);

        // ตั้งค่า default ถ้ายังไม่มี (เลือกตัวแรก ถ้ามี D01 ก็จะเป็น D01)
        if (rows.length > 0) {
          const first = rows.find((d) => d.code === "D01") ?? rows[0];
          setFormData((p) => ({
            ...p,
            disease: first.name_th,
            color: DISEASE_COLOR[first.name_th] ?? p.color,
          }));
        }
      } catch (e) {
        console.error("โหลดโรคจากฐานข้อมูลล้มเหลว:", e);
        setDzErr("โหลดรายชื่อโรคไม่สำเร็จ");
      } finally {
        setDzLoading(false);
      }
    })();
  }, []);
  // ---------------------------------------

  const [formData, setFormData] = useState({
    searchName: "",
    province: "", // optional
    startDate: "",
    endDate: "",
    // จะถูกเซ็ตหลังโหลดรายการโรค
    disease: "", // เก็บเป็น "ชื่อไทย" เพื่อให้ schema เดิมผ่าน
    diseaseOther: "",
    diseaseProvince: "", // optional
    color: "#E89623",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const isOtherDisease = formData.disease === "อื่น ๆ";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    if (id === "disease") {
      const newDiseaseNameTh = value; // เก็บ "ชื่อไทย"
      if (newDiseaseNameTh === "อื่น ๆ") {
        setFormData((prev) => ({
          ...prev,
          disease: newDiseaseNameTh,
          color: "#E89623", // ค่าตั้งต้นสำหรับเลือกสีเอง
          diseaseOther: "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          disease: newDiseaseNameTh,
          diseaseOther: "",
          color: DISEASE_COLOR[newDiseaseNameTh] ?? prev.color,
        }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // แปลง ZodError -> state errors
  const zodToErrors = (err: z.ZodError<unknown>) => {
    const out: Errors = {};
    err.issues.forEach((issue) => {
      const path0 = issue.path?.[0];
      if (typeof path0 === "string") {
        out[path0 as keyof Errors] = issue.message;
      }
    });
    return out;
  };

  const validate = (): boolean => {
    setErrors({});
    const schema = makeSearchCreateSchema(provinces);
    const parsed = schema.safeParse(formData);
    if (!parsed.success) {
      setErrors(zodToErrors(parsed.error));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;

    setSubmitting(true);
    try {
      const diseaseName =
        isOtherDisease ? formData.diseaseOther.trim() : formData.disease;

      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchName: formData.searchName.trim(),
          disease: diseaseName, // ยังส่งเป็นชื่อไทย เพื่อให้ backend/schema เดิมรับได้
          province: formData.province.trim(), // optional
          diseaseProvince: formData.diseaseProvince.trim(), // optional
          startDate: formData.startDate,
          endDate: formData.endDate,
          color: formData.color,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "บันทึกไม่สำเร็จ");
      }

      const data = await res.json(); // { id, ... }
      router.push(`/search?id=${data.id}`);
    } catch (err) {
      console.error(err);
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-12">
      <h1 className="mb-10 text-3xl font-bold text-pink-500 md:text-4xl">
        สร้างการค้นหา
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2"
        noValidate
      >
        {/* Left side */}
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-gray-700">
            ชื่อการค้นหา
            <input
              id="searchName"
              type="text"
              value={formData.searchName}
              onChange={handleChange}
              placeholder="กรุณากรอกชื่อ"
              className={`mt-1 w-full rounded-md border p-2 ${
                errors.searchName ? "border-red-500" : ""
              }`}
              required
            />
            {errors.searchName && (
              <p className="mt-1 text-xs text-red-600">{errors.searchName}</p>
            )}
          </label>

          {/* เลือกจังหวัด (optional) */}
          <label className="text-sm font-medium text-gray-700">
            เลือกจังหวัด
            <select
              id="province"
              value={formData.province}
              onChange={handleChange}
              disabled={provLoading || !!provErr}
              className="mt-1 w-full rounded-md border p-2 disabled:bg-gray-100"
            >
              <option value="">
                {provLoading ? "กำลังโหลดจังหวัด..." : provErr ?? "กรุณาเลือกจังหวัด"}
              </option>
              {!provLoading &&
                !provErr &&
                provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
            </select>
            {errors.province && (
              <p className="mt-1 text-xs text-red-600">{errors.province}</p>
            )}
          </label>

          {/* ช่วงระยะเวลา */}
          <div className="text-sm font-medium text-gray-700">
            ช่วงระยะเวลา
            <div className="mt-1 grid grid-cols-2 gap-2">
              <label className="text-xs text-gray-600">
                วันเริ่มต้น
                <input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-md border p-2 ${
                    errors.startDate ? "border-red-500" : ""
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
                )}
              </label>

              <label className="text-xs text-gray-600">
                วันสิ้นสุด
                <input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`mt-1 w-full rounded-md border p-2 ${
                    errors.endDate ? "border-red-500" : ""
                  }`}
                  min={formData.startDate || undefined}
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
                )}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 self-start rounded-md bg-pink-500 px-4 py-2 text-white hover:bg-pink-600 disabled:opacity-60"
          >
            {submitting ? "กำลังบันทึก..." : "บันทึกการสร้าง"}
          </button>
        </div>

        {/* Right side */}
        <div className="flex flex-col gap-4">
          {/* เลือกโรค */}
          <label className="text-sm font-medium text-gray-700">
            เลือกโรค
            <select
              id="disease"
              value={formData.disease}
              onChange={handleChange}
              className={`mt-1 w-full rounded-md border p-2 ${
                errors.disease ? "border-red-500" : ""
              }`}
            >
              <option value="">
                {dzLoading ? "กำลังโหลดโรค..." : dzErr ?? "กรุณาเลือกโรค"}
              </option>

              {!dzLoading &&
                !dzErr &&
                diseases.map((d) => (
                  // value เก็บ "ชื่อไทย" เพื่อให้ schema เดิมทำงานได้
                  <option key={d.code} value={d.name_th}>
                    {`${d.code} — ${d.name_th} (${d.name_en})`}
                  </option>
                ))}

              <option value="อื่น ๆ">อื่น ๆ (กำหนดเอง)</option>
            </select>
            {errors.disease && (
              <p className="mt-1 text-xs text-red-600">{errors.disease}</p>
            )}
          </label>

          {/* อื่น ๆ → ต้องกรอกชื่อโรค */}
          {isOtherDisease && (
            <label className="text-sm font-medium text-gray-700">
              ชื่อโรค (กรณีเลือก “อื่น ๆ”)
              <input
                id="diseaseOther"
                type="text"
                value={formData.diseaseOther}
                onChange={handleChange}
                placeholder="กรุณาระบุชื่อโรค"
                className={`mt-1 w-full rounded-md border p-2 ${
                  errors.diseaseOther ? "border-red-500" : ""
                }`}
              />
              {errors.diseaseOther && (
                <p className="mt-1 text-xs text-red-600">{errors.diseaseOther}</p>
              )}
            </label>
          )}

          {/* จังหวัดของโรค (optional) */}
          <label className="text-sm font-medium text-gray-700">
            เลือกจังหวัดของโรค
            <select
              id="diseaseProvince"
              value={formData.diseaseProvince}
              onChange={handleChange}
              disabled={provLoading || !!provErr}
              className="mt-1 w-full rounded-md border p-2 disabled:bg-gray-100"
            >
              <option value="">
                {provLoading ? "กำลังโหลดจังหวัด..." : provErr ?? "กรุณาเลือกจังหวัด"}
              </option>
              {!provLoading &&
                !provErr &&
                provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
            </select>
            {errors.diseaseProvince && (
              <p className="mt-1 text-xs text-red-600">{errors.diseaseProvince}</p>
            )}
          </label>

          {/* สี */}
          <div className="text-sm font-medium text-gray-700">
            สีที่ใช้แสดงผล
            <div
              className="mt-1 h-10 w-full rounded border"
              style={{ backgroundColor: formData.color }}
              aria-label="preview-color"
              title={formData.color}
            />
            {isOtherDisease ? (
              <>
                <p className="mt-2 text-xs text-gray-500">
                  เลือกสีได้อิสระ (กรณีเลือก “อื่น ๆ”)
                </p>
                <HexColorPicker
                  color={formData.color}
                  onChange={(color) => setFormData((p) => ({ ...p, color }))}
                  className="mt-3"
                />
              </>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                ระบบกำหนดสีให้อัตโนมัติตามโรคที่เลือก
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchCreate;
