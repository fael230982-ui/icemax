import { customers, quotes, serviceOrders, serviceOrderStops, stock, technicianLocations, tenant } from "../mock-data";
import type { DispatchAssignmentDecisionInput, DispatchVisitPreparationInput, FieldCompletionEmailQueueInput, FieldCustomerSignatureRecordInput, OptimizeRouteInput, TechnicianLocationInput } from "../schemas";
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

export function createMockFieldExecutionEvidencePackage(input: {
  serviceOrderId: string;
  technicianUserId?: string;
  quoteId?: string;
}) {
  const executionStart = createMockFieldExecutionStartPackage(input);
  const order = serviceOrders.find((item) => item.id === input.serviceOrderId);
  const requiredSkus = order ? requiredPartsForIssue(order.issue) : [];

  if (!executionStart || !order) {
    return null;
  }

  const evidenceItems = [
    { key: "photo_before", label: "Foto antes", type: "photo", required: true, status: "pending" },
    { key: "photo_during", label: "Foto durante", type: "photo", required: true, status: "pending" },
    { key: "photo_after", label: "Foto depois", type: "photo", required: true, status: "pending" },
    { key: "measurements", label: "Medicoes tecnicas", type: "measurement", required: true, status: "pending" },
    { key: "parts_usage", label: "Pecas usadas", type: "stock", required: requiredSkus.length > 0, status: requiredSkus.length ? "pending" : "not_required" },
    { key: "customer_observation", label: "Observacao do responsavel", type: "text", required: false, status: "optional" },
  ];

  return {
    serviceOrderId: order.id,
    quoteId: input.quoteId ?? executionStart.quoteId,
    customer: order.customer,
    equipment: order.equipment,
    technician: executionStart.technician,
    status: executionStart.canStartExecution ? "evidence_collection_ready" : "evidence_collection_blocked",
    canCollectEvidence: executionStart.canStartExecution,
    executionStart,
    evidenceItems,
    measurementPlan: [
      { key: "ambient_temperature", label: "Temperatura ambiente", unit: "C", required: true },
      { key: "supply_air_temperature", label: "Temperatura de insuflamento", unit: "C", required: true },
      { key: "electrical_current", label: "Corrente eletrica", unit: "A", required: false },
      { key: "drain_flow", label: "Fluxo do dreno", unit: "visual", required: order.issue.toLowerCase().includes("dreno") },
    ],
    stockUsagePlan: requiredSkus.map((sku) => {
      const item = stock.find((stockItem) => stockItem.sku === sku);

      return {
        sku,
        name: item?.name ?? "Peca provavel",
        suggestedQuantity: 1,
        location: item?.location ?? "Nao localizado",
        requiresConfirmation: true,
      };
    }),
    qualityGate: {
      blocksCompletionWithoutRequiredPhotos: true,
      blocksCompletionWithoutMeasurements: true,
      requiresPartUsageConfirmation: requiredSkus.length > 0,
      requiresProfessionalReportDraft: true,
    },
    audit: {
      event: "field.execution_evidence_package_prepared",
      entity: "service_order",
      entityId: order.id,
      idempotencyKey: `field:${order.id}:${executionStart.technician.technicianUserId}:execution-evidence`,
    },
    nextActions: executionStart.canStartExecution
      ? [
          "Coletar fotos obrigatorias.",
          "Registrar medicoes tecnicas.",
          "Confirmar uso de pecas e atualizar estoque.",
          "Preparar texto tecnico para revisao por IA.",
        ]
      : [
          "Resolver bloqueios de inicio de execucao.",
          "Nao permitir conclusao da OS.",
          "Acionar gestor para liberar override se necessario.",
      ],
  };
}

