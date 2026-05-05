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

export function getProductionReadinessPlan() {
  const requiredSecrets = [
    { key: "DATABASE_URL", configured: Boolean(process.env.DATABASE_URL), owner: "infra" },
    { key: "JWT_SECRET", configured: Boolean(process.env.JWT_SECRET) && !config.jwtSecret.includes("dev-secret"), owner: "seguranca" },
    { key: "PUBLIC_ACCESS_TOKEN_PEPPER", configured: Boolean(process.env.PUBLIC_ACCESS_TOKEN_PEPPER), owner: "seguranca" },
  ];
  const externalAccounts = [
    { provider: "google_maps", purpose: "rotas, ETA e geocodificacao", configured: integrations.some((item) => item.provider === "google_maps" && item.status === "configured") },
    { provider: "smtp_email", purpose: "envio de OS concluida, garantias e cobrancas", configured: integrations.some((item) => item.provider === "smtp_email" && item.status === "configured") },
    { provider: "whatsapp_meta", purpose: "avisos de agenda, rota e pos-atendimento", configured: integrations.some((item) => item.provider === "whatsapp" && item.status === "configured") },
    { provider: "openai", purpose: "revisao tecnica, diagnostico visual e texto profissional", configured: integrations.some((item) => item.provider === "openai" && item.status === "configured") },
  ];
  const gates = [
    { key: "validation", status: "pass", evidence: "npm run validate deve passar antes de release." },
    { key: "database", status: isPrismaEnabled() && process.env.DATABASE_URL ? "pass" : "block", evidence: "Banco real precisa estar ativo para producao." },
    { key: "secrets", status: requiredSecrets.every((item) => item.configured) ? "pass" : "block", evidence: "Segredos reais precisam estar fora do repositorio." },
    { key: "integrations", status: externalAccounts.every((item) => item.configured) ? "pass" : "warn", evidence: "Integracoes podem iniciar em homologacao controlada, mas nao em producao completa." },
    { key: "lgpd", status: "manual", evidence: "Politica de privacidade, termos e base legal devem ser revisados antes de cliente real." },
  ];
  const blockers = gates.filter((item) => item.status === "block");
  const score = Math.round((
    gates.filter((item) => item.status === "pass").length * 18
    + gates.filter((item) => item.status === "warn" || item.status === "manual").length * 8
    + externalAccounts.filter((item) => item.configured).length * 4
    + requiredSecrets.filter((item) => item.configured).length * 6
  ) / 1.4);
  const homologationReady = gates.every((item) => item.status !== "block");
  const productionReady = gates.every((item) => item.status === "pass") && externalAccounts.every((item) => item.configured);

  return {
    status: blockers.length ? "blocked" : "candidate",
    target: "homologacao_controlada",
    score: Math.min(score, 100),
    readinessLevels: {
      development: "active",
      controlledHomologation: homologationReady ? "ready" : "blocked",
      fullProduction: productionReady ? "ready" : "blocked",
    },
    requiredSecrets,
    externalAccounts,
    gates,
    blockers: blockers.map((item) => item.key),
    nextActions: [
      "Configurar PostgreSQL e DATABASE_URL em ambiente seguro.",
      "Trocar JWT_SECRET e PUBLIC_ACCESS_TOKEN_PEPPER por valores longos e privados.",
      "Definir provedor de e-mail transacional para conclusao de OS e portal.",
      "Preparar chaves de mapas, WhatsApp e OpenAI sem publicar credenciais no repositorio.",
      "Executar npm run validate antes de push e homologacao.",
    ],
  };
}

