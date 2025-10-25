// E:\HealtRiskHub\schemas\adminUserSchemas.ts
import { z } from "zod";

const THAI_ENG_ONLY = /^[ก-๙A-Za-z\s]+$/u;
const YMD = /^\d{4}-\d{2}-\d{2}$/;

const notFuture = (iso: string) => {
  if (!YMD.test(iso)) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  const ymd = (x: Date) => x.toISOString().slice(0, 10);
  return ymd(d) <= ymd(today);
};

// บทบาท (ไม่ใช้ options object เพื่อให้รองรับ zod เวอร์ชันที่ไม่มี required_error)
export const userRoleEnum = z.union([z.literal("User"), z.literal("Admin")]);

/** ฟิลด์โปรไฟล์ร่วม */
const baseProfile = {
  first_name: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อ")
    .max(25, "ชื่อต้องไม่เกิน 25 ตัวอักษร")
    .regex(THAI_ENG_ONLY, "ชื่อห้ามมีตัวเลขหรืออักษรพิเศษ"),
  last_name: z
    .string()
    .trim()
    .min(1, "กรุณากรอกนามสกุล")
    .max(25, "นามสกุลต้องไม่เกิน 25 ตัวอักษร")
    .regex(THAI_ENG_ONLY, "นามสกุลห้ามมีตัวเลขหรืออักษรพิเศษ"),
  // position อนุญาตให้เว้นว่างได้ แต่ถ้ากรอกต้องเป็นไทย/อังกฤษ และยาวไม่เกิน 25
  position: z
    .string()
    .trim()
    .max(25, "ตำแหน่งต้องไม่เกิน 25 ตัวอักษร")
    .refine((s) => s === "" || THAI_ENG_ONLY.test(s), {
      message: "ตำแหน่งห้ามมีตัวเลขหรืออักษรพิเศษ",
    }),
  // province อนุญาตให้ว่างได้ในหน้า admin (อยากบังคับเมื่อไรก็ค่อยเปลี่ยนเป็น .min(1))
  province: z.string().trim(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("กรุณากรอกอีเมลให้ถูกต้อง"),
  brith_date: z
    .string()
    .trim()
    .regex(YMD, "รูปแบบวันเกิดไม่ถูกต้อง (YYYY-MM-DD)")
    .refine(notFuture, { message: "วันเกิดต้องไม่อยู่ในอนาคต" }),
  role: userRoleEnum,
};

/** แก้ไขผู้ใช้ (admin edit) */
export const adminEditUserSchema = z.object({
  id: z.number(),
  ...baseProfile,
});

/** สร้างผู้ใช้ (admin create) */
export const adminCreateUserSchema = z
  .object({
    ...baseProfile,
    password: z
      .string()
      .min(6, "Password ต้องมีอย่างน้อย 6 ตัวอักษร")
      .regex(/[A-Z]/, "Password ต้องมีตัวอักษรพิมพ์ใหญ่")
      .regex(/[0-9]/, "Password ต้องมีตัวเลข"),
    confirmPassword: z.string().min(1, "กรุณากรอกยืนยัน Password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password และ ยืนยัน Password ต้องตรงกัน",
  });

export type AdminEditUser = z.infer<typeof adminEditUserSchema>;
export type AdminCreateUser = z.infer<typeof adminCreateUserSchema>;
