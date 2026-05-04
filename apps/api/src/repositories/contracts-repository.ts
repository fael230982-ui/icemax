import { getPrisma } from "../database";
import { serviceContracts } from "../mock-data";
import { previewContractVisits } from "@icemax/shared";
import type { ActivateContractFromAcceptanceInput, CreateContractInput, CreateOrderFromContractVisitInput, GenerateContractVisitsInput } from "../schemas";

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

type MaintenanceCalendarItem = {
  contractId: string;
  customer: string;
  plan: string;
  recurrenceMonths: number;
  expectedDate: string;
  status: "overdue" | "due_soon" | "planned";
  sequence: number;
  coveredEquipment: number;
  recommendedAction: string;
};

function classifyVisit(expectedDate: string, today: Date) {
  const visitDate = new Date(`${expectedDate}T00:00:00.000Z`);
  const diffDays = Math.ceil((visitDate.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) {
    return "overdue" as const;
  }

  if (diffDays <= 15) {
    return "due_soon" as const;
  }

  return "planned" as const;
}

function actionForStatus(status: MaintenanceCalendarItem["status"]) {
  if (status === "overdue") {
    return "Gerar OS preventiva com prioridade alta e reagendar com o cliente.";
  }

  if (status === "due_soon") {
    return "Confirmar janela de atendimento e reservar tecnico/pecas.";
  }

  return "Manter no planejamento do contrato.";
}

function summarizeCalendar(items: MaintenanceCalendarItem[]) {
  return {
    totalVisits: items.length,
    overdue: items.filter((item) => item.status === "overdue").length,
    dueSoon: items.filter((item) => item.status === "due_soon").length,
    planned: items.filter((item) => item.status === "planned").length,
    contractsCovered: new Set(items.map((item) => item.contractId)).size,
  };
}

function buildCapacityBoard(calendar: { generatedAt: string; summary: ReturnType<typeof summarizeCalendar>; data: MaintenanceCalendarItem[] }) {
  const weeks = new Map<string, MaintenanceCalendarItem[]>();

  calendar.data.forEach((visit) => {
    const date = new Date(`${visit.expectedDate}T00:00:00.000Z`);
    const weekStart = new Date(date);
    weekStart.setUTCDate(date.getUTCDate() - date.getUTCDay() + 1);
    const key = weekStart.toISOString().slice(0, 10);
    weeks.set(key, [...(weeks.get(key) ?? []), visit]);
  });

  const weeklyCapacity = 8;
  const weeklyEquipmentCapacity = 45;
  const weeksData = [...weeks.entries()].map(([weekStart, visits]) => {
    const coveredEquipment = visits.reduce((sum, visit) => sum + visit.coveredEquipment, 0);
    const loadPercent = Math.round(Math.max((visits.length / weeklyCapacity) * 100, (coveredEquipment / weeklyEquipmentCapacity) * 100));
    const status = loadPercent >= 100 ? "over_capacity" : loadPercent >= 75 ? "attention" : "healthy";

    return {
      weekStart,
      visits: visits.length,
      coveredEquipment,
      loadPercent,
      status,
      contracts: [...new Set(visits.map((visit) => visit.contractId))].length,
      recommendedAction: status === "over_capacity"
        ? "Rebalancear visitas, abrir janelas extras ou acionar tecnico terceirizado."
        : status === "attention"
          ? "Reservar capacidade e confirmar janelas com antecedencia."
          : "Capacidade saudavel para manter agenda preventiva.",
    };
  }).sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  return {
    generatedAt: calendar.generatedAt,
    summary: {
      ...calendar.summary,
      weeks: weeksData.length,
      healthyWeeks: weeksData.filter((week) => week.status === "healthy").length,
      attentionWeeks: weeksData.filter((week) => week.status === "attention").length,
      overCapacityWeeks: weeksData.filter((week) => week.status === "over_capacity").length,
      weeklyCapacity,
      weeklyEquipmentCapacity,
    },
    governance: {
      auditEvent: "contracts.capacity_board_viewed",
      capacityModel: "visits_and_equipment_per_week_mock",
      supportsOutsourcedTechnicians: true,
      requiresHumanReviewBeforeReschedule: true,
    },
    weeks: weeksData,
    criticalVisits: calendar.data
      .filter((visit) => visit.status === "overdue" || visit.status === "due_soon")
      .slice(0, 8),
  };
}

export async function getMockContractMaintenanceCalendar(params: { occurrences?: number; fromDate?: string }) {
  const today = new Date(`${(params.fromDate ?? new Date().toISOString()).slice(0, 10)}T00:00:00.000Z`);
  const occurrences = params.occurrences ?? 4;
  const data = serviceContracts.flatMap((contract) =>
    previewContractVisits({
      startDate: contract.nextVisit,
      recurrenceMonths: contract.recurrenceMonths as 3 | 4 | 6,
      occurrences,
    }).map((visit) => {
      const status = classifyVisit(visit.expectedDate, today);

      return {
        contractId: contract.id,
        customer: contract.customer,
        plan: contract.plan,
        recurrenceMonths: contract.recurrenceMonths,
        expectedDate: visit.expectedDate,
        status,
        sequence: visit.sequence,
        coveredEquipment: contract.coveredEquipment,
        recommendedAction: actionForStatus(status),
      };
    }),
  ).sort((a, b) => a.expectedDate.localeCompare(b.expectedDate));

  return {
    generatedAt: today.toISOString(),
    summary: summarizeCalendar(data),
    data,
  };
}

export async function getMockContractCapacityBoard(params: { occurrences?: number; fromDate?: string }) {
  return buildCapacityBoard(await getMockContractMaintenanceCalendar(params));
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

export async function getPrismaContractMaintenanceCalendar(tenantId: string, params: { occurrences?: number; fromDate?: string }) {
  const today = new Date(`${(params.fromDate ?? new Date().toISOString()).slice(0, 10)}T00:00:00.000Z`);
  const occurrences = params.occurrences ?? 4;
  const contracts = await getPrisma().serviceContract.findMany({
    where: { tenantId, active: true },
    include: {
      customer: true,
      equipment: true,
      visits: {
        where: {
          status: { in: ["planned", "scheduled", "overdue"] },
        },
        orderBy: { expectedDate: "asc" },
      },
    },
  });

  const data = contracts.flatMap((contract) => {
    const plannedVisits = contract.visits.length
      ? contract.visits.slice(0, occurrences).map((visit, index) => ({
          expectedDate: visit.expectedDate.toISOString().slice(0, 10),
          sequence: index + 1,
        }))
      : previewContractVisits({
          startDate: contract.startDate.toISOString().slice(0, 10),
          recurrenceMonths: contract.recurrenceMonths as 3 | 4 | 6,
          occurrences,
        });

    return plannedVisits.map((visit) => {
      const status = classifyVisit(visit.expectedDate, today);

      return {
        contractId: contract.id,
        customer: contract.customer.name,
        plan: contract.name,
        recurrenceMonths: contract.recurrenceMonths,
        expectedDate: visit.expectedDate,
        status,
        sequence: visit.sequence,
        coveredEquipment: contract.equipment.length,
        recommendedAction: actionForStatus(status),
      };
    });
  }).sort((a, b) => a.expectedDate.localeCompare(b.expectedDate));

  return {
    generatedAt: today.toISOString(),
    summary: summarizeCalendar(data),
    data,
  };
}

export async function getPrismaContractCapacityBoard(tenantId: string, params: { occurrences?: number; fromDate?: string }) {
  return buildCapacityBoard(await getPrismaContractMaintenanceCalendar(tenantId, params));
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

export async function activateMockContractFromAcceptance(tenantId: string, openedByUserId: string, input: ActivateContractFromAcceptanceInput) {
  const contractId = `contract-${Date.now()}`;
  const visits = previewContractVisits({
    startDate: input.startDate.slice(0, 10),
    recurrenceMonths: input.recurrenceMonths,
    occurrences: input.generateVisits,
  }).map((visit) => ({
    id: `visit-${contractId}-${visit.sequence}`,
    tenantId,
    contractId,
    expectedDate: visit.expectedDate,
    status: visit.sequence === 1 ? "scheduled" : "planned",
    sequence: visit.sequence,
  }));

  const firstOrder = {
    id: `order-${Date.now()}`,
    tenantId,
    openedByUserId,
    customerId: input.customerId,
    addressId: input.addressId,
    assignedTechnicianId: input.firstVisitTechnicianId,
    title: input.firstVisitTitle,
    description: input.firstVisitDescription ?? `Primeira preventiva do contrato ${input.name}.`,
    priority: "normal",
    status: "scheduled",
    scheduledStart: visits[0]?.expectedDate,
  };

  return {
    status: "activated_mock",
    contract: {
      id: contractId,
      tenantId,
      customerId: input.customerId,
      addressId: input.addressId,
      name: input.name,
      recurrenceMonths: input.recurrenceMonths,
      startDate: input.startDate,
      endDate: input.endDate,
      active: true,
      includesPreventive: input.includesPreventive,
      includesCleaning: input.includesCleaning,
      equipmentIds: input.equipmentIds,
      monthlyValue: input.monthlyValue,
      notes: input.notes,
    },
    acceptance: {
      acceptedByName: input.acceptedByName,
      acceptedByDocument: input.acceptedByDocument,
      acceptedAt: input.acceptedAt ?? new Date().toISOString(),
      sourceServiceOrderId: input.serviceOrderId,
    },
    visits,
    firstOrder,
    createdEntities: {
      contracts: 1,
      visits: visits.length,
      serviceOrders: 1,
      auditLogs: 1,
    },
  };
}

export async function activatePrismaContractFromAcceptance(tenantId: string, openedByUserId: string, input: ActivateContractFromAcceptanceInput) {
  const prisma = getPrisma();
  const visits = previewContractVisits({
    startDate: input.startDate.slice(0, 10),
    recurrenceMonths: input.recurrenceMonths,
    occurrences: input.generateVisits,
  });

  return prisma.$transaction(async (tx) => {
    const contract = await tx.serviceContract.create({
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
        notes: [
          input.notes,
          `Aceite: ${input.acceptedByName}${input.acceptedByDocument ? ` (${input.acceptedByDocument})` : ""}`,
          input.monthlyValue !== undefined ? `Valor mensal: R$ ${input.monthlyValue.toFixed(2)}` : null,
          `Origem OS: ${input.serviceOrderId}`,
        ].filter(Boolean).join("\n"),
        equipment: {
          create: input.equipmentIds.map((equipmentId) => ({
            tenantId,
            equipmentId,
          })),
        },
      },
    });

    const createdVisits = await Promise.all(
      visits.map((visit) =>
        tx.serviceContractVisit.create({
          data: {
            tenantId,
            contractId: contract.id,
            expectedDate: new Date(`${visit.expectedDate}T00:00:00.000Z`),
            status: visit.sequence === 1 ? "scheduled" : "planned",
          },
        }),
      ),
    );

    const firstVisit = createdVisits[0];
    const firstOrder = await tx.serviceOrder.create({
      data: {
        tenantId,
        customerId: input.customerId,
        addressId: input.addressId,
        equipmentId: input.equipmentIds[0],
        openedByUserId,
        assignedTechnicianId: input.firstVisitTechnicianId,
        title: input.firstVisitTitle,
        description: input.firstVisitDescription ?? `Primeira preventiva do contrato ${input.name}.`,
        priority: "normal",
        status: "scheduled",
        scheduledStart: firstVisit.expectedDate,
      },
    });

    await tx.serviceContractVisit.update({
      where: { id: firstVisit.id },
      data: {
        serviceOrderId: firstOrder.id,
      },
    });

    await tx.auditLog.create({
      data: {
        tenantId,
        actorUserId: openedByUserId,
        entityType: "service_contract",
        entityId: contract.id,
        action: "contract.activated_from_acceptance",
        metadata: {
          serviceOrderId: input.serviceOrderId,
          acceptedByName: input.acceptedByName,
          acceptedByDocument: input.acceptedByDocument,
          acceptedAt: input.acceptedAt ?? new Date().toISOString(),
          monthlyValue: input.monthlyValue,
          visitsCreated: createdVisits.length,
          firstServiceOrderId: firstOrder.id,
        },
      },
    });

    return {
      status: "activated",
      contract,
      visits: createdVisits,
      firstOrder,
      createdEntities: {
        contracts: 1,
        visits: createdVisits.length,
        serviceOrders: 1,
        auditLogs: 1,
      },
    };
  });
}
