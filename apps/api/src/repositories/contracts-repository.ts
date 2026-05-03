import { getPrisma } from "../database";
import { serviceContracts } from "../mock-data";
import { previewContractVisits } from "@icemax/shared";
import type { CreateContractInput, CreateOrderFromContractVisitInput, GenerateContractVisitsInput } from "../schemas";

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

export async function generateMockContractVisits(tenantId: string, contractId: string, input: GenerateContractVisitsInput) {
  const contract = await getMockContract(contractId);
  const startDate = input.fromDate ?? (contract && "nextVisit" in contract ? contract.nextVisit : new Date().toISOString());

  return {
    data: previewContractVisits({
      startDate: startDate.slice(0, 10),
      recurrenceMonths: ((contract?.recurrenceMonths ?? 3) as 3 | 4 | 6),
      occurrences: input.occurrences,
    }).map((visit) => ({
      id: `visit-${contractId}-${visit.sequence}`,
      tenantId,
      contractId,
      expectedDate: visit.expectedDate,
      status: "planned",
    })),
  };
}

export async function generatePrismaContractVisits(tenantId: string, contractId: string, input: GenerateContractVisitsInput) {
  const prisma = getPrisma();
  const contract = await prisma.serviceContract.findFirstOrThrow({
    where: { tenantId, id: contractId },
  });
  const startDate = (input.fromDate ?? contract.startDate.toISOString()).slice(0, 10);
  const visits = previewContractVisits({
    startDate,
    recurrenceMonths: contract.recurrenceMonths as 3 | 4 | 6,
    occurrences: input.occurrences,
  });

  const data = await prisma.$transaction(
    visits.map((visit) =>
      prisma.serviceContractVisit.create({
        data: {
          tenantId,
          contractId,
          expectedDate: new Date(`${visit.expectedDate}T00:00:00.000Z`),
          status: "planned",
        },
      }),
    ),
  );

  return { data };
}

export async function createMockOrderFromContractVisit(tenantId: string, visitId: string, openedByUserId: string, input: CreateOrderFromContractVisitInput) {
  return {
    id: `order-${Date.now()}`,
    tenantId,
    visitId,
    openedByUserId,
    status: "open",
    title: input.title,
    description: input.description,
    assignedTechnicianId: input.assignedTechnicianId,
  };
}

export async function createPrismaOrderFromContractVisit(tenantId: string, visitId: string, openedByUserId: string, input: CreateOrderFromContractVisitInput) {
  const prisma = getPrisma();
  const visit = await prisma.serviceContractVisit.findFirstOrThrow({
    where: { tenantId, id: visitId },
    include: {
      contract: true,
    },
  });

  return prisma.$transaction(async (tx) => {
    const order = await tx.serviceOrder.create({
      data: {
        tenantId,
        customerId: visit.contract.customerId,
        addressId: visit.contract.addressId,
        openedByUserId,
        assignedTechnicianId: input.assignedTechnicianId,
        title: input.title,
        description: input.description,
        priority: "normal",
        status: "open",
        scheduledStart: visit.expectedDate,
      },
    });

    await tx.serviceContractVisit.update({
      where: { id: visitId },
      data: {
        serviceOrderId: order.id,
        status: "scheduled",
      },
    });

    return order;
  });
}
