import DashboardHeader from "./component/DashBordHeader";
import TotalDeath from "./component/TotalDeath";
import TotalPatient from "./component/TotalPatient";

// ต้อง import เพิ่มอีก 5 ตัว
import GraphByProvince from "./component/GraphByProvince";
import GraphByAge from "./component/GraphByAge";
import GraphByGender from "./component/GraphByGender";
import LineGraphByGender from "./component/LineGraphByGender";
import SourceInfo from "./component/SourceInfo";

const DashboardPage = () => {
  return (
    <div className="space-y-4 p-4">
      <DashboardHeader />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TotalPatient />
        <TotalDeath />
      </div>

      <GraphByProvince />
      <GraphByAge />
      <GraphByGender />
      <LineGraphByGender />
      <SourceInfo />
    </div>
  );
};

export default DashboardPage;
