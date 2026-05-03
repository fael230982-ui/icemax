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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar API: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const icemaxApi = {
  dashboard: () => apiGet<DashboardResponse>("/dashboard"),
  serviceOrders: () => apiGet<ApiListResponse<unknown>>("/service-orders"),
  contracts: () => apiGet<ApiListResponse<unknown>>("/contracts"),
  quotes: () => apiGet<ApiListResponse<unknown>>("/quotes"),
  stock: () => apiGet<ApiListResponse<unknown> & { alerts: unknown[] }>("/stock"),
  integrations: () => apiGet<ApiListResponse<unknown>>("/integrations"),
};
