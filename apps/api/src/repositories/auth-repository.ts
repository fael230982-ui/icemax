import { getPrisma } from "../database";
import type { LoginInput } from "../schemas";

export async function findUserForLogin(input: LoginInput) {
  const prisma = getPrisma();

  return prisma.user.findFirst({
    where: {
      email: input.email,
      tenantId: input.tenantId,
      active: true,
    },
    include: {
      tenant: true,
    },
  });
}

export async function findUserById(tenantId: string, userId: string) {
  return getPrisma().user.findFirst({
    where: {
      id: userId,
      tenantId,
      active: true,
    },
    include: {
      tenant: true,
    },
  });
}
