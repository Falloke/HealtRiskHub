// E:\HealtRiskHub\app\admin\admindashboard\page.tsx
import AdminDashboardFeature from "@/app/features/admin/adminDashboardPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Admin Dashboard | HealtRiskHub",
};

export default function AdminDashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">แดชบอร์ดแอดมิน</h1>
      <AdminDashboardFeature />
    </main>
  );
}
