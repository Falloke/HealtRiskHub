"use client";

import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { InputWithLabel } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import ConfirmDialog from "@/app/components/ui/dialog"; // ⬅️ ใช้การ์ดยืนยันที่สร้างไว้
import { provinces } from "@/lib/thai-provinces";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterForm } from "@/schemas/registerSchema";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // ---------- state สำหรับ dialog ----------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingData, setPendingData] = useState<RegisterForm | null>(null);
  const [loading, setLoading] = useState(false);

  // ใช้แสดงค่าปัจจุบันใน dialog
  const watchedProvince = useWatch({ control, name: "province" });
  const watchedDob = useWatch({ control, name: "dob" });

  // กดปุ่ม "ลงทะเบียน" ครั้งแรก => เปิดยืนยัน
  const onSubmitPreview = (data: RegisterForm) => {
    setPendingData(data);
    setConfirmOpen(true);
  };

  // ยิง API จริงหลังยืนยัน
  const doRegister = async () => {
    if (!pendingData) return;
    try {
      setLoading(true);
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingData),
      });

      if (response.status === 201) {
        const resData = await response.json();
        const login = await signIn("credentials", {
          redirect: false,
          email: resData.email,
          password: pendingData.password,
        });
        if (!login?.error) router.push("/");
        else console.error("Login failed:", login.error);
      } else {
        console.error("Register failed:", await response.json());
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pink-100">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-xl bg-white">
        {/* Left Side */}
        <div className="flex w-1/2 items-center justify-center bg-pink-100">
          <Image
            src="/images/register.png"
            alt="Register"
            width={400}
            height={400}
          />
        </div>

        {/* Right Side */}
        <div className="w-1/2 p-10">
          <h2 className="text-primary-pink mb-8 text-center text-3xl font-bold">
            สมัครสมาชิก
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmitPreview)}>
            <div className="grid grid-cols-2 gap-4">
              <InputWithLabel
                id="firstName"
                label="ชื่อ"
                placeholder="กรุณากรอกชื่อ"
                error={errors.firstName?.message}
                {...register("firstName")}
              />

              <InputWithLabel
                id="lastName"
                label="นามสกุล"
                placeholder="กรุณากรอกนามสกุล"
                error={errors.lastName?.message}
                {...register("lastName")}
              />

              {/* จังหวัด */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  จังหวัด
                </label>
                <Select
                  onValueChange={(value) =>
                    setValue("province", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="กรุณาเลือกจังหวัด" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.province && (
                  <p className="text-sm text-red-500">
                    {errors.province.message}
                  </p>
                )}
              </div>

              {/* วันเดือนปีเกิด */}
              <InputWithLabel
                id="dob"
                label="วันเดือนปีเกิด"
                type="date"
                error={errors.dob?.message}
                {...register("dob")}
              />

              <InputWithLabel
                id="position"
                label="ตำแหน่ง"
                placeholder="กรุณากรอกตำแหน่ง"
                containerClassName="col-span-2"
                error={errors.position?.message}
                {...register("position")}
              />
            </div>

            <InputWithLabel
              id="email"
              label="Email"
              placeholder="Email"
              type="email"
              error={errors.email?.message}
              {...register("email")}
            />

            <InputWithLabel
              id="password"
              label="Password"
              placeholder="Password"
              type="password"
              error={errors.password?.message}
              {...register("password")}
            />

            <InputWithLabel
              id="confirmPassword"
              label="ยืนยัน Password"
              placeholder="ยืนยัน Password"
              type="password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <div className="pt-4 text-center">
              <Button
                type="submit"
                className="bg-primary-pink w-full text-white hover:bg-pink-500"
              >
                ลงทะเบียน
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="ยืนยันการลงทะเบียน?"
        description="โปรดตรวจสอบข้อมูลของคุณก่อนกดยืนยัน"
        onConfirm={doRegister}
        disabled={loading}
      >
        {pendingData && (
          <div className="rounded-lg border p-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <p><span className="font-medium">ชื่อ:</span> {pendingData.firstName}</p>
              <p><span className="font-medium">นามสกุล:</span> {pendingData.lastName}</p>
              <p><span className="font-medium">จังหวัด:</span> {watchedProvince || pendingData.province}</p>
              <p><span className="font-medium">วันเกิด:</span> {watchedDob || pendingData.dob}</p>
              <p className="col-span-2"><span className="font-medium">ตำแหน่ง:</span> {pendingData.position}</p>
              <p className="col-span-2"><span className="font-medium">อีเมล:</span> {pendingData.email}</p>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
