// E:\HealtRiskHub\app\features\main\searchTemplate\component\CreateSearch.tsx
"use client";

import { HexColorPicker } from "react-colorful";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SearchCreate = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    searchName: "",
    province: "",
    startDate: "",
    endDate: "",
    disease: "",
    diseaseProvince: "",
    color: "#E89623",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      // ✅ ยิง API บันทึกลง DB
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchName: formData.searchName,
          disease: formData.disease,
          province: formData.province,
          diseaseProvince: formData.diseaseProvince,
          startDate: formData.startDate,
          endDate: formData.endDate,
          color: formData.color,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "บันทึกไม่สำเร็จ");
      }

      const data = await res.json(); // { id, searchName, startDate, endDate }
      // ➜ ไปหน้า /search พร้อม id ที่เพิ่งสร้าง
      router.push(`/search?id=${data.id}`);
    } catch (err: unknown) {
      console.error(err);
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-12">
      <h1 className="mb-10 text-3xl font-bold text-pink-500 md:text-4xl">สร้างการค้นหา</h1>

      <form onSubmit={handleSubmit} className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
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
              className="mt-1 w-full rounded-md border p-2"
              required
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            เลือกจังหวัด
            <input
              id="province"
              type="text"
              value={formData.province}
              onChange={handleChange}
              placeholder="กรุณาเลือกจังหวัด"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            ช่วงระยะเวลา
            <div className="mt-1 flex gap-2">
              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                className="w-1/2 rounded-md border p-2"
              />
              <input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                className="w-1/2 rounded-md border p-2"
              />
            </div>
          </label>

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
          <label className="text-sm font-medium text-gray-700">
            ชื่อโรค
            <input
              id="disease"
              type="text"
              value={formData.disease}
              onChange={handleChange}
              placeholder="กรุณาเลือกชื่อโรค"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            เลือกจังหวัด (อีกที่หนึ่ง)
            <input
              id="diseaseProvince"
              type="text"
              value={formData.diseaseProvince}
              onChange={handleChange}
              placeholder="กรุณาเลือกจังหวัด"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            เลือกสี
            <div className="mt-1 h-10 w-full rounded border" style={{ backgroundColor: formData.color }} />
          </label>

          <HexColorPicker color={formData.color} onChange={(color) => setFormData((p) => ({ ...p, color }))} />
        </div>
      </form>
    </div>
  );
};

export default SearchCreate;
