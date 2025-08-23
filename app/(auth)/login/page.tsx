"use client";

import Image from "next/image";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore"; // Assuming you have an auth store to manage user state

export default function LoginPage() {
  const { setUser } = useAuthStore();
  setUser({ name: "Pimonpan Doungtip", email: "pimonpandt@gmail.com" });

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
            <Input placeholder="Email" type="email" />
            <Input placeholder="Password" type="password" />
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
