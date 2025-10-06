"use client";
type Props = {
  data: {
    totalPatients: number;
    avgPatientsPerDay: number;
    cumulativePatients: number;
  };
};

const TotalPatient = ({ data }: Props) => {
  if (!data) {
    return <p>ไม่พบข้อมูลผู้ป่วยในช่วงเวลานี้</p>;
  }

  return (
    <div className="rounded-md bg-pink-100 p-4 shadow-md">
      <h4 className="text-lg font-bold">จำนวนผู้ป่วย</h4>
      <p className="text-xl font-bold text-red-600">
        {data?.totalPatients != null
          ? data.totalPatients.toLocaleString()
          : "-"}{" "}
        ราย
      </p>
      <p>
        เฉลี่ยวันละ{" "}
        {data?.avgPatientsPerDay != null
          ? data.avgPatientsPerDay.toLocaleString()
          : "-"}{" "}
        คน/วัน
      </p>
      <p className="mt-1 font-semibold">
        สะสม{" "}
        {data?.cumulativePatients != null
          ? data.cumulativePatients.toLocaleString()
          : "-"}{" "}
        ราย
      </p>
    </div>
  );
};

export default TotalPatient;
