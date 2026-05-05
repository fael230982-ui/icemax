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

export function getMobileOfflineAssistedRetryProviderCostPlan() {
  const infrastructure = getMobileOfflineAssistedRetryInfrastructureBacklog();
  const providerPlans = [
    {
      key: "database",
      providerCategory: "managed_postgres",
      purpose: "Persistir tenants, OS, evidencias, auditoria e idempotencia.",
      requiredBefore: "phase_1_real_persistence",
      costModel: "monthly_base_plus_storage_and_backups",
      budgetGuardrails: [
        "Definir teto mensal antes de migrar.",
        "Ativar alertas de uso e armazenamento.",
        "Separar staging e producao quando o plano permitir.",
      ],
      secretPolicy: "DATABASE_URL somente no provedor de hospedagem ou cofre seguro.",
      status: "pending",
    },
    {
      key: "email_provider",
      providerCategory: "transactional_email",
      purpose: "Enviar conclusao de OS, copia ao cliente e notificacoes operacionais.",
      requiredBefore: "external_email_homologation",
      costModel: "per_email_or_monthly_plan",
      budgetGuardrails: [
        "Validar volume mensal previsto por tenant.",
        "Configurar dominio remetente antes do envio real.",
        "Monitorar bounces, rejeicoes e reputacao.",
      ],
      secretPolicy: "SMTP/API key fora do repositorio.",
      status: "pending",
    },
    {
      key: "maps_provider",
      providerCategory: "maps_routes_geocoding",
      purpose: "Calcular rotas, tempo de deslocamento, geocodificacao e apoio ao rastreamento.",
      requiredBefore: "route_optimization_real",
      costModel: "per_request_or_usage_quota",
      budgetGuardrails: [
        "Definir cota diaria de geocodificacao.",
        "Cachear enderecos e matrizes de rota quando permitido.",
        "Bloquear chamadas repetidas fora da janela operacional.",
      ],
      secretPolicy: "Chave de mapas somente em variavel de ambiente do servidor.",
      status: "pending",
    },
    {
      key: "ai_provider",
      providerCategory: "ai_text_vision",
      purpose: "Revisar textos tecnicos, apoiar diagnostico visual e padronizar relatorios.",
      requiredBefore: "real_ai_features",
      costModel: "per_token_or_image_usage",
      budgetGuardrails: [
        "Definir limite por OS e por tenant.",
        "Registrar apenas metadados necessarios para auditoria.",
        "Aplicar fallback manual quando o teto de uso for atingido.",
      ],
      secretPolicy: "OPENAI_API_KEY somente em ambiente seguro, nunca em documento ou commit.",
      status: "pending",
    },
    {
      key: "hosting_domain",
      providerCategory: "hosting_domain_ssl",
      purpose: "Publicar API, painel web, portais e ambientes por tenant.",
      requiredBefore: "public_access",
      costModel: "monthly_hosting_plus_domain_annual",
      budgetGuardrails: [
        "Separar custo de hospedagem, dominio, SSL e observabilidade.",
        "Ativar alertas de CPU, memoria, trafego e armazenamento.",
        "Manter rollback de deploy antes da homologacao externa.",
      ],
      secretPolicy: "Variaveis reais configuradas somente no painel de hospedagem.",
      status: "pending",
    },
    {
      key: "whatsapp_provider",
      providerCategory: "messaging_whatsapp",
      purpose: "Enviar notificacoes, lembretes e comunicacao operacional quando ativado.",
      requiredBefore: "customer_messaging_real",
      costModel: "per_conversation_or_template",
      budgetGuardrails: [
        "Aprovar templates antes do uso real.",
        "Definir limite de conversas por cliente e por contrato.",
        "Manter opt-in e historico de consentimento.",
      ],
      secretPolicy: "Token Meta/WhatsApp somente no cofre ou ambiente seguro.",
      status: "pending",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "provider_cost_plan_ready",
    realExecutionAllowed: false,
    summary: {
      providers: providerPlans.length,
      pending: providerPlans.filter((item) => item.status === "pending").length,
      criticalInfrastructureItems: infrastructure.summary.critical,
      fixedPricesIncluded: false,
      secretsIncluded: false,
    },
    providerPlans,
    approvalPolicy: {
      ownerApprovalRequired: true,
      budgetLimitRequiredBeforeActivation: true,
      usageAlertsRequired: true,
      noSecretsInRepository: true,
    },
    rolloutOrder: ["database", "hosting_domain", "email_provider", "maps_provider", "ai_provider", "whatsapp_provider"],
    guardrails: [
      "Nao registrar valores de chaves, tokens ou senhas.",
      "Validar custo estimado no painel oficial de cada provedor antes de ativar.",
      "Definir teto mensal e alertas antes da homologacao externa.",
      "Manter execucao real bloqueada ate provedores criticos estarem configurados.",
    ],
    nextActions: [
      "Escolher provedor de banco e hospedagem antes da primeira homologacao externa.",
      "Definir teto mensal por provedor e por tenant.",
      "Cadastrar chaves reais somente no ambiente seguro.",
      "Reexecutar validacao tecnica apos ativar cada provedor.",
    ],
  };
}

export function getMobileOfflineAssistedRetryProviderActivationGate() {
  const costPlan = getMobileOfflineAssistedRetryProviderCostPlan();
  const activationChecks = [
    {
      key: "database",
      providerCategory: "managed_postgres",
      requiredBefore: "phase_1_real_persistence",
      checks: [
        { key: "provider_selected", status: "pending", detail: "Provedor de banco ainda precisa ser aprovado." },
        { key: "budget_limit", status: "pending", detail: "Teto mensal ainda precisa ser definido." },
        { key: "usage_alerts", status: "pending", detail: "Alertas de armazenamento e conexoes ainda precisam ser ativados." },
        { key: "secret_configured", status: process.env.DATABASE_URL ? "manual_review" : "pending", detail: "DATABASE_URL deve existir apenas no ambiente seguro." },
      ],
    },
    {
      key: "hosting_domain",
      providerCategory: "hosting_domain_ssl",
      requiredBefore: "public_access",
      checks: [
        { key: "provider_selected", status: "pending", detail: "Hospedagem e dominio ainda precisam ser escolhidos." },
        { key: "budget_limit", status: "pending", detail: "Teto de hospedagem, trafego e observabilidade ainda precisa ser aprovado." },
        { key: "usage_alerts", status: "pending", detail: "Alertas de CPU, memoria e trafego ainda precisam ser ativados." },
        { key: "rollback_plan", status: "pending", detail: "Plano de rollback de deploy ainda precisa ser homologado." },
      ],
    },
    {
      key: "email_provider",
      providerCategory: "transactional_email",
      requiredBefore: "external_email_homologation",
      checks: [
        { key: "provider_selected", status: "pending", detail: "Provedor transacional ainda precisa ser definido." },
        { key: "budget_limit", status: "pending", detail: "Volume mensal e limite de envio ainda precisam ser aprovados." },
        { key: "domain_authentication", status: "pending", detail: "Dominio remetente ainda precisa de SPF, DKIM e politica de envio." },
        { key: "delivery_logs", status: "pending", detail: "Logs de entrega, bounce e rejeicao ainda precisam ser configurados." },
      ],
    },
    {
      key: "maps_provider",
      providerCategory: "maps_routes_geocoding",
      requiredBefore: "route_optimization_real",
      checks: [
        { key: "provider_selected", status: "pending", detail: "Provedor de mapas ainda precisa ser escolhido." },
        { key: "budget_limit", status: "pending", detail: "Cota diaria e teto mensal de chamadas ainda precisam ser definidos." },
        { key: "usage_alerts", status: "pending", detail: "Alertas de quota e cobranca ainda precisam ser ativados." },
        { key: "cache_policy", status: "pending", detail: "Politica de cache de enderecos e rotas ainda precisa ser aprovada." },
      ],
    },
    {
      key: "ai_provider",
      providerCategory: "ai_text_vision",
      requiredBefore: "real_ai_features",
      checks: [
        { key: "provider_selected", status: "pending", detail: "Provedor de IA ainda precisa ser aprovado." },
        { key: "budget_limit", status: "pending", detail: "Limite por OS, por imagem e por tenant ainda precisa ser definido." },
        { key: "privacy_policy", status: "pending", detail: "Politica de dados enviados para IA ainda precisa ser validada." },
        { key: "fallback_manual", status: "pending", detail: "Fluxo manual quando o teto for atingido ainda precisa ser mantido." },
      ],
    },
    {
      key: "whatsapp_provider",
      providerCategory: "messaging_whatsapp",
      requiredBefore: "customer_messaging_real",
      checks: [
        { key: "provider_selected", status: "pending", detail: "Conta Meta/WhatsApp ainda precisa ser preparada." },
        { key: "budget_limit", status: "pending", detail: "Teto de conversas e templates ainda precisa ser aprovado." },
        { key: "template_approval", status: "pending", detail: "Templates oficiais ainda precisam ser aprovados." },
        { key: "customer_consent", status: "pending", detail: "Opt-in e historico de consentimento ainda precisam estar rastreaveis." },
      ],
    },
  ];
  const blockedProviders = activationChecks.filter((provider) =>
    provider.checks.some((check) => check.status === "pending"));

  return {
    generatedAt: new Date().toISOString(),
    status: "provider_activation_blocked",
    realExecutionAllowed: false,
    summary: {
      providers: activationChecks.length,
      blocked: blockedProviders.length,
      readyForActivation: activationChecks.length - blockedProviders.length,
      sourceProviders: costPlan.summary.providers,
      ownerApprovalRequired: costPlan.approvalPolicy.ownerApprovalRequired,
    },
    activationChecks,
    decision: {
      result: "keep_blocked",
      reason: "Provedores ainda nao possuem teto, alertas, homologacao e configuracao segura suficientes.",
      allowedActions: ["planning", "manual_provider_selection", "budget_approval", "staging_configuration"],
      blockedActions: ["real_retry", "automatic_retry_loop", "external_customer_send", "production_provider_calls"],
    },
    guardrails: [
      "Nao ativar provedor real sem teto mensal aprovado.",
      "Nao executar envio real enquanto logs, alertas e rollback nao estiverem prontos.",
      "Nao registrar segredo em documento, checklist, changelog ou commit.",
      "Reexecutar validate e homologacao final apos cada configuracao externa.",
    ],
    nextActions: [
      "Escolher banco e hospedagem primeiro.",
      "Definir teto mensal e alertas por provedor.",
      "Preparar ambiente de staging com segredos fora do repositorio.",
      "Revisar este gate antes de liberar qualquer integracao real.",
    ],
  };
}

export function getMobileOfflineAssistedRetryProviderHomologationRunbook() {
  const activationGate = getMobileOfflineAssistedRetryProviderActivationGate();
  const phases = [
    {
      key: "phase_0_selection",
      title: "Selecao e aprovacao",
      status: "pending",
      owner: "RAFAEL DA SILVA BEZEERA",
      providers: ["database", "hosting_domain", "email_provider", "maps_provider", "ai_provider", "whatsapp_provider"],
      requiredEvidence: [
        "Provedor escolhido por categoria.",
        "Teto mensal aprovado por provedor.",
        "Politica de alertas definida.",
        "Decisao registrada sem expor credenciais.",
      ],
      exitCriteria: "Todos os provedores necessarios para staging aprovados e com limite de custo definido.",
    },
    {
      key: "phase_1_secure_staging",
      title: "Configuracao segura em staging",
      status: "blocked",
      owner: "platform",
      providers: ["database", "hosting_domain", "email_provider", "maps_provider", "ai_provider"],
      requiredEvidence: [
        "Variaveis reais cadastradas somente no ambiente seguro.",
        "Logs de entrega e auditoria habilitados.",
        "Alertas de uso ativos.",
        "Nenhum segredo registrado em commit, documento ou log.",
      ],
      exitCriteria: "Staging executa chamadas controladas sem vazamento de segredo e com auditoria rastreavel.",
    },
    {
      key: "phase_2_controlled_provider_smoke",
      title: "Smoke test controlado",
      status: "blocked",
      owner: "qa",
      providers: ["database", "email_provider", "maps_provider", "ai_provider"],
      requiredEvidence: [
        "Consulta simples de banco real validada.",
        "E-mail de teste enviado para destinatario interno.",
        "Rota/geocodificacao testada com endereco de demonstracao.",
        "Revisao de texto por IA testada com conteudo ficticio.",
      ],
      exitCriteria: "Chamadas externas funcionam em staging, com custo rastreado e sem contato real com cliente.",
    },
    {
      key: "phase_3_business_homologation",
      title: "Homologacao operacional",
      status: "blocked",
      owner: "operations",
      providers: ["database", "hosting_domain", "email_provider", "maps_provider", "ai_provider", "whatsapp_provider"],
      requiredEvidence: [
        "Fluxo de OS completo revisado.",
        "Cliente ficticio recebe comunicacao apenas em canal de teste.",
        "Relatorio, assinatura e evidencias conferidos.",
        "Fallback manual documentado para cada provedor.",
      ],
      exitCriteria: "Operacao aprova fluxo sem envio real para cliente externo.",
    },
    {
      key: "phase_4_production_decision",
      title: "Decisao de producao",
      status: "blocked",
      owner: "RAFAEL DA SILVA BEZEERA",
      providers: ["database", "hosting_domain", "email_provider", "maps_provider", "ai_provider", "whatsapp_provider"],
      requiredEvidence: [
        "Checklist completo validado.",
        "CHANGELOG atualizado.",
        "npm run validate executado.",
        "Plano de rollback aprovado.",
        "Aprovacao humana registrada.",
      ],
      exitCriteria: "Somente o titular aprova qualquer ativacao real por tenant.",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "provider_homologation_runbook_ready",
    realExecutionAllowed: false,
    summary: {
      phases: phases.length,
      blockedPhases: phases.filter((phase) => phase.status === "blocked").length,
      pendingPhases: phases.filter((phase) => phase.status === "pending").length,
      gateDecision: activationGate.decision.result,
      productionProviderCallsAllowed: false,
    },
    phases,
    evidencePolicy: {
      mustAvoidSecrets: true,
      internalRecipientsOnly: true,
      customerCommunicationBlocked: true,
      ownerApprovalRequired: true,
    },
    requiredCommands: ["npm run validate", "guard:secrets", "typecheck", "test", "build -w apps/web"],
    guardrails: [
      "Usar somente dados ficticios em smoke test de provedor.",
      "Enviar e-mail, WhatsApp e notificacoes apenas para canais internos de teste.",
      "Nao colar prints com chaves, tokens, URLs privadas ou dados sensiveis.",
      "Manter producao bloqueada enquanto o gate de ativacao indicar keep_blocked.",
    ],
    nextActions: [
      "Preparar checklist de decisao de provedor por categoria.",
      "Definir plano de staging sem expor segredos no repositorio.",
      "Criar evidencias internas para smoke test controlado.",
      "Revisar gate de ativacao antes de qualquer chamada real.",
    ],
  };
}

export function getMobileOfflineAssistedRetryProviderEvidenceBoard() {
  const runbook = getMobileOfflineAssistedRetryProviderHomologationRunbook();
  const evidenceItems = runbook.phases.flatMap((phase) =>
    phase.requiredEvidence.map((evidence, index) => ({
      id: `${phase.key}-evidence-${index + 1}`,
      phase: phase.key,
      phaseTitle: phase.title,
      owner: phase.owner,
      description: evidence,
      status: phase.status === "pending" ? "pending_capture" : "blocked",
      requiresSecretReview: evidence.toLowerCase().includes("variaveis reais")
        || evidence.toLowerCase().includes("credenciais")
        || evidence.toLowerCase().includes("segredo"),
      allowedStorage: "internal_evidence_vault_only",
      publicRepositoryAllowed: false,
    })));
  const blockedItems = evidenceItems.filter((item) => item.status === "blocked");
  const sensitiveItems = evidenceItems.filter((item) => item.requiresSecretReview);

  return {
    generatedAt: new Date().toISOString(),
    status: "provider_evidence_board_ready",
    realExecutionAllowed: false,
    summary: {
      evidenceItems: evidenceItems.length,
      blockedItems: blockedItems.length,
      pendingCapture: evidenceItems.filter((item) => item.status === "pending_capture").length,
      sensitiveItems: sensitiveItems.length,
      phases: runbook.summary.phases,
      gateDecision: runbook.summary.gateDecision,
    },
    evidenceItems,
    acceptanceRules: [
      "Evidencia nao pode conter chaves, tokens, senhas, URLs privadas ou dados sensiveis.",
      "Prints devem ocultar qualquer segredo antes de armazenamento interno.",
      "Evidencias de e-mail, WhatsApp e notificacao devem usar destinatarios internos.",
      "Cada item precisa de responsavel, data, ambiente e resultado esperado antes da aprovacao.",
    ],
    rejectionRules: [
      "Rejeitar evidencia com segredo visivel.",
      "Rejeitar teste feito com cliente real antes da homologacao externa aprovada.",
      "Rejeitar evidencia sem comando de validacao ou sem log de resultado.",
      "Rejeitar aprovacao de producao enquanto o gate estiver em keep_blocked.",
    ],
    nextActions: [
      "Capturar evidencias da fase de selecao sem incluir credenciais.",
      "Preparar local seguro para armazenar evidencias internas.",
      "Definir responsavel por revisar itens sensiveis.",
      "Manter push para GitHub sem anexos sensiveis.",
    ],
  };
}

export function getMobileOfflineAssistedRetryTenantActivationDecisionPackage() {
  const evidenceBoard = getMobileOfflineAssistedRetryProviderEvidenceBoard();
  const blockingReasons = [
    {
      key: "provider_gate",
      severity: "critical",
      status: "blocked",
      detail: "Gate de provedores ainda indica keep_blocked.",
    },
    {
      key: "evidence_board",
      severity: "critical",
      status: "blocked",
      detail: "Evidencias de homologacao ainda possuem itens bloqueados ou pendentes.",
    },
    {
      key: "budget_approval",
      severity: "high",
      status: "pending",
      detail: "Teto mensal por provedor e por tenant ainda precisa de aprovacao formal.",
    },
    {
      key: "secure_secrets",
      severity: "critical",
      status: "blocked",
      detail: "Segredos reais devem existir somente no ambiente seguro antes da ativacao.",
    },
    {
      key: "human_approval",
      severity: "critical",
      status: "pending",
      detail: "Aprovacao humana do titular ainda e obrigatoria para cada tenant.",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "tenant_activation_decision_package_ready",
    tenantId: config.defaultTenantId,
    tenantScope: "default_whitelabel_template",
    realExecutionAllowed: false,
    summary: {
      decision: "do_not_activate",
      blockingReasons: blockingReasons.length,
      criticalBlocks: blockingReasons.filter((item) => item.severity === "critical").length,
      evidenceItems: evidenceBoard.summary.evidenceItems,
      evidenceBlocked: evidenceBoard.summary.blockedItems,
      gateDecision: evidenceBoard.summary.gateDecision,
    },
    decision: {
      result: "do_not_activate",
      reason: "Tenant ainda nao possui evidencias, orcamento, alertas, segredos seguros e aprovacao suficientes para provedores reais.",
      allowedActions: ["continue_development", "prepare_staging", "collect_internal_evidence", "approve_provider_budget"],
      blockedActions: ["activate_real_provider", "enable_customer_send", "enable_automatic_retry", "enable_commercial_tenant_release"],
    },
    blockingReasons,
    requiredSignoffs: [
      { role: "owner", name: "RAFAEL DA SILVA BEZEERA", status: "pending", requiredFor: "tenant_activation" },
      { role: "platform", name: "DESENVOLVEDOR E PROJETISTA", status: "pending", requiredFor: "secure_configuration" },
      { role: "operations", name: "Operacao", status: "pending", requiredFor: "business_homologation" },
    ],
    tenantReleaseCriteria: [
      "Gate de provedores precisa sair de keep_blocked.",
      "Todas as evidencias precisam estar aprovadas sem segredos visiveis.",
      "Teto mensal e alertas precisam estar configurados por provedor.",
      "Rollback e validacao tecnica precisam estar executados.",
      "Aprovacao humana precisa estar registrada por tenant.",
    ],
    nextActions: [
      "Manter tenant em modo de desenvolvimento local.",
      "Preparar staging seguro antes de qualquer tenant comercial.",
      "Coletar evidencias internas e revisar itens sensiveis.",
      "Reavaliar pacote de decisao apos homologacao completa.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelRolloutPlan() {
  const tenantDecision = getMobileOfflineAssistedRetryTenantActivationDecisionPackage();
  const rolloutWaves = [
    {
      key: "wave_0_icemax_internal",
      tenantScope: "ICEMAX",
      status: "blocked",
      objective: "Validar operacao interna, branding, OS, evidencias e provedores em staging.",
      entryCriteria: [
        "Pacote de decisao por tenant sem blocos criticos.",
        "Identidade visual ICEMAX revisada.",
        "Ambiente de staging isolado.",
        "Evidencias internas sem segredos.",
      ],
      exitCriteria: "ICEMAX aprovada em homologacao interna sem ativar tenant comercial.",
    },
    {
      key: "wave_1_icemax_controlled",
      tenantScope: "ICEMAX",
      status: "blocked",
      objective: "Executar piloto controlado com equipe interna e dados supervisionados.",
      entryCriteria: [
        "Wave 0 aprovada.",
        "Teto mensal de provedores aprovado.",
        "Alertas e rollback ativos.",
        "Aprovacao humana do titular registrada.",
      ],
      exitCriteria: "Piloto ICEMAX finalizado sem incidente critico e com custo dentro do teto.",
    },
    {
      key: "wave_2_first_whitelabel",
      tenantScope: "first_partner_tenant",
      status: "blocked",
      objective: "Preparar primeira empresa whitelabel sem misturar dados, custos ou evidencias.",
      entryCriteria: [
        "Template ICEMAX validado.",
        "Branding do parceiro separado.",
        "Variaveis e limites por tenant isolados.",
        "Contrato e responsabilidades operacionais definidos.",
      ],
      exitCriteria: "Primeiro tenant parceiro homologado com isolamento comprovado.",
    },
    {
      key: "wave_3_scaled_whitelabel",
      tenantScope: "multi_tenant",
      status: "blocked",
      objective: "Escalar operacao whitelabel com governanca repetivel.",
      entryCriteria: [
        "Primeiro tenant parceiro aprovado.",
        "Checklist de onboarding repetivel.",
        "Monitoramento por tenant ativo.",
        "Relatorio de custo por tenant disponivel.",
      ],
      exitCriteria: "Expansao controlada liberada somente por aprovacao formal.",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_rollout_plan_ready",
    realExecutionAllowed: false,
    summary: {
      waves: rolloutWaves.length,
      blockedWaves: rolloutWaves.filter((wave) => wave.status === "blocked").length,
      firstTenant: "ICEMAX",
      futureWhitelabelSupported: true,
      tenantDecision: tenantDecision.decision.result,
      commercialReleaseAllowed: false,
    },
    rolloutWaves,
    isolationPolicy: {
      tenantDataIsolationRequired: true,
      providerBudgetByTenantRequired: true,
      evidenceByTenantRequired: true,
      brandingByTenantRequired: true,
      secretsSharedBetweenTenantsAllowed: false,
    },
    blockedActions: [
      "release_partner_tenant_before_icemax",
      "share_provider_credentials_between_tenants",
      "mix_customer_data_between_tenants",
      "activate_commercial_whitelabel_without_owner_signoff",
    ],
    nextActions: [
      "Finalizar template operacional da ICEMAX antes do primeiro parceiro.",
      "Preparar checklist de onboarding whitelabel por tenant.",
      "Definir politica de custos e alertas por tenant.",
      "Reavaliar rollout apos pacote de decisao sair de do_not_activate.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelOnboardingChecklist() {
  const rollout = getMobileOfflineAssistedRetryWhitelabelRolloutPlan();
  const checklist = [
    {
      area: "identity_branding",
      owner: "operations",
      status: "blocked",
      items: [
        "Cadastrar nome comercial, slug e dominio do tenant.",
        "Validar logo, cores, assinatura de e-mail e termos visuais.",
        "Confirmar textos legais e rodape por empresa.",
      ],
    },
    {
      area: "tenant_data",
      owner: "platform",
      status: "blocked",
      items: [
        "Criar tenant isolado sem dados compartilhados.",
        "Definir seed inicial de usuarios, clientes, equipes e permissssoes.",
        "Configurar politica de retencao e auditoria por tenant.",
      ],
    },
    {
      area: "users_permissions",
      owner: "platform",
      status: "blocked",
      items: [
        "Cadastrar proprietario, administradores, tecnicos e terceiros.",
        "Validar matriz de permissoes por perfil.",
        "Revisar acesso a relatorios, estoque, contratos e auditoria.",
      ],
    },
    {
      area: "provider_budget",
      owner: "finance",
      status: "blocked",
      items: [
        "Definir teto mensal por provedor e por tenant.",
        "Ativar alertas de custo, quota e consumo.",
        "Registrar aprovacao sem incluir segredos ou dados de cartao.",
      ],
    },
    {
      area: "secure_integrations",
      owner: "platform",
      status: "blocked",
      items: [
        "Configurar segredos somente no ambiente seguro.",
        "Separar chaves, remetentes, mapas, IA e WhatsApp por tenant quando aplicavel.",
        "Executar smoke test com dados ficticios e destinatarios internos.",
      ],
    },
    {
      area: "business_operations",
      owner: "operations",
      status: "blocked",
      items: [
        "Configurar checklists, garantias, relatorios e modelos de OS.",
        "Validar contratos recorrentes, estoque, pecas e rotas.",
        "Treinar equipe interna antes do primeiro atendimento real.",
      ],
    },
    {
      area: "release_governance",
      owner: "RAFAEL DA SILVA BEZEERA",
      status: "blocked",
      items: [
        "Executar npm run validate antes da liberacao.",
        "Revisar evidencias sem segredos visiveis.",
        "Registrar signoff final por tenant.",
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_onboarding_checklist_ready",
    realExecutionAllowed: false,
    summary: {
      sections: checklist.length,
      blockedSections: checklist.filter((section) => section.status === "blocked").length,
      totalItems: checklist.reduce((total, section) => total + section.items.length, 0),
      firstTenant: rollout.summary.firstTenant,
      commercialReleaseAllowed: false,
    },
    checklist,
    onboardingPolicy: {
      repeatablePerTenant: true,
      tenantIsolationRequired: true,
      ownerSignoffRequired: true,
      secretsInRepositoryAllowed: false,
      customerDataInSmokeTestsAllowed: false,
    },
    nextActions: [
      "Usar ICEMAX como primeiro preenchimento do checklist.",
      "Converter itens aprovados em evidencias internas por tenant.",
      "Criar templates de branding e permissoes reutilizaveis.",
      "Manter qualquer parceiro whitelabel bloqueado ate ICEMAX estar homologada.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelOperationalHandoff() {
  const onboarding = getMobileOfflineAssistedRetryWhitelabelOnboardingChecklist();
  const handoffSections = [
    {
      key: "support_model",
      owner: "operations",
      status: "blocked",
      responsibilities: [
        "Definir horario de suporte por tenant.",
        "Definir responsavel por incidentes de OS, agenda, estoque e contratos.",
        "Registrar canal interno de escalonamento sem dados sensiveis.",
      ],
    },
    {
      key: "tenant_admin_training",
      owner: "operations",
      status: "blocked",
      responsibilities: [
        "Treinar administrador do tenant em usuarios, permissoes e relatorios.",
        "Treinar equipe tecnica em app, modo offline, assinatura e evidencias.",
        "Validar entendimento de garantias, pecas e contratos recorrentes.",
      ],
    },
    {
      key: "operational_routines",
      owner: "tenant_admin",
      status: "blocked",
      responsibilities: [
        "Definir rotina diaria de agenda e pendencias offline.",
        "Definir rotina semanal de estoque, pecas e contratos.",
        "Definir rotina mensal de custos, indicadores e revisao de provedores.",
      ],
    },
    {
      key: "incident_response",
      owner: "platform",
      status: "blocked",
      responsibilities: [
        "Classificar incidentes por severidade.",
        "Manter rollback e plano manual para OS critica.",
        "Bloquear reenvio real se houver falha de auditoria ou segredo exposto.",
      ],
    },
    {
      key: "go_live_packet",
      owner: "RAFAEL DA SILVA BEZEERA",
      status: "blocked",
      responsibilities: [
        "Conferir checklist de onboarding completo.",
        "Conferir validacao tecnica e evidencias aprovadas.",
        "Registrar signoff final antes de liberar tenant comercial.",
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_operational_handoff_ready",
    realExecutionAllowed: false,
    summary: {
      sections: handoffSections.length,
      blockedSections: handoffSections.filter((section) => section.status === "blocked").length,
      onboardingItems: onboarding.summary.totalItems,
      firstTenant: onboarding.summary.firstTenant,
      goLiveAllowed: false,
    },
    handoffSections,
    handoffPolicy: {
      supportOwnerRequired: true,
      tenantAdminTrainingRequired: true,
      incidentRollbackRequired: true,
      ownerSignoffRequired: true,
      productionReleaseBlocked: true,
    },
    blockedActions: [
      "start_commercial_support_without_owner",
      "train_with_real_customer_data",
      "go_live_without_incident_response",
      "go_live_without_onboarding_evidence",
    ],
    nextActions: [
      "Preparar roteiro de treinamento ICEMAX.",
      "Definir matriz de suporte e incidentes por tenant.",
      "Criar pacote de go-live somente apos homologacao.",
      "Revisar handoff a cada novo tenant whitelabel.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelGoLiveReadinessBoard() {
  const handoff = getMobileOfflineAssistedRetryWhitelabelOperationalHandoff();
  const checks = [
    {
      key: "onboarding_complete",
      area: "tenant_setup",
      severity: "critical",
      status: "blocked",
      detail: "Checklist de onboarding ainda precisa estar completo e evidenciado.",
    },
    {
      key: "support_ready",
      area: "support",
      severity: "critical",
      status: "blocked",
      detail: "Modelo de suporte, responsaveis e escalonamento ainda precisam estar definidos.",
    },
    {
      key: "training_done",
      area: "training",
      severity: "high",
      status: "blocked",
      detail: "Administradores, tecnicos e terceiros ainda precisam de treinamento validado.",
    },
    {
      key: "incident_response_ready",
      area: "reliability",
      severity: "critical",
      status: "blocked",
      detail: "Plano de incidente e rollback ainda precisa estar aprovado.",
    },
    {
      key: "provider_evidence_ready",
      area: "integrations",
      severity: "critical",
      status: "blocked",
      detail: "Evidencias de provedores e smoke tests ainda precisam estar aprovados.",
    },
    {
      key: "owner_signoff_ready",
      area: "governance",
      severity: "critical",
      status: "blocked",
      detail: "Signoff final do titular ainda precisa ser registrado por tenant.",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_go_live_readiness_blocked",
    realExecutionAllowed: false,
    summary: {
      checks: checks.length,
      blocked: checks.filter((check) => check.status === "blocked").length,
      criticalBlocks: checks.filter((check) => check.severity === "critical").length,
      firstTenant: handoff.summary.firstTenant,
      goLiveAllowed: false,
    },
    checks,
    decision: {
      result: "do_not_go_live",
      reason: "Tenant ainda nao possui onboarding, suporte, treinamento, incidente, evidencias e signoff suficientes.",
      allowedActions: ["finish_onboarding", "train_team", "prepare_support", "collect_evidence"],
      blockedActions: ["commercial_go_live", "real_customer_send", "provider_production_calls", "partner_tenant_release"],
    },
    guardrails: [
      "Nao liberar tenant comercial sem suporte definido.",
      "Nao iniciar atendimento real sem plano de incidente.",
      "Nao usar dados reais em treinamento antes da homologacao.",
      "Nao ativar chamadas de producao enquanto o board estiver bloqueado.",
    ],
    nextActions: [
      "Fechar treinamento ICEMAX.",
      "Definir suporte e matriz de incidentes.",
      "Aprovar evidencias internas de onboarding.",
      "Reexecutar board antes de qualquer go-live.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelPostGoLivePlan() {
  const readiness = getMobileOfflineAssistedRetryWhitelabelGoLiveReadinessBoard();
  const milestones = [
    {
      key: "day_0_hypercare",
      window: "D0",
      status: "blocked",
      owner: "operations",
      checks: [
        "Acompanhar primeiras OS em tempo real.",
        "Monitorar pendencias offline, assinatura, e-mails e relatorios.",
        "Validar suporte ativo e responsavel de plantao.",
      ],
    },
    {
      key: "day_1_stability",
      window: "D1",
      status: "blocked",
      owner: "platform",
      checks: [
        "Revisar logs, auditoria e incidentes.",
        "Conferir consumo de provedores e alertas.",
        "Validar rollback manual para OS critica.",
      ],
    },
    {
      key: "week_1_business_review",
      window: "Semana 1",
      status: "blocked",
      owner: "operations",
      checks: [
        "Revisar agenda, rotas, estoque e contratos.",
        "Coletar feedback dos tecnicos e administradores.",
        "Ajustar modelos de relatorio, garantia e checklist.",
      ],
    },
    {
      key: "day_30_scale_decision",
      window: "D30",
      status: "blocked",
      owner: "RAFAEL DA SILVA BEZEERA",
      checks: [
        "Comparar custos reais com teto aprovado.",
        "Revisar incidentes, retrabalho e suporte.",
        "Decidir se tenant pode sair de hypercare ou se escala deve continuar bloqueada.",
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_post_go_live_plan_ready",
    realExecutionAllowed: false,
    summary: {
      milestones: milestones.length,
      blockedMilestones: milestones.filter((item) => item.status === "blocked").length,
      sourceDecision: readiness.decision.result,
      hypercareRequired: true,
      scaleAllowed: false,
    },
    milestones,
    monitoringPolicy: {
      dailyIncidentReviewRequired: true,
      providerCostReviewRequired: true,
      offlineQueueReviewRequired: true,
      customerImpactReviewRequired: true,
      ownerScaleDecisionRequired: true,
    },
    blockedActions: [
      "scale_tenant_without_30_day_review",
      "disable_hypercare_before_stability",
      "ignore_provider_cost_alerts",
      "release_second_tenant_without_first_tenant_review",
    ],
    nextActions: [
      "Preparar roteiro de hypercare ICEMAX.",
      "Definir indicadores dos primeiros 30 dias.",
      "Criar modelo de revisao D1, Semana 1 e D30.",
      "Manter escala whitelabel bloqueada ate revisao do primeiro tenant.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelTenantHealthScore() {
  const postGoLive = getMobileOfflineAssistedRetryWhitelabelPostGoLivePlan();
  const indicators = [
    {
      key: "offline_retry_stability",
      label: "Estabilidade do reenvio offline",
      status: "blocked",
      score: 62,
      target: "95% de reenvios sem intervencao manual por 30 dias",
      evidence: "Fila offline ainda deve ser acompanhada diariamente no hypercare.",
    },
    {
      key: "field_team_adoption",
      label: "Aderencia da equipe tecnica",
      status: "attention",
      score: 76,
      target: "90% das OS com checklist, fotos, assinatura e relatorio completo",
      evidence: "Uso assistido recomendado nas primeiras rotas reais.",
    },
    {
      key: "customer_communication",
      label: "Comunicacao com cliente",
      status: "attention",
      score: 74,
      target: "Envio de relatorio, copia opcional ao cliente e garantia sem retrabalho",
      evidence: "Modelos precisam ser revisados apos primeiros atendimentos reais.",
    },
    {
      key: "provider_cost_control",
      label: "Controle de custos de provedores",
      status: "blocked",
      score: 58,
      target: "Custos de mapas, e-mail, WhatsApp e IA dentro do teto aprovado",
      evidence: "Sem contas reais conectadas, custos permanecem simulados.",
    },
    {
      key: "support_and_incidents",
      label: "Suporte e incidentes",
      status: "blocked",
      score: 61,
      target: "Nenhum incidente critico aberto e SLA de suporte definido",
      evidence: "Matriz de suporte e resposta ainda deve ser homologada.",
    },
    {
      key: "owner_business_review",
      label: "Revisao executiva do dono",
      status: "blocked",
      score: 55,
      target: "Aprovacao formal de RAFAEL DA SILVA BEZEERA para escalar",
      evidence: "Decisao D30 continua obrigatoria antes de liberar outro tenant.",
    },
  ];
  const averageScore = Math.round(indicators.reduce((total, item) => total + item.score, 0) / indicators.length);

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_tenant_health_score_blocked",
    realExecutionAllowed: false,
    summary: {
      firstTenant: "ICEMAX",
      averageScore,
      minimumScaleScore: 90,
      blockedIndicators: indicators.filter((item) => item.status === "blocked").length,
      attentionIndicators: indicators.filter((item) => item.status === "attention").length,
      sourceMilestones: postGoLive.summary.milestones,
      hypercareRequired: postGoLive.summary.hypercareRequired,
      scaleAllowed: false,
    },
    indicators,
    decision: {
      result: "keep_hypercare",
      reason: "Escala whitelabel depende de 30 dias acompanhados, custos reais controlados e aprovacao executiva.",
      requiredBeforeScale: [
        "Fechar revisao D1 sem incidente critico.",
        "Fechar revisao da Semana 1 com adocao da equipe validada.",
        "Fechar revisao D30 com custos reais e impacto no cliente.",
        "Registrar aprovacao formal do dono antes do segundo tenant.",
      ],
    },
    blockedActions: [
      "second_tenant_activation",
      "public_whitelabel_offer",
      "disable_daily_health_review",
      "scale_without_owner_business_review",
    ],
    nextActions: [
      "Usar este health score nas reunioes D1, Semana 1 e D30.",
      "Atualizar indicadores com dados reais quando provedores e operacao estiverem conectados.",
      "Manter segundo tenant bloqueado ate atingir score minimo e aprovacao executiva.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelContinuousImprovementPlan() {
  const health = getMobileOfflineAssistedRetryWhitelabelTenantHealthScore();
  const improvementTracks = [
    {
      key: "field_execution_quality",
      label: "Qualidade da execucao em campo",
      owner: "operations",
      priority: "high",
      sourceIndicators: ["field_team_adoption", "customer_communication"],
      actions: [
        "Revisar checklists com base nas primeiras OS reais.",
        "Padronizar fotos obrigatorias por tipo de equipamento.",
        "Ajustar texto de relatorio e garantia conforme feedback dos clientes.",
      ],
    },
    {
      key: "offline_reliability",
      label: "Confiabilidade offline",
      owner: "platform",
      priority: "high",
      sourceIndicators: ["offline_retry_stability", "support_and_incidents"],
      actions: [
        "Classificar falhas por origem: rede, assinatura, anexo, provedor ou permissao.",
        "Criar rotina de revisao diaria da fila offline durante hypercare.",
        "Manter reenvio assistido com evidencia ate estabilidade comprovada.",
      ],
    },
    {
      key: "provider_economics",
      label: "Economia de provedores",
      owner: "finance",
      priority: "high",
      sourceIndicators: ["provider_cost_control"],
      actions: [
        "Comparar custo simulado com consumo real por OS.",
        "Definir teto mensal por tenant para mapas, e-mail, WhatsApp e IA.",
        "Bloquear recursos pagos quando nao houver conta configurada e aprovada.",
      ],
    },
    {
      key: "tenant_scale_governance",
      label: "Governanca para escala whitelabel",
      owner: "RAFAEL DA SILVA BEZEERA",
      priority: "critical",
      sourceIndicators: ["owner_business_review"],
      actions: [
        "Fechar ata executiva D30 antes de segundo tenant.",
        "Registrar ajustes obrigatorios para o pacote padrao whitelabel.",
        "Definir se a proxima empresa entra em piloto assistido ou permanece bloqueada.",
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_continuous_improvement_plan_ready",
    realExecutionAllowed: false,
    summary: {
      firstTenant: health.summary.firstTenant,
      sourceHealthScore: health.summary.averageScore,
      scaleAllowed: false,
      tracks: improvementTracks.length,
      criticalTracks: improvementTracks.filter((item) => item.priority === "critical").length,
      highPriorityTracks: improvementTracks.filter((item) => item.priority === "high").length,
    },
    improvementTracks,
    retrospectiveCadence: [
      {
        key: "daily_hypercare_review",
        cadence: "Diaria",
        requiredUntil: "Fim do hypercare",
        output: "Lista de incidentes, causa raiz e acao corretiva.",
      },
      {
        key: "weekly_business_review",
        cadence: "Semanal",
        requiredUntil: "D30",
        output: "Ajustes de processo, treinamento, relatorio e comunicacao.",
      },
      {
        key: "scale_readiness_review",
        cadence: "D30",
        requiredUntil: "Antes do segundo tenant",
        output: "Decisao executiva: escalar, prorrogar hypercare ou bloquear.",
      },
    ],
    blockedActions: [
      "close_hypercare_without_retrospective",
      "repeat_failed_process_for_next_tenant",
      "approve_scale_without_corrective_actions",
      "publish_whitelabel_offer_without_operational_review",
    ],
    nextActions: [
      "Usar os indicadores do health score como entrada da retrospectiva.",
      "Transformar incidentes em acoes corretivas com dono e prazo.",
      "Revisar o pacote whitelabel padrao antes de qualquer nova empresa.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelScaleDecisionPackage() {
  const health = getMobileOfflineAssistedRetryWhitelabelTenantHealthScore();
  const improvement = getMobileOfflineAssistedRetryWhitelabelContinuousImprovementPlan();
  const gates = [
    {
      key: "tenant_health_score",
      label: "Health score minimo",
      status: health.summary.averageScore >= health.summary.minimumScaleScore ? "ready" : "blocked",
      current: health.summary.averageScore,
      required: health.summary.minimumScaleScore,
      evidenceRequired: "Relatorio consolidado dos primeiros 30 dias.",
    },
    {
      key: "corrective_actions_closed",
      label: "Acoes corretivas fechadas",
      status: "blocked",
      current: 0,
      required: improvement.summary.tracks,
      evidenceRequired: "Cada trilha deve ter dono, prazo, resultado e aceite.",
    },
    {
      key: "provider_costs_approved",
      label: "Custos reais aprovados",
      status: "blocked",
      current: 0,
      required: 1,
      evidenceRequired: "Comparativo de custo por OS e teto mensal por tenant.",
    },
    {
      key: "support_model_signed_off",
      label: "Modelo de suporte aprovado",
      status: "blocked",
      current: 0,
      required: 1,
      evidenceRequired: "SLA, plantao, incidentes e rollback aprovados.",
    },
    {
      key: "owner_scale_signoff",
      label: "Aprovacao executiva para escala",
      status: "blocked",
      current: 0,
      required: 1,
      evidenceRequired: "Aprovacao formal de RAFAEL DA SILVA BEZEERA.",
    },
  ];
  const blockedGates = gates.filter((gate) => gate.status === "blocked").length;

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_scale_decision_blocked",
    realExecutionAllowed: false,
    summary: {
      firstTenant: health.summary.firstTenant,
      sourceHealthScore: health.summary.averageScore,
      gates: gates.length,
      blockedGates,
      scaleAllowed: blockedGates === 0,
      nextTenantAllowed: false,
    },
    gates,
    decisionOptions: [
      {
        key: "scale",
        allowedNow: false,
        meaning: "Liberar segundo tenant com operacao acompanhada.",
        requiredEvidence: ["Todos os gates prontos", "Custos aprovados", "Aprovacao executiva"],
      },
      {
        key: "extend_hypercare",
        allowedNow: true,
        meaning: "Prorrogar ICEMAX em acompanhamento ate corrigir pendencias.",
        requiredEvidence: ["Plano de melhoria atualizado", "Nova data de revisao"],
      },
      {
        key: "block_whitelabel_offer",
        allowedNow: true,
        meaning: "Bloquear oferta whitelabel comercial ate estabilidade comprovada.",
        requiredEvidence: ["Riscos abertos", "Impacto comercial", "Plano de mitigacao"],
      },
    ],
    blockedActions: [
      "sign_second_tenant_contract",
      "enable_partner_branding",
      "activate_partner_provider_accounts",
      "announce_whitelabel_public_release",
    ],
    nextActions: [
      "Consolidar evidencias D30 do primeiro tenant.",
      "Fechar acoes corretivas da melhoria continua.",
      "Reavaliar gates antes de qualquer contrato com segunda empresa.",
      "Registrar decisao final assinada pelo dono.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelSecondTenantPreOnboarding() {
  const scaleDecision = getMobileOfflineAssistedRetryWhitelabelScaleDecisionPackage();
  const preOnboardingSections = [
    {
      key: "commercial_screening",
      label: "Triagem comercial",
      status: "blocked",
      owner: "commercial",
      requiredEvidence: [
        "Segmento e volume de OS estimado.",
        "Modelo de contrato e recorrencia pretendida.",
        "Riscos de suporte e expectativa de SLA.",
      ],
    },
    {
      key: "brand_and_domain",
      label: "Marca, dominio e identidade",
      status: "blocked",
      owner: "platform",
      requiredEvidence: [
        "Nome comercial e logo autorizados.",
        "Dominio ou subdominio aprovado.",
        "Cores, termos legais e dados de contato.",
      ],
    },
    {
      key: "provider_accounts",
      label: "Contas de provedores por tenant",
      status: "blocked",
      owner: "platform",
      requiredEvidence: [
        "E-mail transacional.",
        "WhatsApp/Meta quando aplicavel.",
        "Mapas, IA e limites de custo aprovados.",
      ],
    },
    {
      key: "data_isolation",
      label: "Isolamento de dados",
      status: "blocked",
      owner: "engineering",
      requiredEvidence: [
        "Tenant ID dedicado.",
        "Usuarios, tecnicos, clientes e estoque separados.",
        "Auditoria e politica LGPD revisadas.",
      ],
    },
    {
      key: "operational_training",
      label: "Treinamento operacional",
      status: "blocked",
      owner: "operations",
      requiredEvidence: [
        "Treinamento administrativo.",
        "Treinamento de tecnicos e terceirizados.",
        "Simulacao de OS completa antes de cliente real.",
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_second_tenant_pre_onboarding_blocked",
    realExecutionAllowed: false,
    summary: {
      sourceDecision: scaleDecision.status,
      firstTenant: scaleDecision.summary.firstTenant,
      candidateTenantAllowed: false,
      sections: preOnboardingSections.length,
      blockedSections: preOnboardingSections.filter((item) => item.status === "blocked").length,
      scaleAllowed: scaleDecision.summary.scaleAllowed,
    },
    preOnboardingSections,
    intakePolicy: {
      contractBeforeScaleDecisionAllowed: false,
      collectPublicSecretsAllowed: false,
      sharedProviderAccountsAllowed: false,
      sharedCustomerDataAllowed: false,
      ownerApprovalRequired: true,
    },
    blockedActions: [
      "collect_second_tenant_credentials",
      "create_partner_production_workspace",
      "send_partner_contract_for_signature",
      "import_partner_customer_base",
    ],
    nextActions: [
      "Manter segundo tenant apenas como candidato ate decisao D30.",
      "Preparar formulario de triagem sem coletar credenciais.",
      "Usar o pacote de decisao de escala como gate obrigatorio.",
      "Registrar aceite do dono antes de iniciar onboarding real.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelTenantCostMatrix() {
  const preOnboarding = getMobileOfflineAssistedRetryWhitelabelSecondTenantPreOnboarding();
  const costCenters = [
    {
      key: "maps",
      label: "Mapas e rotas",
      status: "blocked",
      billingMode: "por uso",
      monthlyCapBRL: 250,
      controls: ["Limite por tenant", "Auditoria de chamadas", "Bloqueio sem chave aprovada"],
    },
    {
      key: "email",
      label: "E-mail transacional",
      status: "blocked",
      billingMode: "por volume",
      monthlyCapBRL: 120,
      controls: ["Templates por tenant", "Dominio validado", "Copia opcional ao cliente"],
    },
    {
      key: "whatsapp",
      label: "WhatsApp/Meta",
      status: "blocked",
      billingMode: "por conversa",
      monthlyCapBRL: 300,
      controls: ["Opt-in do cliente", "Templates aprovados", "Fallback por e-mail"],
    },
    {
      key: "ai",
      label: "IA para texto, foto e diagnostico",
      status: "blocked",
      billingMode: "por consumo",
      monthlyCapBRL: 400,
      controls: ["Mascaramento de dados", "Limite por usuario", "Revisao humana obrigatoria"],
    },
    {
      key: "storage",
      label: "Armazenamento de fotos, assinaturas e relatorios",
      status: "attention",
      billingMode: "por espaco",
      monthlyCapBRL: 180,
      controls: ["Retencao por contrato", "Separacao por tenant", "Backup e descarte LGPD"],
    },
  ];
  const totalMonthlyCapBRL = costCenters.reduce((total, item) => total + item.monthlyCapBRL, 0);

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_tenant_cost_matrix_blocked",
    realExecutionAllowed: false,
    summary: {
      sourceCandidateAllowed: preOnboarding.summary.candidateTenantAllowed,
      costCenters: costCenters.length,
      blockedCostCenters: costCenters.filter((item) => item.status === "blocked").length,
      totalMonthlyCapBRL,
      sharedBillingAllowed: false,
      productionProviderCallsAllowed: false,
    },
    costCenters,
    billingPolicy: {
      tenantLevelCostTrackingRequired: true,
      sharedCardsBetweenTenantsAllowed: false,
      sharedProviderKeysAllowed: false,
      ownerMonthlyCostApprovalRequired: true,
      automaticShutdownOnCapExceeded: true,
    },
    blockedActions: [
      "use_icemax_provider_keys_for_partner",
      "enable_paid_provider_without_cap",
      "hide_provider_cost_from_owner",
      "bill_partner_without_cost_breakdown",
    ],
    nextActions: [
      "Definir teto mensal por tenant antes do segundo onboarding.",
      "Separar contas, chaves e custos por empresa.",
      "Criar revisao mensal de custos por modulo e por OS.",
      "Manter provedores pagos bloqueados ate aprovacao executiva.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelOperationalContractPack() {
  const costMatrix = getMobileOfflineAssistedRetryWhitelabelTenantCostMatrix();
  const clauses = [
    {
      key: "scope_and_modules",
      label: "Escopo e modulos contratados",
      status: "draft",
      required: [
        "Definir OS, agenda, rotas, estoque, contratos, relatorios, QR e portal.",
        "Listar recursos bloqueados ate provedores reais serem aprovados.",
      ],
    },
    {
      key: "tenant_isolation",
      label: "Isolamento do tenant",
      status: "draft",
      required: [
        "Dados, usuarios, clientes, tecnicos e estoque separados por empresa.",
        "Proibicao de uso cruzado de base de clientes.",
      ],
    },
    {
      key: "provider_costs",
      label: "Custos de provedores",
      status: "draft",
      required: [
        "Teto mensal por centro de custo.",
        "Responsabilidade de pagamento e aprovacao para excedentes.",
      ],
    },
    {
      key: "support_and_sla",
      label: "Suporte e SLA",
      status: "draft",
      required: [
        "Canais de suporte, horario, prioridade e tempo de resposta.",
        "Processo de incidente critico e rollback operacional.",
      ],
    },
    {
      key: "data_protection",
      label: "Protecao de dados e LGPD",
      status: "draft",
      required: [
        "Responsabilidades do controlador e operador.",
        "Retencao, descarte e atendimento a solicitacoes LGPD.",
      ],
    },
    {
      key: "commercial_release",
      label: "Liberacao comercial",
      status: "blocked",
      required: [
        "Aprovacao formal do dono.",
        "Pacote de decisao de escala liberado.",
        "Custos e suporte aprovados.",
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_operational_contract_pack_blocked",
    realExecutionAllowed: false,
    summary: {
      clauses: clauses.length,
      blockedClauses: clauses.filter((item) => item.status === "blocked").length,
      draftClauses: clauses.filter((item) => item.status === "draft").length,
      sourceTotalMonthlyCapBRL: costMatrix.summary.totalMonthlyCapBRL,
      contractSignatureAllowed: false,
      commercialReleaseAllowed: false,
    },
    clauses,
    attachments: [
      "Anexo A - escopo funcional por modulo.",
      "Anexo B - matriz de custos por tenant.",
      "Anexo C - suporte, SLA e incidentes.",
      "Anexo D - protecao de dados, retencao e LGPD.",
      "Anexo E - aceite de go-live e criterios de rollback.",
    ],
    contractPolicy: {
      legalReviewRequired: true,
      ownerSignatureRequired: true,
      customerCredentialsInContractAllowed: false,
      publicRepositoryDisclosureAllowed: false,
      productionActivationBeforePaymentAllowed: false,
    },
    blockedActions: [
      "send_contract_without_cost_attachment",
      "sign_contract_before_scale_decision",
      "activate_partner_before_legal_review",
      "include_customer_credentials_in_contract",
    ],
    nextActions: [
      "Revisar pacote contratual com advogado antes de uso real.",
      "Conectar matriz de custos ao anexo comercial.",
      "Definir SLA padrao e excecoes por tenant.",
      "Manter assinatura bloqueada ate decisao de escala aprovada.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelSupportSlaGate() {
  const contractPack = getMobileOfflineAssistedRetryWhitelabelOperationalContractPack();
  const slaLevels = [
    {
      key: "critical_outage",
      label: "Indisponibilidade critica",
      status: "blocked",
      responseTime: "30 minutos",
      resolutionTarget: "4 horas ou rollback operacional",
      examples: ["Tecnicos sem acesso ao app", "OS nao sincroniza", "Relatorios nao sao emitidos"],
    },
    {
      key: "field_blocker",
      label: "Bloqueio de atendimento em campo",
      status: "blocked",
      responseTime: "1 hora",
      resolutionTarget: "Mesmo dia util",
      examples: ["Assinatura falha", "Foto obrigatoria nao salva", "Rota critica indisponivel"],
    },
    {
      key: "administrative_issue",
      label: "Problema administrativo",
      status: "draft",
      responseTime: "4 horas uteis",
      resolutionTarget: "2 dias uteis",
      examples: ["Cadastro incorreto", "Relatorio com ajuste textual", "Permissao de usuario"],
    },
    {
      key: "improvement_request",
      label: "Melhoria ou ajuste de processo",
      status: "draft",
      responseTime: "2 dias uteis",
      resolutionTarget: "Backlog priorizado",
      examples: ["Novo modelo de checklist", "Novo campo em relatorio", "Nova regra de estoque"],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_support_sla_gate_blocked",
    realExecutionAllowed: false,
    summary: {
      sourceContractSignatureAllowed: contractPack.summary.contractSignatureAllowed,
      slaLevels: slaLevels.length,
      blockedLevels: slaLevels.filter((item) => item.status === "blocked").length,
      supportReady: false,
      partnerGoLiveAllowed: false,
    },
    slaLevels,
    supportPolicy: {
      onCallOwnerRequired: true,
      incidentChannelRequired: true,
      rollbackRunbookRequired: true,
      supportWithoutContractAllowed: false,
      partnerDirectEngineerAccessAllowed: false,
      dailyIncidentReviewDuringHypercare: true,
    },
    requiredRunbooks: [
      "Falha de sincronizacao offline.",
      "Erro em relatorio, assinatura ou envio de e-mail.",
      "Mapa/rota indisponivel.",
      "IA indisponivel ou resposta inadequada.",
      "Rollback de tenant em atendimento critico.",
    ],
    blockedActions: [
      "go_live_without_support_owner",
      "promise_sla_without_runbook",
      "allow_partner_direct_engineering_escalation",
      "close_incident_without_root_cause",
    ],
    nextActions: [
      "Definir responsavel de suporte por tenant.",
      "Criar canal oficial de incidente e escala.",
      "Conectar runbooks ao pacote contratual.",
      "Validar SLA em simulacao antes de cliente real.",
    ],
  };
}

export function getMobileOfflineAssistedRetryWhitelabelSecurityPrivacyGate() {
  const supportSla = getMobileOfflineAssistedRetryWhitelabelSupportSlaGate();
  const controls = [
    {
      key: "tenant_data_isolation",
      label: "Isolamento de dados por tenant",
      status: "blocked",
      requiredEvidence: [
        "Tenant ID dedicado em todas as entidades.",
        "Usuarios, clientes, OS, estoque e contratos sem compartilhamento.",
        "Auditoria por tenant validada.",
      ],
    },
    {
      key: "lgpd_roles",
      label: "Papeis LGPD e DPA",
      status: "blocked",
      requiredEvidence: [
        "Controlador e operador definidos.",
        "DPA ou anexo de protecao de dados revisado.",
        "Canal de solicitacao do titular definido.",
      ],
    },
    {
      key: "retention_and_deletion",
      label: "Retencao e descarte",
      status: "blocked",
      requiredEvidence: [
        "Prazo de retencao por tipo de arquivo.",
        "Processo de descarte de fotos, assinaturas e relatorios.",
        "Backup e restauracao testados.",
      ],
    },
    {
      key: "secrets_and_provider_keys",
      label: "Segredos e chaves de provedores",
      status: "blocked",
      requiredEvidence: [
        "Chaves separadas por tenant.",
        "Nenhuma credencial no repositorio.",
        "Rotacao e revogacao documentadas.",
      ],
    },
    {
      key: "incident_response",
      label: "Resposta a incidente",
      status: "blocked",
      requiredEvidence: [
        "Runbook de incidente de dados.",
        "Responsavel de comunicacao.",
        "Critério de notificacao e contencao.",
      ],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: "whitelabel_security_privacy_gate_blocked",
    realExecutionAllowed: false,
    summary: {
      sourceSupportReady: supportSla.summary.supportReady,
      controls: controls.length,
      blockedControls: controls.filter((item) => item.status === "blocked").length,
      partnerProductionAllowed: false,
      dataImportAllowed: false,
      publicPortalAllowed: false,
    },
    controls,
    privacyPolicy: {
      tenantDataSharingAllowed: false,
      publicSecretsAllowed: false,
      customerDataImportBeforeDpaAllowed: false,
      aiWithoutHumanReviewAllowed: false,
      auditLogRequired: true,
      deletionRequestWorkflowRequired: true,
    },
    blockedActions: [
      "import_partner_customer_data_before_dpa",
      "reuse_icemax_storage_bucket_without_tenant_prefix",
      "enable_ai_without_privacy_review",
      "go_live_without_security_incident_runbook",
    ],
    nextActions: [
      "Criar DPA/anexo LGPD padrao para whitelabel.",
      "Validar isolamento por tenant em banco, arquivos e auditoria.",
      "Definir retencao e descarte por tipo de evidencia.",
      "Bloquear importacao real ate aprovar seguranca e privacidade.",
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