export function createMockFieldExecutionCloseoutPackage(input: {
  serviceOrderId: string;
  technicianUserId?: string;
  quoteId?: string;
}) {
  const evidence = createMockFieldExecutionEvidencePackage(input);
  const order = serviceOrders.find((item) => item.id === input.serviceOrderId);

  if (!evidence || !order) {
    return null;
  }

  const requiredPending = evidence.evidenceItems.filter((item) => item.required && item.status === "pending");
  const stockNeedsConfirmation = evidence.stockUsagePlan.length > 0;
  const blockers = [
    ...requiredPending.map((item) => ({
      key: item.key,
      label: item.label,
      reason: "Evidencia obrigatoria ainda pendente no pacote de campo.",
    })),
    ...(stockNeedsConfirmation
      ? [{
          key: "stock_usage_confirmation",
          label: "Confirmacao de pecas",
          reason: "Baixa de estoque precisa ser confirmada antes da conclusao.",
        }]
      : []),
  ];
  const professionalReportDraft = [
    `Atendimento tecnico realizado para ${order.customer} no equipamento ${order.equipment}.`,
    `Foram previstas evidencias fotograficas, medicoes operacionais e validacao do escopo aprovado.`,
    stockNeedsConfirmation
      ? "O tecnico deve confirmar as pecas utilizadas para atualizar o estoque e compor o relatorio final."
      : "Nao ha peca obrigatoria prevista para baixa neste atendimento.",
    "A conclusao deve ser assinada pelo responsavel apos revisao do relatorio e anexos.",
  ].join(" ");

  return {
    serviceOrderId: order.id,
    quoteId: evidence.quoteId,
    customer: order.customer,
    equipment: order.equipment,
    technician: evidence.technician,
    status: blockers.length ? "field_closeout_blocked" : "field_closeout_ready",
    canRequestCustomerSignature: blockers.length === 0,
    evidence,
    blockers,
    completionChecklist: [
      { key: "required_photos", label: "Fotos obrigatorias anexadas", status: blockers.some((item) => item.key.includes("photo")) ? "blocked" : "ready" },
      { key: "technical_measurements", label: "Medicoes tecnicas registradas", status: blockers.some((item) => item.key === "measurements") ? "blocked" : "ready" },
      { key: "stock_usage", label: "Pecas conferidas e baixadas", status: stockNeedsConfirmation ? "attention" : "ready" },
      { key: "professional_report", label: "Relatorio tecnico revisado", status: "draft_ready" },
      { key: "customer_signature", label: "Assinatura do cliente", status: blockers.length ? "locked" : "ready" },
    ],
    reportDraft: {
      source: "local_professional_report_draft",
      requiresAiReview: true,
      text: professionalReportDraft,
      recommendedTone: "profissional, claro e sem termos informais",
    },
    customerSignatureGate: {
      requiresResponsibleName: true,
      requiresDocumentOrRole: true,
      requiresEmailCopyDecision: true,
      emailCopyOptional: true,
      lockedUntilBlockersResolved: blockers.length > 0,
    },
    audit: {
      event: "field.execution_closeout_package_prepared",
      entity: "service_order",
      entityId: order.id,
      idempotencyKey: `field:${order.id}:${evidence.technician.technicianUserId}:execution-closeout`,
    },
    nextActions: blockers.length
      ? [
          "Concluir evidencias obrigatorias antes de solicitar assinatura.",
          "Confirmar uso de pecas e baixa no estoque.",
          "Revisar o texto tecnico antes de apresentar ao cliente.",
        ]
      : [
          "Enviar relatorio para revisao final.",
          "Solicitar assinatura do responsavel.",
          "Preparar e-mail de conclusao para empresa e cliente.",
      ],
  };
}

export function createMockFieldCustomerSignaturePackage(input: {
  serviceOrderId: string;
  technicianUserId?: string;
  quoteId?: string;
}) {
  const closeout = createMockFieldExecutionCloseoutPackage(input);
  const order = serviceOrders.find((item) => item.id === input.serviceOrderId);

  if (!closeout || !order) {
    return null;
  }

  const locked = !closeout.canRequestCustomerSignature;

  return {
    serviceOrderId: order.id,
    quoteId: closeout.quoteId,
    customer: order.customer,
    equipment: order.equipment,
    technician: closeout.technician,
    status: locked ? "customer_signature_locked" : "customer_signature_ready",
    canCaptureSignature: !locked,
    closeout,
    signatureDocument: {
      title: `Aceite tecnico da OS ${order.id}`,
      version: "2026.05",
      language: "pt-BR",
      terms: [
        "Declaro que acompanhei ou fui informado sobre o atendimento tecnico realizado.",
        "Recebi a explicacao do relatorio tecnico, evidencias registradas e eventuais recomendacoes.",
        "Estou ciente de que garantias e exclusoes dependem do termo emitido pela empresa.",
        "Autorizo o encerramento operacional desta ordem de servico conforme registros apresentados.",
      ],
    },
    captureFields: [
      { key: "responsibleName", label: "Nome do responsavel", required: true, type: "text" },
      { key: "responsibleRole", label: "Cargo ou relacao com o cliente", required: true, type: "text" },
      { key: "responsibleDocument", label: "Documento", required: false, type: "text" },
      { key: "signatureImage", label: "Assinatura digital", required: true, type: "signature" },
      { key: "emailCopyToCustomer", label: "Enviar copia ao cliente", required: false, type: "boolean" },
    ],
    emailDecision: {
      companyRecipientSource: "tenant.operationsCompletionEmail",
      customerCopyOptional: true,
      defaultCustomerCopy: true,
      allowedChannels: ["email", "internal_queue"],
    },
    privacy: {
      requiresConsentTextVisible: true,
      storesSignatureAsProtectedFile: true,
      auditRetention: "conforme politica da empresa",
    },
    blockers: closeout.blockers,
    audit: {
      event: "field.customer_signature_package_prepared",
      entity: "service_order",
      entityId: order.id,
      idempotencyKey: `field:${order.id}:${closeout.technician.technicianUserId}:customer-signature`,
    },
    nextActions: locked
      ? [
          "Resolver bloqueios do fechamento antes de coletar assinatura.",
          "Manter assinatura indisponivel no app.",
          "Registrar justificativa se houver tentativa de override.",
        ]
      : [
          "Apresentar termos ao responsavel.",
          "Coletar assinatura digital e identificacao.",
          "Registrar decisao de copia por e-mail ao cliente.",
      ],
  };
}

