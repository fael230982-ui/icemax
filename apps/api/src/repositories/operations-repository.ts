import { getPrisma } from "../database";
import { checklistTemplates, quotes, stock } from "../mock-data";
import type {
  CreatePartInput,
  CreateStockLocationInput,
  CreateStockMovementInput,
  PublicQuoteDecisionInput,
  UpdateQuoteDecisionInput,
} from "../schemas";

export async function listMockQuotes() {
  return {
    data: quotes,
    total: quotes.length,
  };
}

export async function listPrismaQuotes(tenantId: string) {
  const data = await getPrisma().quote.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      order: {
        include: {
          customer: true,
        },
      },
    },
  });

  return {
    data,
    total: data.length,
  };
}

export async function updateMockQuoteDecision(tenantId: string, quoteId: string, input: UpdateQuoteDecisionInput) {
  return {
    id: quoteId,
    tenantId,
    status: input.decision,
    customerName: input.customerName,
    reason: input.reason,
  };
}

function quoteIdFromPublicToken(token: string) {
  if (!token.startsWith("quote_")) {
    return null;
  }

  const withoutPrefix = token.slice("quote_".length);
  const lastSeparator = withoutPrefix.lastIndexOf("_");

  if (lastSeparator <= 0) {
    return null;
  }

  return withoutPrefix.slice(0, lastSeparator);
}

function buildQuoteApprovalPackage(tenantId: string, quote: {
  id: string;
  number?: string;
  serviceOrderId?: string;
  customer?: string;
  status?: string;
  total?: number;
  validUntil?: string | Date | null;
  items?: Array<{ description?: string; quantity?: number; unitPrice?: number; kind?: string }>;
}, tokenOverride?: string) {
  const issuedAt = new Date();
  const expiresAt = quote.validUntil ? new Date(quote.validUntil) : new Date(issuedAt);

  if (!quote.validUntil) {
    expiresAt.setDate(expiresAt.getDate() + 7);
  }

  const token = tokenOverride ?? `quote_${quote.id}_${issuedAt.getTime()}`;
  const publicUrl = `https://app.icemax.local/orcamentos/${token}`;
  const total = Number(quote.total ?? 0);

  return {
    quoteId: quote.id,
    quoteNumber: quote.number ?? quote.id,
    serviceOrderId: quote.serviceOrderId,
    tenantId,
    status: "approval_package_ready",
    customer: quote.customer ?? "Cliente",
    currentQuoteStatus: quote.status ?? "draft",
    total,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    token,
    publicUrl,
    financialSummary: {
      total,
      formattedTotal: `R$ ${total.toFixed(2)}`,
      items: quote.items?.map((item, index) => ({
        sequence: index + 1,
        kind: item.kind ?? "service",
        description: item.description ?? "Item do orcamento",
        quantity: item.quantity ?? 1,
        unitPrice: item.unitPrice ?? 0,
        subtotal: (item.quantity ?? 1) * (item.unitPrice ?? 0),
      })) ?? [],
    },
    approvalOptions: [
      { decision: "approved", label: "Aprovar orcamento", nextStatus: "waiting_execution" },
      { decision: "rejected", label: "Recusar orcamento", nextStatus: "commercial_review" },
    ],
    customerMessages: {
      whatsappBody: `Ola! Seu orcamento ${quote.number ?? quote.id} esta pronto para aprovacao: ${publicUrl}`,
      emailSubject: `Aprovacao do orcamento ${quote.number ?? quote.id}`,
      emailBody: `Ola, acesse ${publicUrl} para revisar e aprovar o orcamento no valor de R$ ${total.toFixed(2)}.`,
    },
    governance: {
      requiresCustomerIdentification: true,
      recordsIpAndUserAgent: true,
      hidesInternalMargin: true,
      auditEvent: "quote.approval_package_created",
      decisionEndpoint: `/quotes/${quote.id}/decision`,
      publicDecisionEndpoint: `/public/quotes/${token}/decision`,
    },
    nextActions: [
      "Enviar link pela fila de comunicacao.",
      "Registrar abertura e decisao do cliente.",
      "Se aprovado, liberar execucao e reserva de pecas.",
      "Se recusado, solicitar motivo e revisar proposta comercial.",
    ],
  };
}

