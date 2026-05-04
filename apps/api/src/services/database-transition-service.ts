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

const migrationReadiness = [
  {
    domain: "multiempresa",
    readiness: 86,
    repositoryCoverage: "prisma_ready",
    risk: "medium",
    blockers: ["JWT_SECRET real", "revisao de isolamento por tenant"],
    nextAction: "Validar login, tenant padrao e auditoria com banco real.",
  },
  {
    domain: "clientes",
    readiness: 78,
    repositoryCoverage: "prisma_ready",
    risk: "medium",
    blockers: ["normalizacao de enderecos", "deduplicacao por e-mail/documento"],
    nextAction: "Migrar clientes, enderecos e equipamentos antes das OS.",
  },
  {
    domain: "ordens",
    readiness: 72,
    repositoryCoverage: "partial_prisma",
    risk: "high",
    blockers: ["fotos em storage privado", "assinatura digital persistida", "timeline completa"],
    nextAction: "Migrar OS com notas, fotos e pecas em lote controlado.",
  },
  {
    domain: "contratos",
    readiness: 68,
    repositoryCoverage: "partial_prisma",
    risk: "high",
    blockers: ["parcelas recorrentes persistidas", "agenda preventiva real", "aceite auditavel"],
    nextAction: "Persistir contrato, visitas e plano de cobranca antes de automacoes.",
  },
  {
    domain: "estoque",
    readiness: 64,
    repositoryCoverage: "mock_first",
    risk: "high",
    blockers: ["saldo inicial conferido", "reservas concorrentes", "inventario por local"],
    nextAction: "Importar saldo inicial e bloquear movimentacoes negativas.",
  },
  {
    domain: "portal_cliente",
    readiness: 58,
    repositoryCoverage: "public_mock",
    risk: "high",
    blockers: ["identidade do cliente", "token com hash", "revogacao e expiracao reais"],
    nextAction: "Implementar tokens persistidos antes de expor dados financeiros reais.",
  },
  {
    domain: "comunicacao",
    readiness: 52,
    repositoryCoverage: "queue_mock",
    risk: "high",
    blockers: ["provedor de e-mail", "WhatsApp oficial", "idempotencia persistida"],
    nextAction: "Persistir fila antes de conectar provedores externos.",
  },
  {
    domain: "documentos",
    readiness: 48,
    repositoryCoverage: "catalog_mock",
    risk: "medium",
    blockers: ["storage privado", "antivirus", "controle de versao de arquivos"],
    nextAction: "Criar storage por tenant e vincular documentos a entidades reais.",
  },
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

export function getDataReadinessBoard() {
  const sorted = [...migrationReadiness].sort((a, b) => b.readiness - a.readiness);
  const highRisk = sorted.filter((item) => item.risk === "high");
  const averageReadiness = Math.round(sorted.reduce((sum, item) => sum + item.readiness, 0) / sorted.length);

  return {
    generatedAt: new Date().toISOString(),
    currentMode: isPrismaEnabled() ? "prisma" : "mock",
    targetMode: "prisma",
    summary: {
      domains: sorted.length,
      averageReadiness,
      highRisk: highRisk.length,
      prismaReady: sorted.filter((item) => item.repositoryCoverage === "prisma_ready").length,
      partialPrisma: sorted.filter((item) => item.repositoryCoverage === "partial_prisma").length,
      mockFirst: sorted.filter((item) => item.repositoryCoverage.includes("mock")).length,
    },
    recommendedSequence: [
      "multiempresa",
      "clientes",
      "ordens",
      "contratos",
      "estoque",
      "portal_cliente",
      "comunicacao",
      "documentos",
    ],
    governance: {
      auditEvent: "database.data_readiness_board_viewed",
      noProductionCutoverWithoutBackup: true,
      requiresValidationAfterEachDomain: true,
      requiresTenantIsolationReview: true,
    },
    domains: sorted,
  };
}
