// E:\HealtRiskHub\schemas\editProfileSchema.ts
import { z } from "zod";

// แยกส่วนตรวจรหัสผ่านใหม่ (ไม่บังคับกรอก แต่ถ้ากรอกต้องผ่านกฎ)
export const editPasswordSchema = z
  .object({
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const newPassword = data.newPassword?.trim();
    const confirmNewPassword = data.confirmNewPassword?.trim();

    // ไม่กรอกทั้งคู่ -> ข้าม
    if (!newPassword && !confirmNewPassword) return;

    // กรอกไม่ครบคู่
    if (!newPassword || !confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: !newPassword ? ["newPassword"] : ["confirmNewPassword"],
        message: "กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ให้ครบ",
      });
      return;
    }

    // กฎเดียวกับ register
    if (newPassword.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "Password ต้องมีอย่างน้อย 6 ตัวอักษร",
      });
    }
    if (!/[A-Z]/.test(newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "Password ต้องมีตัวอักษรพิมพ์ใหญ่",
      });
    }
    if (!/[0-9]/.test(newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "Password ต้องมีตัวเลข",
      });
    }
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmNewPassword"],
        message: "รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ต้องตรงกัน",
      });
    }
  });

export const editProfileSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "กรุณากรอกชื่อ")
      .max(25, "ชื่อต้องไม่เกิน 25 ตัวอักษร")
      .regex(/^[ก-๙a-zA-Z\s]+$/u, "ชื่อห้ามมีตัวเลขหรืออักษรพิเศษ")
      .transform((s) => s.trim()),

    lastName: z
      .string()
      .min(1, "กรุณากรอกนามสกุล")
      .max(25, "นามสกุลต้องไม่เกิน 25 ตัวอักษร")
      .regex(/^[ก-๙a-zA-Z\s]+$/u, "นามสกุลห้ามมีตัวเลขหรืออักษรพิเศษ")
      .transform((s) => s.trim()),

    province: z.string().min(1, "กรุณาเลือกจังหวัด").transform((s) => s.trim()),

    dob: z.string().min(1, "กรุณากรอกวันเดือนปีเกิด").transform((s) => s.trim()),

    position: z
      .string()
      .min(1, "กรุณากรอกตำแหน่ง")
      .max(25, "ตำแหน่งต้องไม่เกิน 25 ตัวอักษร")
      .regex(/^[ก-๙a-zA-Z\s]+$/u, "ตำแหน่งห้ามมีตัวเลขหรืออักษรพิเศษ")
      .transform((s) => s.trim()),

    email: z
      .string()
      .email("กรุณากรอกอีเมลให้ถูกต้อง")
      .transform((s) => s.trim().toLowerCase()),
  })
  .and(editPasswordSchema)
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

export type EditProfileForm = z.infer<typeof editProfileSchema>;
