"use client";

//import { usePathname } from "next/navigation";
import AuthNavBar from "@/app/components/navbar/AuthNavBar";
import NavBar from "@/app/components/navbar/NavBar";
import { useSession } from "next-auth/react"

export default function NavbarSwitcher() {
//  const pathname = usePathname();
const { data: session} = useSession()


const isAuthPage = session?.user?.role === "admin" || session?.user?.role === "User";

  return isAuthPage ? <AuthNavBar /> : <NavBar />;
}
