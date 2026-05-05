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

function getMobileOfflineActionNextStep(owner: string) {
  if (owner === "supervisor") {
    return "Conferir status da OS, assinatura, SLA e idempotencia antes do dry-run.";
  }

  if (owner === "qualidade") {
    return "Validar evidencia, fotos e consistencia do relatorio antes do dry-run.";
  }

  if (owner === "estoque") {
    return "Conferir saldo, reserva e almoxarifado antes do dry-run.";
  }

  return "Conferir pendencia operacional e registrar decisao antes do dry-run.";
}

export function getMobileOfflineAssistedRetryActionPlan() {
  const board = getMobileOfflineEscalationBoard();
  const executiveSummary = getMobileOfflineAssistedRetryExecutiveSummary();
  const actions = board.data
    .slice()
    .sort((a, b) => b.severityScore - a.severityScore)
    .map((item) => {
      const dueInHours = item.priority === "critical" ? 2 : item.priority === "high" ? 6 : 12;

      return {
        id: `action-${item.id}`,
        recordId: item.id,
        serviceOrderId: item.serviceOrderId,
        customer: item.customer,
        owner: item.owner,
        recommendedOwner: item.owner,
        priority: item.priority,
        severityScore: item.severityScore,
        slaStatus: item.slaStatus,
        type: item.actionLabel,
        decision: item.priority === "critical" ? "review_and_dry_run_today" : "collect_evidence_and_schedule_dry_run",
        allowedNow: ["review", "prepare_assisted_retry", "dry_run"],
        blockedNow: ["real_execution"],
        dueInHours,
        nextStep: getMobileOfflineActionNextStep(item.owner),
      };
    });
  const lanes = actions.reduce<Record<string, { owner: string; total: number; critical: number; high: number }>>((acc, item) => {
    const lane = acc[item.recommendedOwner] ?? {
      owner: item.recommendedOwner,
      total: 0,
      critical: 0,
      high: 0,
    };

    lane.total += 1;
    lane.critical += item.priority === "critical" ? 1 : 0;
    lane.high += item.priority === "high" ? 1 : 0;
    acc[item.recommendedOwner] = lane;
    return acc;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    status: "action_plan_ready",
    realExecutionAllowed: false,
    automaticRetryAllowed: false,
    summary: {
      totalActions: actions.length,
      critical: board.summary.critical,
      high: board.summary.high,
      dueInTwoHours: actions.filter((item) => item.dueInHours <= 2).length,
      realExecutionBlocked: true,
      topBlockers: executiveSummary.blockers,
    },
    lanes: Object.values(lanes),
    actions,
    governance: {
      dryRunOnly: true,
      requiresManagerReview: true,
      source: "mobile_offline_assisted_retry_executive_summary",
    },
    nextActions: [
      "Tratar acoes criticas primeiro e registrar revisao.",
      "Preparar reenvio assistido somente depois da conferencia operacional.",
      "Executar dry-run para validar payload e idempotencia sem envio real.",
      "Manter execucao real bloqueada ate banco real, auditoria persistente e permissao sensivel.",
    ],
  };
}

export function getMobileOfflineAssistedRetryDailyCommand() {
  const actionPlan = getMobileOfflineAssistedRetryActionPlan();
  const productionGate = getMobileOfflineAssistedRetryProductionGate();
  const dailyCapacity = {
    supervisor: 6,
    qualidade: 5,
    estoque: 4,
  };
  const workload = actionPlan.lanes.map((lane) => {
    const capacity = dailyCapacity[lane.owner as keyof typeof dailyCapacity] ?? 3;
    const utilization = Math.round((lane.total / capacity) * 100);

    return {
      owner: lane.owner,
      total: lane.total,
      critical: lane.critical,
      high: lane.high,
      dailyCapacity: capacity,
      utilization,
      status: utilization > 100 ? "over_capacity" : utilization >= 80 ? "attention" : "controlled",
    };
  });
  const todayQueue = actionPlan.actions
    .filter((item) => item.dueInHours <= 6)
    .map((item) => ({
      recordId: item.recordId,
      serviceOrderId: item.serviceOrderId,
      customer: item.customer,
      owner: item.recommendedOwner,
      dueInHours: item.dueInHours,
      priority: item.priority,
      severityScore: item.severityScore,
      nextStep: item.nextStep,
    }));

  return {
    generatedAt: new Date().toISOString(),
    status: "daily_command_ready",
    realExecutionAllowed: false,
    summary: {
      totalActions: actionPlan.summary.totalActions,
      todayQueue: todayQueue.length,
      dueInTwoHours: actionPlan.summary.dueInTwoHours,
      overloadedLanes: workload.filter((item) => item.status === "over_capacity").length,
      productionGateStatus: productionGate.status,
      realExecutionBlocked: true,
    },
    workload,
    todayQueue,
    decisions: [
      {
        key: "real_execution",
        status: "blocked",
        reason: "Execucao real depende de banco real, auditoria persistente e permissao sensivel.",
      },
      {
        key: "dry_run",
        status: "allowed",
        reason: "Dry-run valida payload e idempotencia sem alterar sistemas externos.",
      },
      {
        key: "daily_capacity",
        status: workload.some((item) => item.status === "over_capacity") ? "rebalance_required" : "controlled",
        reason: "Capacidade diaria estimada por area para tratar pendencias offline.",
      },
    ],
    nextActions: [
      "Executar primeiro as pendencias com vencimento em ate duas horas.",
      "Rebalancear areas acima da capacidade antes de iniciar dry-runs em lote.",
      "Registrar decisao gerencial em cada pendencia antes de preparar reenvio assistido.",
      "Manter envio real bloqueado ate o gate de producao ficar aprovado.",
    ],
  };
}

export function getMobileOfflineAssistedRetryDryRunBatch() {
  const dailyCommand = getMobileOfflineAssistedRetryDailyCommand();
  const actionPlan = getMobileOfflineAssistedRetryActionPlan();
  const batchLimit = 3;
  const candidates = actionPlan.actions
    .filter((item) => item.allowedNow.includes("dry_run"))
    .slice(0, batchLimit)
    .map((item, index) => ({
      sequence: index + 1,
      recordId: item.recordId,
      serviceOrderId: item.serviceOrderId,
      customer: item.customer,
      owner: item.recommendedOwner,
      priority: item.priority,
      severityScore: item.severityScore,
      idempotencyKey: `mobile-offline-retry:${item.recordId}`,
      preChecks: [
        "manager_review_recorded",
        "assisted_retry_prepared",
        "payload_hash_generated",
        "real_execution_disabled",
      ],
      dryRunOnly: true,
    }));

  return {
    generatedAt: new Date().toISOString(),
    status: "dry_run_batch_ready",
    realExecutionAllowed: false,
    automaticExecutionAllowed: false,
    summary: {
      batchLimit,
      selectedForDryRun: candidates.length,
      remainingAfterBatch: Math.max(actionPlan.actions.length - candidates.length, 0),
      dailyQueue: dailyCommand.summary.todayQueue,
      realExecutionBlocked: true,
    },
    candidates,
    controls: {
      requiresHumanStart: true,
      stopOnFirstFailure: true,
      maxParallelDryRuns: 1,
      idempotencyRequired: true,
      persistAuditBeforeRealExecution: true,
    },
    blockedActions: [
      {
        key: "real_batch_execution",
        reason: "Lote real permanece bloqueado ate gate de producao, banco real e auditoria persistente.",
      },
      {
        key: "automatic_retry_loop",
        reason: "Loop automatico nao e permitido para pendencias offline criticas.",
      },
    ],
    auditTrail: [
      "mobile_offline_dry_run_batch_planned",
      "mobile_offline_assisted_retry_prepared",
      "mobile_offline_assisted_retry_dry_run",
    ],
    nextActions: [
      "Revisar candidatos selecionados antes de iniciar o primeiro dry-run.",
      "Executar um dry-run por vez e parar no primeiro erro.",
      "Registrar evidencia de payload e idempotencia para cada candidato.",
      "Nao converter dry-run em execucao real ate o gate de producao estar aprovado.",
    ],
  };
}

export function getMobileOfflineAssistedRetryEvidencePackage() {
  const dryRunBatch = getMobileOfflineAssistedRetryDryRunBatch();
  const auditContract = getMobileOfflineAssistedRetryAuditContract();
  const evidenceItems = dryRunBatch.candidates.map((candidate) => ({
    recordId: candidate.recordId,
    serviceOrderId: candidate.serviceOrderId,
    customer: candidate.customer,
    idempotencyKey: candidate.idempotencyKey,
    requiredEvidence: [
      {
        key: "manager_review",
        label: "Revisao gerencial",
        status: "required",
        detail: "Registrar decisao e responsavel antes do preparo do reenvio assistido.",
      },
      {
        key: "payload_hash",
        label: "Hash do payload",
        status: "required",
        detail: "Guardar hash do payload do dry-run sem expor dados sensiveis.",
      },
      {
        key: "dry_run_result",
        label: "Resultado do dry-run",
        status: "required",
        detail: "Registrar sucesso, falha, codigo interno e mensagem normalizada.",
      },
      {
        key: "idempotency_trace",
        label: "Trilha de idempotencia",
        status: "required",
        detail: "Comprovar que a chave de idempotencia bloqueia duplicidade.",
      },
    ],
    retention: {
      minimumDays: 365,
      piiPolicy: "store_hashes_and_references_not_raw_payload",
      exportAllowed: false,
    },
  }));

  return {
    generatedAt: new Date().toISOString(),
    status: "evidence_package_ready",
    realExecutionAllowed: false,
    summary: {
      candidates: evidenceItems.length,
      requiredEvidencePerCandidate: evidenceItems[0]?.requiredEvidence.length ?? 0,
      auditEventsRequired: auditContract.summary.totalEvents,
      persistenceRequiredBeforeRealExecution: auditContract.persistenceRequiredBeforeRealExecution,
      realExecutionBlocked: true,
    },
    evidenceItems,
    auditEvents: auditContract.events.map((item) => item.event),
    controls: {
      storeRawPayload: false,
      storePayloadHash: true,
      requireActor: true,
      requireTenantId: true,
      requireTimestamp: true,
      immutableAfterApproval: true,
    },
    blockers: [
      "Banco real ainda nao configurado para persistir evidencias.",
      "Auditoria persistente ainda e requisito antes da execucao real.",
      "Permissao sensivel de envio real ainda deve ficar bloqueada por padrao.",
    ],
    nextActions: [
      "Persistir pacote de evidencias em banco real antes de homologacao final.",
      "Validar que cada dry-run gera hash, ator, tenant e timestamp.",
      "Conferir retencao minima e politica de dados sensiveis.",
      "Manter envio real bloqueado enquanto evidencias nao forem persistidas.",
    ],
  };
}

export function getMobileOfflineAssistedRetryFinalHomologationMatrix() {
  const evidencePackage = getMobileOfflineAssistedRetryEvidencePackage();
  const productionGate = getMobileOfflineAssistedRetryProductionGate();
  const permissions = getMobileOfflineAssistedRetryPermissions();
  const dryRunBatch = getMobileOfflineAssistedRetryDryRunBatch();
  const checks = [
    {
      key: "dry_run_batch",
      label: "Lote dry-run planejado",
      status: dryRunBatch.summary.selectedForDryRun > 0 ? "pass" : "block",
      detail: `${dryRunBatch.summary.selectedForDryRun} candidato(s) selecionado(s) para dry-run controlado.`,
    },
    {
      key: "evidence_package",
      label: "Pacote de evidencias",
      status: evidencePackage.summary.candidates > 0 ? "attention" : "block",
      detail: "Evidencias estao definidas, mas ainda dependem de persistencia real.",
    },
    {
      key: "production_gate",
      label: "Gate de producao",
      status: productionGate.status === "blocked" ? "block" : "pass",
      detail: "Execucao real segue bloqueada ate requisitos de producao.",
    },
    {
      key: "sensitive_permission",
      label: "Permissao sensivel",
      status: permissions.defaultDecision === "deny" ? "pass" : "block",
      detail: "Permissao padrao deve negar execucao real para evitar reenvio acidental.",
    },
    {
      key: "audit_persistence",
      label: "Auditoria persistente",
      status: evidencePackage.summary.persistenceRequiredBeforeRealExecution ? "block" : "pass",
      detail: "Persistencia de auditoria ainda e requisito antes da producao.",
    },
  ];
  const blocked = checks.filter((item) => item.status === "block");
  const attention = checks.filter((item) => item.status === "attention");

  return {
    generatedAt: new Date().toISOString(),
    status: blocked.length ? "homologation_blocked" : "homologation_ready",
    realExecutionAllowed: false,
    summary: {
      totalChecks: checks.length,
      passed: checks.filter((item) => item.status === "pass").length,
      attention: attention.length,
      blocked: blocked.length,
      selectedForDryRun: dryRunBatch.summary.selectedForDryRun,
      realExecutionBlocked: true,
    },
    checks,
    approvals: [
      {
        role: "owner",
        required: true,
        decision: "pending",
        reason: "Aprovar mudanca de dry-run controlado para homologacao final.",
      },
      {
        role: "admin",
        required: true,
        decision: "pending",
        reason: "Validar permissao sensivel e segregacao por tenant.",
      },
      {
        role: "audit",
        required: true,
        decision: "pending",
        reason: "Confirmar trilha persistente e politica de retencao.",
      },
    ],
    blockers: blocked.map((item) => item.key),
    nextActions: [
      "Executar dry-runs controlados e registrar evidencias completas.",
      "Persistir auditoria em banco real antes de liberar qualquer execucao real.",
      "Conferir permissoes owner/admin por tenant.",
      "Revalidar gate de producao apos integracoes reais estarem configuradas.",
    ],
  };
}

export function getMobileOfflineAssistedRetryControlledReleasePlan() {
  const homologation = getMobileOfflineAssistedRetryFinalHomologationMatrix();
  const phases = [
    {
      phase: "phase_0_mock_control",
      label: "Controle em mock",
      status: "current",
      entryCriteria: ["Fluxos mockados validados", "Testes automatizados verdes", "Envio real bloqueado"],
      exitCriteria: ["Banco real configurado", "Auditoria persistente criada", "Permissoes sensiveis revisadas"],
      allowedActions: ["review", "prepare_assisted_retry", "dry_run"],
      blockedActions: ["real_execution", "automatic_retry_loop"],
    },
    {
      phase: "phase_1_real_persistence",
      label: "Persistencia real sem envio externo",
      status: "blocked",
      entryCriteria: ["DATABASE_URL configurado", "Prisma migrado", "Auditoria persistente ativa"],
      exitCriteria: ["Evidencias gravadas em banco real", "Rollback validado", "Tenant isolado"],
      allowedActions: ["review", "prepare_assisted_retry", "dry_run", "persist_evidence"],
      blockedActions: ["real_execution"],
    },
    {
      phase: "phase_2_homologation_tenant",
      label: "Homologacao por tenant",
      status: "blocked",
      entryCriteria: ["Tenant de homologacao criado", "Owner/admin aprovados", "Gate sem bloqueios criticos"],
      exitCriteria: ["Dry-run real auditado", "Permissoes confirmadas", "Monitoramento ativo"],
      allowedActions: ["tenant_scoped_dry_run", "evidence_review"],
      blockedActions: ["broad_release", "automatic_retry_loop"],
    },
    {
      phase: "phase_3_controlled_real_execution",
      label: "Execucao real controlada",
      status: "blocked",
      entryCriteria: ["Homologacao aprovada", "Auditoria persistente", "Rollback testado", "Aprovacao owner/admin/audit"],
      exitCriteria: ["Primeira execucao real sem duplicidade", "Evidencias completas", "Monitoramento sem alerta critico"],
      allowedActions: ["single_real_retry_with_human_approval"],
      blockedActions: ["batch_real_execution", "automatic_retry_loop"],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "release_plan_ready",
    realExecutionAllowed: false,
    currentPhase: "phase_0_mock_control",
    summary: {
      phases: phases.length,
      blockedPhases: phases.filter((item) => item.status === "blocked").length,
      homologationStatus: homologation.status,
      homologationBlockedChecks: homologation.summary.blocked,
      realExecutionBlocked: true,
    },
    phases,
    rollback: {
      strategy: "disable_real_execution_and_return_to_dry_run_only",
      requiredBeforePhase3: true,
      checkpoints: [
        "Snapshot de evidencias antes da execucao real.",
        "Chave de idempotencia validada antes de retry real.",
        "Feature flag de execucao real desligavel por tenant.",
        "Auditoria imutavel disponivel para revisao.",
      ],
    },
    governance: {
      ownerApprovalRequired: true,
      adminApprovalRequired: true,
      auditApprovalRequired: true,
      tenantScopedReleaseOnly: true,
      defaultDecision: "keep_blocked",
    },
    nextActions: [
      "Concluir banco real e migracoes antes de sair da fase mock.",
      "Persistir evidencias reais sem envio externo na fase 1.",
      "Homologar por tenant antes de qualquer execucao real.",
      "Liberar somente uma execucao real manual e monitorada na fase 3.",
    ],
  };
}

export function getMobileOfflineAssistedRetryProductionReadinessBoard() {
  const controlledRelease = getMobileOfflineAssistedRetryControlledReleasePlan();
  const finalHomologation = getMobileOfflineAssistedRetryFinalHomologationMatrix();
  const productionGate = getMobileOfflineAssistedRetryProductionGate();
  const evidencePackage = getMobileOfflineAssistedRetryEvidencePackage();
  const readinessItems = [
    {
      key: "mock_flows",
      label: "Fluxos controlados",
      status: "ready",
      weight: 20,
      detail: "API, console, dry-run, evidencias e homologacao controlada estao conectados.",
    },
    {
      key: "automated_validation",
      label: "Validacao automatizada",
      status: "ready",
      weight: 15,
      detail: "Typecheck, testes e build cobrem o fluxo controlado.",
    },
    {
      key: "real_database",
      label: "Banco real",
      status: "blocked",
      weight: 20,
      detail: "Persistencia real ainda precisa ser configurada antes da producao.",
    },
    {
      key: "persistent_audit",
      label: "Auditoria persistente",
      status: evidencePackage.summary.persistenceRequiredBeforeRealExecution ? "blocked" : "ready",
      weight: 15,
      detail: "Evidencias e eventos precisam ser gravados de forma persistente e auditavel.",
    },
    {
      key: "tenant_permissions",
      label: "Permissoes por tenant",
      status: "attention",
      weight: 10,
      detail: "Permissoes sensiveis estao negadas por padrao, mas precisam de revisao em ambiente real.",
    },
    {
      key: "production_gate",
      label: "Gate de producao",
      status: productionGate.status === "blocked" ? "blocked" : "ready",
      weight: 20,
      detail: "Gate ainda bloqueia execucao real ate os requisitos criticos serem atendidos.",
    },
  ];
  const readinessScore = readinessItems
    .filter((item) => item.status === "ready")
    .reduce((total, item) => total + item.weight, 0);

  return {
    generatedAt: new Date().toISOString(),
    status: "production_readiness_blocked",
    realExecutionAllowed: false,
    readinessScore,
    summary: {
      readyItems: readinessItems.filter((item) => item.status === "ready").length,
      attentionItems: readinessItems.filter((item) => item.status === "attention").length,
      blockedItems: readinessItems.filter((item) => item.status === "blocked").length,
      currentPhase: controlledRelease.currentPhase,
      homologationStatus: finalHomologation.status,
      realExecutionBlocked: true,
    },
    readinessItems,
    topRisks: [
      {
        key: "real_database_missing",
        severity: "critical",
        mitigation: "Configurar banco real, migracoes e smoke test antes de persistir evidencias reais.",
      },
      {
        key: "audit_persistence_missing",
        severity: "critical",
        mitigation: "Persistir eventos e hashes antes de qualquer execucao real.",
      },
      {
        key: "tenant_permission_review",
        severity: "high",
        mitigation: "Validar owner/admin/audit por tenant antes da primeira liberacao controlada.",
      },
    ],
    releaseDecision: {
      decision: "keep_blocked",
      reason: "Prontidao operacional controlada esta avancada, mas producao real depende de banco, auditoria e permissoes reais.",
      minimumScoreForRealExecution: 95,
    },
    nextActions: [
      "Executar transicao para banco real com smoke test.",
      "Persistir evidencias e eventos de auditoria em banco real.",
      "Validar permissoes sensiveis por tenant.",
      "Reexecutar homologacao final antes de qualquer retry real.",
    ],
  };
}

export function getMobileOfflineAssistedRetryInfrastructureBacklog() {
  const readiness = getMobileOfflineAssistedRetryProductionReadinessBoard();
  const backlog = [
    {
      key: "database",
      area: "infra",
      priority: "critical",
      title: "Banco real e migracoes",
      requiredConfig: ["DATABASE_URL", "Prisma migrate", "backup policy"],
      owner: "platform",
      status: "pending",
      blocks: ["phase_1_real_persistence", "persistent_audit", "real_execution"],
    },
    {
      key: "audit_storage",
      area: "security",
      priority: "critical",
      title: "Auditoria persistente e imutavel",
      requiredConfig: ["audit table", "payload hash", "actor tenant timestamp", "retention policy"],
      owner: "platform",
      status: "pending",
      blocks: ["evidence_persistence", "final_homologation", "real_execution"],
    },
    {
      key: "auth_permissions",
      area: "security",
      priority: "critical",
      title: "Autenticacao e permissoes sensiveis",
      requiredConfig: ["JWT_SECRET", "owner role", "admin role", "audit role", "tenant isolation"],
      owner: "platform",
      status: "pending",
      blocks: ["tenant_release", "real_execution"],
    },
    {
      key: "email_provider",
      area: "integration",
      priority: "high",
      title: "Provedor de e-mail transacional",
      requiredConfig: ["SMTP or API provider", "sender domain", "delivery logs"],
      owner: "operations",
      status: "pending",
      blocks: ["completion_email_real_send", "customer_copy"],
    },
    {
      key: "maps_provider",
      area: "integration",
      priority: "high",
      title: "Mapas, rotas e geocodificacao",
      requiredConfig: ["maps API key", "route matrix", "geocoding quota"],
      owner: "operations",
      status: "pending",
      blocks: ["route_optimization_real", "technician_tracking"],
    },
    {
      key: "ai_provider",
      area: "integration",
      priority: "high",
      title: "IA para texto e diagnostico visual",
      requiredConfig: ["OPENAI_API_KEY", "usage limits", "prompt logging policy"],
      owner: "platform",
      status: "pending",
      blocks: ["real_ai_text_review", "visual_diagnosis"],
    },
    {
      key: "hosting_domain",
      area: "deploy",
      priority: "high",
      title: "Hospedagem, dominio e SSL",
      requiredConfig: ["hosting account", "domain", "SSL", "environment variables"],
      owner: "platform",
      status: "pending",
      blocks: ["public_access", "tenant_portal"],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "infrastructure_backlog_ready",
    realExecutionAllowed: false,
    summary: {
      totalItems: backlog.length,
      critical: backlog.filter((item) => item.priority === "critical").length,
      high: backlog.filter((item) => item.priority === "high").length,
      readinessScore: readiness.readinessScore,
      productionDecision: readiness.releaseDecision.decision,
    },
    backlog,
    guardrails: [
      "Nao registrar segredos em documentos, commits ou logs.",
      "Configurar variaveis reais somente no provedor de hospedagem.",
      "Manter execucao real bloqueada ate banco, auditoria e permissoes estarem aprovados.",
      "Validar custos e limites antes de ativar provedores externos.",
    ],
    nextActions: [
      "Priorizar banco real, auditoria e permissoes sensiveis.",
      "Definir provedores de e-mail, mapas e IA antes da homologacao externa.",
      "Preparar ambiente de staging com variaveis reais fora do repositorio.",
      "Reexecutar readiness e homologacao final apos infraestrutura configurada.",
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
