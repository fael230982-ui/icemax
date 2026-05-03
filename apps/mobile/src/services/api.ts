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

export function createCheckInAction(serviceOrderId: string) {
  return {
    id: `offline-${Date.now()}`,
    label: `Check-in OS ${serviceOrderId}`,
    method: "PATCH",
    path: `/service-orders/${serviceOrderId}/status`,
    payload: { status: "in_progress" },
    createdAt: new Date().toISOString(),
  } satisfies OfflineAction;
}