export async function createMockQuoteApprovalPackage(tenantId: string, quoteId: string) {
  const quote = quotes.find((item) => item.id === quoteId);

  if (!quote) {
    return null;
  }

  return buildQuoteApprovalPackage(tenantId, quote);
}

export async function createMockPublicQuoteApprovalPackage(tenantId: string, token: string) {
  const quoteId = quoteIdFromPublicToken(token);

  if (!quoteId) {
    return null;
  }

  const quote = quotes.find((item) => item.id === quoteId);

  if (!quote) {
    return null;
  }

  return buildQuoteApprovalPackage(tenantId, quote, token);
}

export async function createPrismaQuoteApprovalPackage(tenantId: string, quoteId: string) {
  const quote = await getPrisma().quote.findFirst({
    where: {
      id: quoteId,
      tenantId,
    },
    include: {
      items: true,
      order: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (!quote) {
    return null;
  }

  return buildQuoteApprovalPackage(tenantId, {
    id: quote.id,
    number: quote.number,
    serviceOrderId: quote.serviceOrderId,
    customer: quote.order.customer.name,
    status: quote.status,
    total: Number(quote.total),
    validUntil: quote.validUntil,
    items: quote.items.map((item) => ({
      kind: item.kind,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    })),
  });
}

export async function createPrismaPublicQuoteApprovalPackage(tenantId: string, token: string) {
  const quoteId = quoteIdFromPublicToken(token);

  if (!quoteId) {
    return null;
  }

  const quote = await getPrisma().quote.findFirst({
    where: {
      id: quoteId,
      tenantId,
    },
    include: {
      items: true,
      order: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (!quote) {
    return null;
  }

  return buildQuoteApprovalPackage(tenantId, {
    id: quote.id,
    number: quote.number,
    serviceOrderId: quote.serviceOrderId,
    customer: quote.order.customer.name,
    status: quote.status,
    total: Number(quote.total),
    validUntil: quote.validUntil,
    items: quote.items.map((item) => ({
      kind: item.kind,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    })),
  }, token);
}

export async function updateMockPublicQuoteDecision(tenantId: string, token: string, input: PublicQuoteDecisionInput) {
  const quoteId = quoteIdFromPublicToken(token);

  if (!quoteId || !quotes.some((item) => item.id === quoteId)) {
    return null;
  }

  const status = input.decision === "revision_requested" ? "rejected" : input.decision;

  return {
    id: `public-decision-${Date.now()}`,
    quoteId,
    tenantId,
    status,
    customerName: input.customerName,
    customerDocument: input.customerDocument,
    customerEmail: input.customerEmail,
    acceptedTerms: input.acceptedTerms,
    reason: input.reason ?? (input.decision === "revision_requested" ? "Cliente solicitou revisao do orcamento." : undefined),
    auditEvent: "quote.public_decision_recorded",
    nextAction: status === "approved" ? "Liberar execucao da OS e reserva de pecas." : "Enviar para revisao comercial.",
  };
}

export async function updatePrismaQuoteDecision(tenantId: string, quoteId: string, input: UpdateQuoteDecisionInput) {
  const status = input.decision;
  return getPrisma().quote.update({
    where: {
      id: quoteId,
      tenantId,
    },
    data: {
      status,
      approvedAt: status === "approved" ? new Date() : undefined,
      rejectedAt: status === "rejected" ? new Date() : undefined,
    },
  });
}

export async function updatePrismaPublicQuoteDecision(tenantId: string, token: string, input: PublicQuoteDecisionInput) {
  const quoteId = quoteIdFromPublicToken(token);

  if (!quoteId) {
    return null;
  }

  const status = input.decision === "revision_requested" ? "rejected" : input.decision;

  const quote = await getPrisma().quote.findFirst({
    where: {
      id: quoteId,
      tenantId,
    },
  });

  if (!quote) {
    return null;
  }

  return getPrisma().quote.update({
    where: {
      id: quoteId,
      tenantId,
    },
    data: {
      status,
      approvedAt: status === "approved" ? new Date() : undefined,
      rejectedAt: status === "rejected" ? new Date() : undefined,
    },
  });
}

export async function listMockChecklists() {
  return {
    data: checklistTemplates,
    total: checklistTemplates.length,
  };
}

export async function listPrismaChecklists(tenantId: string) {
  const data = await getPrisma().checklistTemplate.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return {
    data,
    total: data.length,
  };
}

export async function listMockStock() {
  return {
    data: stock,
    total: stock.length,
    alerts: stock.filter((item) => item.quantity <= item.minimum),
  };
}

export async function listPrismaStock(tenantId: string) {
  const data = await getPrisma().stockItem.findMany({
    where: { tenantId },
    include: {
      part: true,
      location: true,
    },
    orderBy: {
      part: {
        name: "asc",
      },
    },
  });

  const alerts = data.filter((item) => Number(item.quantity) <= Number(item.part.minimumStock));

  return {
    data,
    total: data.length,
    alerts,
  };
}

export async function createMockPart(tenantId: string, input: CreatePartInput) {
  return {
    id: `part-${Date.now()}`,
    tenantId,
    active: true,
    ...input,
  };
}

export async function createPrismaPart(tenantId: string, input: CreatePartInput) {
  return getPrisma().part.create({
    data: {
      tenantId,
      sku: input.sku,
      name: input.name,
      unit: input.unit,
      costPrice: input.costPrice,
      salePrice: input.salePrice,
      minimumStock: input.minimumStock,
    },
  });
}

export async function listPrismaStockLocations(tenantId: string) {
  const data = await getPrisma().stockLocation.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });

  return {
    data,
    total: data.length,
  };
}

export async function listMockStockLocations() {
  return {
    data: [
      { id: "loc-001", name: "Almoxarifado", type: "warehouse" },
      { id: "loc-002", name: "Veiculo Rafael", type: "vehicle" },
    ],
    total: 2,
  };
}

export async function createMockStockLocation(tenantId: string, input: CreateStockLocationInput) {
  return {
    id: `location-${Date.now()}`,
    tenantId,
    active: true,
    ...input,
  };
}

export async function createPrismaStockLocation(tenantId: string, input: CreateStockLocationInput) {
  return getPrisma().stockLocation.create({
    data: {
      tenantId,
      name: input.name,
      type: input.type,
      technicianUserId: input.technicianUserId,
    },
  });
}

export async function createMockStockMovement(tenantId: string, createdByUserId: string, input: CreateStockMovementInput) {
  return {
    id: `movement-${Date.now()}`,
    tenantId,
    createdByUserId,
    ...input,
  };
}

export async function createPrismaStockMovement(tenantId: string, createdByUserId: string, input: CreateStockMovementInput) {
  const prisma = getPrisma();

  return prisma.$transaction(async (tx) => {
    const movement = await tx.stockMovement.create({
      data: {
        tenantId,
        partId: input.partId,
        fromLocationId: input.fromLocationId,
        toLocationId: input.toLocationId,
        serviceOrderId: input.serviceOrderId,
        quantity: input.quantity,
        reason: input.reason,
        createdByUserId,
      },
    });

    if (input.fromLocationId) {
      await tx.stockItem.upsert({
        where: { partId_locationId: { partId: input.partId, locationId: input.fromLocationId } },
        create: {
          tenantId,
          partId: input.partId,
          locationId: input.fromLocationId,
          quantity: -input.quantity,
        },
        update: {
          quantity: { decrement: input.quantity },
        },
      });
    }

    if (input.toLocationId) {
      await tx.stockItem.upsert({
        where: { partId_locationId: { partId: input.partId, locationId: input.toLocationId } },
        create: {
          tenantId,
          partId: input.partId,
          locationId: input.toLocationId,
          quantity: input.quantity,
        },
        update: {
          quantity: { increment: input.quantity },
        },
      });
    }

    return movement;
  });
}