export function getMobileOfflineEscalationBoard() {
  const items = [
    {
      id: "offline-blocked-001",
      technicianUserId: "tech-001",
      technicianName: "Rafael Martins",
      serviceOrderId: "1048",
      customer: "ClimaSul Hotel",
      actionLabel: "Assinatura OS 1048",
      priority: "critical",
      retryCount: 5,
      ageHours: 6,
      blockedReason: "Limite de tentativas atingido no envio de assinatura.",
      likelyCause: "OS pode ter sido encerrada no painel antes da sincronizacao do app.",
      recommendedAction: "Conferir status da OS, validar assinatura com o cliente e liberar reenvio assistido.",
      owner: "supervisor",
      impact: "Fechamento da OS e envio de e-mail ao cliente podem ficar travados.",
    },
    {
      id: "offline-blocked-002",
      technicianUserId: "tech-002",
      technicianName: "Tecnico Terceiro",
      serviceOrderId: "1049",
      customer: "Condominio Central",
      actionLabel: "Foto after OS 1049",
      priority: "critical",
      retryCount: 5,
      ageHours: 3,
      blockedReason: "Upload de evidencia recusado pela API.",
      likelyCause: "Arquivo local pendente de conversao ou URL temporaria invalida.",
      recommendedAction: "Solicitar nova captura da evidencia ou reenviar arquivo pelo painel.",
      owner: "qualidade",
      impact: "Arquivo de fechamento pode ficar incompleto.",
    },
    {
      id: "offline-blocked-003",
      technicianUserId: "tech-001",
      technicianName: "Rafael Martins",
      serviceOrderId: "1050",
      customer: "Industria Norte",
      actionLabel: "Peca OS 1050",
      priority: "high",
      retryCount: 5,
      ageHours: 12,
      blockedReason: "Movimento de estoque nao foi aceito.",
      likelyCause: "Saldo pode ter sido consumido por outra OS ou local de estoque incorreto.",
      recommendedAction: "Conferir saldo do almoxarifado e ajustar reserva antes de sincronizar.",
      owner: "estoque",
      impact: "Saldo de peca e custo da OS podem ficar divergentes.",
    },
  ].map((item) => {
    const priorityWeight = item.priority === "critical" ? 70 : item.priority === "high" ? 45 : 25;
    const ageWeight = Math.min(item.ageHours * 3, 30);
    const severityScore = Math.min(priorityWeight + ageWeight, 100);

    return {
      ...item,
      severityScore,
      slaStatus: severityScore >= 85 ? "critical_now" : severityScore >= 65 ? "attention" : "monitor",
    };
  });
  const critical = items.filter((item) => item.priority === "critical").length;
  const high = items.filter((item) => item.priority === "high").length;

  return {
    generatedAt: new Date().toISOString(),
    policy: {
      maxRetryCount: 5,
      blockedActionsRequireReview: true,
      automaticRetryAllowed: false,
    },
    summary: {
      total: items.length,
      critical,
      high,
      oldestAgeHours: Math.max(...items.map((item) => item.ageHours)),
      highestSeverityScore: Math.max(...items.map((item) => item.severityScore)),
      owners: Array.from(new Set(items.map((item) => item.owner))),
    },
    data: items,
    nextActions: [
      "Supervisor revisa eventos criticos antes de liberar reenvio.",
      "Estoque confere movimentos recusados antes de ajustar saldo.",
      "Qualidade valida evidencias bloqueadas antes de fechar OS.",
    ],
  };
}

export function reviewMobileOfflineEscalation(recordId: string, body: unknown) {
  const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const decision = typeof payload.decision === "string" ? payload.decision : "keep_blocked";
  const reviewedBy = typeof payload.reviewedBy === "string" ? payload.reviewedBy : "supervisor";
  const note = typeof payload.note === "string" ? payload.note : "Revisao registrada pelo painel.";
  const allowedDecisions = ["release_assisted_retry", "request_new_evidence", "keep_blocked"];
  const normalizedDecision = allowedDecisions.includes(decision) ? decision : "keep_blocked";
  const nextStatus = normalizedDecision === "release_assisted_retry" ? "ready_for_assisted_retry" : "blocked";

  return {
    id: `offline-review-${recordId}`,
    recordId,
    decision: normalizedDecision,
    reviewedBy,
    note,
    nextStatus,
    audit: {
      event: "mobile_offline_escalation_reviewed",
      recordedAt: new Date().toISOString(),
      requiresSupervisor: true,
    },
    nextActions: normalizedDecision === "release_assisted_retry"
      ? ["Confirmar dados da OS antes do reenvio.", "Registrar reenvio assistido com auditoria."]
      : normalizedDecision === "request_new_evidence"
        ? ["Solicitar nova captura ao tecnico.", "Manter OS em revisao ate evidencia valida."]
        : ["Manter pendencia bloqueada.", "Encaminhar para suporte se reincidir."],
  };
}

export function getEndOfDaySnapshot() {
  const readiness = getPlatformReadiness();
  const gate = getPreReleaseGate();

  return {
    date: new Date().toISOString().slice(0, 10),
    project: "ICEMAX",
    owner: "RAFAEL DA SILVA BEZEERA",
    status: "development_active",
    completedToday: [
      "fluxo comercial da OS para oportunidade de contrato",
      "proposta comercial de contrato recorrente",
      "plano de ativacao de contrato",
      "pacote de aceite de contrato",
      "validacao local com typecheck, testes e build",
    ],
    productCoverage: {
      serviceOrders: "operacional",
      contracts: "recorrencia planejada",
      dispatch: "regras locais com rota estimada",
      customerPortal: "abertura opcional de OS",
      ai: "revisao de texto e causas provaveis em modo local",
      whitelabel: "base preparada para multiplas empresas",
      mobile: "estrutura inicial offline",
    },
    validation: {
      localCommand: "npm run validate",
      expectedBeforeNextPush: true,
      readinessPass: readiness.blockingItems.length === 0,
      releaseGate: gate.status,
    },
    openDependencies: readiness.blockingItems,
    nextRecommendedBlocks: [
      "executar ativacao real de contrato no banco Prisma",
      "aprofundar aplicativo mobile de tecnico",
      "evoluir mapa/planta interativa com pontos de equipamento",
      "preparar integracoes reais de e-mail, WhatsApp, mapas e OpenAI",
      "criar fluxo de assinatura digital e aceite auditavel",
    ],
    github: {
      pushAuthorizedByRafael: true,
      branch: "main",
      remote: "origin",
    },
  };
}
