"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import DashboardHeader from "app/components/header/DashBoardHeader";
import TotalDeath from "app/components/header/TotalDeath";
import TotalPatient from "app/components/header/TotalPatient";
import BarGraph from "./component/BarGraph";
import NarrativeSection from "./component/NarrativeSection";
import SourceInfo from "app/features/main/dashBoardPage/component/SourceInfo";

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
    <main className="min-h-screen w-full bg-white">
      <div className="mx-auto w-full max-w-[1920px] space-y-6 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          <DashboardHeader />

          {data && (
            <>
              <div className="flex-col-2 flex gap-2">
                <TotalPatient data={data} />
                <TotalDeath data={data} />
              </div>
            </>
          )}
        </div>

        <BarGraph />

        <NarrativeSection />
        <SourceInfo />
      </div>
    </main>
  );
}
