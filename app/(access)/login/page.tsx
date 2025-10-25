// app/(access)/login/page.tsx
"use client";

import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    const res = await signIn("credentials", {
      redirect: false,          // เราจะนำทางเอง
      email,
      password,
      callbackUrl: "/",         // เผื่อใช้ res.url
    });

    setLoading(false);

    if (!res || res.error) {
      setError("Invalid username or password");
      return;
    }

    // สำเร็จ → นำทางไปหน้าหลัก
    router.replace(res.url ?? "/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pink-100">
      <div className="flex w-full max-w-5xl overflow-hidden rounded-xl bg-white">
        <div className="flex w-1/2 items-center justify-center bg-pink-100">
          <Image src="/images/login.png" alt="Login" width={400} height={400} />
        </div>

        <div className="w-1/2 p-10">
          <h2 className="mb-8 text-center text-3xl font-bold text-pink-700">
            เข้าสู่ระบบ
          </h2>

          <form className="space-y-6" onSubmit={onLogin}>
            <input
              className="border-input focus-visible:ring-primary-pink flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              type="email"
              placeholder="Email"
              name="email"
              required
              autoComplete="email"
            />
            <input
              className="border-input focus-visible:ring-primary-pink flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              type="password"
              name="password"
              placeholder="Password"
              required
              autoComplete="current-password"
            />

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="text-center">
              <Button
                className="w-full bg-pink-500 text-white hover:bg-pink-600"
                disabled={loading}
              >
                {loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
