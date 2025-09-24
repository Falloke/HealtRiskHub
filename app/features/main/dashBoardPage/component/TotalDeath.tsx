type Props = {
  data: {
    totalDeaths: number;
    avgDeathsPerDay: number;
    cumulativeDeaths: number;
  };
};

const TotalDeath = ({ data }: Props) => {
  if (!data) {
    return <p>ไม่พบข้อมูลผู้เสียชีวิตในช่วงเวลานี้</p>;
  }

  return (
    <div className="rounded bg-gray-100 p-4 shadow">
      <h2 className="text-xl font-semibold">จำนวนผู้เสียชีวิต</h2>
      <p className="text-3xl font-bold text-gray-800">
        {data?.totalDeaths != null ? data.totalDeaths.toLocaleString() : "-"}{" "}
        ราย
      </p>
      <p className="text-sm">
        เฉลี่ยวันละ{" "}
        {data?.avgDeathsPerDay != null
          ? data.avgDeathsPerDay.toLocaleString()
          : "-"}{" "}
        คน/วัน
      </p>
      <p className="text-sm">
        สะสม{" "}
        <span className="font-semibold">
          {data?.cumulativeDeaths != null
            ? data.cumulativeDeaths.toLocaleString()
            : "-"}
        </span>{" "}
        ราย
      </p>
    </div>
  );
};

export default TotalDeath;
