"use client";

import Image from "next/image";
import { Button } from "@/app/components/ui/button"; // ใช้ buttonVariants ที่คุณเตรียมไว้
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { provinces } from "@/lib/thai-provinces"; // สร้างไฟล์นี้ไว้เก็บรายชื่อจังหวัด
import { useState } from "react";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    province: "",
    dob: "",
    position: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  // function register แล้ว login เลย ส่งข้อมูล form ไป
  const Register = async () => {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        province: form.province,
        dob: form.dob,
        position: form.position,
        email: form.email,
        confirmPassword: form.confirmPassword,
      }),
    });

    if (response?.status == 201) {
      const data = await response.json();
      const login = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.confirmPassword,
      });

      console.log(login ,data);
      

      if (!login?.error) {
        redirect("/");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pink-100">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-xl bg-white">
        <div className="flex w-1/2 items-center justify-center bg-pink-100">
          <Image
            src="/images/register.png"
            alt="Register"
            width={400}
            height={400}
          />
        </div>
        <div className="w-1/2 p-10">
          <h2 className="text-primary-pink mb-8 text-center text-3xl font-bold">
            สมัครสมาชิก
          </h2>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              Register();
            }}
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="กรุณากรอกชื่อ"
                value={form.firstName}
                onChange={(event) =>
                  setForm({ ...form, firstName: event.currentTarget.value })
                }
              />
              <Input
                placeholder="กรุณากรอกนามสกุล"
                value={form.lastName}
                onChange={(event) =>
                  setForm({ ...form, lastName: event.currentTarget.value })
                }
              />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="กรุณาเลือกจังหวัด" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem
                      key={province}
                      value={province}
                      onClick={() => setForm({ ...form, province: province })}
                    >
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={form.dob}
                onChange={(event) =>
                  setForm({ ...form, dob: event.currentTarget.value })
                }
              />
              <Input
                placeholder="กรุณากรอกตำแหน่ง"
                className="col-span-2"
                value={form.position}
                onChange={(event) =>
                  setForm({ ...form, position: event.currentTarget.value })
                }
              />
            </div>
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.currentTarget.value })
              }
            />

            <Input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.currentTarget.value })
              }
            />
            <Input
              placeholder="ยืนยัน Password"
              type="confirmPassword"
              value={form.confirmPassword}
              onChange={(event) =>
                setForm({ ...form, confirmPassword: event.currentTarget.value })
              }
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
    </div>
  );
}
