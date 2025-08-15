// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** รวม className + แก้ชนกันของ Tailwind */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