export function createMockFieldCompletionEmailPackage(input: {
  serviceOrderId: string;
  technicianUserId?: string;
  quoteId?: string;
  emailCopyToCustomer?: boolean;
}) {
  const signature = createMockFieldCustomerSignaturePackage(input);
  const order = serviceOrders.find((item) => item.id === input.serviceOrderId);
  const customer = order ? customers.find((item) => item.name === order.customer) : null;

  if (!signature || !order) {
    return null;
  }

  const copyToCustomer = input.emailCopyToCustomer ?? signature.emailDecision.defaultCustomerCopy;
  const signatureCaptured = false;
  const blockedReasons = [
    ...(signature.canCaptureSignature && !signatureCaptured ? ["assinatura digital ainda nao capturada"] : []),
    ...(!signature.canCaptureSignature ? ["pacote de assinatura bloqueado pelo fechamento tecnico"] : []),
    ...(copyToCustomer && !customer?.email ? ["cliente sem e-mail cadastrado para copia"] : []),
  ];

  return {
    serviceOrderId: order.id,
    quoteId: signature.quoteId,
    customer: order.customer,
    equipment: order.equipment,
    technician: signature.technician,
    status: blockedReasons.length ? "completion_email_blocked" : "completion_email_ready",
    canQueueEmail: blockedReasons.length === 0,
    signature,
    recipients: {
      company: tenant.supportEmail,
      customerCopy: copyToCustomer ? customer?.email ?? null : null,
      copyToCustomer,
    },
    subject: `OS ${order.id} concluida - ${order.customer}`,
    bodyPreview: [
      `Ola, segue o fechamento tecnico da OS ${order.id}.`,
      `Cliente: ${order.customer}. Equipamento: ${order.equipment}.`,
      `Resumo tecnico: ${signature.closeout.reportDraft.text}`,
      "Anexos previstos: relatorio tecnico, evidencias de campo, assinatura digital e termo de garantia quando aplicavel.",
    ].join("\n\n"),
    attachments: [
      { key: "technical_report", label: "Relatorio tecnico", required: true, status: "pending_generation" },
      { key: "field_evidences", label: "Evidencias de campo", required: true, status: "pending_package" },
      { key: "customer_signature", label: "Assinatura digital", required: true, status: signatureCaptured ? "ready" : "pending_signature" },
      { key: "warranty_terms", label: "Termo de garantia", required: false, status: "recommended" },
    ],
    deliveryPolicy: {
      sendAfterCustomerSignature: true,
      companyEmailConfiguredByTenant: true,
      customerCopyOptional: true,
      requiresAuditEvent: true,
      canRetry: true,
    },
    blockers: blockedReasons,
    audit: {
      event: "field.completion_email_package_prepared",
      entity: "service_order",
      entityId: order.id,
      idempotencyKey: `field:${order.id}:${signature.technician.technicianUserId}:completion-email`,
    },
    nextActions: blockedReasons.length
      ? [
          "Capturar assinatura digital do cliente.",
          "Resolver bloqueios do fechamento tecnico.",
          "Confirmar se o cliente recebera copia por e-mail.",
        ]
      : [
          "Enfileirar envio para e-mail da empresa.",
          "Anexar relatorio, evidencias e assinatura.",
          "Registrar auditoria do envio e status de entrega.",
      ],
  };
}

