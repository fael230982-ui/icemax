import { quotes, serviceOrders, serviceOrderStops, stock, technicianLocations } from "../mock-data";
import type { DispatchAssignmentDecisionInput, DispatchVisitPreparationInput, OptimizeRouteInput, TechnicianLocationInput } from "../schemas";
import { createVisualDiagnosisPackage } from "./ai-assistant-service";

const priorityWeight: Record<string, number> = {
  emergency: 0,
  high: 1,
  normal: 2,
  low: 3,
};

type Coordinate = {
  latitude: number;
  longitude: number;
};

function distanceKm(a: Coordinate, b: Coordinate) {
  const earthRadiusKm = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
}

export function listMockTechnicianLocations() {
  return {
    data: technicianLocations,
    total: technicianLocations.length,
  };
}

export function recordMockTechnicianLocation(tenantId: string, technicianUserId: string, input: TechnicianLocationInput) {
  return {
    id: `loc-${Date.now()}`,
    tenantId,
    technicianUserId,
    status: "reported",
    ...input,
    capturedAt: input.capturedAt ?? new Date().toISOString(),
  };
}

export function optimizeMockRoute(input: OptimizeRouteInput) {
  const technician = technicianLocations.find((item) => item.technicianUserId === input.technicianUserId);
  const origin = input.origin ?? technician ?? technicianLocations[0];
  const stops = serviceOrderStops
    .filter((stop) => input.serviceOrderIds.includes(stop.serviceOrderId))
    .map((stop) => ({
      ...stop,
      distanceFromOriginKm: Number(distanceKm(origin, stop).toFixed(2)),
    }))
    .sort((a, b) => {
      const priorityDelta = priorityWeight[a.priority] - priorityWeight[b.priority];
      return priorityDelta || a.distanceFromOriginKm - b.distanceFromOriginKm;
    });

  let cursor = origin;
  let totalDistanceKm = 0;
  const orderedStops = stops.map((stop, index) => {
    const legDistanceKm = distanceKm(cursor, stop);
    totalDistanceKm += legDistanceKm;
    cursor = stop;

    return {
      sequence: index + 1,
      serviceOrderId: stop.serviceOrderId,
      customer: stop.customer,
      priority: stop.priority,
      latitude: stop.latitude,
      longitude: stop.longitude,
      legDistanceKm: Number(legDistanceKm.toFixed(2)),
      estimatedTravelMinutes: Math.max(5, Math.round((legDistanceKm / 28) * 60)),
    };
  });

  return {
    technicianUserId: input.technicianUserId,
    origin,
    stops: orderedStops,
    totalDistanceKm: Number(totalDistanceKm.toFixed(2)),
    totalTravelMinutes: orderedStops.reduce((sum, stop) => sum + stop.estimatedTravelMinutes, 0),
    strategy: "priority_then_distance",
  };
}

const technicianStatusPenalty: Record<string, number> = {
  available: 0,
  en_route: 18,
  in_progress: 35,
  reported: 8,
};

const serviceOrderPriorityScore: Record<string, number> = {
  emergency: 100,
  high: 72,
  normal: 45,
  low: 20,
};

function explainRecommendation(params: {
  priority: string;
  technicianStatus: string;
  distanceKm: number;
  score: number;
}) {
  const reasons = [
    `Prioridade ${params.priority} considerada no score.`,
    `Tecnico com status ${params.technicianStatus}.`,
    `Deslocamento estimado de ${params.distanceKm.toFixed(2)} km.`,
  ];

  if (params.score >= 80) {
    reasons.push("Recomendacao forte para acionamento imediato.");
  } else if (params.score >= 55) {
    reasons.push("Boa opcao para encaixe na agenda.");
  } else {
    reasons.push("Opcao secundaria; avaliar impacto na rota.");
  }

  return reasons;
}

