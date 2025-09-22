import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;
  console.log("session", session);
  // หน้าที่ไม่ควร redirect กลับ เช่น login/register หรือ root (หน้า /)
  const PUBLIC_PATHS = [
    "/",
    "/login",
    "/register",
    "/haslogin",
    "/favicon.ico",
    "/dashBoard",
    "/provincPage",
    "/comparePage",
    "/searchTemplate",
    "/historyPage",
    "/profilePage",
    "/provincialInfo",
  ];

  // ยกเว้น API และ static assets ไปแล้วใน matcher
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  if (!session || session?.user?.role !== "User") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|images|favicon.ico).*)"],
};

