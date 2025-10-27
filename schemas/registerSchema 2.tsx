// E:\HealtRiskHub\schemas\registerSchema.ts
import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "กรุณากรอกชื่อ")
      .max(25, "ชื่อต้องไม่เกิน 25 ตัวอักษร")
      .regex(/^[ก-๙a-zA-Z\s]+$/u, "ชื่อห้ามมีตัวเลขหรืออักษรพิเศษ"),

    lastName: z
      .string()
      .trim()
      .min(1, "กรุณากรอกนามสกุล")
      .max(25, "นามสกุลต้องไม่เกิน 25 ตัวอักษร")
      .regex(/^[ก-๙a-zA-Z\s]+$/u, "นามสกุลห้ามมีตัวเลขหรืออักษรพิเศษ"),

    province: z.string().trim().min(1, "กรุณาเลือกจังหวัด"),

    dob: z.string().trim().min(1, "กรุณากรอกวันเดือนปีเกิด"),

    position: z
      .string()
      .trim()
      .min(1, "กรุณากรอกตำแหน่ง")
      .max(25, "ตำแหน่งต้องไม่เกิน 25 ตัวอักษร")
      .regex(/^[ก-๙a-zA-Z\s]+$/u, "ตำแหน่งห้ามมีตัวเลขหรืออักษรพิเศษ"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("กรุณากรอกอีเมลให้ถูกต้อง"),

    password: z
      .string()
      .min(6, "Password ต้องมีอย่างน้อย 6 ตัวอักษร")
      .regex(/[A-Z]/, "Password ต้องมีตัวอักษรพิมพ์ใหญ่")
      .regex(/[0-9]/, "Password ต้องมีตัวเลข"),

    confirmPassword: z.string().min(1, "กรุณากรอกยืนยัน Password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password และ ยืนยัน Password ต้องตรงกัน",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    // ตรวจ dob เป็น YYYY-MM-DD และไม่อนาคต
    const iso = data.dob;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dob"],
        message: "รูปแบบวันเกิดไม่ถูกต้อง (YYYY-MM-DD)",
      });
      return;
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dob"],
        message: "วันเกิดไม่ถูกต้อง",
      });
      return;
    }
    const today = new Date();
    const ymd = (x: Date) => x.toISOString().slice(0, 10);
    if (ymd(d) > ymd(today)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dob"],
        message: "วันเกิดต้องไม่อยู่ในอนาคต",
      });
    }
  });

export type RegisterForm = z.infer<typeof registerSchema>;
