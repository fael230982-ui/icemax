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

function buildQuoteApprovalActivation(tenantId: string, quote: {
  id: string;
  number?: string;
  serviceOrderId?: string;
  customer?: string;
  status?: string;
  total?: number;
  validUntil?: string | Date | null;
  items?: Array<{ description?: string; quantity?: number; unitPrice?: number; kind?: string }>;
}) {
  const handoff = buildQuoteDecisionHandoff(tenantId, quote);
  const approved = quote.status === "approved";
  const partItems = quote.items?.filter((item) => item.kind === "part") ?? [];

  return {
    quoteId: quote.id,
    quoteNumber: quote.number ?? quote.id,
    serviceOrderId: quote.serviceOrderId,
    tenantId,
    customer: quote.customer ?? "Cliente",
    status: approved ? "activation_ready" : "activation_blocked",
    activationAllowed: approved,
    blocker: approved ? null : "Orcamento precisa estar aprovado para liberar execucao operacional.",
    serviceOrderUpdate: {
      targetStatus: approved ? "scheduled" : "waiting_approval",
      reason: approved
        ? "Orcamento aprovado pelo cliente e pronto para execucao."
        : "Execucao bloqueada ate aprovacao do orcamento.",
    },
    stockReservation: {
      required: approved && partItems.length > 0,
      sourceLocation: "Almoxarifado",
      targetLocation: "Veiculo Rafael",
      items: partItems.map((item) => ({
        description: item.description ?? "Peca do orcamento",
        quantity: item.quantity ?? 1,
        status: approved ? "reservation_required" : "blocked_until_approval",
      })),
    },
    dispatch: {
      required: approved,
      recommendedTechnicianId: "tech-001",
      readinessCheck: quote.serviceOrderId ? `/dispatch/service-orders/${quote.serviceOrderId}/readiness?technicianUserId=tech-001` : null,
      visitPreparationEndpoint: "/dispatch/visit-preparation",
      message: approved
        ? "Despacho pode ser reavaliado com pecas aprovadas e janela do cliente."
        : "Despacho nao deve ser executado sem aprovacao do orcamento.",
    },
    communications: {
      internal: handoff.communications.internalSubject,
      technician: handoff.communications.technicianMessage,
      customer: handoff.communications.customerMessage,
    },
    audit: {
      event: "quote.approval_activation_prepared",
      entity: "quote",
      entityId: quote.id,
      requiresPersistence: true,
      idempotencyKey: `quote:${quote.id}:approval-activation`,
    },
    nextActions: approved
      ? [
          "Persistir mudanca de status da OS.",
          "Criar reserva de pecas para itens aprovados.",
          "Rodar prontidao e preparo da visita.",
          "Avisar tecnico e cliente sobre proxima etapa.",
          "Registrar auditoria de ativacao do orcamento.",
        ]
      : [
          "Manter OS bloqueada para execucao.",
          "Aguardar aprovacao do cliente ou revisao comercial.",
          "Nao reservar pecas nem despachar tecnico.",
        ],
  };
}

export async function createMockQuoteApprovalActivation(tenantId: string, quoteId: string) {
  const quote = quotes.find((item) => item.id === quoteId);

  if (!quote) {
    return null;
  }

  return buildQuoteApprovalActivation(tenantId, quote);
}

