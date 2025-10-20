"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useProvincialInfoStore } from "@/store/useProvincialInfoStore";
import DashboardHeader from "app/components/header/DashBoardHeader";
import TotalDeath from "app/components/header/TotalDeath";
import TotalPatient from "app/components/header/TotalPatient";
import BarGraph from "app/features/main/dashBoardPage/component/BarGraph";
import NarrativeSection from "app/features/main/dashBoardPage/component/NarrativeSection";
import SourceInfo from "app/features/main/dashBoardPage/component/SourceInfo";
import DiseaseInfo from "@/app/features/main/provincePage/component/DiseaseInfo";

export const dynamic = "force-dynamic";
export default ProvincePage;
type DataType = {
  totalPatients: number;
  avgPatientsPerDay: number;
  cumulativePatients: number;
  totalDeaths: number;
  avgDeathsPerDay: number;
  cumulativeDeaths: number;
};
function ProvincePage() {
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
  const { diseaseCode: dCodeDash, diseaseNameTh: dNameDash } =
    useDashboardStore();
  const setDiseaseProv = useProvincialInfoStore((s) => s.setDisease);

  useEffect(() => {
    if (dCodeDash) setDiseaseProv(dCodeDash, dNameDash ?? null);
  }, [dCodeDash, dNameDash, setDiseaseProv]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex-col-2 flex">
        <DashboardHeader />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data && (
            <>
              <TotalPatient data={data} />
              <TotalDeath data={data} />
            </>
          )}
        </div>
      </div>
      <BarGraph />

      <DiseaseInfo />
      <NarrativeSection />
      <SourceInfo />
    </div>
  );
}