export function recordMockFieldCustomerSignature(serviceOrderId: string, input: FieldCustomerSignatureRecordInput) {
  const signature = createMockFieldCustomerSignaturePackage({
    serviceOrderId,
    technicianUserId: input.technicianUserId,
    quoteId: input.quoteId,
  });
  const order = serviceOrders.find((item) => item.id === serviceOrderId);

  if (!signature || !order) {
    return null;
  }

  const accepted = input.acceptedTerms && Boolean(input.responsibleName);

  return {
    id: `sig-${serviceOrderId}-${Date.now()}`,
    serviceOrderId,
    quoteId: input.quoteId ?? signature.quoteId,
    customer: order.customer,
    equipment: order.equipment,
    technician: signature.technician,
    status: signature.canCaptureSignature && accepted ? "customer_signature_recorded" : "customer_signature_needs_review",
    canCompleteServiceOrder: signature.canCaptureSignature && accepted,
    responsible: {
      name: input.responsibleName,
      role: input.responsibleRole,
      document: input.responsibleDocument ?? null,
    },
    signature: {
      fileUrl: input.signatureFileUrl ?? `https://local.icemax.dev/signatures/${serviceOrderId}-${Date.now()}.png`,
      signedAt: input.signedAt ?? new Date().toISOString(),
      acceptedTerms: input.acceptedTerms,
      storedAsProtectedFile: true,
    },
    emailCopyToCustomer: input.emailCopyToCustomer,
    mobileOfflineId: input.mobileOfflineId ?? null,
    audit: {
      event: "field.customer_signature_recorded",
      entity: "service_order",
      entityId: serviceOrderId,
      idempotencyKey: input.mobileOfflineId ?? `field:${serviceOrderId}:${input.technicianUserId}:signature-recorded`,
    },
    nextActions: [
      "Atualizar status da OS para concluida quando os bloqueios estiverem resolvidos.",
      "Preparar pacote de e-mail final.",
      "Anexar assinatura ao historico da OS e do equipamento.",
    ],
  };
}

export function queueMockFieldCompletionEmail(serviceOrderId: string, input: FieldCompletionEmailQueueInput) {
  const emailPackage = createMockFieldCompletionEmailPackage({
    serviceOrderId,
    technicianUserId: input.technicianUserId,
    quoteId: input.quoteId,
    emailCopyToCustomer: input.emailCopyToCustomer,
  });
  const order = serviceOrders.find((item) => item.id === serviceOrderId);

  if (!emailPackage || !order) {
    return null;
  }

  const companyEmail = input.companyEmail ?? emailPackage.recipients.company;
  const customerEmail = input.emailCopyToCustomer ? input.customerEmail ?? emailPackage.recipients.customerCopy : null;

  return {
    id: `email-${serviceOrderId}-${Date.now()}`,
    serviceOrderId,
    quoteId: input.quoteId ?? emailPackage.quoteId,
    status: "queued_mock",
    channel: "email",
    recipients: {
      company: companyEmail,
      customerCopy: customerEmail,
      copyToCustomer: input.emailCopyToCustomer,
    },
    subject: emailPackage.subject,
    bodyPreview: emailPackage.bodyPreview,
    attachments: emailPackage.attachments.map((attachment) => ({
      ...attachment,
      status: attachment.key === "warranty_terms" && !input.includeWarrantyTerms ? "skipped" : attachment.status,
    })),
    provider: {
      configured: false,
      mode: "mock_queue_until_email_provider_key",
      canRetry: true,
    },
    requestedAt: input.requestedAt ?? new Date().toISOString(),
    mobileOfflineId: input.mobileOfflineId ?? null,
    audit: {
      event: "field.completion_email_queued",
      entity: "service_order",
      entityId: serviceOrderId,
      idempotencyKey: input.mobileOfflineId ?? `field:${serviceOrderId}:${input.technicianUserId}:completion-email-queued`,
    },
    nextActions: [
      "Enviar quando o provedor de e-mail estiver configurado.",
      "Registrar status de entrega ou falha.",
      "Disponibilizar comprovante no historico do cliente.",
    ],
  };
}

