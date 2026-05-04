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

type QuoteApprovalPackage = ReturnType<typeof buildQuoteApprovalPackage>;

function buildQuoteCommunicationPackage(tenantId: string, approvalPackage: QuoteApprovalPackage) {
  return {
    quoteId: approvalPackage.quoteId,
    quoteNumber: approvalPackage.quoteNumber,
    serviceOrderId: approvalPackage.serviceOrderId,
    tenantId,
    customer: approvalPackage.customer,
    status: "quote_communication_ready",
    trigger: "quote_approval_requested",
    recipients: {
      companyEmail: "adm.rcsolutions@gmail.com",
      customerEmailCopy: "cliente@local.dev",
      whatsapp: "+5500000000000",
      internal: "comercial@icemax.local",
    },
    messages: [
      {
        channel: "email",
        template: "orcamento_aprovacao_email",
        subject: approvalPackage.customerMessages.emailSubject,
        body: approvalPackage.customerMessages.emailBody,
        copyToCustomer: true,
      },
      {
        channel: "whatsapp",
        template: "orcamento_aprovacao_whatsapp",
        body: approvalPackage.customerMessages.whatsappBody,
        copyToCustomer: true,
      },
      {
        channel: "internal",
        template: "orcamento_handoff_comercial",
        subject: `Orcamento ${approvalPackage.quoteNumber} enviado para aprovacao`,
        body: `Acompanhar abertura do link ${approvalPackage.publicUrl} e acionar operacao quando houver decisao do cliente.`,
        copyToCustomer: false,
      },
    ],
    approvalLink: {
      token: approvalPackage.token,
      publicUrl: approvalPackage.publicUrl,
      expiresAt: approvalPackage.expiresAt,
      publicDecisionEndpoint: approvalPackage.governance.publicDecisionEndpoint,
    },
    preflight: [
      { key: "approval_link", status: "ok", result: approvalPackage.publicUrl },
      { key: "customer_identification", status: "required_on_decision", result: "nome do responsavel obrigatorio no portal" },
      { key: "email_provider", status: "pending_external_key", result: "envio real depende de provedor configurado" },
      { key: "whatsapp_provider", status: "pending_external_key", result: "envio real depende de Meta WhatsApp configurado" },
    ],
    governance: {
      lgpdBasis: "execucao de contrato e comunicacao comercial solicitada",
      auditEvent: "communication.quote_package_prepared",
      requireWhatsappOptIn: true,
      hidesInternalMargin: true,
      idempotencyScope: `quote:${approvalPackage.quoteId}:approval`,
    },
    nextActions: [
      "Enviar link de aprovacao por e-mail.",
      "Enviar mensagem curta por WhatsApp quando houver consentimento.",
      "Monitorar abertura e decisao do cliente.",
      "Ao aprovar, liberar execucao e reserva de pecas.",
      "Ao recusar ou pedir revisao, devolver ao comercial.",
    ],
  };
}

export async function createMockQuoteCommunicationPackage(tenantId: string, quoteId: string) {
  const approvalPackage = await createMockQuoteApprovalPackage(tenantId, quoteId);

  if (!approvalPackage) {
    return null;
  }

  return buildQuoteCommunicationPackage(tenantId, approvalPackage);
}

function queueItemsFromQuoteMessages(params: {
  quoteId: string;
  trigger: string;
  recipients: Record<string, string>;
  messages: Array<{ channel: string; template: string; subject?: string; body: string; copyToCustomer: boolean }>;
}) {
  return params.messages.map((message, index) => {
    const recipient = message.channel === "email"
      ? params.recipients.companyEmail
      : message.channel === "whatsapp"
        ? params.recipients.whatsapp
        : params.recipients.internal;

    return {
      id: `queue-quote-${params.quoteId}-${message.channel}-${index + 1}`,
      sourceType: "quote",
      sourceId: params.quoteId,
      trigger: params.trigger,
      channel: message.channel,
      provider: message.channel === "whatsapp" ? "whatsapp_business_pending" : message.channel === "email" ? "email_provider_pending" : "internal_notification",
      recipient,
      template: message.template,
      subject: message.subject,
      body: message.body,
      copyToCustomer: message.copyToCustomer,
      status: "queued_mock",
      priority: message.channel === "internal" ? "normal" : "high",
      attempts: 0,
      maxAttempts: 3,
      idempotencyKey: `quote:${params.quoteId}:${message.channel}:${message.template}`,
      scheduledFor: new Date().toISOString(),
    };
  });
}

