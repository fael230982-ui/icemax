import { getPrisma } from "../database";
import { serviceOrders } from "../mock-data";

export async function listMockOrders() {
  return {
    data: serviceOrders,
    total: serviceOrders.length,
  };
}

export async function getMockOrder(id: string) {
  return serviceOrders.find((item) => item.id === id) ?? null;
}

export async function listPrismaOrders(tenantId: string) {
  const prisma = getPrisma();
  const data = await prisma.serviceOrder.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      customer: true,
      equipment: true,
      assignedTechnician: true,
    },
  });

  return {
    data,
    total: data.length,
  };
}

export async function getPrismaOrder(tenantId: string, id: string) {
  return getPrisma().serviceOrder.findFirst({
    where: { tenantId, id },
    include: {
      customer: true,
      equipment: true,
      address: true,
      assignedTechnician: true,
      photos: true,
      notes: true,
      partsUsed: true,
      quotes: true,
    },
  });
}
