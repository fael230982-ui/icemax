import { userRoles } from "@icemax/shared";
import { config, isPrismaEnabled } from "../config";
import { integrations, tenant } from "../mock-data";

const moduleCatalog = [
  { key: "service_orders", label: "Ordens de servico", maturity: "operational_mock", owner: "operacao" },
  { key: "contracts", label: "Contratos recorrentes", maturity: "operational_mock", owner: "contratos" },
  { key: "dispatch", label: "Despacho e rotas", maturity: "local_rules", owner: "operacao" },
  { key: "stock", label: "Estoque e compras", maturity: "operational_mock", owner: "estoque" },
  { key: "ai", label: "IA operacional", maturity: "local_rules", owner: "qualidade" },
  { key: "customer_portal", label: "Portal do cliente", maturity: "public_mock", owner: "cliente" },
  { key: "whitelabel", label: "Whitelabel", maturity: "contract_ready", owner: "plataforma" },
  { key: "lgpd", label: "LGPD e auditoria", maturity: "contract_ready", owner: "seguranca" },
  { key: "billing", label: "Faturamento", maturity: "contract_ready", owner: "financeiro" },
  { key: "mobile_offline", label: "Mobile offline", maturity: "skeleton_ready", owner: "campo" },
];

const roleMatrix: Record<string, string[]> = {
  owner: ["*"],
  admin: ["dashboard", "service_orders", "contracts", "stock", "billing", "settings"],
  dispatcher: ["dashboard", "service_orders", "dispatch", "contracts"],
  supervisor: ["dashboard", "service_orders", "quality", "reports"],
  technician: ["mobile_orders", "checklists", "photos", "parts"],
  outsourced_technician: ["mobile_orders_limited", "checklists", "photos"],
  customer: ["customer_portal", "quotes", "service_history"],
};

export function getPlatformReadiness() {
  const integrationStatus = integrations.map((integration) => ({
    provider: integration.provider,
    status: integration.status,
    requiredEnv: integration.requiredEnv,
    ready: integration.status === "configured",
  }));
  const blockingItems = [
    !isPrismaEnabled() ? "API_DATA_SOURCE ainda esta em modo mock" : null,
    config.jwtSecret.includes("dev-secret") ? "JWT_SECRET deve ser trocado antes de producao" : null,
    ...integrationStatus.filter((item) => !item.ready).map((item) => `${item.provider} nao configurado`),
  ].filter(Boolean);

  return {
    tenant: tenant.name,
    dataSource: config.dataSource,
    mode: isPrismaEnabled() ? "database" : "mock",
    modules: moduleCatalog.length,
    integrations: integrationStatus,
    blockingItems,
    releaseReady: blockingItems.length === 0,
  };
}

export function getModuleCatalog() {
  return {
    data: moduleCatalog,
    total: moduleCatalog.length,
  };
}

export function getRoleMatrix() {
  return {
    data: userRoles.map((role) => ({
      role,
      permissions: roleMatrix[role] ?? [],
    })),
    total: userRoles.length,
  };
}

export function getPlatformDiagnostics() {
  return {
    service: "icemax-api",
    tenantId: config.defaultTenantId,
    dataSource: config.dataSource,
    storage: {
      local: true,
      reports: true,
      uploads: true,
      qrLabels: true,
    },
    externalDependencies: integrations.map((integration) => ({
      provider: integration.provider,
      configured: integration.status === "configured",
      requiredEnv: integration.requiredEnv,
    })),
    validation: {
      zod: true,
      testFactory: true,
      auditEvents: true,
    },
  };
}

export function getPreReleaseGate() {
  const checks = [
    {
      key: "data_source",
      label: "Fonte de dados",
      status: isPrismaEnabled() ? "pass" : "block",
      detail: isPrismaEnabled() ? "API usando Prisma." : "API ainda esta em modo mock.",
    },
    {
      key: "database_url",
      label: "DATABASE_URL",
      status: process.env.DATABASE_URL ? "pass" : "block",
      detail: process.env.DATABASE_URL ? "Variavel configurada." : "Banco real ainda nao configurado.",
    },
    {
      key: "jwt_secret",
      label: "JWT_SECRET",
      status: process.env.JWT_SECRET && !config.jwtSecret.includes("dev-secret") ? "pass" : "block",
      detail: "Segredo JWT precisa ser longo, privado e diferente do valor de desenvolvimento.",
    },
    {
      key: "integrations",
      label: "Integracoes externas",
      status: integrations.every((item) => item.status === "configured") ? "pass" : "warn",
      detail: "OpenAI, mapas, e-mail e WhatsApp podem ficar pendentes ate homologacao controlada.",
    },
    {
      key: "validation",
      label: "Validacao tecnica",
      status: "manual",
      detail: "Executar npm run validate antes de push, homologacao e release.",
    },
    {
      key: "pdf_docs",
      label: "PDFs de documentacao",
      status: "deferred",
      detail: "PDFs adiados por decisao do Rafael para ganhar velocidade.",
    },
  ];
  const blocking = checks.filter((item) => item.status === "block");

  return {
    status: blocking.length ? "blocked" : "ready",
    blocking: blocking.length,
    checks,
    recommendation: blocking.length
      ? "Manter desenvolvimento local e nao liberar homologacao externa ainda."
      : "Pode preparar homologacao controlada.",
  };
}