export async function createMockQuoteCommunicationQueue(tenantId: string, quoteId: string) {
  const communicationPackage = await createMockQuoteCommunicationPackage(tenantId, quoteId);

  if (!communicationPackage) {
    return null;
  }

  const items = queueItemsFromQuoteMessages({
    quoteId,
    trigger: communicationPackage.trigger,
    recipients: communicationPackage.recipients,
    messages: communicationPackage.messages,
  });

  return {
    sourceType: "quote",
    sourceId: quoteId,
    tenantId,
    status: "queued_mock",
    total: items.length,
    readyToSend: items.filter((item) => item.status === "queued_mock").length,
    blocked: 0,
    approvalLink: communicationPackage.approvalLink,
    preflight: communicationPackage.preflight,
    items,
    audit: {
      event: "communication.quote_queue_created",
      entity: "quote",
      entityId: quoteId,
    },
    nextActions: [
      "Persistir itens da fila no banco real.",
      "Processar e-mail quando provedor estiver configurado.",
      "Processar WhatsApp somente com consentimento valido.",
      "Registrar entrega, falha e abertura do link na auditoria.",
    ],
  };
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

export async function createPrismaQuoteCommunicationPackage(tenantId: string, quoteId: string) {
  const approvalPackage = await createPrismaQuoteApprovalPackage(tenantId, quoteId);

  if (!approvalPackage) {
    return null;
  }

  return buildQuoteCommunicationPackage(tenantId, approvalPackage);
}

export async function createPrismaQuoteCommunicationQueue(tenantId: string, quoteId: string) {
  const communicationPackage = await createPrismaQuoteCommunicationPackage(tenantId, quoteId);

  if (!communicationPackage) {
    return null;
  }

  const items = queueItemsFromQuoteMessages({
    quoteId,
    trigger: communicationPackage.trigger,
    recipients: communicationPackage.recipients,
    messages: communicationPackage.messages,
  });

  return {
    sourceType: "quote",
    sourceId: quoteId,
    tenantId,
    status: "queued_mock",
    total: items.length,
    readyToSend: items.length,
    blocked: 0,
    approvalLink: communicationPackage.approvalLink,
    preflight: communicationPackage.preflight,
    items,
    audit: {
      event: "communication.quote_queue_created",
      entity: "quote",
      entityId: quoteId,
    },
    nextActions: [
      "Persistir itens da fila no banco real.",
      "Processar e-mail quando provedor estiver configurado.",
      "Processar WhatsApp somente com consentimento valido.",
      "Registrar entrega, falha e abertura do link na auditoria.",
    ],
  };
}

function buildQuoteDecisionHandoff(tenantId: string, quote: {
  id: string;
  number?: string;
  serviceOrderId?: string;
  customer?: string;
  status?: string;
  total?: number;
  validUntil?: string | Date | null;
  items?: Array<{ description?: string; quantity?: number; unitPrice?: number; kind?: string }>;
}) {
  const total = Number(quote.total ?? 0);
  const approved = quote.status === "approved";
  const rejected = quote.status === "rejected";

  return {
    quoteId: quote.id,
    quoteNumber: quote.number ?? quote.id,
    serviceOrderId: quote.serviceOrderId,
    tenantId,
    customer: quote.customer ?? "Cliente",
    status: approved ? "execution_handoff_ready" : rejected ? "commercial_review_required" : "waiting_customer_decision",
    currentQuoteStatus: quote.status ?? "draft",
    total,
    decisionSummary: {
      approved,
      rejected,
      waitingDecision: !approved && !rejected,
      message: approved
        ? "Orcamento aprovado. Liberar execucao operacional com controle de pecas e comunicacao ao tecnico."
        : rejected
          ? "Orcamento recusado ou em revisao. Comercial deve ajustar proposta antes de nova comunicacao."
          : "Orcamento ainda aguarda decisao do cliente.",
    },
    executionPlan: approved
      ? [
          "Atualizar OS para aguardando execucao.",
          "Reservar pecas previstas no orcamento.",
          "Confirmar disponibilidade de tecnico e janela de atendimento.",
          "Enviar aviso ao tecnico com itens aprovados.",
          "Registrar aceite do cliente na auditoria.",
        ]
      : [
          "Bloquear execucao ate nova decisao.",
          "Registrar motivo da recusa ou revisao.",
          "Gerar nova versao comercial quando necessario.",
          "Reenviar link atualizado ao cliente.",
        ],
    stockImpact: {
      requiresReservation: approved,
      items: quote.items?.map((item) => ({
        kind: item.kind ?? "service",
        description: item.description ?? "Item do orcamento",
        quantity: item.quantity ?? 1,
        reservationStatus: approved && item.kind === "part" ? "reservation_required" : "no_stock_action",
      })) ?? [],
    },
    communications: {
      internalSubject: approved ? `Orcamento ${quote.number ?? quote.id} aprovado` : `Revisar orcamento ${quote.number ?? quote.id}`,
      technicianMessage: approved
        ? `Orcamento ${quote.number ?? quote.id} aprovado para OS ${quote.serviceOrderId}. Conferir pecas e executar conforme escopo aprovado.`
        : `Orcamento ${quote.number ?? quote.id} ainda nao esta liberado para execucao.`,
      customerMessage: approved
        ? `Recebemos sua aprovacao do orcamento ${quote.number ?? quote.id}. A equipe seguira com a programacao do atendimento.`
        : `Recebemos sua solicitacao sobre o orcamento ${quote.number ?? quote.id}. Nossa equipe revisara a proposta.`,
    },
    governance: {
      auditEvent: "quote.decision_handoff_prepared",
      requiresAuditTrail: true,
      blocksExecutionWithoutApproval: true,
      preservesOriginalQuote: true,
    },
    nextActions: approved
      ? [
          "Acionar reserva de pecas da OS.",
          "Acionar despacho tecnico.",
          "Notificar cliente sobre proxima etapa.",
        ]
      : [
          "Revisar escopo e valores.",
          "Registrar motivo comercial.",
          "Gerar novo pacote de aprovacao se houver ajuste.",
        ],
  };
}

export async function createMockQuoteDecisionHandoff(tenantId: string, quoteId: string) {
  const quote = quotes.find((item) => item.id === quoteId);

  if (!quote) {
    return null;
  }

  return buildQuoteDecisionHandoff(tenantId, quote);
}

export async function createPrismaQuoteDecisionHandoff(tenantId: string, quoteId: string) {
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

  return buildQuoteDecisionHandoff(tenantId, {
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
