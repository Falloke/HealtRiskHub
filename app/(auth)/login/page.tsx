"use client";

import Image from "next/image";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore"; // Assuming you have an auth store to manage user state
import { useState } from "react";

export default function LoginPage() {
  const { setUser } = useAuthStore();
  setUser({ name: "Pimonpan Doungtip", email: "pimonpandt@gmail.com" });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pink-100">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-xl bg-white">
        <div className="flex w-1/2 items-center justify-center bg-pink-100">
          <Image src="/images/login.png" alt="Login" width={400} height={400} />
        </div>
        <div className="w-1/2 p-10">
          <h2 className="text-primary-pink mb-8 text-center text-3xl font-bold">
            เข้าสู่ระบบ
          </h2>
          <form className="space-y-6">
            {/* <Input placeholder="Email" type="email" />
            <Input placeholder="Password" type="password" value={formData.email} onChange={(e) => setFormData({...formData, email:e.currentTarget.value})}/> */}

            <input
              className="border-input focus-visible:ring-primary-pink flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.currentTarget.value })
              }
            />
            <input
              className="border-input focus-visible:ring-primary-pink flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              type="password"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, password: e.currentTarget.value })
              }
            />

            <div className="text-center">
              <Button className="bg-primary-pink w-full text-white hover:bg-pink-500">
                สมัครสมาชิก
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
