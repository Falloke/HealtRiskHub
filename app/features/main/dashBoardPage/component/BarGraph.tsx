"use client";

import GraphPatientsByRegion from "@/app/components/bargraph/GraphPatientsByRegion";
import GraphDeathsByRegion from "@/app/components/bargraph/GraphDeathsByRegion";
import GraphPatientsByAge from "@/app/components/bargraph/GraphPatientsByAge";
import GraphDeathsByAge from "@/app/components/bargraph/GraphDeathsByAge";
import GraphByGenderPatients from "@/app/components/bargraph/GraphByGenderPatients";
import GraphByGenderDeaths from "@/app/components/bargraph/GraphByGenderDeaths";
import GraphByGenderTrend from "@/app/components/linegraph/GraphByGenderTrend";

const BarGraph = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <GraphPatientsByRegion />
      <GraphDeathsByRegion />
      <GraphPatientsByAge />
      <GraphDeathsByAge />
      <GraphByGenderPatients />
      <GraphByGenderDeaths />
      <GraphByGenderTrend />
    </div>
  );
};

export default BarGraph;
