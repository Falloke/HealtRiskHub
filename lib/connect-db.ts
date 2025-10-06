// E:\HealtRiskHub\lib\connect-db.ts
// ใช้ client ที่ generate ไว้ที่ generated/prisma/client (ตาม schema.prisma)
import { PrismaClient } from "@/generated/prisma/client";

// เก็บ instance ไว้บน global ป้องกัน new PrismaClient ซ้ำตอน HMR/Hot Reload
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"], // จะเงียบกว่า log: ["query"] (ปรับได้)
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
