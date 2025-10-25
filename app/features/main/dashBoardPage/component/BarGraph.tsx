"use client";

import GraphPatientsByRegion from "@/app/components/bargraph/GraphPatientsByRegion";
import GraphDeathsByRegion from "@/app/components/bargraph/GraphDeathsByRegion";
import GraphByAgePatients from "@/app/components/bargraph/GraphByAgePatients";
import GraphByAgeDeaths from "@/app/components/bargraph/GraphByAgeDeaths";
import GraphByGenderPatients from "@/app/components/bargraph/GraphByGenderPatients";
import GraphByGenderDeaths from "@/app/components/bargraph/GraphByGenderDeaths";
import GraphProvincePatients from "@/app/components/bargraph/GraphProvinceByPatients";
import GraphProvinceDeaths from "@/app/components/bargraph/GraphProvinceByDeaths";
import GraphByGenderTrend from "@/app/components/linegraph/GraphByGenderTrend";


const BarGraph = () => {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <GraphProvincePatients />
        <GraphProvinceDeaths />
        <GraphPatientsByRegion />
        <GraphDeathsByRegion />
        <GraphByAgePatients />
        <GraphByAgeDeaths />
        <GraphByGenderPatients />
        <GraphByGenderDeaths />
      </div>
      <GraphByGenderTrend />
    </div>
  );
};

export default BarGraph;
