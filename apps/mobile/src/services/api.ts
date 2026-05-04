const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333";

export type MobileOrder = {
  id: string;
  customer: string;
  status: string;
  detail: string;
  priority: string;
};

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

export type OfflineAction = {
  id: string;
  label: string;
  method: "POST" | "PATCH";
  path: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

function offlineId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createCheckInAction(serviceOrderId: string) {
  return {
    id: offlineId("check-in"),
    label: `Check-in OS ${serviceOrderId}`,
    method: "PATCH",
    path: `/service-orders/${serviceOrderId}/status`,
    payload: { status: "in_progress" },
    createdAt: new Date().toISOString(),
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
