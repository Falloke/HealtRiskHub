// components/Sidebar.tsx
"use client";

import { useState } from "react";
import { CalendarIcon, Search } from "lucide-react";

const Sidebar = () => {
  const [disease, setDisease] = useState("");
  const [province, setProvince] = useState("กรุงเทพมหานคร");
  const [startDate, setStartDate] = useState("2024-09-10");
  const [endDate, setEndDate] = useState("2024-09-30");

  const handleSearch = () => {
    console.log({
      disease,
      province,
      startDate,
      endDate,
    });
  };

  return (
    <aside className="flex w-full max-w-xs flex-col gap-4 bg-pink-100 px-4 py-6">
      <div className="relative">
        <input
          type="text"
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
          placeholder="โรคไข้หวัดใหญ่"
          className="w-full rounded-full px-4 py-2 pl-10 text-sm outline-none"
        />
        <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-500" />
      </div>

      <div>
        <label className="mb-1 block text-sm">เลือกจังหวัด</label>
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="w-full rounded-full bg-white px-4 py-2 text-sm outline-none"
        >
          <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
          <option value="เชียงใหม่">เชียงใหม่</option>
          <option value="ขอนแก่น">ขอนแก่น</option>
          <option value="ชลบุรี">ชลบุรี</option>
          {/* เพิ่มจังหวัดอื่น ๆ ได้ */}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm">เลือกระยะเวลา</label>
        <div className="relative mb-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-full px-4 py-2 pl-10 text-sm outline-none"
          />
          <CalendarIcon className="absolute top-2.5 left-3 h-4 w-4 text-gray-500" />
        </div>
        <div className="relative">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-full px-4 py-2 pl-10 text-sm outline-none"
          />
          <CalendarIcon className="absolute top-2.5 left-3 h-4 w-4 text-gray-500" />
        </div>
      </div>

      <button
        onClick={handleSearch}
        className="rounded-full bg-pink-600 py-2 text-sm font-medium text-white hover:bg-pink-700"
      >
        ค้นหา
      </button>

      <button className="rounded-full border bg-white py-2 text-sm text-gray-700">
        การค้นหาที่ได้บันทึกไว้
      </button>
    </aside>
  );
};

export default Sidebar;
