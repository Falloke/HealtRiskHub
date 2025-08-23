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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pink-100">
      <div className="flex w-full max-w-6xl overflow-hidden rounded-xl bg-white">
        <div className="flex w-1/2 items-center justify-center bg-pink-100">
          <Image
            src="/images/register.png"
            alt="Register"
            width={400}
            height{400}
          />
        </div>
        <div className="w-1/2 p-10">
          <h2 className="text-primary-pink mb-8 text-center text-3xl font-bold">
            สมัครสมาชิก
          </h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="กรุณากรอกชื่อ" />
              <Input placeholder="กรุณากรอกนามสกุล" />
              <Select>
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
              <Input type="date" />
              <Input placeholder="กรุณากรอกตำแหน่ง" className="col-span-2" />
            </div>
            <Input placeholder="Email" type="email" />
            <Input placeholder="Password" type="password" />
            <Input placeholder="ยืนยัน Password" type="password" />
            <div className="pt-4 text-center">
              <Button className="bg-primary-pink w-full text-white hover:bg-pink-500">
                ลงทะเบียน
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
