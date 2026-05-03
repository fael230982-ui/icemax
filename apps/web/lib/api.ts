export type ApiListResponse<T> = {
  data: T[];
  total: number;
};

export type DashboardResponse = {
  tenant: {
    id: string;
    name: string;
    supportEmail: string;
    primaryColor: string;
    secondaryColor: string;
  };
  metrics: Array<{
    key: string;
    label: string;
    value: number;
    detail: string;
  }>;
  urgentOrders: unknown[];
  upcomingContractVisits: unknown[];
};

export type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  tenant: {
    id: string;
    name: string;
  };
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type ApiOptions = {
  token?: string;
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "PUT";
};

function withQuery(path: string, query?: Record<string, string | undefined>) {
  if (!query) {
    return path;
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params.size ? `${path}?${params.toString()}` : path;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar API: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const icemaxApi = {
  login: (body: { email: string; password: string; tenantId?: string }) =>
    apiRequest<LoginResponse>("/auth/login", { method: "POST", body }),
  me: (token: string) => apiRequest<unknown>("/auth/me", { token }),
  dashboard: (token?: string) => apiRequest<DashboardResponse>("/dashboard", { token }),
  serviceOrders: (token?: string, filters?: { status?: string; priority?: string; customer?: string }) =>
    apiRequest<ApiListResponse<unknown>>(withQuery("/service-orders", filters), { token }),
  createServiceOrder: (body: unknown, token?: string) =>
    apiRequest<unknown>("/service-orders", { method: "POST", body, token }),
  customers: (token?: string) => apiRequest<ApiListResponse<unknown>>("/customers", { token }),
  createCustomer: (body: unknown, token?: string) => apiRequest<unknown>("/customers", { method: "POST", body, token }),
  equipment: (token?: string) => apiRequest<ApiListResponse<unknown>>("/equipment", { token }),
  createEquipment: (body: unknown, token?: string) => apiRequest<unknown>("/equipment", { method: "POST", body, token }),
  contracts: (token?: string) => apiRequest<ApiListResponse<unknown>>("/contracts", { token }),
  createContract: (body: unknown, token?: string) => apiRequest<unknown>("/contracts", { method: "POST", body, token }),
  quotes: (token?: string) => apiRequest<ApiListResponse<unknown>>("/quotes", { token }),
  stock: (token?: string) => apiRequest<ApiListResponse<unknown> & { alerts: unknown[] }>("/stock", { token }),
  integrations: (token?: string) => apiRequest<ApiListResponse<unknown>>("/integrations", { token }),
  uploadFile: (body: unknown, token?: string) => apiRequest<unknown>("/files", { method: "POST", body, token }),
  createQrLabel: (body: unknown, token?: string) => apiRequest<unknown>("/qr-labels", { method: "POST", body, token }),
  auditLog: (token?: string) => apiRequest<ApiListResponse<unknown>>("/audit-log", { token }),
};
