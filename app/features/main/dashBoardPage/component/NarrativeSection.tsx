// E:\HealtRiskHub\app\features\main\dashBoardPage\component\NarrativeSection.tsx
"use client";

import { useState } from "react";
import { composeAINarrativePayload } from "../composePayload.client";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
// import { Textarea } from "@/app/components/ui/textarea"; // ถ้าจะเปิดช่องโน้ตค่อยเอาออกจากคอมเมนต์

import { useSession } from "next-auth/react";

export default function NarrativeSection() {
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";

  // ⛔️ ยังไม่ล็อกอิน/ยังโหลดสถานะ: ไม่แสดงอะไรเลย
  if (!isAuthed) return null;

  const [extraNotes, setExtraNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState("");
  const { province, start_date, end_date } = useDashboardStore();

  async function handleGenerate() {
    try {
      setLoading(true);
      setArticle("");
      const payload = await composeAINarrativePayload(extraNotes);
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "AI failed");
      setArticle(data.content);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "เกิดข้อผิดพลาด";
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  function downloadTxt() {
    const blob = new Blob([article], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `narrative_${province}_${start_date}_${end_date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>AI Narrative — คำอธิบายแดชบอร์ดอัตโนมัติ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* เปิดใช้งานเมื่ออยากให้กรอกโน้ตเพิ่ม
        <div className="text-sm text-muted-foreground">
          เพิ่มข้อความ/มาตรการเฉพาะพื้นที่เพื่อให้ AI นำไปผสมกับตัวเลขจากกราฟ
        </div>
        <Textarea
          placeholder="เช่น เน้นล้างมือ สวมหน้ากากในพื้นที่ปิด ฉีดวัคซีนกลุ่มเสี่ยง..."
          value={extraNotes}
          onChange={(e) => setExtraNotes(e.target.value)}
        /> */}

        <div className="flex gap-2">
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "กำลังสร้างบทความ…" : "Generate Narrative"}
          </Button>
          <Button variant="secondary" onClick={downloadTxt} disabled={!article}>
            ดาวน์โหลด .txt
          </Button>
        </div>

        {article && (
          <div className="mt-4 whitespace-pre-wrap rounded-lg bg-muted p-4 leading-7">
            {article}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
