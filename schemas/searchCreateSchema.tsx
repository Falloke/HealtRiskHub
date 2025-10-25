import { z } from "zod";

/** สร้างสกีมาด้วยลิสต์จังหวัดที่อนุญาต (โหลดจาก JSON มาใส่) */
export const makeSearchCreateSchema = (allowedProvinces: string[]) =>
  z.object({
    searchName: z.string().trim().min(1, "กรุณากรอกชื่อการค้นหา").max(60, "ชื่อต้องไม่เกิน 60 ตัวอักษร"),

    // province / diseaseProvince ไม่บังคับ: ว่างได้ แต่ถ้าไม่ว่างจะตรวจว่าอยู่ในลิสต์
    province: z.string().trim().optional().or(z.literal("")),
    diseaseProvince: z.string().trim().optional().or(z.literal("")),

    startDate: z.string().min(1, "กรุณาเลือกวันเริ่มต้น"),
    endDate: z.string().min(1, "กรุณาเลือกวันสิ้นสุด"),

    disease: z.enum(["ไข้หวัดใหญ่", "โควิด-19", "ฝีดาษลิง", "อื่น ๆ"]),
    diseaseOther: z.string().trim().optional().or(z.literal("")),

    color: z.string().regex(/^#([0-9A-Fa-f]{6})$/, "รหัสสีไม่ถูกต้อง (เช่น #A1B2C3)"),
  })
  .superRefine((data, ctx) => {
    // ตรวจรูปแบบวัน + ลำดับวัน
    const isYMD = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
    if (!isYMD(data.startDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["startDate"], message: "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)" });
    }
    if (!isYMD(data.endDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endDate"], message: "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)" });
    }
    const sd = new Date(data.startDate);
    const ed = new Date(data.endDate);
    if (!Number.isNaN(sd.getTime()) && !Number.isNaN(ed.getTime()) && sd > ed) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["endDate"], message: "วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น" });
    }

    // ถ้าเลือก "อื่น ๆ" ต้องกรอก diseaseOther
    if (data.disease === "อื่น ๆ" && !data.diseaseOther?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["diseaseOther"], message: "กรุณาระบุชื่อโรค" });
    }

    // จังหวัด (ถ้าไม่ว่าง) ต้องอยู่ใน allowedProvinces
    const inList = (v?: string) => !v || allowedProvinces.includes(v);
    if (!inList(data.province)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["province"], message: "จังหวัดไม่ถูกต้อง" });
    }
    if (!inList(data.diseaseProvince)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["diseaseProvince"], message: "จังหวัดไม่ถูกต้อง" });
    }
  });

export type SearchCreateForm = z.input<ReturnType<typeof makeSearchCreateSchema>>;
