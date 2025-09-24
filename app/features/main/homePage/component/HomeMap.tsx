"use client";
import dynamic from "next/dynamic";

const HomeMapInner = dynamic(() => import("./HomeMapInner"), { ssr: false });

export default function HomeMap() {
  console.log("🎯 Rerender HomeMap");
  return <HomeMapInner />;
}
