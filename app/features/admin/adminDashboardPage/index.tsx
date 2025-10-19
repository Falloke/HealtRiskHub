// รวมวิดเจ็ตทั้งหมดของหน้าแอดมิน
// import WebInfo from "./component/WebInfo";
import MemberStats from "./component/MemberStats";
import TopSearchedProvinces from "./component/TopSearchedProvinces";

const AdminDashboardFeature = () => {
  return (
    <div className="space-y-8">
      {/* แถวสรุปตัวเลข */}
      <MemberStats />

      {/* ตาราง Top จังหวัดที่ถูกค้นหา */}
      <TopSearchedProvinces />

      {/* ตั้งค่าข้อมูลเว็บไซต์ */}
      {/* <section className="rounded-lg border bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold">ตั้งค่าข้อมูลเว็บไซต์</h2>
        <WebInfo />
      </section> */}
    </div>
  );
};

export default AdminDashboardFeature;
