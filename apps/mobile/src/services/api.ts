const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333";

export type MobileOrder = {
  id: string;
  customer: string;
  status: string;
  detail: string;
  priority: string;
  equipment: string;
  routeEta: string;
  offlineRisk: string;
  nextAction: string;
};

export type AssignedOrdersSource = "api" | "fallback";

export async function fetchAssignedOrders(token?: string) {
  const response = await fetch(`${apiBaseUrl}/service-orders?status=in_progress`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao sincronizar OS: ${response.status}`);
  }

  return response.json() as Promise<{ data: unknown[]; total: number }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(source: Record<string, unknown>, keys: string[], fallback: string) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function readNestedName(source: Record<string, unknown>, key: string, fallback: string) {
  const value = source[key];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (isRecord(value)) {
    return readString(value, ["name", "label", "title", "serialNumber", "code"], fallback);
  }

  return fallback;
}

function normalizeOrderId(value: string, fallback: string) {
  const cleanValue = value.trim();
  if (!cleanValue) {
    return fallback;
  }

  return cleanValue.startsWith("#") ? cleanValue : `#${cleanValue}`;
}

function normalizePriority(value: string) {
  const normalized = value.trim().toLowerCase();
  if (["emergency", "emergencia", "urgente", "critical", "critica"].includes(normalized)) {
    return "Emergencia";
  }

  if (["high", "alta"].includes(normalized)) {
    return "Alta";
  }

  if (["low", "baixa"].includes(normalized)) {
    return "Baixa";
  }

  if (["normal", "medium", "media"].includes(normalized)) {
    return "Normal";
  }

  return value || "Normal";
}

function normalizeAssignedOrder(rawOrder: unknown, fallback: MobileOrder, index: number): MobileOrder {
  if (!isRecord(rawOrder)) {
    return fallback;
  }

  const id = normalizeOrderId(readString(rawOrder, ["id", "serviceOrderId", "number", "code"], fallback.id), fallback.id);
  const customer = readString(rawOrder, ["customerName", "clientName", "customer"], readNestedName(rawOrder, "customer", fallback.customer));
  const equipment = readString(
    rawOrder,
    ["equipmentLabel", "equipmentName", "assetName", "equipment"],
    readNestedName(rawOrder, "equipment", fallback.equipment),
  );
  const detail = readString(rawOrder, ["detail", "title", "problem", "description", "summary"], fallback.detail);
  const status = readString(rawOrder, ["status", "state", "stage"], fallback.status);
  const priority = normalizePriority(readString(rawOrder, ["priority", "urgency"], fallback.priority));
  const routeEta = readString(rawOrder, ["routeEta", "eta", "estimatedArrival"], fallback.routeEta);
  const offlineRisk = readString(rawOrder, ["offlineRisk", "connectivityRisk"], fallback.offlineRisk);
  const nextAction = readString(
    rawOrder,
    ["nextAction", "recommendedAction", "fieldInstruction"],
    fallback.nextAction || `Abrir a OS ${id.replace("#", "")} e seguir o checklist tecnico.`,
  );

  return {
    ...fallback,
    id,
    customer: customer || `Cliente ${index + 1}`,
    equipment,
    detail,
    status,
    priority,
    routeEta,
    offlineRisk,
    nextAction,
  };
}

export function normalizeAssignedOrdersResponse(response: { data?: unknown[] }, fallbackOrders: MobileOrder[]) {
  const rawOrders = Array.isArray(response.data) ? response.data : [];
  const normalizedOrders = rawOrders.map((order, index) => normalizeAssignedOrder(order, fallbackOrders[index] ?? fallbackOrders[0], index));

  return normalizedOrders.length ? normalizedOrders : fallbackOrders;
}

export async function fetchAssignedMobileOrdersWithSource(fallbackOrders: MobileOrder[], token?: string) {
  const response = await fetchAssignedOrders(token);
  const rawOrders = Array.isArray(response.data) ? response.data : [];

  return {
    orders: normalizeAssignedOrdersResponse(response, fallbackOrders),
    source: (rawOrders.length ? "api" : "fallback") as AssignedOrdersSource,
  };
}

export async function fetchAssignedMobileOrders(fallbackOrders: MobileOrder[], token?: string) {
  const result = await fetchAssignedMobileOrdersWithSource(fallbackOrders, token);
  return result.orders;
}

export async function sendOfflineAction(action: OfflineAction, token?: string) {
  const response = await fetch(`${apiBaseUrl}${action.path}`, {
    method: action.method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(action.payload),
  });

  if (!response.ok) {
    throw new Error(`Falha ao enviar acao offline: ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

export type OfflineSyncResult = {
  ok: boolean;
  synced: number;
  remaining: OfflineAction[];
  blocked?: number;
  failedLabel?: string;
  errorMessage?: string;
};

export type OfflineAction = {
  id: string;
  label: string;
  method: "POST" | "PATCH";
  path: string;
  payload: Record<string, unknown>;
  createdAt: string;
  priority?: "normal" | "high" | "critical";
  retryCount?: number;
};

export type FieldCommandChecklistItem = {
  key: string;
  label: string;
  status: "ready" | "attention" | "blocked";
  detail: string;
};

export const maxOfflineRetryCount = 5;

function offlineId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function isOfflineActionBlocked(action: OfflineAction) {
  return (action.retryCount ?? 0) >= maxOfflineRetryCount;
}

export function summarizeOfflineQueue(actions: OfflineAction[]) {
  const byPriority = actions.reduce<Record<string, number>>((summary, action) => {
    const priority = action.priority ?? "normal";
    summary[priority] = (summary[priority] ?? 0) + 1;
    return summary;
  }, {});
  const retrying = actions.filter((action) => (action.retryCount ?? 0) > 0).length;
  const blocked = actions.filter(isOfflineActionBlocked).length;
  const oldest = actions.reduce<string | null>((current, action) => {
    if (!current || action.createdAt < current) {
      return action.createdAt;
    }

    return current;
  }, null);

  return {
    total: actions.length,
    byPriority,
    retrying,
    blocked,
    oldest,
    hasCritical: Boolean(byPriority.critical),
  };
}

export function getOfflineActionServiceOrderId(action: OfflineAction) {
  const serviceOrderPathMatch = action.path.match(/\/service-orders\/([^/]+)/);
  if (serviceOrderPathMatch?.[1]) {
    return serviceOrderPathMatch[1];
  }

  const dispatchPathMatch = action.path.match(/\/dispatch\/service-orders\/([^/]+)/);
  if (dispatchPathMatch?.[1]) {
    return dispatchPathMatch[1];
  }

  const payloadServiceOrderId = action.payload.serviceOrderId;
  if (typeof payloadServiceOrderId === "string" && payloadServiceOrderId.trim()) {
    return payloadServiceOrderId.trim();
  }

  const labelMatch = action.label.match(/OS\s+#?([A-Za-z0-9-]+)/i);
  return labelMatch?.[1] ?? null;
}

export function getCriticalPendingActionsForServiceOrder(actions: OfflineAction[], serviceOrderId: string) {
  return actions.filter((action) => action.priority === "critical" && getOfflineActionServiceOrderId(action) === serviceOrderId);
}

export function getBlockedCriticalPendingActionsForServiceOrder(actions: OfflineAction[], serviceOrderId: string) {
  return getCriticalPendingActionsForServiceOrder(actions, serviceOrderId).filter(isOfflineActionBlocked);
}

export function buildFieldCommandChecklist(actions: OfflineAction[]): FieldCommandChecklistItem[] {
  const summary = summarizeOfflineQueue(actions);

  return [
    {
      key: "offline_queue",
      label: "Fila offline",
      status: summary.blocked ? "blocked" : summary.total ? "attention" : "ready",
      detail: summary.blocked
        ? `${summary.blocked} acao bloqueada exige revisao do gestor.`
        : summary.total
          ? `${summary.total} acao pendente deve sincronizar antes do fechamento final.`
          : "Sem pendencias locais antes de iniciar novo atendimento.",
    },
    {
      key: "critical_actions",
      label: "Acoes criticas",
      status: summary.hasCritical ? "attention" : "ready",
      detail: summary.hasCritical
        ? "Assinatura, foto final ou evidencia critica devem ser sincronizadas com prioridade."
        : "Nenhuma acao critica pendente no aparelho.",
    },
    {
      key: "route_and_arrival",
      label: "Rota e chegada",
      status: "ready",
      detail: "Confirmar deslocamento, responsavel no local e check-in antes da execucao.",
    },
    {
      key: "parts_and_scope",
      label: "Pecas e escopo",
      status: "attention",
      detail: "Conferir pecas carregadas e nao executar fora do escopo aprovado.",
    },
    {
      key: "signature_and_report",
      label: "Assinatura e relatorio",
      status: "attention",
      detail: "Fechamento tecnico, assinatura e e-mail final devem seguir a ordem correta.",
    },
  ];
}

export function sortOfflineQueueForSync(actions: OfflineAction[]) {
  const priorityWeight = {
    critical: 0,
    high: 1,
    normal: 2,
  };

  return [...actions].sort((left, right) => {
    const leftPriority = priorityWeight[left.priority ?? "normal"];
    const rightPriority = priorityWeight[right.priority ?? "normal"];

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.createdAt.localeCompare(right.createdAt);
  });
}

export async function syncOfflineQueuePartially(
  actions: OfflineAction[],
  sender: (action: OfflineAction) => Promise<unknown> = sendOfflineAction,
): Promise<OfflineSyncResult> {
  const syncedIds = new Set<string>();
  const blockedActions = actions.filter(isOfflineActionBlocked);
  const blockedIds = new Set(blockedActions.map((action) => action.id));
  const orderedActions = sortOfflineQueueForSync(actions.filter((action) => !blockedIds.has(action.id)));

  if (!orderedActions.length && blockedActions.length) {
    return {
      ok: false,
      synced: 0,
      remaining: actions,
      blocked: blockedActions.length,
      errorMessage: "Limite de tentativas atingido. Revise a pendencia antes de reenviar.",
    };
  }

  for (const action of orderedActions) {
    const actionWithRetry = { ...action, retryCount: (action.retryCount ?? 0) + 1 };

    try {
      await sender(actionWithRetry);
      syncedIds.add(action.id);
    } catch (error) {
      return {
        ok: false,
        synced: syncedIds.size,
        blocked: blockedActions.length,
        remaining: actions
          .filter((pendingAction) => !syncedIds.has(pendingAction.id))
          .map((pendingAction) => (
            pendingAction.id === action.id
              ? { ...pendingAction, retryCount: (pendingAction.retryCount ?? 0) + 1 }
              : pendingAction
          )),
        failedLabel: action.label,
        errorMessage: error instanceof Error ? error.message : "Falha ao sincronizar.",
      };
    }
  }

  return {
    ok: blockedActions.length === 0,
    synced: orderedActions.length,
    remaining: blockedActions,
    blocked: blockedActions.length,
    errorMessage: blockedActions.length
      ? "Acoes bloqueadas por excesso de tentativas continuam pendentes."
      : undefined,
  };
}

export function createFieldCommandChecklistAckAction(serviceOrderId: string, technicianUserId: string, actions: OfflineAction[]) {
  const checklist = buildFieldCommandChecklist(actions);

  return {
    id: offlineId("field-command"),
    label: `Comando campo OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/notes`,
    payload: {
      rawText: `Comando de campo da OS ${serviceOrderId} conferido no aplicativo tecnico antes da execucao.`,
      source: "mobile_offline_field_command",
      mobileAck: {
        technicianUserId,
        checkedAt: new Date().toISOString(),
        offline: true,
        checklist,
        blocked: checklist.filter((item) => item.status === "blocked").length,
        attention: checklist.filter((item) => item.status === "attention").length,
      },
    },
    createdAt: new Date().toISOString(),
    priority: checklist.some((item) => item.status === "blocked") ? "critical" : "high",
    retryCount: 0,
  } satisfies OfflineAction;
}

export function createMobileOfflineEscalationReviewAction(action: OfflineAction, reviewedBy: string) {
  const serviceOrderId = getOfflineActionServiceOrderId(action);

  return {
    id: offlineId("offline-review"),
    label: `Revisao gestor ${action.label}`,
    method: "POST",
    path: `/platform/mobile-offline-escalations/${action.id}/review`,
    payload: {
      tenantId: "icemax-demo",
      offlineActionId: action.id,
      serviceOrderId,
      decision: "manager_review_requested_from_mobile",
      reviewedBy,
      note: `Tecnico solicitou revisao assistida para ${action.label} apos ${action.retryCount ?? 0} tentativas.`,
      recordedAt: new Date().toISOString(),
      mobileContext: {
        originalLabel: action.label,
        originalPath: action.path,
        originalPriority: action.priority ?? "normal",
        originalRetryCount: action.retryCount ?? 0,
      },
    },
    createdAt: new Date().toISOString(),
    priority: "high",
    retryCount: 0,
  } satisfies OfflineAction;
}

export function createCheckInAction(serviceOrderId: string) {
  return {
    id: offlineId("check-in"),
    label: `Check-in OS ${serviceOrderId}`,
    method: "PATCH",
    path: `/service-orders/${serviceOrderId}/status`,
    payload: { status: "in_progress" },
    createdAt: new Date().toISOString(),
    priority: "high",
    retryCount: 0,
  } satisfies OfflineAction;
}

export function createLocationAction(technicianUserId: string, serviceOrderId: string) {
  return {
    id: offlineId("location"),
    label: `Localizacao ${serviceOrderId}`,
    method: "POST",
    path: `/technicians/${technicianUserId}/location`,
    payload: {
      serviceOrderId,
      latitude: -23.55052,
      longitude: -46.633308,
      accuracy: 25,
    },
    createdAt: new Date().toISOString(),
    priority: "normal",
    retryCount: 0,
  } satisfies OfflineAction;
}

export function createChecklistAction(serviceOrderId: string, checklistItemId: string, value: string) {
  return {
    id: offlineId("checklist"),
    label: `Checklist OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/checklist-answers`,
    payload: { checklistItemId, value },
    createdAt: new Date().toISOString(),
    priority: "high",
    retryCount: 0,
  } satisfies OfflineAction;
}

export function createPhotoEvidenceAction(serviceOrderId: string, type: "before" | "during" | "after" | "issue" | "part") {
  return {
    id: offlineId("photo"),
    label: `Foto ${type} OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/photos`,
    payload: {
      type,
      fileUrl: `https://local.icemax.dev/offline/${serviceOrderId}-${type}.jpg`,
      caption: "Evidencia capturada em modo offline.",
    },
    createdAt: new Date().toISOString(),
    priority: type === "after" || type === "issue" ? "critical" : "high",
    retryCount: 0,
  } satisfies OfflineAction;
}

export function createPartUsageAction(serviceOrderId: string, partId: string, quantity: number) {
  return {
    id: offlineId("part"),
    label: `Peca OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/parts`,
    payload: { partId, quantity },
    createdAt: new Date().toISOString(),
    priority: "high",
    retryCount: 0,
  } satisfies OfflineAction;
}

export function createCustomerSignatureAction(serviceOrderId: string, customerSignedName: string) {
  return {
    id: offlineId("signature"),
    label: `Assinatura OS ${serviceOrderId}`,
    method: "PATCH",
    path: `/service-orders/${serviceOrderId}/status`,
    payload: {
      status: "completed",
      customerSignedName,
    },
    createdAt: new Date().toISOString(),
    priority: "critical",
    retryCount: 0,
  } satisfies OfflineAction;
}

export function createFieldExecutionCloseoutAckAction(serviceOrderId: string, quoteId: string) {
  return {
    id: offlineId("field-closeout"),
    label: `Fechamento campo OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/notes`,
    payload: {
      rawText: `Fechamento tecnico da OS ${serviceOrderId} conferido no app antes da assinatura do cliente.`,
      source: "mobile_offline_field_execution_closeout",
      mobileAck: {
        quoteId,
        evidenceChecked: true,
        measurementsChecked: true,
        stockUsageChecked: true,
        reportDraftReviewed: true,
        acknowledgedAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createFieldCustomerSignaturePackageAckAction(serviceOrderId: string, quoteId: string, customerSignedName: string) {
  return {
    id: offlineId("field-signature-package"),
    label: `Pacote assinatura OS ${serviceOrderId}`,
    method: "POST",
    path: `/dispatch/service-orders/${serviceOrderId}/customer-signature`,
    payload: {
      quoteId,
      technicianUserId: "tech-002",
      responsibleName: customerSignedName,
      responsibleRole: "Responsavel no local",
      signatureFileUrl: `https://local.icemax.dev/signatures/${serviceOrderId}.png`,
      emailCopyToCustomer: false,
      acceptedTerms: true,
      signedAt: new Date().toISOString(),
      mobileOfflineId: offlineId("offline-signature"),
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createFieldCompletionEmailAckAction(serviceOrderId: string, quoteId: string, emailCopyToCustomer: boolean) {
  return {
    id: offlineId("completion-email"),
    label: `E-mail conclusao OS ${serviceOrderId}`,
    method: "POST",
    path: `/dispatch/service-orders/${serviceOrderId}/completion-email`,
    payload: {
      quoteId,
      technicianUserId: "tech-002",
      emailCopyToCustomer,
      includeWarrantyTerms: true,
      requestedAt: new Date().toISOString(),
      mobileOfflineId: offlineId("offline-email"),
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createVisitPreparationAckAction(serviceOrderId: string, technicianUserId: string) {
  return {
    id: offlineId("visit-prep"),
    label: `Preparo recebido OS ${serviceOrderId}`,
    method: "POST",
    path: "/dispatch/visit-preparation",
    payload: {
      serviceOrderId,
      technicianUserId,
      includeVisualDiagnosis: true,
      includeCustomerPortalEvidence: true,
      mobileAck: {
        receivedAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createPartsLoadAckAction(serviceOrderId: string, technicianUserId: string) {
  return {
    id: offlineId("parts-load"),
    label: `Pecas carregadas OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/parts-reservation`,
    payload: {
      technicianUserId,
      sourceLocation: "Almoxarifado",
      targetLocation: "Veiculo Rafael",
      requestedSkus: ["R410A", "CAP-45"],
      mobileAck: {
        loadedAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createWarrantyPresentedAction(serviceOrderId: string, customerId: string) {
  return {
    id: offlineId("warranty"),
    label: `Garantia apresentada OS ${serviceOrderId}`,
    method: "POST",
    path: "/warranty-terms",
    payload: {
      serviceOrderId,
      customerId,
      coverageDays: 90,
      coverageText: "Garantia de mao de obra e pecas fornecidas conforme termo apresentado ao cliente no encerramento da OS.",
      exclusions: ["mau uso", "intervencao de terceiros", "oscilacao eletrica", "infraestrutura inadequada"],
      mobileAck: {
        presentedAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createSatisfactionSurveyAction(serviceOrderId: string, customerId: string, score: number) {
  return {
    id: offlineId("survey"),
    label: `Pesquisa OS ${serviceOrderId}`,
    method: "POST",
    path: "/satisfaction-surveys",
    payload: {
      serviceOrderId,
      customerId,
      score,
      comment: score >= 9 ? "Cliente satisfeito com o atendimento." : "Cliente solicitou acompanhamento do gestor.",
      mobileAck: {
        answeredAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createManualConsultedAction(serviceOrderId: string, manualId: string) {
  return {
    id: offlineId("manual"),
    label: `Manual consultado OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/notes`,
    payload: {
      rawText: `Manual tecnico ${manualId} consultado e mantido em cache offline antes da execucao.`,
      source: "mobile_offline_manual",
      mobileAck: {
        manualId,
        cachedAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createQuoteApprovalPresentedAction(serviceOrderId: string, quoteId: string) {
  return {
    id: offlineId("quote-approval"),
    label: `Orcamento apresentado OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/notes`,
    payload: {
      rawText: `Link de aprovacao do orcamento ${quoteId} apresentado ao cliente em campo.`,
      source: "mobile_offline_quote_approval",
      mobileAck: {
        quoteId,
        presentedAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createApprovedQuoteActivationAckAction(serviceOrderId: string, quoteId: string) {
  return {
    id: offlineId("quote-activation"),
    label: `Orcamento aprovado OS ${serviceOrderId}`,
    method: "POST",
    path: `/quotes/${quoteId}/approval-activation`,
    payload: {
      serviceOrderId,
      mobileAck: {
        quoteId,
        acknowledgedAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createQuoteTimelineViewedAction(serviceOrderId: string, quoteId: string) {
  return {
    id: offlineId("quote-timeline"),
    label: `Timeline orcamento OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/notes`,
    payload: {
      rawText: `Linha do tempo do orcamento ${quoteId} consultada pelo tecnico em campo.`,
      source: "mobile_offline_quote_timeline",
      mobileAck: {
        quoteId,
        viewedAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createQuoteBoardViewedAction(serviceOrderId: string) {
  return {
    id: offlineId("quote-board"),
    label: `Board orcamentos OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/notes`,
    payload: {
      rawText: "Board de aprovacao de orcamentos consultado pelo tecnico antes de executar a OS.",
      source: "mobile_offline_quote_board",
      mobileAck: {
        viewedAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createQuoteReminderPresentedAction(serviceOrderId: string, quoteId: string) {
  return {
    id: offlineId("quote-reminder"),
    label: `Lembrete orcamento OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/notes`,
    payload: {
      rawText: `Lembrete do orcamento ${quoteId} apresentado ou reforcado com o responsavel em campo.`,
      source: "mobile_offline_quote_reminder",
      mobileAck: {
        quoteId,
        presentedAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createQuoteExecutionReadinessAckAction(serviceOrderId: string, quoteId: string) {
  return {
    id: offlineId("quote-readiness"),
    label: `Prontidao orcamento OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/notes`,
    payload: {
      rawText: `Prontidao de execucao do orcamento ${quoteId} conferida pelo tecnico antes do inicio do servico.`,
      source: "mobile_offline_quote_execution_readiness",
      mobileAck: {
        quoteId,
        checkedAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}

export function createQuoteExecutionDispatchQueueAckAction(serviceOrderId: string, quoteId: string) {
  return {
    id: offlineId("quote-dispatch-queue"),
    label: `Fila despacho OS ${serviceOrderId}`,
    method: "POST",
    path: `/service-orders/${serviceOrderId}/notes`,
    payload: {
      rawText: `Fila de despacho do orcamento aprovado ${quoteId} recebida e conferida no app tecnico.`,
      source: "mobile_offline_quote_dispatch_queue",
      mobileAck: {
        quoteId,
        acknowledgedAt: new Date().toISOString(),
        offline: true,
      },
    },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}
