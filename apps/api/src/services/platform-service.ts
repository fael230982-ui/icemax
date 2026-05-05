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

export function getMobileOfflineAssistedRetryPermissions() {
  const stages = [
    {
      key: "review",
      label: "Revisar pendencia",
      allowedRoles: ["owner", "admin", "supervisor"],
      deniedRoles: ["technician", "outsourced_technician", "customer"],
      requiredControls: ["justificativa", "registro de auditoria", "decisao explicita"],
      status: "enabled_mock",
    },
    {
      key: "prepare",
      label: "Preparar reenvio assistido",
      allowedRoles: ["owner", "admin", "supervisor"],
      deniedRoles: ["technician", "outsourced_technician", "customer"],
      requiredControls: ["revisao gerencial", "idempotencia", "checks manuais"],
      status: "enabled_mock",
    },
    {
      key: "dry_run",
      label: "Simular reenvio",
      allowedRoles: ["owner", "admin", "supervisor"],
      deniedRoles: ["technician", "outsourced_technician", "customer"],
      requiredControls: ["payload sem envio real", "resultado registrado", "validacao de duplicidade"],
      status: "enabled_mock",
    },
    {
      key: "execute_real",
      label: "Executar reenvio real",
      allowedRoles: ["owner", "admin"],
      deniedRoles: ["supervisor", "technician", "outsourced_technician", "customer"],
      requiredControls: ["banco real", "auditoria persistente", "permissao sensivel", "confirmacao dupla"],
      status: "blocked_until_production_gate",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    policy: "mobile_offline_assisted_retry_permissions",
    defaultDecision: "deny",
    productionExecutionAllowed: false,
    separationOfDuties: {
      technicianCannotReleaseOwnQueue: true,
      outsourcedTechnicianCannotReleaseQueue: true,
      customerCannotAccessInternalRetry: true,
      realExecutionRequiresHigherPrivilegeThanReview: true,
    },
    stages,
    summary: {
      enabledStages: stages.filter((stage) => stage.status === "enabled_mock").length,
      blockedStages: stages.filter((stage) => stage.status.includes("blocked")).length,
      sensitiveRoles: ["owner", "admin"],
      operationalReviewerRoles: ["supervisor"],
    },
    nextActions: [
      "Conectar a politica ao middleware de permissao por rota antes de producao.",
      "Persistir auditoria de revisao, preparo, dry-run e execucao real.",
      "Exigir confirmacao dupla para reenvio real de assinatura, estoque e fechamento de OS.",
    ],
  };
}

export function getMobileOfflineAssistedRetryProductionGate() {
  const checks = [
    {
      key: "database",
      label: "Banco real",
      status: isPrismaEnabled() && Boolean(process.env.DATABASE_URL) ? "pass" : "block",
      detail: "Reenvio real precisa ler e atualizar fila offline, OS, evidencias e auditoria no banco.",
    },
    {
      key: "persistent_audit",
      label: "Auditoria persistente",
      status: isPrismaEnabled() ? "manual" : "block",
      detail: "Cada revisao, preparo, dry-run e execucao real deve gerar evento persistido.",
    },
    {
      key: "permission_policy",
      label: "Permissao sensivel",
      status: "manual",
      detail: "Execucao real deve aceitar somente owner/admin e exigir confirmacao dupla.",
    },
    {
      key: "idempotency",
      label: "Idempotencia",
      status: "pass",
      detail: "Chave baseada no ID offline original evita duplicidade de assinatura, foto, peca e fechamento.",
    },
    {
      key: "payload_integrity",
      label: "Integridade do payload",
      status: "manual",
      detail: "Antes do envio real, validar estado da OS, evidencias locais e consistencia do estoque.",
    },
    {
      key: "rollback",
      label: "Plano de reversao",
      status: "manual",
      detail: "Definir como desfazer uma execucao real parcial sem perder trilha de auditoria.",
    },
  ];
  const blocked = checks.filter((check) => check.status === "block");
  const manual = checks.filter((check) => check.status === "manual");

  return {
    generatedAt: new Date().toISOString(),
    gate: "mobile_offline_assisted_retry_real_execution",
    status: blocked.length ? "blocked" : "manual_approval_required",
    realExecutionAllowed: false,
    dryRunAllowed: true,
    checks,
    summary: {
      passed: checks.filter((check) => check.status === "pass").length,
      blocked: blocked.length,
      manual: manual.length,
      requiredBeforeEnable: blocked.concat(manual).map((check) => check.key),
    },
    rolloutPlan: [
      "Manter reenvio real desativado no ambiente atual.",
      "Ativar primeiro em homologacao com dados controlados e logs persistidos.",
      "Liberar por tenant somente apos checklist de auditoria, permissao e rollback.",
      "Monitorar duplicidade, falhas por payload e reversoes nos primeiros ciclos.",
    ],
  };
}

export function getMobileOfflineAssistedRetryAuditContract() {
  const events = [
    {
      event: "mobile_offline_action_blocked",
      trigger: "App remove item da fila automatica ao exceder tentativas.",
      requiredFields: ["tenantId", "offlineActionId", "serviceOrderId", "technicianUserId", "retryCount", "blockedReason"],
      retention: "5 anos",
    },
    {
      event: "mobile_offline_escalation_reviewed",
      trigger: "Gestor revisa pendencia bloqueada.",
      requiredFields: ["tenantId", "offlineActionId", "decision", "reviewedBy", "note", "recordedAt"],
      retention: "5 anos",
    },
    {
      event: "mobile_offline_assisted_retry_prepared",
      trigger: "Painel prepara pacote de reenvio assistido.",
      requiredFields: ["tenantId", "offlineActionId", "approvedBy", "idempotencyKey", "checks", "reason"],
      retention: "5 anos",
    },
    {
      event: "mobile_offline_assisted_retry_dry_run",
      trigger: "Painel simula reenvio sem envio real.",
      requiredFields: ["tenantId", "offlineActionId", "executedBy", "idempotencyKey", "steps", "result"],
      retention: "2 anos",
    },
    {
      event: "mobile_offline_assisted_retry_executed",
      trigger: "Execucao real futura do reenvio assistido.",
      requiredFields: ["tenantId", "offlineActionId", "executedBy", "approvalId", "idempotencyKey", "result", "rollbackReference"],
      retention: "5 anos",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    contract: "mobile_offline_assisted_retry_audit",
    persistenceRequiredBeforeRealExecution: true,
    storageTarget: isPrismaEnabled() ? "prisma_audit_log" : "mock_contract_only",
    events,
    immutableFields: ["tenantId", "offlineActionId", "idempotencyKey", "recordedAt"],
    privacyControls: {
      hidePayloadRawByDefault: true,
      storePayloadHash: true,
      redactCustomerSignatureImage: true,
      redactPhotoBinary: true,
    },
    summary: {
      totalEvents: events.length,
      productionCriticalEvents: events.filter((item) => item.event.includes("executed") || item.event.includes("reviewed")).length,
      minimumRetention: "2 anos",
      maximumRetention: "5 anos",
    },
    nextActions: [
      "Mapear contrato no modelo persistente de audit log.",
      "Gravar hash do payload original sem expor foto, assinatura ou dado sensivel em claro.",
      "Vincular cada evento ao tenant e ao usuario responsavel.",
      "Bloquear execucao real se qualquer campo obrigatorio nao puder ser persistido.",
    ],
  };
}

export function getMobileOfflineAssistedRetryReadiness(recordId: string) {
  const board = getMobileOfflineEscalationBoard();
  const escalation = board.data.find((item) => item.id === recordId) ?? board.data[0];
  const productionGate = getMobileOfflineAssistedRetryProductionGate();
  const permissions = getMobileOfflineAssistedRetryPermissions();
  const auditContract = getMobileOfflineAssistedRetryAuditContract();
  const timeline = getMobileOfflineEscalationTimeline(recordId);
  const checks = [
    {
      key: "risk_reviewed",
      label: "Risco classificado",
      status: escalation.severityScore >= 85 ? "attention" : "pass",
      detail: `Score atual ${escalation.severityScore} e SLA ${escalation.slaStatus}.`,
    },
    {
      key: "permissions",
      label: "Permissoes mapeadas",
      status: permissions.productionExecutionAllowed ? "pass" : "block",
      detail: "Execucao real exige owner/admin e confirmacao dupla.",
    },
    {
      key: "audit_contract",
      label: "Contrato de auditoria",
      status: auditContract.persistenceRequiredBeforeRealExecution ? "block" : "pass",
      detail: "Persistencia de auditoria e obrigatoria antes do envio real.",
    },
    {
      key: "production_gate",
      label: "Gate de producao",
      status: productionGate.realExecutionAllowed ? "pass" : "block",
      detail: "Gate atual mantem reenvio real desativado.",
    },
    {
      key: "timeline",
      label: "Timeline operacional",
      status: timeline.summary.blocked > 0 ? "block" : "pass",
      detail: timeline.summary.nextRequiredAction,
    },
  ];
  const blockers = checks.filter((check) => check.status === "block");
  const attention = checks.filter((check) => check.status === "attention");

  return {
    recordId,
    generatedAt: new Date().toISOString(),
    status: blockers.length ? "not_ready_for_real_execution" : "ready_for_controlled_execution",
    realExecutionAllowed: false,
    dryRunAllowed: productionGate.dryRunAllowed,
    escalation: {
      serviceOrderId: escalation.serviceOrderId,
      customer: escalation.customer,
      actionLabel: escalation.actionLabel,
      priority: escalation.priority,
      severityScore: escalation.severityScore,
      slaStatus: escalation.slaStatus,
      owner: escalation.owner,
    },
    checks,
    summary: {
      passed: checks.filter((check) => check.status === "pass").length,
      attention: attention.length,
      blocked: blockers.length,
      requiredBeforeRealExecution: blockers.map((check) => check.key),
    },
    recommendation: blockers.length
      ? "Manter somente revisao, preparo e dry-run ate banco real, auditoria persistente e permissao sensivel estarem ativos."
      : "Liberar apenas em homologacao controlada antes de qualquer tenant real.",
  };
}

export function getMobileOfflineAssistedRetryExecutiveSummary() {
  const board = getMobileOfflineEscalationBoard();
  const productionGate = getMobileOfflineAssistedRetryProductionGate();
  const auditContract = getMobileOfflineAssistedRetryAuditContract();
  const permissions = getMobileOfflineAssistedRetryPermissions();
  const readinessReports = board.data.map((item) => getMobileOfflineAssistedRetryReadiness(item.id));
  const blockedRealExecution = readinessReports.filter((item) => !item.realExecutionAllowed).length;
  const dryRunAllowed = readinessReports.filter((item) => item.dryRunAllowed).length;
  const topRisks = board.data
    .slice()
    .sort((a, b) => b.severityScore - a.severityScore)
    .slice(0, 3)
    .map((item) => ({
      recordId: item.id,
      serviceOrderId: item.serviceOrderId,
      customer: item.customer,
      actionLabel: item.actionLabel,
      severityScore: item.severityScore,
      slaStatus: item.slaStatus,
      owner: item.owner,
    }));

  return {
    generatedAt: new Date().toISOString(),
    status: "real_execution_blocked",
    realExecutionAllowed: false,
    dryRunAllowed: dryRunAllowed > 0,
    summary: {
      totalBlockedPendencies: board.summary.total,
      criticalPendencies: board.summary.critical,
      highPendencies: board.summary.high,
      highestSeverityScore: board.summary.highestSeverityScore,
      blockedRealExecution,
      dryRunAllowed,
      productionGateBlocked: productionGate.status === "blocked",
      auditPersistenceRequired: auditContract.persistenceRequiredBeforeRealExecution,
      permissionDefaultDecision: permissions.defaultDecision,
    },
    topRisks,
    blockers: Array.from(new Set(readinessReports.flatMap((item) => item.summary.requiredBeforeRealExecution))),
    governance: {
      automaticRetryAllowed: board.policy.automaticRetryAllowed,
      realExecutionRequiresOwnerOrAdmin: permissions.summary.sensitiveRoles,
      evidenceRequiredBeforeEnable: productionGate.summary.requiredBeforeEnable,
      auditEventsRequired: auditContract.summary.totalEvents,
    },
    nextActions: [
      "Tratar pendencias criticas por ordem de score.",
      "Usar dry-run para validar payload sem envio real.",
      "Ativar banco real e auditoria persistente antes de qualquer reenvio real.",
      "Liberar execucao real somente por tenant e apos homologacao controlada.",
    ],
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

export function prepareMobileOfflineAssistedRetry(recordId: string, body: unknown) {
  const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const approvedBy = typeof payload.approvedBy === "string" ? payload.approvedBy : "supervisor";
  const reason = typeof payload.reason === "string" ? payload.reason : "Reenvio assistido solicitado pelo painel.";
  const checks = [
    {
      key: "manager_review",
      label: "Revisao gerencial registrada",
      status: "pass",
      detail: "Pendencia precisa ter decisao de liberacao assistida antes do reenvio.",
    },
    {
      key: "service_order_state",
      label: "Estado da OS conferido",
      status: "manual",
      detail: "Confirmar que a OS ainda aceita a acao bloqueada.",
    },
    {
      key: "duplicate_guard",
      label: "Protecao contra duplicidade",
      status: "pass",
      detail: "Reenvio deve usar o ID offline original como chave de idempotencia.",
    },
    {
      key: "evidence_integrity",
      label: "Integridade da evidencia",
      status: "manual",
      detail: "Validar assinatura, foto, peca ou anotacao antes de reenviar.",
    },
  ];
  const manualChecks = checks.filter((check) => check.status === "manual").length;

  return {
    id: `assisted-retry-${recordId}`,
    recordId,
    approvedBy,
    reason,
    status: manualChecks ? "manual_confirmation_required" : "ready",
    idempotencyKey: `mobile-offline-retry:${recordId}`,
    checks,
    payloadPolicy: {
      reuseOriginalOfflineId: true,
      resetRetryCount: true,
      automaticRetry: false,
      auditRequired: true,
    },
    audit: {
      event: "mobile_offline_assisted_retry_prepared",
      recordedAt: new Date().toISOString(),
    },
    nextActions: [
      "Confirmar manualmente os checks pendentes.",
      "Executar reenvio assistido somente apos validar duplicidade e estado da OS.",
      "Registrar resultado do reenvio na auditoria operacional.",
    ],
  };
}

export function executeMobileOfflineAssistedRetryDryRun(recordId: string, body: unknown) {
  const payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
  const executedBy = typeof payload.executedBy === "string" ? payload.executedBy : "supervisor";
  const idempotencyKey = typeof payload.idempotencyKey === "string"
    ? payload.idempotencyKey
    : `mobile-offline-retry:${recordId}`;
  const steps = [
    { key: "load_original_action", status: "simulated", detail: "Acao offline original localizada pelo registro bloqueado." },
    { key: "validate_idempotency", status: "simulated", detail: "Chave de idempotencia conferida antes do reenvio." },
    { key: "validate_service_order", status: "manual_required", detail: "Estado real da OS deve ser confirmado antes de producao." },
    { key: "send_payload", status: "dry_run_only", detail: "Envio real permanece bloqueado neste ambiente." },
    { key: "write_audit", status: "simulated", detail: "Auditoria operacional preparada para registrar resultado." },
  ];

  return {
    id: `assisted-retry-execution-${recordId}`,
    recordId,
    executedBy,
    idempotencyKey,
    status: "dry_run_completed",
    realSendBlocked: true,
    duplicateProtected: true,
    steps,
    result: {
      wouldSend: true,
      sent: false,
      retryCountAfterSuccess: 0,
      queueActionAfterSuccess: "remove_from_blocked_queue",
    },
    audit: {
      event: "mobile_offline_assisted_retry_dry_run",
      recordedAt: new Date().toISOString(),
    },
  };
}

export function getMobileOfflineEscalationTimeline(recordId: string) {
  const events = [
    {
      key: "blocked",
      label: "Acao offline bloqueada",
      status: "completed",
      actor: "app_tecnico",
      detail: "Limite de 5 tentativas atingido e item removido do envio automatico.",
    },
    {
      key: "manager_review",
      label: "Revisao gerencial",
      status: "completed",
      actor: "supervisor",
      detail: "Gestor classificou a pendencia e definiu se pode seguir para reenvio assistido.",
    },
    {
      key: "assisted_retry_package",
      label: "Pacote de reenvio",
      status: "completed",
      actor: "console_web",
      detail: "Checks, idempotencia e politica sem reenvio automatico foram preparados.",
    },
    {
      key: "dry_run",
      label: "Simulacao de reenvio",
      status: "completed",
      actor: "console_web",
      detail: "Fluxo foi simulado com envio real bloqueado.",
    },
    {
      key: "production_execution",
      label: "Execucao real",
      status: "blocked",
      actor: "api",
      detail: "Depende de banco real, auditoria persistente e permissao de supervisor.",
    },
  ];

  return {
    recordId,
    generatedAt: new Date().toISOString(),
    currentStatus: "awaiting_production_execution",
    events,
    summary: {
      completed: events.filter((event) => event.status === "completed").length,
      blocked: events.filter((event) => event.status === "blocked").length,
      nextRequiredAction: "Ativar execucao real somente apos persistencia de auditoria e checagem de permissao.",
    },
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
