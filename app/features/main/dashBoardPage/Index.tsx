"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardHeader from "./component/DashBoardHeader";
import TotalDeath from "./component/TotalDeath";
import TotalPatient from "./component/TotalPatient";
import GraphByProvince from "./component/GraphByProvince";
import GraphByAge from "./component/GraphByAge";
import GraphByGender from "./component/GraphByGender";
import LineGraphByGender from "./component/LineGraphByGender";
import SourceInfo from "./component/SourceInfo";

export const dynamic = "force-dynamic";
export default DashboardPage;
type DataType = {
  totalPatients: number;
  avgPatientsPerDay: number;
  cumulativePatients: number;

  totalDeaths: number;
  avgDeathsPerDay: number;
  cumulativeDeaths: number;
};
function DashboardPage() {
  const [data, setData] = useState<DataType | null>(null);
  const searchParams = useSearchParams();
  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");
  const province = searchParams.get("province") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        if (start_date) params.set("start_date", start_date);
        if (end_date) params.set("end_date", end_date);
        if (province) params.set("province", province);

        const response = await fetch(`/api/dashBoard?${params.toString()}`);

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [start_date, end_date, province]);

  return (
    <div className="space-y-4 p-4">
      <DashboardHeader />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {data && (
          <>
            <TotalPatient data={data} />
            <TotalDeath data={data} />
          </>
        )}
      </div>
      <GraphByProvince />
      <GraphByAge />
      <GraphByGender />
      <LineGraphByGender />
      <SourceInfo />
    </div>
  );
}
