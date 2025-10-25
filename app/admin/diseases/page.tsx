import AdminDiseasesFeature from "@/app/features/admin/diseasesPage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = { title: "จัดการข้อมูลโรค | HealtRiskHub" };

export default function AdminDiseasesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">จัดการข้อมูลโรค</h1>
      <AdminDiseasesFeature />
    </main>
  );
}
