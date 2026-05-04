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

const tenantIsolationGates = [
  {
    domain: "multiempresa",
    status: "ready",
    requiredControls: ["tenantId em JWT", "DEFAULT_TENANT_ID", "auditoria por tenant"],
    evidence: ["auth.getRequestContext", "seed de tenant ICEMAX", "AuditLog no schema"],
    productionBlockers: [],
  },
  {
    domain: "clientes",
    status: "ready",
    requiredControls: ["Customer.tenantId", "CustomerAddress por cliente", "Equipment.tenantId"],
    evidence: ["repositorios Prisma recebem tenantId", "rotas de contrato e OS usam contexto autenticado"],
    productionBlockers: [],
  },
  {
    domain: "ordens",
    status: "partial",
    requiredControls: ["ServiceOrder.tenantId", "fotos privadas por tenant", "assinatura vinculada a OS"],
    evidence: ["ServiceOrder e ServiceOrderNote previstos no schema", "fluxo mock ja separado por tenant"],
    productionBlockers: ["storage privado de fotos", "assinatura digital persistida"],
  },
  {
    domain: "contratos",
    status: "partial",
    requiredControls: ["ServiceContract.tenantId", "visitas recorrentes por contrato", "agenda preventiva isolada"],
    evidence: ["rotas de contratos recebem context.tenantId", "calendario e capacidade ja possuem contrato de API"],
    productionBlockers: ["parcelas recorrentes persistidas", "aceite auditavel do contrato"],
  },
  {
    domain: "estoque",
    status: "blocked",
    requiredControls: ["StockLocation.tenantId", "saldo por local", "movimento com usuario e origem"],
    evidence: ["schema de estoque planejado", "mini ERP web previsto no painel"],
    productionBlockers: ["bloqueio de saldo negativo", "concorrencia em reservas", "inventario inicial validado"],
  },
  {
    domain: "portal_cliente",
    status: "blocked",
    requiredControls: ["token publico com hash", "escopo por cliente", "expiracao e revogacao"],
    evidence: ["politica de acesso documentada", "resumo financeiro mockado"],
    productionBlockers: ["persistencia de token seguro", "rate limit por link", "log de acesso do cliente"],
  },
  {
    domain: "comunicacao",
    status: "blocked",
    requiredControls: ["templates por tenant", "fila idempotente", "logs de envio"],
    evidence: ["contratos de notificacao planejados", "e-mail e WhatsApp isolados no desenho"],
    productionBlockers: ["provedores reais", "fila persistida", "controle de reenvio"],
  },
  {
    domain: "documentos",
    status: "blocked",
    requiredControls: ["storage por tenant", "permissao por entidade", "versao e auditoria"],
    evidence: ["Manual, FloorPlan e EquipmentQrLabel previstos no schema"],
    productionBlockers: ["storage privado", "varredura de arquivo", "politica de download"],
  },
];

const rollbackDrillSteps = [
  {
    order: 1,
    phase: "preflight",
    title: "Congelar janela de mudanca",
    owner: "desenvolvimento",
    command: "npm run validate",
    evidence: "validacao completa sem falhas",
    rollbackTrigger: "falha em typecheck, teste, build ou guard de segredos",
  },
  {
    order: 2,
    phase: "backup",
    title: "Criar snapshot do banco",
    owner: "infraestrutura",
    command: "pg_dump --format=custom --file=icemax-pre-cutover.dump",
    evidence: "arquivo de dump armazenado fora do servidor principal",
    rollbackTrigger: "backup ausente, incompleto ou sem teste de restauracao",
  },
  {
    order: 3,
    phase: "migration",
    title: "Executar migracoes Prisma",
    owner: "desenvolvimento",
    command: "npm run db:migrate",
    evidence: "migrations aplicadas sem drift",
    rollbackTrigger: "drift, erro de migration ou perda de constraint",
  },
  {
    order: 4,
    phase: "seed",
    title: "Aplicar seed operacional minimo",
    owner: "produto",
    command: "npm run db:seed",
    evidence: "tenant, usuario dono, tecnico, cliente e OS de teste criados",
    rollbackTrigger: "login administrativo ou tenant padrao indisponivel",
  },
  {
    order: 5,
    phase: "smoke",
    title: "Validar fluxos criticos",
    owner: "homologacao",
    command: "npm run validate",
    evidence: "login, dashboard, OS, contratos, estoque e portal respondendo",
    rollbackTrigger: "qualquer fluxo critico com erro 5xx ou mistura de tenant",
  },
  {
    order: 6,
    phase: "rollback",
    title: "Restaurar snapshot se necessario",
    owner: "infraestrutura",
    command: "pg_restore --clean --if-exists --dbname=icemax icemax-pre-cutover.dump",
    evidence: "ambiente retorna ao estado pre-cutover",
    rollbackTrigger: "decisao do gate de go/no-go",
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

export function getTenantIsolationGate() {
  const ready = tenantIsolationGates.filter((item) => item.status === "ready");
  const partial = tenantIsolationGates.filter((item) => item.status === "partial");
  const blocked = tenantIsolationGates.filter((item) => item.status === "blocked");

  return {
    generatedAt: new Date().toISOString(),
    currentMode: isPrismaEnabled() ? "prisma" : "mock",
    defaultTenantId: config.defaultTenantId,
    productionCutoverAllowed: blocked.length === 0 && partial.length === 0,
    summary: {
      domains: tenantIsolationGates.length,
      ready: ready.length,
      partial: partial.length,
      blocked: blocked.length,
    },
    minimumRules: [
      "Toda consulta produtiva deve receber tenantId pelo contexto autenticado.",
      "Nenhum endpoint publico pode acessar dados financeiros sem token persistido, expiravel e auditavel.",
      "Arquivos, fotos, plantas, manuais e assinaturas devem usar storage privado separado por tenant.",
      "Qualquer job de agenda, cobranca ou notificacao deve registrar tenantId, usuario de origem e idempotencia.",
    ],
    nextReleaseFocus: blocked.map((item) => ({
      domain: item.domain,
      unblock: item.productionBlockers[0],
    })),
    gates: tenantIsolationGates,
  };
}

export function getDatabaseRollbackDrill() {
  const destructiveCommands = rollbackDrillSteps.filter((item) => item.phase === "rollback").map((item) => item.command);

  return {
    generatedAt: new Date().toISOString(),
    currentMode: isPrismaEnabled() ? "prisma" : "mock",
    targetMode: "prisma",
    executionPolicy: "manual_approval_required",
    dryRunOnly: true,
    summary: {
      totalSteps: rollbackDrillSteps.length,
      rollbackTriggers: rollbackDrillSteps.length,
      destructiveCommandsBlocked: destructiveCommands.length,
    },
    goNoGoCriteria: [
      "Backup restauravel confirmado antes da migration.",
      "Tenant isolation gate sem dominios bloqueados para o escopo que sera ativado.",
      "Data readiness board com dominios criticos acima do minimo combinado.",
      "Smoke test operacional aprovado apos a virada.",
    ],
    blockedDestructiveCommands: destructiveCommands,
    steps: rollbackDrillSteps,
  };
}