export function createMockFieldFinalizationBoard() {
  const rows = serviceOrders.map((order) => {
    const technician = technicianLocations.find((item) => item.serviceOrderId === order.id) ?? technicianLocations[1] ?? technicianLocations[0];
    const quote = quotes.find((item) => item.serviceOrderId === order.id);
    const closeout = createMockFieldExecutionCloseoutPackage({
      serviceOrderId: order.id,
      technicianUserId: technician?.technicianUserId,
      quoteId: quote?.id,
    });
    const signature = closeout
      ? createMockFieldCustomerSignaturePackage({
          serviceOrderId: order.id,
          technicianUserId: technician?.technicianUserId,
          quoteId: quote?.id,
        })
      : null;
    const email = signature
      ? createMockFieldCompletionEmailPackage({
          serviceOrderId: order.id,
          technicianUserId: technician?.technicianUserId,
          quoteId: quote?.id,
          emailCopyToCustomer: true,
        })
      : null;
    const blockers = [
      ...(closeout?.blockers.map((item) => item.label) ?? []),
      ...(email?.blockers ?? []),
    ];

    return {
      serviceOrderId: order.id,
      customer: order.customer,
      equipment: order.equipment,
      priority: order.priority,
      technician: technician?.technician ?? order.technician,
      technicianUserId: technician?.technicianUserId ?? null,
      quoteId: quote?.id ?? null,
      status: blockers.length ? "needs_attention" : "ready_to_send",
      closeoutStatus: closeout?.status ?? "not_prepared",
      signatureStatus: signature?.status ?? "not_prepared",
      emailStatus: email?.status ?? "not_prepared",
      blockers,
      nextAction: blockers.length
        ? "Resolver pendencias de fechamento, assinatura ou anexos."
        : "Enfileirar e-mail final e concluir acompanhamento.",
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    status: rows.some((row) => row.status === "needs_attention") ? "attention" : "ready",
    summary: {
      serviceOrders: rows.length,
      needsAttention: rows.filter((row) => row.status === "needs_attention").length,
      readyToSend: rows.filter((row) => row.status === "ready_to_send").length,
      emailProviderConfigured: false,
    },
    governance: {
      requiresCustomerSignature: true,
      requiresFieldEvidence: true,
      requiresEmailAudit: true,
      auditEvent: "field.finalization_board_viewed",
    },
    rows,
  };
}

export function createMockCompletionEmailQueueBoard() {
  const rows = serviceOrders.map((order) => {
    const technician = technicianLocations.find((item) => item.serviceOrderId === order.id) ?? technicianLocations[1] ?? technicianLocations[0];
    const quote = quotes.find((item) => item.serviceOrderId === order.id);
    const email = createMockFieldCompletionEmailPackage({
      serviceOrderId: order.id,
      technicianUserId: technician?.technicianUserId,
      quoteId: quote?.id,
      emailCopyToCustomer: true,
    });
    const blocked = Boolean(email?.blockers.length);

    return {
      serviceOrderId: order.id,
      customer: order.customer,
      equipment: order.equipment,
      technician: technician?.technician ?? order.technician,
      technicianUserId: technician?.technicianUserId ?? null,
      quoteId: quote?.id ?? null,
      subject: email?.subject ?? `OS ${order.id} concluida`,
      status: blocked ? "blocked" : "waiting_provider",
      recipients: email?.recipients ?? {
        company: tenant.supportEmail,
        customerCopy: null,
        copyToCustomer: true,
      },
      blockers: email?.blockers ?? ["pacote de e-mail nao preparado"],
      attachments: email?.attachments ?? [],
      retry: {
        attempts: 0,
        nextAttemptAt: blocked ? null : new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        strategy: "manual_until_email_provider_configured",
      },
      nextAction: blocked
        ? "Resolver assinatura, evidencias ou cadastro de e-mail antes de enviar."
        : "Configurar provedor de e-mail para disparo real e registrar entrega.",
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    provider: {
      configured: false,
      mode: "mock_queue_until_email_provider_key",
      companyRecipient: tenant.supportEmail,
    },
    summary: {
      total: rows.length,
      blocked: rows.filter((row) => row.status === "blocked").length,
      waitingProvider: rows.filter((row) => row.status === "waiting_provider").length,
      customerCopies: rows.filter((row) => row.recipients.copyToCustomer).length,
    },
    governance: {
      auditEvent: "field.completion_email_queue_viewed",
      requiresCustomerSignature: true,
      customerCopyOptional: true,
      providerKeyRequiredForRealSend: true,
    },
    rows,
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
