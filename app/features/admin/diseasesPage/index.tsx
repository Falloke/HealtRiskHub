// app/features/admin/diseasesPage/index.tsx
"use client";

import { useSearchParams } from "next/navigation";
import DiseaseEditor from "./component/DiseaseEditor";

const AdminDiseasesFeature = () => {
  const sp = useSearchParams();
  const code = (sp.get("code") ?? "D01").trim(); // default ชั่วคราว

  return <DiseaseEditor code={code} />;
};

export default AdminDiseasesFeature;