export async function createPrismaQuoteApprovalActivation(tenantId: string, quoteId: string) {
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

  return buildQuoteApprovalActivation(tenantId, {
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

function buildQuoteExecutionReadiness(tenantId: string, quote: {
  id: string;
  number?: string;
  serviceOrderId?: string;
  customer?: string;
  status?: string;
  total?: number;
  validUntil?: string | Date | null;
  items?: Array<{ description?: string; quantity?: number; unitPrice?: number; kind?: string }>;
}) {
  const activation = buildQuoteApprovalActivation(tenantId, quote);
  const approved = quote.status === "approved";
  const partItems = quote.items?.filter((item) => item.kind === "part") ?? [];
  const checks = [
    {
      key: "customer_approval",
      label: "Aprovacao do cliente",
      status: approved ? "ready" : "blocked",
      detail: approved ? "Orcamento aprovado pelo cliente." : "A execucao depende da aprovacao do orcamento.",
    },
    {
      key: "service_order_link",
      label: "OS vinculada",
      status: quote.serviceOrderId ? "ready" : "blocked",
      detail: quote.serviceOrderId ? `OS ${quote.serviceOrderId} vinculada ao orcamento.` : "Orcamento sem OS vinculada.",
    },
    {
      key: "stock_reservation",
      label: "Reserva de pecas",
      status: partItems.length ? "attention" : "ready",
      detail: partItems.length
        ? "Ha itens de peca no orcamento; reservar antes do despacho."
        : "Orcamento sem item de estoque obrigatorio.",
    },
    {
      key: "dispatch_readiness",
      label: "Prontidao de despacho",
      status: approved && quote.serviceOrderId ? "attention" : "blocked",
      detail: approved && quote.serviceOrderId
        ? `Rodar ${activation.dispatch.readinessCheck} antes de deslocar o tecnico.`
        : "Despacho bloqueado ate aprovacao e OS vinculada.",
    },
    {
      key: "customer_communication",
      label: "Comunicacao ao cliente",
      status: approved ? "ready" : "pending",
      detail: approved
        ? "Cliente deve ser avisado sobre a proxima etapa da programacao."
        : "Aguardar decisao antes de avisar programacao.",
    },
  ];
  const blocked = checks.filter((check) => check.status === "blocked");
  const attention = checks.filter((check) => check.status === "attention");

  return {
    quoteId: quote.id,
    quoteNumber: quote.number ?? quote.id,
    serviceOrderId: quote.serviceOrderId,
    tenantId,
    customer: quote.customer ?? "Cliente",
    status: blocked.length ? "execution_blocked" : attention.length ? "execution_needs_attention" : "execution_ready",
    canExecute: blocked.length === 0,
    activationAllowed: activation.activationAllowed,
    activation,
    checks,
    requiredActions: [
      ...(approved ? [] : ["Obter aprovacao do cliente antes de executar."]),
      ...(quote.serviceOrderId ? [] : ["Vincular orcamento a uma OS operacional."]),
      ...(partItems.length ? ["Criar reserva de pecas aprovadas antes do deslocamento."] : []),
      ...(approved && quote.serviceOrderId ? ["Rodar prontidao de despacho e preparo da visita."] : []),
      ...(approved ? ["Avisar tecnico e cliente sobre a programacao."] : []),
    ],
    integrations: {
      stockReservationEndpoint: quote.serviceOrderId ? `/service-orders/${quote.serviceOrderId}/parts-reservation` : null,
      dispatchReadinessEndpoint: activation.dispatch.readinessCheck,
      visitPreparationEndpoint: activation.dispatch.visitPreparationEndpoint,
      mobileAckSource: "mobile_offline_quote_execution_readiness",
    },
    governance: {
      auditEvent: "quote.execution_readiness_checked",
      blocksExecutionWithoutApproval: true,
      hidesInternalMargin: true,
      requiresDispatchAudit: true,
    },
    nextActions: blocked.length
      ? [
          "Resolver bloqueios antes de liberar execucao.",
          "Manter OS fora da fila de despacho.",
          "Registrar pendencia no historico do orcamento.",
        ]
      : [
          "Criar reserva de pecas se houver item de estoque.",
          "Rodar prontidao e preparo da visita.",
          "Enviar pacote para o app do tecnico.",
          "Atualizar cliente sobre programacao.",
        ],
  };
}

export async function createMockQuoteExecutionReadiness(tenantId: string, quoteId: string) {
  const quote = quotes.find((item) => item.id === quoteId);

  if (!quote) {
    return null;
  }

  return buildQuoteExecutionReadiness(tenantId, quote);
}

export async function createPrismaQuoteExecutionReadiness(tenantId: string, quoteId: string) {
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

  return buildQuoteExecutionReadiness(tenantId, {
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

function buildQuoteApprovalTimeline(tenantId: string, quote: {
  id: string;
  number?: string;
  serviceOrderId?: string;
  customer?: string;
  status?: string;
  total?: number;
  validUntil?: string | Date | null;
  items?: Array<{ description?: string; quantity?: number; unitPrice?: number; kind?: string }>;
}) {
  const currentStatus = quote.status ?? "draft";
  const approved = currentStatus === "approved";
  const rejected = currentStatus === "rejected";
  const decided = approved || rejected;
  const opened = currentStatus !== "draft";
  const activated = approved;
  const issuedAt = new Date("2026-05-04T09:00:00.000Z");

  const events = [
    {
      key: "quote.created",
      label: "Orcamento criado",
      status: "done",
      actor: "comercial",
      occurredAt: issuedAt.toISOString(),
      detail: `Orcamento ${quote.number ?? quote.id} criado para ${quote.customer ?? "Cliente"}.`,
    },
    {
      key: "quote.approval_package_created",
      label: "Pacote de aprovacao preparado",
      status: "done",
      actor: "sistema",
      occurredAt: new Date(issuedAt.getTime() + 8 * 60 * 1000).toISOString(),
      detail: "Link publico, mensagens e termos foram preparados sem expor margem interna.",
    },
    {
      key: "communication.quote_queue_created",
      label: "Comunicacao enfileirada",
      status: "done",
      actor: "sistema",
      occurredAt: new Date(issuedAt.getTime() + 12 * 60 * 1000).toISOString(),
      detail: "E-mail, WhatsApp e aviso interno ficaram prontos para processamento.",
    },
    {
      key: "quote.public_link_opened",
      label: "Link publico aberto",
      status: opened ? "done" : "pending",
      actor: "cliente",
      occurredAt: opened ? new Date(issuedAt.getTime() + 38 * 60 * 1000).toISOString() : null,
      detail: opened
        ? "Cliente acessou o portal publico do orcamento."
        : "Aguardando primeiro acesso do cliente ao link de aprovacao.",
    },
    {
      key: "quote.public_decision_recorded",
      label: "Decisao registrada",
      status: decided ? "done" : "pending",
      actor: "cliente",
      occurredAt: decided ? new Date(issuedAt.getTime() + 52 * 60 * 1000).toISOString() : null,
      detail: approved
        ? "Cliente aprovou o orcamento e aceitou os termos."
        : rejected
          ? "Cliente recusou ou solicitou revisao do orcamento."
          : "Aguardando aprovacao, recusa ou solicitacao de revisao.",
    },
    {
      key: "quote.approval_activation_prepared",
      label: "Execucao liberada",
      status: activated ? "done" : decided ? "blocked" : "pending",
      actor: "operacao",
      occurredAt: activated ? new Date(issuedAt.getTime() + 64 * 60 * 1000).toISOString() : null,
      detail: activated
        ? "Orcamento aprovado foi convertido em plano de execucao com despacho e estoque."
        : decided
          ? "Execucao bloqueada porque a decisao nao liberou o atendimento."
          : "Execucao depende da decisao do cliente.",
    },
  ];

  const nextEvent = events.find((event) => event.status !== "done");

  return {
    quoteId: quote.id,
    quoteNumber: quote.number ?? quote.id,
    serviceOrderId: quote.serviceOrderId,
    tenantId,
    customer: quote.customer ?? "Cliente",
    status: "quote_timeline_ready",
    currentQuoteStatus: currentStatus,
    summary: {
      sent: true,
      opened,
      decided,
      approved,
      rejected,
      activated,
      pendingReason: nextEvent?.detail ?? "Fluxo de aprovacao concluido e pronto para acompanhamento operacional.",
    },
    events,
    metrics: {
      totalEvents: events.length,
      completedEvents: events.filter((event) => event.status === "done").length,
      pendingEvents: events.filter((event) => event.status === "pending").length,
      blockedEvents: events.filter((event) => event.status === "blocked").length,
      elapsedMinutes: activated ? 64 : decided ? 52 : opened ? 38 : 12,
      nextEvent: nextEvent?.key ?? null,
    },
    governance: {
      auditEvent: "quote.approval_timeline_viewed",
      requiresImmutableAuditLog: true,
      recordsPublicAccess: true,
      recordsDecisionEvidence: true,
      hidesInternalMargin: true,
      lgpdBasis: "execucao de contrato e registro de aceite comercial",
    },
    nextActions: activated
      ? [
          "Confirmar reserva de pecas quando houver item de estoque.",
          "Sincronizar liberacao no app do tecnico.",
          "Avisar cliente sobre programacao de execucao.",
        ]
      : decided
        ? [
            "Registrar motivo comercial da decisao.",
            "Preparar nova versao se houver revisao solicitada.",
            "Manter OS bloqueada para execucao ate novo aceite.",
          ]
        : [
            "Monitorar abertura e decisao do cliente.",
            "Reenviar lembrete por canal autorizado se vencer SLA.",
            "Acionar comercial quando o prazo de validade estiver proximo.",
          ],
  };
}

export async function createMockQuoteApprovalTimeline(tenantId: string, quoteId: string) {
  const quote = quotes.find((item) => item.id === quoteId);

  if (!quote) {
    return null;
  }

  return buildQuoteApprovalTimeline(tenantId, quote);
}

export async function createPrismaQuoteApprovalTimeline(tenantId: string, quoteId: string) {
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

  return buildQuoteApprovalTimeline(tenantId, {
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

function buildQuoteApprovalBoard(tenantId: string, quoteList: Array<{
  id: string;
  number?: string;
  serviceOrderId?: string;
  customer?: string;
  status?: string;
  total?: number;
  validUntil?: string | Date | null;
  items?: Array<{ description?: string; quantity?: number; unitPrice?: number; kind?: string }>;
}>) {
  const today = new Date("2026-05-04T12:00:00.000Z");
  const rows = quoteList.map((quote) => {
    const status = quote.status ?? "draft";
    const validUntil = quote.validUntil ? new Date(quote.validUntil) : null;
    const daysToExpire = validUntil
      ? Math.ceil((validUntil.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
      : null;
    const approved = status === "approved";
    const rejected = status === "rejected";
    const pendingDecision = !approved && !rejected;
    const riskLevel = approved
      ? "execution"
      : daysToExpire !== null && daysToExpire <= 1
        ? "critical"
        : daysToExpire !== null && daysToExpire <= 3
          ? "attention"
          : "normal";

    return {
      quoteId: quote.id,
      quoteNumber: quote.number ?? quote.id,
      serviceOrderId: quote.serviceOrderId,
      customer: quote.customer ?? "Cliente",
      status,
      total: Number(quote.total ?? 0),
      formattedTotal: `R$ ${Number(quote.total ?? 0).toFixed(2)}`,
      validUntil: validUntil?.toISOString() ?? null,
      daysToExpire,
      riskLevel,
      lane: approved ? "approved_ready_to_execute" : rejected ? "commercial_review" : "waiting_customer_decision",
      sla: {
        targetHours: pendingDecision ? 24 : approved ? 8 : 48,
        currentHours: approved ? 2 : pendingDecision ? 12 : 6,
        status: riskLevel === "critical" ? "breach_risk" : approved ? "ready" : "inside_sla",
      },
      communication: {
        recommendedChannel: pendingDecision ? "whatsapp_email" : approved ? "internal_dispatch" : "commercial_followup",
        nextMessage: pendingDecision
          ? `Lembrete amigavel para decisao do orcamento ${quote.number ?? quote.id}.`
          : approved
            ? `Orcamento ${quote.number ?? quote.id} aprovado; liberar despacho e preparar OS ${quote.serviceOrderId}.`
            : `Revisar proposta ${quote.number ?? quote.id} com o cliente antes de reenviar.`,
      },
      nextAction: approved
        ? "Ativar execucao e conferir prontidao de despacho."
        : rejected
          ? "Revisar motivo comercial e preparar nova versao."
          : "Monitorar abertura, enviar lembrete autorizado e acompanhar validade.",
    };
  });

  const summary = {
    total: rows.length,
    waitingCustomerDecision: rows.filter((row) => row.lane === "waiting_customer_decision").length,
    approvedReadyToExecute: rows.filter((row) => row.lane === "approved_ready_to_execute").length,
    commercialReview: rows.filter((row) => row.lane === "commercial_review").length,
    critical: rows.filter((row) => row.riskLevel === "critical").length,
    attention: rows.filter((row) => row.riskLevel === "attention").length,
    totalPipeline: rows.reduce((sum, row) => sum + row.total, 0),
  };

  return {
    tenantId,
    status: "quote_approval_board_ready",
    generatedAt: today.toISOString(),
    summary: {
      ...summary,
      formattedPipeline: `R$ ${summary.totalPipeline.toFixed(2)}`,
    },
    lanes: [
      {
        key: "waiting_customer_decision",
        title: "Aguardando cliente",
        total: summary.waitingCustomerDecision,
        rows: rows.filter((row) => row.lane === "waiting_customer_decision"),
      },
      {
        key: "approved_ready_to_execute",
        title: "Aprovados para execucao",
        total: summary.approvedReadyToExecute,
        rows: rows.filter((row) => row.lane === "approved_ready_to_execute"),
      },
      {
        key: "commercial_review",
        title: "Revisao comercial",
        total: summary.commercialReview,
        rows: rows.filter((row) => row.lane === "commercial_review"),
      },
    ],
    alerts: rows
      .filter((row) => row.riskLevel === "critical" || row.riskLevel === "attention" || row.lane === "approved_ready_to_execute")
      .map((row) => ({
        quoteId: row.quoteId,
        quoteNumber: row.quoteNumber,
        severity: row.riskLevel === "critical" ? "critical" : row.lane === "approved_ready_to_execute" ? "execution" : "attention",
        message: row.nextAction,
      })),
    governance: {
      auditEvent: "quote.approval_board_viewed",
      hidesInternalMargin: true,
      requiresCustomerOptInForWhatsapp: true,
      boardRefreshSeconds: 300,
    },
    nextActions: [
      "Priorizar orcamentos criticos ou proximos do vencimento.",
      "Ativar execucao dos aprovados antes de perder janela operacional.",
      "Registrar motivos de recusa e reenviar nova proposta quando aplicavel.",
      "Usar comunicacao autorizada para lembretes ao cliente.",
    ],
  };
}

export async function createMockQuoteApprovalBoard(tenantId: string) {
  return buildQuoteApprovalBoard(tenantId, quotes);
}

export async function createPrismaQuoteApprovalBoard(tenantId: string) {
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

  return buildQuoteApprovalBoard(tenantId, data.map((quote) => ({
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
  })));
}

type QuoteApprovalBoard = ReturnType<typeof buildQuoteApprovalBoard>;

function buildQuoteApprovalReminders(tenantId: string, board: QuoteApprovalBoard) {
  const rows = board.lanes.flatMap((lane) => lane.rows);
  const reminders = rows
    .filter((row) => row.lane === "waiting_customer_decision" || row.lane === "approved_ready_to_execute")
    .map((row, index) => {
      const waitingCustomer = row.lane === "waiting_customer_decision";
      const internal = row.lane === "approved_ready_to_execute";

      return {
        id: `quote-reminder-${row.quoteId}-${index + 1}`,
        quoteId: row.quoteId,
        quoteNumber: row.quoteNumber,
        serviceOrderId: row.serviceOrderId,
        customer: row.customer,
        channel: waitingCustomer ? "whatsapp_email" : "internal_dispatch",
        template: waitingCustomer ? "orcamento_lembrete_decisao" : "orcamento_aprovado_despacho",
        recipient: waitingCustomer ? "cliente@local.dev" : "operacao@icemax.local",
        priority: row.riskLevel === "critical" ? "urgent" : internal ? "high" : "normal",
        subject: waitingCustomer
          ? `Lembrete do orcamento ${row.quoteNumber}`
          : `Orcamento ${row.quoteNumber} aprovado para execucao`,
        body: waitingCustomer
          ? `Ola! O orcamento ${row.quoteNumber} segue disponivel para aprovacao. A aprovacao libera a programacao da OS ${row.serviceOrderId}.`
          : `Orcamento ${row.quoteNumber} aprovado. Conferir estoque, prontidao e despacho da OS ${row.serviceOrderId}.`,
        copyToCustomer: waitingCustomer,
        status: "queued_mock",
        idempotencyKey: `quote:${row.quoteId}:approval-reminder:${row.lane}`,
        scheduledFor: new Date("2026-05-04T12:10:00.000Z").toISOString(),
        preflight: [
          { key: "customer_opt_in", status: waitingCustomer ? "required" : "not_applicable" },
          { key: "margin_hidden", status: "ok" },
          { key: "provider_key", status: waitingCustomer ? "pending_external_key" : "internal_notification" },
        ],
      };
    });

  return {
    tenantId,
    status: "quote_approval_reminders_ready",
    source: "quote_approval_board",
    total: reminders.length,
    readyToSend: reminders.filter((item) => item.status === "queued_mock").length,
    blocked: reminders.filter((item) => item.preflight.some((check) => check.status === "blocked")).length,
    reminders,
    governance: {
      auditEvent: "quote.approval_reminders_prepared",
      requiresCustomerOptInForWhatsapp: true,
      hidesInternalMargin: true,
      idempotencyScope: "quote.approval-reminders",
    },
    nextActions: [
      "Enviar lembretes ao cliente somente por canal autorizado.",
      "Acionar despacho interno para orcamentos aprovados.",
      "Registrar entrega, abertura e decisao na auditoria.",
      "Evitar lembrete duplicado usando chave de idempotencia.",
    ],
  };
}

export async function createMockQuoteApprovalReminders(tenantId: string) {
  return buildQuoteApprovalReminders(tenantId, await createMockQuoteApprovalBoard(tenantId));
}

export async function createPrismaQuoteApprovalReminders(tenantId: string) {
  return buildQuoteApprovalReminders(tenantId, await createPrismaQuoteApprovalBoard(tenantId));
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