export function recommendMockDispatchAssignments(input?: { serviceOrderIds?: string[] }) {
  const candidateStops = serviceOrderStops.filter((stop) => !input?.serviceOrderIds?.length || input.serviceOrderIds.includes(stop.serviceOrderId));
  const data = candidateStops.map((stop) => {
    const order = serviceOrders.find((item) => item.id === stop.serviceOrderId);
    const candidates = technicianLocations.map((technician) => {
      const distance = distanceKm(technician, stop);
      const priorityScore = serviceOrderPriorityScore[stop.priority] ?? 40;
      const statusPenalty = technicianStatusPenalty[technician.status] ?? 12;
      const distancePenalty = Math.min(45, distance * 6);
      const sameOrderBonus = technician.serviceOrderId === stop.serviceOrderId ? 18 : 0;
      const score = Math.max(0, Math.round(priorityScore - statusPenalty - distancePenalty + sameOrderBonus));

      return {
        technicianUserId: technician.technicianUserId,
        technician: technician.technician,
        technicianStatus: technician.status,
        currentServiceOrderId: technician.serviceOrderId,
        distanceKm: Number(distance.toFixed(2)),
        estimatedTravelMinutes: Math.max(5, Math.round((distance / 28) * 60)),
        score,
        reasons: explainRecommendation({
          priority: stop.priority,
          technicianStatus: technician.status,
          distanceKm: distance,
          score,
        }),
      };
    }).sort((a, b) => b.score - a.score || a.estimatedTravelMinutes - b.estimatedTravelMinutes);

    return {
      serviceOrderId: stop.serviceOrderId,
      customer: stop.customer,
      issue: order?.issue ?? "Atendimento tecnico",
      priority: stop.priority,
      recommendedTechnician: candidates[0],
      alternatives: candidates.slice(1),
    };
  }).sort((a, b) => (serviceOrderPriorityScore[b.priority] ?? 0) - (serviceOrderPriorityScore[a.priority] ?? 0));

  return {
    strategy: "priority_status_distance_score",
    generatedAt: new Date().toISOString(),
    summary: {
      serviceOrders: data.length,
      techniciansEvaluated: technicianLocations.length,
      immediateActions: data.filter((item) => item.recommendedTechnician.score >= 80).length,
    },
    data,
  };
}

