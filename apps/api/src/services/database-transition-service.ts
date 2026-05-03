import { config, isPrismaEnabled } from "../config";

const schemaDomains = [
  { domain: "multiempresa", models: ["Tenant", "User", "IntegrationSetting", "AuditLog"] },
  { domain: "clientes", models: ["Customer", "CustomerAddress", "Equipment"] },
  { domain: "ordens", models: ["ServiceOrder", "ServiceOrderNote", "ServiceOrderPhoto", "ServiceOrderPart"] },
  { domain: "contratos", models: ["ServiceContract", "ServiceContractVisit"] },
  { domain: "estoque", models: ["Part", "StockLocation", "StockBalance", "StockMovement", "StockReservation"] },
  { domain: "qualidade", models: ["ChecklistTemplate", "ChecklistItem", "ServiceOrderChecklistAnswer"] },
  { domain: "comunicacao", models: ["Notification", "NotificationTemplate", "WhatsappEvent"] },
  { domain: "documentos", models: ["Manual", "FloorPlan", "EquipmentQrLabel", "Quote"] },
];

export function getDatabaseCutoverPlan() {
  const steps = [
    "Criar PostgreSQL local ou remoto",
    "Configurar DATABASE_URL",
    "Executar npm run db:generate",
    "Executar npm run db:migrate",
    "Executar npm run db:seed",
    "Definir API_DATA_SOURCE=prisma",
    "Validar login com adm.rcsolutions@gmail.com",
    "Executar npm run validate",
  ];

  return {
    currentMode: isPrismaEnabled() ? "prisma" : "mock",
    targetMode: "prisma",
    defaultTenantId: config.defaultTenantId,
    steps,
    blockedBy: process.env.DATABASE_URL ? [] : ["DATABASE_URL nao configurada neste terminal"],
  };
}

export function getDatabaseSchemaSummary() {
  return {
    provider: "postgresql",
    domains: schemaDomains,
    totalDomains: schemaDomains.length,
    totalModelsReferenced: schemaDomains.reduce((sum, item) => sum + item.models.length, 0),
  };
}

export function getSeedPlan() {
  return {
    command: "npm run db:seed",
    creates: [
      "tenant ICEMAX",
      "usuario dono",
      "tecnico",
      "cliente",
      "equipamento",
      "ordem de servico",
      "contrato recorrente",
      "estoque inicial",
      "checklists",
      "manual",
      "integracoes pendentes",
    ],
    devLogin: {
      email: "adm.rcsolutions@gmail.com",
      passwordPolicy: "senha local apenas para desenvolvimento",
    },
  };
}

export function getEnvironmentChecklist() {
  return {
    requiredForMock: ["API_DATA_SOURCE=mock"],
    requiredForPrisma: ["DATABASE_URL", "API_DATA_SOURCE=prisma", "JWT_SECRET", "DEFAULT_TENANT_ID"],
    current: {
      dataSource: config.dataSource,
      hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
      defaultTenantId: config.defaultTenantId,
    },
  };
}
