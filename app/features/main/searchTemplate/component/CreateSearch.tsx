"use client";

import { HexColorPicker } from "react-colorful";
import { useState } from "react";

const SearchPage = () => {
  const [color, setColor] = useState("#E89623");

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-12">
      <h1 className="mb-10 text-3xl font-bold text-pink-500 md:text-4xl">
        สร้างการค้นหา
      </h1>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left side */}
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-gray-700">
            ชื่อการค้นหา
            <input
              type="text"
              placeholder="กรุณากรอกชื่อ"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            เลือกจังหวัด
            <input
              type="text"
              placeholder="กรุณาเลือกจังหวัด"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            ช่วงระยะเวลา
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                className="w-1/2 rounded-md border p-2"
              />
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                className="w-1/2 rounded-md border p-2"
              />
            </div>
          </label>

          <button className="mt-4 self-start rounded-md bg-pink-500 px-4 py-2 text-white hover:bg-pink-600">
            บันทึกการสร้าง
          </button>
        </div>

        {/* Right side */}
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-gray-700">
            ชื่อโรค
            <input
              type="text"
              placeholder="กรุณาเลือกชื่อโรค"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            เลือกจังหวัด
            <input
              type="text"
              placeholder="กรุณาเลือกจังหวัด"
              className="mt-1 w-full rounded-md border p-2"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            เลือกสี
            <div
              className="mt-1 h-10 w-full rounded border"
              style={{ backgroundColor: color }}
            />
          </label>

          <HexColorPicker color={color} onChange={setColor} />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
