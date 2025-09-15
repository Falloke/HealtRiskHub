"use client";

import { HexColorPicker } from "react-colorful";
import { useState } from "react";

const SearchPage = () => {
  const [formData, setFormData] = useState({
    searchName: "",
    province: "",
    startDate: "",
    endDate: "",
    disease: "",
    diseaseProvince: "",
    color: "#E89623",
  });

  // handleChange สำหรับ input ทั่วไป
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // handleSubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("✅ Data ที่จะส่ง:", formData);

    // TODO: คุณสามารถ fetch ไป API ได้ที่นี่
    // await fetch("/api/search", { method: "POST", body: JSON.stringify(formData) });
    alert("สร้างการค้นหาสำเร็จ");
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-12">
      <h1 className="mb-10 text-3xl font-bold text-pink-500 md:text-4xl">
        สร้างการค้นหา
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2"
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
              className="mt-1 w-full rounded-md border p-2"
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
            className="mt-4 self-start rounded-md bg-pink-500 px-4 py-2 text-white hover:bg-pink-600"
          >
            บันทึกการสร้าง
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
            เลือกจังหวัด
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
            <div
              className="mt-1 h-10 w-full rounded border"
              style={{ backgroundColor: formData.color }}
            />
          </label>

          <HexColorPicker
            color={formData.color}
            onChange={(color) =>
              setFormData((prev) => ({ ...prev, color }))
            }
          />
        </div>
      </form>
    </div>
  );
};

export default SearchPage;
