import { z } from "zod";

export const profileUpdateSchema = z
  .object({
    firstName: z.string().min(1, "กรุณากรอกชื่อ"),
    lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
    province: z.string().min(1, "กรุณาเลือกจังหวัด"),
    dob: z.string().min(1, "กรุณาเลือกวันเกิด"),
    position: z.string().min(1, "กรุณากรอกตำแหน่ง"),
    password: z.string().min(6, "รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร").optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (v) => (v.password && v.password.length > 0 ? v.confirmPassword === v.password : true),
    { path: ["confirmPassword"], message: "ยืนยันรหัสผ่านไม่ตรงกัน" }
  );

export type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;
