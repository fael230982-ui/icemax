import { integrations, serviceContracts, serviceOrders, stock, tenant } from "../mock-data";

const apiContracts = [
  { method: "GET", path: "/health", group: "system", auth: "public" },
  { method: "GET", path: "/dashboard", group: "operations", auth: "tenant" },
  { method: "GET", path: "/service-orders", group: "service_orders", auth: "tenant" },
  { method: "POST", path: "/service-orders", group: "service_orders", auth: "tenant" },
  { method: "PATCH", path: "/service-orders/:id/status", group: "field_execution", auth: "tenant" },
  { method: "POST", path: "/service-orders/:id/report", group: "reports", auth: "tenant" },
  { method: "GET", path: "/contracts", group: "contracts", auth: "tenant" },
  { method: "POST", path: "/contracts/:id/visits/generate", group: "contracts", auth: "tenant" },
  { method: "GET", path: "/stock", group: "stock", auth: "tenant" },
  { method: "POST", path: "/stock-movements", group: "stock", auth: "tenant" },
  { method: "POST", path: "/ai/text-improve", group: "ai", auth: "tenant" },
  { method: "POST", path: "/customer-portal/service-orders", group: "customer_portal", auth: "public" },
  { method: "GET", path: "/platform/readiness", group: "platform", auth: "tenant" },
  { method: "GET", path: "/acceleration/lots", group: "acceleration", auth: "tenant" },
];

const scenarios = [
  {
    key: "os-completa",
    title: "OS corretiva completa",
    steps: ["criar OS", "adicionar nota", "alterar status", "gerar relatorio", "registrar satisfacao"],
  },
  {
    key: "contrato-preventivo",
    title: "Contrato recorrente com visita preventiva",
    steps: ["criar contrato", "gerar visitas", "criar OS preventiva", "acompanhar SLA"],
  },
  {
    key: "campo-offline",
    title: "Atendimento com fila offline",
    steps: ["registrar check-in", "salvar localizacao", "sincronizar fila", "auditar eventos"],
  },
  {
    key: "reenvio-offline-real",
    title: "Gate de reenvio real offline",
    steps: ["classificar risco", "validar permissoes", "validar auditoria", "executar dry-run", "bloquear envio real"],
  },
  {
    key: "whitelabel-tenant",
    title: "Preparacao whitelabel",
    steps: ["criar marca", "validar papeis", "revisar integracoes", "diagnosticar readiness"],
  },
];

export function listApiContracts() {
  return {
    data: apiContracts,
    total: apiContracts.length,
    version: "0.8.2",
  };
}

export function listHomologationScenarios() {
  return {
    data: scenarios,
    total: scenarios.length,
  };
}

export function runHomologationScenario(key: string) {
  const scenario = scenarios.find((item) => item.key === key);

  if (!scenario) {
    return null;
  }
  const realOfflineRetry = key === "reenvio-offline-real";

  return {
    id: `homologation-${key}-${Date.now()}`,
    ...scenario,
    status: realOfflineRetry ? "blocked_by_production_gate" : "passed_mock",
    executedAt: new Date().toISOString(),
    evidence: scenario.steps.map((step, index) => ({
      step: index + 1,
      label: step,
      status: realOfflineRetry && step === "bloquear envio real" ? "blocked_as_expected" : "ok",
    })),
    recommendation: realOfflineRetry
      ? "Manter envio real bloqueado; validar apenas revisao, preparo e dry-run ate banco real e auditoria persistente."
      : "Cenario homologado em modo mock.",
  };
}

export function getObservabilitySummary() {
  return {
    tenant: tenant.name,
    mode: "local_mock",
    counters: {
      serviceOrders: serviceOrders.length,
      contracts: serviceContracts.length,
      stockAlerts: stock.filter((item) => item.quantity < item.minimum).length,
      integrations: integrations.length,
    },
    signals: [
      { key: "api", status: "healthy" },
      { key: "storage", status: "local" },
      { key: "database", status: "mock" },
      { key: "external_integrations", status: "pending_credentials" },
    ],
  };
}

export function getDemoDataSnapshot() {
  return {
    tenant,
    serviceOrders,
    serviceContracts,
    stock,
    integrations,
    generatedAt: new Date().toISOString(),
  };
}
