"use client";

import Image from "next/image";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore"; // Assuming you have an auth store to manage user state
import { useState } from "react";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

export default function LoginPage() {
  // const { setUser } = useAuthStore();
  // setUser({ name: "Pimonpan Doungtip", email: "pimonpandt@gmail.com" });

  const [error, setError] = useState<string>();

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await signIn("credentials", {
      redirect: false,
      email: formData.get("email"),
      password: formData.get("password"),
    });
    
    if (res?.error) {
      setError("Invalid username or password");
    } else {
      redirect("/");
    }
  };

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
          <form className="space-y-6" onSubmit={onLogin}>
            {/* <Input placeholder="Email" type="email" />
            <Input placeholder="Password" type="password" value={formData.email} onChange={(e) => setFormData({...formData, email:e.currentTarget.value})}/> */}

            <input
              className="border-input focus-visible:ring-primary-pink flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              type="email"
              placeholder="Email"
              name="email"
            />
            <input
              className="border-input focus-visible:ring-primary-pink flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              type="password"
              name="password"
              placeholder="Password"
            />
            {error && <div className="text-red-500">{error}</div>}
            <div className="text-center">
              <Button className="hover:bg-primary-pink w-full bg-pink-500 text-white">
                สมัครสมาชิก
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