export function createMockQuoteExecutionDispatchQueue() {
  const approvedQuotes = quotes.filter((quote) => quote.status === "approved" && quote.serviceOrderId);
  const recommendations = recommendMockDispatchAssignments({
    serviceOrderIds: approvedQuotes.map((quote) => quote.serviceOrderId),
  });

  const data = approvedQuotes.map((quote) => {
    const recommendation = recommendations.data.find((item) => item.serviceOrderId === quote.serviceOrderId);
    const technicianUserId = recommendation?.recommendedTechnician.technicianUserId ?? technicianLocations[0].technicianUserId;
    const readiness = getMockServiceOrderDispatchReadiness(quote.serviceOrderId, technicianUserId);
    const canDispatch = readiness?.status !== "blocked";

    return {
      quoteId: quote.id,
      quoteNumber: quote.number,
      serviceOrderId: quote.serviceOrderId,
      customer: quote.customer,
      total: quote.total,
      priority: recommendation?.priority ?? "normal",
      status: canDispatch ? "ready_for_dispatch" : "needs_preparation",
      canDispatch,
      recommendedTechnician: recommendation?.recommendedTechnician,
      route: readiness?.route,
      readinessStatus: readiness?.status ?? "blocked",
      blockers: readiness?.checks.filter((check) => check.status === "blocked") ?? [],
      attention: readiness?.checks.filter((check) => check.status === "attention") ?? [],
      dispatchPackage: {
        readinessEndpoint: `/dispatch/service-orders/${quote.serviceOrderId}/readiness?technicianUserId=${technicianUserId}`,
        visitPreparationEndpoint: "/dispatch/visit-preparation",
        mobileAckSource: "mobile_offline_quote_execution_readiness",
      },
      nextActions: canDispatch
        ? [
            "Enviar pacote para o app do tecnico.",
            "Confirmar janela com o cliente.",
            "Registrar saida e rota otimizada.",
          ]
        : [
            "Resolver bloqueios antes de deslocar tecnico.",
            "Manter orcamento fora da execucao ate preparo.",
            "Acionar gestor se houver urgencia comercial.",
          ],
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    strategy: "approved_quote_readiness_then_dispatch_score",
    summary: {
      approvedQuotes: approvedQuotes.length,
      readyForDispatch: data.filter((item) => item.canDispatch).length,
      needsPreparation: data.filter((item) => !item.canDispatch).length,
      techniciansEvaluated: recommendations.summary.techniciansEvaluated,
    },
    governance: {
      requiresCustomerApproval: true,
      requiresReadinessBeforeDispatch: true,
      auditEvent: "dispatch.quote_execution_queue_viewed",
      blocksUnapprovedQuotes: true,
    },
    data,
  };
}

export function createMockDispatchAssignmentDecision(input: DispatchAssignmentDecisionInput) {
  const queue = createMockQuoteExecutionDispatchQueue();
  const assignment = queue.data.find((item) => item.quoteId === input.quoteId && item.serviceOrderId === input.serviceOrderId);
  const recommendations = recommendMockDispatchAssignments({ serviceOrderIds: [input.serviceOrderId] });
  const recommendation = recommendations.data[0];
  const selectedTechnician = technicianLocations.find((item) => item.technicianUserId === input.technicianUserId);
  const alternatives = recommendation?.alternatives.filter((item) => item.technicianUserId !== input.technicianUserId) ?? [];
  const accepted = input.decision === "accepted";
  const needsSupport = input.decision === "needs_support";
  const rejected = input.decision === "rejected";
  const replacement = rejected ? alternatives[0] : null;

  if (!assignment) {
    return null;
  }

  return {
    quoteId: input.quoteId,
    serviceOrderId: input.serviceOrderId,
    technicianUserId: input.technicianUserId,
    technician: selectedTechnician?.technician ?? input.technicianUserId,
    decision: input.decision,
    status: accepted ? "assignment_confirmed" : needsSupport ? "assignment_needs_manager_support" : "assignment_reassignment_required",
    accepted,
    reason: input.reason ?? null,
    assignment,
    dispatchImpact: {
      keepAssignedTechnician: accepted || needsSupport,
      canStartRoute: accepted && assignment.canDispatch,
      requiresManagerReview: needsSupport || rejected || !assignment.canDispatch,
      requiresCustomerNotice: accepted,
    },
    reassignment: replacement
      ? {
          recommendedTechnician: replacement,
          reason: "Tecnico recusou ou ficou indisponivel; usar melhor alternativa por score e tempo estimado.",
          routeEndpoint: `/dispatch/routes/optimize`,
          readinessEndpoint: `/dispatch/service-orders/${input.serviceOrderId}/readiness?technicianUserId=${replacement.technicianUserId}`,
        }
      : null,
    audit: {
      event: "dispatch.assignment_decision_recorded",
      entity: "service_order",
      entityId: input.serviceOrderId,
      idempotencyKey: `dispatch:${input.serviceOrderId}:${input.technicianUserId}:${input.decision}`,
    },
    nextActions: accepted
      ? [
          "Registrar aceite do tecnico.",
          "Enviar aviso de deslocamento ao cliente.",
          "Iniciar acompanhamento de rota e check-in.",
        ]
      : needsSupport
        ? [
            "Gestor deve revisar motivo informado pelo tecnico.",
            "Manter OS aguardando suporte sem perder a atribuicao.",
            "Atualizar cliente se houver impacto na janela.",
          ]
        : [
            "Acionar tecnico alternativo recomendado.",
            "Recalcular rota e prontidao.",
            "Registrar motivo da recusa para auditoria operacional.",
          ],
  };
}

export function createMockDispatchDepartureCommunicationPackage(input: {
  serviceOrderId: string;
  technicianUserId?: string;
  quoteId?: string;
}) {
  const order = serviceOrders.find((item) => item.id === input.serviceOrderId);
  const technician = technicianLocations.find((item) => item.technicianUserId === input.technicianUserId) ?? technicianLocations[0];
  const readiness = getMockServiceOrderDispatchReadiness(input.serviceOrderId, technician.technicianUserId);
  const quote = input.quoteId ? quotes.find((item) => item.id === input.quoteId) : quotes.find((item) => item.serviceOrderId === input.serviceOrderId);

  if (!order || !readiness) {
    return null;
  }

  const canNotifyCustomer = readiness.status !== "blocked";
  const etaText = `${readiness.route.totalTravelMinutes} min`;
  const trackingUrl = `https://app.icemax.local/acompanhamento/${input.serviceOrderId}`;

  return {
    serviceOrderId: order.id,
    quoteId: quote?.id ?? null,
    customer: order.customer,
    technician: {
      technicianUserId: technician.technicianUserId,
      name: technician.technician,
      status: technician.status,
    },
    status: canNotifyCustomer ? "departure_communication_ready" : "departure_communication_blocked",
    canNotifyCustomer,
    eta: {
      travelMinutes: readiness.route.totalTravelMinutes,
      totalDistanceKm: readiness.route.totalDistanceKm,
      label: etaText,
    },
    channels: [
      {
        channel: "whatsapp",
        allowed: canNotifyCustomer,
        template: "dispatch_departure_whatsapp",
        preview: `Ola, ${order.customer}. O tecnico ${technician.technician} esta a caminho para a OS ${order.id}. Previsao aproximada: ${etaText}. Acompanhe: ${trackingUrl}`,
      },
      {
        channel: "email",
        allowed: canNotifyCustomer,
        template: "dispatch_departure_email",
        subject: `Tecnico a caminho - OS ${order.id}`,
        preview: `Confirmamos que ${technician.technician} esta em deslocamento para atendimento. Previsao aproximada: ${etaText}. Link de acompanhamento: ${trackingUrl}`,
      },
      {
        channel: "internal",
        allowed: true,
        template: "dispatch_departure_internal",
        preview: `OS ${order.id} liberada para deslocamento com ${technician.technician}. Status de prontidao: ${readiness.status}.`,
      },
    ],
    privacy: {
      hidesInternalMargin: true,
      hidesTechnicianPersonalPhone: true,
      hidesExactLocationUntilDeparture: true,
      customerCopyOptional: true,
    },
    preflight: {
      readinessStatus: readiness.status,
      requiresManagerApproval: readiness.status === "attention" || order.priority === "emergency",
      blocksWhenReadinessBlocked: true,
      optInRequiredForWhatsapp: true,
    },
    audit: {
      event: "dispatch.departure_communication_prepared",
      entity: "service_order",
      entityId: order.id,
      idempotencyKey: `dispatch:${order.id}:${technician.technicianUserId}:departure-communication`,
    },
    nextActions: canNotifyCustomer
      ? [
          "Confirmar aceite do tecnico antes do envio real.",
          "Enviar aviso ao cliente pelo canal autorizado.",
          "Iniciar rastreamento operacional ate o check-in.",
        ]
      : [
          "Resolver bloqueios de prontidao antes de avisar o cliente.",
          "Manter comunicacao somente interna.",
          "Reavaliar tecnico e rota apos correcao.",
        ],
  };
}

export function createMockDispatchRouteTrackingSnapshot(input: {
  serviceOrderId: string;
  technicianUserId?: string;
  quoteId?: string;
}) {
  const order = serviceOrders.find((item) => item.id === input.serviceOrderId);
  const technician = technicianLocations.find((item) => item.technicianUserId === input.technicianUserId) ?? technicianLocations[0];
  const stop = serviceOrderStops.find((item) => item.serviceOrderId === input.serviceOrderId);
  const readiness = getMockServiceOrderDispatchReadiness(input.serviceOrderId, technician.technicianUserId);
  const communication = createMockDispatchDepartureCommunicationPackage(input);

  if (!order || !stop || !readiness || !communication) {
    return null;
  }

  const remainingDistanceKm = Number(distanceKm(technician, stop).toFixed(2));
  const delayed = readiness.route.totalTravelMinutes > 30;
  const requiresAttention = delayed || readiness.status === "attention" || order.priority === "emergency";

  return {
    serviceOrderId: order.id,
    quoteId: input.quoteId ?? communication.quoteId,
    customer: order.customer,
    status: delayed ? "route_attention" : "route_on_time",
    technician: communication.technician,
    currentLocation: {
      latitude: technician.latitude,
      longitude: technician.longitude,
      capturedAt: technician.capturedAt,
      accuracy: "mock",
    },
    destination: {
      latitude: stop.latitude,
      longitude: stop.longitude,
      customer: stop.customer,
    },
    eta: {
      remainingMinutes: readiness.route.totalTravelMinutes,
      remainingDistanceKm,
      label: `${readiness.route.totalTravelMinutes} min`,
      delayed,
    },
    timeline: [
      { key: "assignment_accepted", label: "Tecnico aceitou", status: "done" },
      { key: "customer_notified", label: "Cliente avisado", status: communication.canNotifyCustomer ? "ready" : "blocked" },
      { key: "departure_started", label: "Saida registrada", status: "in_progress" },
      { key: "arrival_checkin", label: "Check-in no cliente", status: "pending" },
    ],
    alerts: [
      ...(delayed ? ["ETA acima do limite desejado; avisar cliente se a janela mudar."] : []),
      ...(readiness.status === "attention" ? ["Prontidao com atencao; gestor deve acompanhar deslocamento."] : []),
      ...(order.priority === "emergency" ? ["OS emergencial exige monitoramento ate chegada."] : []),
    ],
    managerActions: requiresAttention
      ? [
          "Acompanhar posicao ate o check-in.",
          "Atualizar cliente se houver atraso.",
          "Manter tecnico alternativo em observacao.",
        ]
      : [
          "Monitorar check-in.",
          "Manter cliente informado apenas se a previsao mudar.",
        ],
    governance: {
      auditEvent: "dispatch.route_tracking_viewed",
      exposesCustomerSafeLocation: true,
      hidesTechnicianPersonalPhone: true,
      requiresLocationConsent: true,
      mockUntilMapsProviderConfigured: true,
    },
  };
}

export function createMockDispatchArrivalCheckInPackage(input: {
  serviceOrderId: string;
  technicianUserId?: string;
  quoteId?: string;
}) {
  const tracking = createMockDispatchRouteTrackingSnapshot(input);
  const order = serviceOrders.find((item) => item.id === input.serviceOrderId);
  const technician = technicianLocations.find((item) => item.technicianUserId === input.technicianUserId) ?? technicianLocations[0];
  const stop = serviceOrderStops.find((item) => item.serviceOrderId === input.serviceOrderId);

  if (!tracking || !order || !stop) {
    return null;
  }

  const distanceToCustomerKm = Number(distanceKm(technician, stop).toFixed(2));
  const withinCheckInRadius = distanceToCustomerKm <= 0.3;
  const canCheckIn = withinCheckInRadius || tracking.eta.remainingMinutes <= 5;

  return {
    serviceOrderId: order.id,
    quoteId: input.quoteId ?? tracking.quoteId,
    customer: order.customer,
    technician: tracking.technician,
    status: canCheckIn ? "arrival_checkin_ready" : "arrival_checkin_waiting_route",
    canCheckIn,
    validation: {
      distanceToCustomerKm,
      acceptedRadiusKm: 0.3,
      etaMinutes: tracking.eta.remainingMinutes,
      locationSource: "mock_mobile_location",
    },
    checklistGate: [
      { key: "gps_position", label: "Posicao do tecnico", status: canCheckIn ? "ok" : "attention" },
      { key: "customer_site", label: "Local do cliente", status: canCheckIn ? "ok" : "pending" },
      { key: "photos_before", label: "Fotos antes da intervencao", status: "pending" },
      { key: "safety", label: "Seguranca antes da abertura do equipamento", status: "pending" },
      { key: "scope", label: "Escopo aprovado conferido", status: input.quoteId ? "ok" : "attention" },
    ],
    mobileActions: [
      "Registrar check-in com localizacao.",
      "Capturar foto inicial do equipamento.",
      "Conferir QR Code ou identificacao do equipamento.",
      "Abrir checklist tecnico antes de intervir.",
    ],
    managerVisibility: {
      notifyArrival: canCheckIn,
      keepTrackingOpen: !canCheckIn,
      customerCanSeeArrival: canCheckIn,
      requiresManualOverride: !canCheckIn,
    },
    audit: {
      event: "dispatch.arrival_checkin_package_prepared",
      entity: "service_order",
      entityId: order.id,
      idempotencyKey: `dispatch:${order.id}:${tracking.technician.technicianUserId}:arrival-checkin`,
    },
    nextActions: canCheckIn
      ? [
          "Liberar check-in no app do tecnico.",
          "Abrir checklist da OS.",
          "Manter rastreio ate o inicio da execucao.",
        ]
      : [
          "Aguardar aproximacao do tecnico.",
          "Permitir override do gestor somente com justificativa.",
          "Manter cliente informado se houver atraso.",
        ],
  };
}

export function createMockFieldExecutionStartPackage(input: {
  serviceOrderId: string;
  technicianUserId?: string;
  quoteId?: string;
}) {
  const arrival = createMockDispatchArrivalCheckInPackage(input);
  const order = serviceOrders.find((item) => item.id === input.serviceOrderId);
  const quote = input.quoteId ? quotes.find((item) => item.id === input.quoteId) : quotes.find((item) => item.serviceOrderId === input.serviceOrderId);

  if (!arrival || !order) {
    return null;
  }

  const requiredEvidence = [
    { key: "checkin_location", label: "Check-in com localizacao", status: arrival.canCheckIn ? "ready" : "blocked" },
    { key: "equipment_identity", label: "Equipamento conferido por QR Code ou placa", status: "pending" },
    { key: "before_photo", label: "Foto inicial do equipamento", status: "pending" },
    { key: "approved_scope", label: "Escopo aprovado conferido", status: quote ? "ready" : "attention" },
    { key: "safety_orientation", label: "Orientacao de seguranca revisada", status: "pending" },
  ];
  const blockers = requiredEvidence.filter((item) => item.status === "blocked");

  return {
    serviceOrderId: order.id,
    quoteId: quote?.id ?? null,
    customer: order.customer,
    equipment: order.equipment,
    technician: arrival.technician,
    status: blockers.length ? "execution_start_blocked" : "execution_start_ready",
    canStartExecution: blockers.length === 0,
    arrival,
    requiredEvidence,
    checklistStart: {
      template: order.issue.toLowerCase().includes("dreno") ? "corretiva_dreno" : "hvac_initial_diagnosis",
      requiredBeforeIntervention: true,
      firstItems: [
        "Confirmar equipamento e ambiente atendido.",
        "Registrar foto antes da intervencao.",
        "Desenergizar equipamento quando aplicavel.",
        "Validar escopo aprovado com responsavel no local.",
      ],
    },
    technicianScript: [
      "Confirmar com o responsavel que a equipe chegou.",
      "Explicar que a avaliacao inicial sera registrada com fotos.",
      "Nao executar itens fora do escopo sem nova autorizacao.",
    ],
    managerVisibility: {
      notifyExecutionStarted: blockers.length === 0,
      requiresOverride: blockers.length > 0,
      auditBeforeIntervention: true,
    },
    audit: {
      event: "field.execution_start_package_prepared",
      entity: "service_order",
      entityId: order.id,
      idempotencyKey: `field:${order.id}:${arrival.technician.technicianUserId}:execution-start`,
    },
    nextActions: blockers.length
      ? [
          "Resolver bloqueios antes de iniciar execucao.",
          "Permitir override gerencial somente com justificativa.",
          "Manter OS em check-in aguardando liberacao.",
        ]
      : [
          "Liberar checklist tecnico.",
          "Registrar evidencias obrigatorias.",
          "Iniciar atendimento com escopo aprovado.",
        ],
  };
}

function requiredPartsForIssue(issue: string) {
  const normalized = issue.toLowerCase();

  if (normalized.includes("dreno") || normalized.includes("vazando")) {
    return ["BD-001"];
  }

  if (normalized.includes("refrigeracao") || normalized.includes("gela") || normalized.includes("gas")) {
    return ["R410A", "CAP-45"];
  }

  return ["CAP-45"];
}

export function getMockServiceOrderDispatchReadiness(serviceOrderId: string, technicianUserId?: string) {
  const order = serviceOrders.find((item) => item.id === serviceOrderId);
  const stop = serviceOrderStops.find((item) => item.serviceOrderId === serviceOrderId);
  const technician = technicianLocations.find((item) => item.technicianUserId === technicianUserId) ?? technicianLocations[0];

  if (!order || !stop) {
    return null;
  }

  const route = optimizeMockRoute({
    technicianUserId: technician.technicianUserId,
    serviceOrderIds: [serviceOrderId],
  });
  const requiredSkus = requiredPartsForIssue(order.issue);
  const parts = requiredSkus.map((sku) => {
    const item = stock.find((stockItem) => stockItem.sku === sku);
    const available = item ? item.quantity > 0 : false;

    return {
      sku,
      name: item?.name ?? "Peca nao cadastrada",
      available,
      quantity: item?.quantity ?? 0,
      location: item?.location ?? "Nao localizado",
      belowMinimum: item ? item.quantity <= item.minimum : true,
    };
  });

  const checks = [
    {
      key: "technician_location",
      label: "Localizacao do tecnico",
      status: technician ? "ok" : "blocked",
      detail: technician ? `${technician.technician} com posicao recente.` : "Tecnico sem localizacao.",
    },
    {
      key: "route",
      label: "Deslocamento",
      status: route.totalTravelMinutes <= 35 ? "ok" : "attention",
      detail: `${route.totalTravelMinutes} minutos estimados ate o cliente.`,
    },
    {
      key: "parts",
      label: "Pecas provaveis",
      status: parts.every((part) => part.available) ? "ok" : "blocked",
      detail: parts.every((part) => part.available) ? "Pecas provaveis disponiveis." : "Ha peca provavel indisponivel.",
    },
    {
      key: "manual",
      label: "Manual tecnico",
      status: "ok",
      detail: "Consultar manual do equipamento no app antes da execucao.",
    },
    {
      key: "customer_context",
      label: "Historico do cliente",
      status: order.priority === "emergency" ? "attention" : "ok",
      detail: order.priority === "emergency" ? "Atendimento urgente; revisar historico antes de concluir." : "Sem alerta critico de historico.",
    },
  ];
  const blocked = checks.filter((check) => check.status === "blocked").length;
  const attention = checks.filter((check) => check.status === "attention").length;

  return {
    serviceOrderId,
    customer: order.customer,
    issue: order.issue,
    technician: {
      technicianUserId: technician.technicianUserId,
      name: technician.technician,
      status: technician.status,
    },
    route: {
      totalTravelMinutes: route.totalTravelMinutes,
      totalDistanceKm: route.totalDistanceKm,
    },
    parts,
    checks,
    status: blocked > 0 ? "blocked" : attention > 0 ? "attention" : "ready",
    recommendation: blocked > 0
      ? "Separar pecas ou trocar tecnico antes do deslocamento."
      : attention > 0
        ? "Liberar com acompanhamento do gestor."
        : "Liberado para despacho.",
  };
}

export function createMockVisitPreparationPackage(input: DispatchVisitPreparationInput) {
  const order = serviceOrders.find((item) => item.id === input.serviceOrderId);
  const readiness = getMockServiceOrderDispatchReadiness(input.serviceOrderId, input.technicianUserId);

  if (!order || !readiness) {
    return null;
  }

  const diagnosis = input.includeVisualDiagnosis
    ? createVisualDiagnosisPackage({
      serviceOrderId: order.id,
      equipmentType: order.equipment,
      description: order.issue,
      photoHints: input.includeCustomerPortalEvidence
        ? ["foto do cliente indica sintoma principal", "anexos pendentes de conferencia no painel"]
        : [],
      symptoms: [order.priority, order.status],
    })
    : null;
  const blockedChecks = readiness.checks.filter((item) => item.status === "blocked");
  const attentionChecks = readiness.checks.filter((item) => item.status === "attention");
  const canDispatch = blockedChecks.length === 0;

  return {
    serviceOrderId: order.id,
    status: canDispatch ? "ready_for_dispatch" : "needs_preparation",
    customer: order.customer,
    equipment: order.equipment,
    issue: order.issue,
    priority: order.priority,
    technician: readiness.technician,
    route: readiness.route,
    readinessStatus: readiness.status,
    dispatchDecision: {
      canDispatch,
      requiresManagerApproval: attentionChecks.length > 0 || order.priority === "emergency",
      reason: canDispatch
        ? "Visita preparada com recursos minimos para deslocamento."
        : "Existem bloqueios antes de liberar o tecnico.",
    },
    preparationChecklist: [
      {
        key: "parts",
        label: "Separar pecas provaveis",
        status: readiness.parts.every((part) => part.available) ? "done" : "blocked",
        detail: readiness.parts.map((part) => `${part.sku} - ${part.quantity} em ${part.location}`).join("; "),
      },
      {
        key: "manual",
        label: "Conferir manual no app",
        status: "pending",
        detail: "Tecnico deve abrir manual antes da execucao e registrar divergencias.",
      },
      {
        key: "diagnosis",
        label: "Revisar diagnostico assistido",
        status: diagnosis ? "done" : "pending",
        detail: diagnosis ? diagnosis.likelyCauses.map((item) => item.cause).join("; ") : "Diagnostico visual nao solicitado.",
      },
      {
        key: "customer_access",
        label: "Confirmar acesso com cliente",
        status: order.priority === "emergency" ? "attention" : "pending",
        detail: order.priority === "emergency" ? "Confirmar acesso imediato antes do deslocamento." : "Confirmar janela e responsavel no local.",
      },
      {
        key: "safety",
        label: "Orientacao de seguranca",
        status: diagnosis?.riskFlags.includes("risco_eletrico") ? "attention" : "done",
        detail: diagnosis?.safetyGuidance ?? "Sem alerta critico preliminar.",
      },
    ],
    partsToLoad: readiness.parts,
    diagnosis,
    managerNotes: [
      canDispatch ? "Despacho pode ser liberado pelo operador." : "Resolver bloqueios de pecas antes de enviar tecnico.",
      order.priority === "emergency" ? "Prioridade emergencial exige acompanhamento do gestor." : "Prioridade sem regra especial de emergencia.",
      "Registrar fotos, pecas usadas e relatorio revisado antes de concluir a OS.",
    ],
    nextActions: [
      "Enviar pacote para o app mobile do tecnico.",
      "Gerar comunicacao de saida para o cliente.",
      "Reservar pecas provaveis no estoque quando banco real estiver ativo.",
      "Recalcular rota se houver mudanca de agenda.",
    ],
  };
}
