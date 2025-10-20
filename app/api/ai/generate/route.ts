// app/api/ai/generate/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs"; // กันปัญหา env บน edge

type AINarrativePayload = {
  timeRange: { start: string; end: string };
  province: string;
  disease?: string;
  overview: {
    totalPatients: number;
    avgPatientsPerDay: number;
    cumulativePatients: number;
    totalDeaths: number;
    avgDeathsPerDay: number;
    cumulativeDeaths: number;
  };
  byAge: {
    patients: Array<{ ageRange: string; patients: number }>;
    deaths: Array<{ ageRange: string; deaths: number }>;
  };
  byGender: {
    patients: { male: number; female: number; unknown: number };
    deaths: Array<{ gender: "ชาย" | "หญิง"; value: number }>;
  };
  monthlyGenderTrend: Array<{ month: string; male: number; female: number }>;
  extraNotes?: string;
  precomputed?: { monthlyTotals?: Array<{ month: string; total: number }> };
};

const MODEL_ID = "gemini-2.5-flash";
const generationConfig = {
  temperature: 0.2,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 3500,
};

const SYS_PROMPT = `
คุณเป็นนักระบาดวิทยา สร้าง "บทความ Markdown ภาษาไทย" จาก JSON เท่านั้น (ห้ามเดาตัวเลข/เปอร์เซ็นต์)
ต้องมีหัวข้อเหล่านี้เรียงตามลำดับ และต้องจบครบทุกหัวข้อทุกครั้ง:

## รายงานสถานการณ์
## แนวโน้มรายเดือน
## การกระจายตามกลุ่มอายุ
## เปรียบเทียบเพศ
## ข้อเสนอแนะเชิงปฏิบัติ
## สรุปย่อ

กฎการนำเสนอ (เคร่งครัด):
- แสดงตัวเลขด้วยตัวคั่นหลักพัน เช่น 6,541
- ถ้าไม่มีข้อมูล ให้เขียนว่า "ไม่มีข้อมูลเพียงพอ"
- ห้ามสมมุติ/ประมาณ/ปัดเศษนอกเหนือจากที่ให้ไว้
- เดือนต้องเรียงเวลาแบบ YYYY-MM
- ห้ามตัดประโยคค้าง ต้องจบครบถึงหัวข้อ "## สรุปย่อ"
`.trim();

function makeUserPrompt(p: AINarrativePayload) {
  const header = `โรค: ${p.disease ?? "ไม่ระบุ"} | จังหวัด: ${p.province} | ช่วงเวลา: ${p.timeRange.start} ถึง ${p.timeRange.end}`;
  const json = JSON.stringify(p, null, 2);
  return `${header}

ข้อมูลแดชบอร์ด (JSON):
${json}

คำสั่ง:
- ยึดหัวข้อและกฎใน System Prompt อย่างเคร่งครัด
- ใช้ค่า precomputed.monthlyTotals (ถ้ามี) เพื่อตอบเดือนสูงสุด/ต่ำสุดโดยตรง
- ห้ามหยุดก่อนจบหัวข้อ "## สรุปย่อ"
`;
}

// ตรวจว่าบทความจบครบทุกหัวข้อหรือยัง
function looksIncomplete(markdown: string) {
  const mustHave = [
    "## รายงานสถานการณ์",
    "## แนวโน้มรายเดือน",
    "## การกระจายตามกลุ่มอายุ",
    "## เปรียบเทียบเพศ",
    "## ข้อเสนอแนะเชิงปฏิบัติ",
    "## สรุปย่อ",
  ];
  return !mustHave.every((h) => markdown.includes(h));
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as AINarrativePayload;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: MODEL_ID });
    const basePrompt = `System:\n${SYS_PROMPT}\n\nUser:\n${makeUserPrompt(payload)}`;

    // เรียกครั้งที่ 1
    const r1 = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: basePrompt }] }],
      generationConfig,
    });
    let text = r1.response.text() ?? "";

    // ถ้าเนื้อหาไม่ครบหัวข้อ ลองรีไตรรอบเดียว
    if (looksIncomplete(text)) {
      const continuePrompt =
        basePrompt +
        `\n\nข้อควรระวัง: เนื้อหายังไม่ครบทุกหัวข้อ ให้เขียน "ต่อให้จบทุกหัวข้อ" โดยยึดรูปแบบเดิมทั้งหมด`;
      const r2 = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: continuePrompt }] }],
        generationConfig,
      });
      const t2 = r2.response.text() ?? "";
      // เลือกข้อความที่ครบกว่า
      if (!looksIncomplete(t2) || t2.length > text.length) text = t2;
    }

    return NextResponse.json({ ok: true, content: text });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
