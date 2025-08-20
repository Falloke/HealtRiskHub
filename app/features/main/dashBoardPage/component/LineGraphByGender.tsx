const LineGraphByGender = () => {
  return (
    <div className="rounded-md bg-white p-4 shadow-md">
      <h4 className="mb-2 font-bold">แนวโน้มผู้ป่วยตามเพศ</h4>
      <p>[กราฟเส้นแสดงแนวโน้มชายหญิง รายเดือน]</p>
      <button className="mt-2 rounded-md bg-pink-500 px-4 py-1 text-white shadow">
        คลิกเพื่อสร้างคำอธิบาย
      </button>
    </div>
  );
};

export default LineGraphByGender;
