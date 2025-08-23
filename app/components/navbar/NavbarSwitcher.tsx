"use client";

import { usePathname } from "next/navigation";
import AuthNavBar from "@/app/components/navbar/AuthNavBar";
import NavBar from "@/app/components/navbar/NavBar";

export default function NavbarSwitcher() {
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  return isAuthPage ? <AuthNavBar /> : <NavBar />;
}
