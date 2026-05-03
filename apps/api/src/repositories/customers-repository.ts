import { getPrisma } from "../database";
import { customers } from "../mock-data";

export async function listMockCustomers() {
  return {
    data: customers,
    total: customers.length,
  };
}

export async function listPrismaCustomers(tenantId: string) {
  const data = await getPrisma().customer.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
    include: {
      addresses: true,
      equipment: true,
      contracts: true,
    },
  });

  return {
    data,
    total: data.length,
  };
}
