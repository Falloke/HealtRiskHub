"use client";

import AuthNavBar from "@/app/components/navbar/AuthNavBar";
import NavBar from "@/app/components/navbar/NavBar";
import { useSession } from "next-auth/react";

export default function NavbarSwitcher() {
  const { data: session, status } = useSession();

  // ระหว่างโหลด session ให้โชว์ NavBar ปกติไปก่อน หรือจะใส่ skeleton ก็ได้
  if (status === "loading") return <NavBar />;

  const isLoggedIn = !!session?.user; // แค่มี session ก็ถือว่า auth แล้ว
  return isLoggedIn ? <AuthNavBar /> : <NavBar />;
}
