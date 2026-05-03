import { getPrisma } from "../database";
import { serviceContracts } from "../mock-data";
import type { CreateContractInput } from "../schemas";

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

export async function createMockContract(tenantId: string, input: CreateContractInput) {
  return {
    id: `contract-${Date.now()}`,
    tenantId,
    active: true,
    ...input,
  };
}

export async function createPrismaContract(tenantId: string, input: CreateContractInput) {
  return getPrisma().serviceContract.create({
    data: {
      tenantId,
      customerId: input.customerId,
      addressId: input.addressId,
      name: input.name,
      recurrenceMonths: input.recurrenceMonths,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      includesPreventive: input.includesPreventive,
      includesCleaning: input.includesCleaning,
      notes: input.notes,
      equipment: {
        create: input.equipmentIds.map((equipmentId) => ({
          tenantId,
          equipmentId,
        })),
      },
    },
    include: {
      equipment: true,
    },
  });
}
