import { PrismaClient } from "@icemax/database";

let prisma: PrismaClient | null = null;

export function getPrisma() {
  prisma ??= new PrismaClient();
  return prisma;
}

export async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}
