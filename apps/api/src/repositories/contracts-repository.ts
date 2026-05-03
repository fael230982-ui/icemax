import { getPrisma } from "../database";
import { serviceContracts } from "../mock-data";

export async function listMockContracts() {
  return {
    data: serviceContracts,
    total: serviceContracts.length,
  };
}

export async function listMockDueContracts() {
  return {
    data: serviceContracts.filter((contract) => contract.status === "upcoming" || contract.status === "generate_order"),
  };
}

export async function getMockContract(id: string) {
  return serviceContracts.find((item) => item.id === id) ?? null;
}

export async function listPrismaContracts(tenantId: string) {
  const data = await getPrisma().serviceContract.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      address: true,
      equipment: {
        include: {
          equipment: true,
        },
      },
      visits: true,
    },
  });

  return {
    data,
    total: data.length,
  };
}

export async function listPrismaDueContracts(tenantId: string) {
  const data = await getPrisma().serviceContractVisit.findMany({
    where: {
      tenantId,
      status: { in: ["planned", "scheduled", "overdue"] },
    },
    orderBy: { expectedDate: "asc" },
    include: {
      contract: {
        include: {
          customer: true,
        },
      },
    },
  });

  return { data };
}

export async function getPrismaContract(tenantId: string, id: string) {
  return getPrisma().serviceContract.findFirst({
    where: { tenantId, id },
  });
}
