import { getPrisma } from "../database";
import { equipment } from "../mock-data";

export async function listMockEquipment() {
  return {
    data: equipment,
    total: equipment.length,
  };
}

export async function listPrismaEquipment(tenantId: string) {
  const data = await getPrisma().equipment.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      address: true,
      qrLabels: true,
      mapPoints: true,
    },
  });

  return {
    data,
    total: data.length,
  };
}
