"use client";

import { useDashboardStore } from "@/store/useDashboardStore";

// ฟังก์ชันฟอร์แมตวันที่ไทย (07 ตุลาคม 2568)
function formatThaiDate(dateStr?: string | null) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number); // รับรูปแบบ YYYY-MM-DD จาก <input type="date">
  const date = new Date(y, (m ?? 1) - 1, d ?? 1); // เลี่ยงปัญหา timezone shift
  const TH_MONTHS = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const day = String(date.getDate()).padStart(2, "0");
  const month = TH_MONTHS[date.getMonth()];
  const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
  return `${day} ${month} ${year}`;
}

const DashboardHeader = () => {
  const { province, start_date, end_date, diseaseNameTh } = useDashboardStore();

  const hasStart = Boolean(start_date);
  const hasEnd = Boolean(end_date);
  const rangeText =
    hasStart || hasEnd
      ? `${formatThaiDate(start_date) || "-"} ถึง ${formatThaiDate(end_date) || "-"}`
      : "";

  return (
    <div className="max-w-full gap-4 px-6 py-4 leading-tight">
      <h2 className="text-lg font-bold text-green-800 lg:text-2xl">
        รายงานสถานการณ์
      </h2>

      <h3 className="overflow-hidden text-lg font-bold text-ellipsis text-green-900">
        {diseaseNameTh || "โรคไข้หวัดใหญ่"}{" "}
        {province ? `ในจังหวัด ${province}` : "(ทั่วประเทศ)"}
      </h3>

      {(hasStart || hasEnd) && (
        <p className="text-md text-gray-700">
          ช่วงวันที่ <strong>{rangeText}</strong>
        </p>
      )}
    </div>
  );
};

export default DashboardHeader;
