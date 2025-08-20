"use client";

import { Trash2, Search } from "lucide-react";

const mockHistory = [
  {
    date: "07/25/2025",
    color: "bg-orange-500",
    name: "บ้านพ่อ",
    disease: "โรคไข้หวัดใหญ่",
    province: "เชียงใหม่",
    range: "07/25/2025 - 08/01/2025",
  },
  {
    date: "07/14/2025",
    color: "bg-green-500",
    name: "บ้านยายและบ้านแม่",
    disease: "โรคโควิด",
    province: "เชียงใหม่ - กรุงเทพ",
    range: "07/14/2025 - 07/24/2025",
  },
  {
    date: "07/07/2025",
    color: "bg-sky-500",
    name: "มหาลัยและบ้านญาติ",
    disease: "โรคไข้หวัดใหญ่",
    province: "เชียงใหม่ - เชียงราย",
    range: "07/07/2025 - 07/13/2025",
  },
  {
    date: "07/01/2025",
    color: "bg-pink-500",
    name: "บ้านโยโย่และตลาด",
    disease: "โรคโควิด",
    province: "เชียงใหม่ - พัทยา",
    range: "07/01/2025 - 07/06/2025",
  },
  {
    date: "06/23/2025",
    color: "bg-blue-600",
    name: "บ้านรายทอง",
    disease: "โรคโควิด",
    province: "กรุงเทพ",
    range: "06/23/2025 - 06/30/2025",
  },
  {
    date: "06/16/2025",
    color: "bg-red-600",
    name: "บ้านโยโย่และบ้านหนุ่มโยโย่",
    disease: "โรคไข้หวัดใหญ่",
    province: "เชียงใหม่ - ชลบุรี",
    range: "06/16/2025 - 06/22/2025",
  },
];

const TableHistory = () => {
  return (
    <div className="p-6">
      <h2 className="mb-4 text-3xl font-bold text-pink-600">ประวัติการค้นหา</h2>
      <div className="overflow-x-auto rounded-md bg-white shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-pink-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                ค้นหา
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                วันที่ค้นหา
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                ชื่อการค้นหา
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                โรค
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                จังหวัด
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                ระยะเวลา
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                ลบ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {mockHistory.map((item, index) => (
              <tr key={index} className="transition hover:bg-pink-50">
                <td className="px-4 py-3">
                  <Search className="h-5 w-5" />
                </td>
                <td className="px-4 py-3 text-sm">{item.date}</td>
                <td className="flex items-center gap-2 px-4 py-3 text-sm">
                  <span className={`h-3 w-3 rounded-full ${item.color}`}></span>
                  {item.name}
                </td>
                <td className="px-4 py-3 text-sm">{item.disease}</td>
                <td className="px-4 py-3 text-sm">{item.province}</td>
                <td className="cursor-pointer px-4 py-3 text-sm text-blue-600 underline">
                  {item.range}
                </td>
                <td className="px-4 py-3 text-center">
                  <Trash2 className="h-5 w-5 cursor-pointer text-gray-500 hover:text-red-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableHistory;
