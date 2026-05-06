import { getPrisma } from "../database";
import { integrations, notifications, whatsappTemplates } from "../mock-data";
import type { CreateNotificationTemplateInput, SendNotificationInput, UpdateIntegrationStatusInput } from "../schemas";
import type { Prisma } from "@icemax/database";

export async function listMockNotifications() {
  return {
    data: notifications,
    total: notifications.length,
  };
}

export async function listPrismaNotifications(tenantId: string) {
  const data = await getPrisma().notification.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return {
    data,
    total: data.length,
  };
}

export async function listMockIntegrations() {
  return {
    data: integrations,
    total: integrations.length,
  };
}

export async function listPrismaIntegrations(tenantId: string) {
  const data = await getPrisma().integrationSetting.findMany({
    where: { tenantId },
    orderBy: { provider: "asc" },
  });

  return {
    data,
    total: data.length,
  };
}

export async function upsertMockIntegration(tenantId: string, input: UpdateIntegrationStatusInput) {
  return {
    id: `integration-${input.provider}`,
    tenantId,
    ...input,
  };
}

export async function upsertPrismaIntegration(tenantId: string, input: UpdateIntegrationStatusInput) {
  const config = input.config as Prisma.InputJsonValue | undefined;

  return getPrisma().integrationSetting.upsert({
    where: { tenantId_provider: { tenantId, provider: input.provider } },
    create: {
      tenantId,
      provider: input.provider,
      status: input.status,
      config,
    },
    update: {
      status: input.status,
      config,
    },
  });
}

export async function listMockWhatsappTemplates() {
  return {
    data: whatsappTemplates,
    total: whatsappTemplates.length,
  };
}

export async function listPrismaNotificationTemplates(tenantId: string) {
  const data = await getPrisma().notificationTemplate.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });

  return {
    data,
    total: data.length,
  };
}

export async function createMockNotificationTemplate(tenantId: string, input: CreateNotificationTemplateInput) {
  return {
    id: `template-${Date.now()}`,
    tenantId,
    ...input,
  };
}

export async function createPrismaNotificationTemplate(tenantId: string, input: CreateNotificationTemplateInput) {
  return getPrisma().notificationTemplate.create({
    data: {
      tenantId,
      channel: input.channel,
      name: input.name,
      subject: input.subject,
      body: input.body,
      active: input.active,
    },
  });
}

export async function sendMockNotification(tenantId: string, input: SendNotificationInput) {
  return {
    id: `notification-${Date.now()}`,
    tenantId,
    status: "queued",
    ...input,
  };
}

export async function sendPrismaNotification(tenantId: string, input: SendNotificationInput) {
  return getPrisma().notification.create({
    data: {
      tenantId,
      channel: input.channel,
      recipient: input.recipient,
      subject: input.subject,
      body: input.body,
      relatedType: input.relatedType,
      relatedId: input.relatedId,
      status: "queued",
    },
  });
}

export async function getCommunicationPersistentQueueReadiness(tenantId: string) {
  const channels = [
    {
      key: "email",
      label: "E-mail transacional",
      decision: "prepare",
      providerProductionAllowed: false,
      requiredBeforeProduction: ["template por tenant", "fila persistida", "bounce handling", "limite de envio"],
      idempotencyKeyPattern: "tenant:channel:entity:template",
    },
    {
      key: "whatsapp",
      label: "WhatsApp Business",
      decision: "blocked",
      providerProductionAllowed: false,
      requiredBeforeProduction: ["opt-in do cliente", "template aprovado", "fila persistida", "webhook de status"],
      idempotencyKeyPattern: "tenant:whatsapp:recipient:template:entity",
    },
    {
      key: "internal",
      label: "Avisos internos",
      decision: "prepare",
      providerProductionAllowed: false,
      requiredBeforeProduction: ["usuario destino", "auditoria", "deduplicacao", "retencao"],
      idempotencyKeyPattern: "tenant:internal:user:event",
    },
    {
      key: "push",
      label: "Push tecnico",
      decision: "blocked",
      providerProductionAllowed: false,
      requiredBeforeProduction: ["device token", "consentimento", "fila persistida", "fallback interno"],
      idempotencyKeyPattern: "tenant:push:user:event",
    },
  ];
  const queueStates = [
    { key: "draft", label: "Rascunho", canSend: false, keepsPayload: true },
    { key: "queued", label: "Enfileirada", canSend: false, keepsPayload: true },
    { key: "ready_for_provider", label: "Pronta para provedor", canSend: false, keepsPayload: true },
    { key: "sent", label: "Enviada", canSend: false, keepsPayload: false },
    { key: "failed_retryable", label: "Falha com reenvio", canSend: false, keepsPayload: true },
    { key: "failed_blocked", label: "Falha bloqueada", canSend: false, keepsPayload: true },
  ];

  return {
    generatedAt: new Date().toISOString(),
    tenantId,
    status: "communication_persistent_queue_readiness_blocked",
    realProviderSendAllowed: false,
    summary: {
      projectPercentAfterBlock: 91,
      channels: channels.length,
      blockedChannels: channels.filter((item) => item.decision === "blocked").length,
      persistentQueueRequired: true,
      providerKeysRequiredNow: false,
    },
    channels,
    queueStates,
    storagePolicy: {
      storeSecretsInQueue: false,
      storeProviderToken: false,
      storePayloadHash: true,
      tenantIsolationRequired: true,
      retentionDaysBeforeArchive: 90,
    },
    processingPolicy: {
      dryRunOnly: true,
      maxAttempts: 5,
      exponentialBackoffRequired: true,
      manualReviewAfterMaxAttempts: true,
      providerWebhookRequiredBeforeRealSend: true,
    },
    blockedActions: [
      "send_real_email_without_persistent_queue",
      "send_whatsapp_without_opt_in",
      "store_provider_token_in_notification_payload",
      "process_queue_without_tenant_id",
    ],
    nextActions: [
      "Persistir notificacoes por tenant antes de conectar provedores reais.",
      "Adicionar idempotencia por canal, template e entidade.",
      "Criar webhooks de status para e-mail e WhatsApp antes do envio real.",
      "Manter provedores em dry-run ate custos, LGPD e aceite estarem aprovados.",
    ],
  };
}

export async function getCommunicationProviderActivationPlan(tenantId: string) {
  const providers = [
    {
      key: "email",
      label: "E-mail transacional",
      targetUse: "relatorio final, garantia, cobranca e avisos de contrato",
      activationStage: "homologation_ready",
      realSendAllowed: false,
      requiredCredentials: ["EMAIL_PROVIDER_API_KEY", "EMAIL_SENDER_DOMAIN"],
      requiredControls: ["fila persistente", "idempotencia", "webhook de bounce", "limite diario por tenant"],
      estimatedMonthlyCostRangeBrl: "R$ 50 a R$ 350 no inicio",
    },
    {
      key: "whatsapp",
      label: "WhatsApp Business Cloud API",
      targetUse: "agendamento, deslocamento, aprovacao de orcamento e pos-atendimento",
      activationStage: "legal_and_template_blocked",
      realSendAllowed: false,
      requiredCredentials: ["META_APP_ID", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"],
      requiredControls: ["opt-in", "templates aprovados", "janela de atendimento", "webhook de status"],
      estimatedMonthlyCostRangeBrl: "variavel por conversa e categoria",
    },
    {
      key: "maps",
      label: "Google Maps Platform",
      targetUse: "despacho inteligente, rota, ETA e geocodificacao",
      activationStage: "cost_guard_required",
      realSendAllowed: false,
      requiredCredentials: ["GOOGLE_MAPS_API_KEY"],
      requiredControls: ["limite de chamadas", "cache de enderecos", "restricao por dominio/app", "alerta de custo"],
      estimatedMonthlyCostRangeBrl: "depende de volume e creditos da conta",
    },
    {
      key: "openai",
      label: "OpenAI",
      targetUse: "revisao de texto, diagnostico assistido e resumo profissional",
      activationStage: "privacy_guard_required",
      realSendAllowed: false,
      requiredCredentials: ["OPENAI_API_KEY"],
      requiredControls: ["mascara de dados sensiveis", "log de uso", "limite por tenant", "fallback manual"],
      estimatedMonthlyCostRangeBrl: "variavel por tokens usados",
    },
  ];

  const gates = [
    { key: "commercial_approval", label: "Aprovacao de custos", status: "required", owner: "owner" },
    { key: "lgpd_review", label: "Revisao LGPD e consentimentos", status: "required", owner: "admin" },
    { key: "persistent_queue", label: "Fila persistente com idempotencia", status: "required", owner: "engineering" },
    { key: "provider_webhooks", label: "Webhooks de entrega, falha e revogacao", status: "required", owner: "engineering" },
    { key: "homologation_evidence", label: "Evidencias de homologacao", status: "required", owner: "operations" },
    { key: "rollback_plan", label: "Plano de rollback e modo manual", status: "required", owner: "operations" },
  ];

  return {
    generatedAt: new Date().toISOString(),
    tenantId,
    status: "communication_provider_activation_blocked",
    projectPercentAfterBlock: 92,
    realProviderCallsAllowed: false,
    summary: {
      providers: providers.length,
      blockedProviders: providers.filter((item) => !item.realSendAllowed).length,
      requiredGates: gates.length,
      readyForCredentialCollection: true,
      readyForProductionSend: false,
    },
    providers,
    gates,
    costPolicy: {
      requireMonthlyBudgetByTenant: true,
      requireUsageAlerts: true,
      blockOnMissingBudget: true,
      exposeCostToTenantAdmin: true,
    },
    privacyPolicy: {
      maskSensitiveDataBeforeAi: true,
      whatsappRequiresOptIn: true,
      publicLinkPreferredForSensitiveDocuments: true,
      auditEveryProviderCallback: true,
    },
    rolloutPlan: [
      "Homologar e-mail com dominio de teste e destinatarios internos.",
      "Ativar WhatsApp apenas com templates aprovados e opt-in registrado.",
      "Ativar mapas primeiro com cache, cotas e alertas de custo.",
      "Ativar IA com mascaramento de dados e limite por tenant.",
      "Liberar envio real por tenant somente apos evidencias e aceite formal.",
    ],
    rollbackPlan: [
      "Desligar chave do provider por tenant.",
      "Retornar notificacoes para modo manual.",
      "Bloquear novas tentativas automaticas.",
      "Preservar auditoria, payload hash e motivo da falha.",
    ],
    blockedActions: [
      "collect_provider_keys_without_owner_budget",
      "enable_whatsapp_without_template_approval",
      "enable_ai_without_sensitive_data_mask",
      "enable_maps_without_cost_limit",
      "enable_real_send_without_rollback_plan",
    ],
  };
}

export async function getProviderCredentialVaultPolicy(tenantId: string) {
  const credentialGroups = [
    {
      provider: "email",
      label: "E-mail transacional",
      secretNames: ["EMAIL_PROVIDER_API_KEY"],
      publicConfigNames: ["EMAIL_SENDER_DOMAIN", "EMAIL_FROM_NAME"],
      rotationDays: 90,
      productionStorage: "managed_secret_vault",
      displayPolicy: "masked_preview_only",
    },
    {
      provider: "whatsapp",
      label: "WhatsApp Business",
      secretNames: ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_APP_SECRET"],
      publicConfigNames: ["META_APP_ID", "WHATSAPP_PHONE_NUMBER_ID"],
      rotationDays: 60,
      productionStorage: "managed_secret_vault",
      displayPolicy: "never_show_token",
    },
    {
      provider: "maps",
      label: "Google Maps Platform",
      secretNames: ["GOOGLE_MAPS_API_KEY"],
      publicConfigNames: ["MAPS_ALLOWED_DOMAINS", "MAPS_ALLOWED_BUNDLE_IDS"],
      rotationDays: 120,
      productionStorage: "managed_secret_vault",
      displayPolicy: "masked_preview_only",
    },
    {
      provider: "openai",
      label: "OpenAI",
      secretNames: ["OPENAI_API_KEY"],
      publicConfigNames: ["OPENAI_MODEL_POLICY", "OPENAI_MONTHLY_BUDGET_BRL"],
      rotationDays: 90,
      productionStorage: "managed_secret_vault",
      displayPolicy: "never_show_token",
    },
  ];

  const checks = [
    { key: "no_plaintext_database", label: "Nao gravar segredo em texto puro no banco", status: "required" },
    { key: "no_secret_in_logs", label: "Nao imprimir segredo em log, erro, auditoria ou console", status: "required" },
    { key: "tenant_scoped_access", label: "Acesso a segredo sempre isolado por tenant", status: "required" },
    { key: "owner_approval", label: "Cadastro e troca de segredo exigem owner/admin autorizado", status: "required" },
    { key: "masked_preview", label: "Interface mostra apenas prefixo/sufixo mascarado", status: "required" },
    { key: "rotation_workflow", label: "Rotacao programada com teste antes de substituir chave ativa", status: "required" },
  ];

  return {
    generatedAt: new Date().toISOString(),
    tenantId,
    status: "provider_credential_vault_policy_ready",
    projectPercentAfterBlock: 93,
    realSecretCollectionAllowed: false,
    summary: {
      credentialGroups: credentialGroups.length,
      checks: checks.length,
      secretsStoredInRepository: false,
      secretsStoredInQueuePayload: false,
      readyForSecretCollectionScreen: true,
      readyForRealSecretStorage: false,
    },
    credentialGroups,
    checks,
    auditPolicy: {
      auditSecretCreated: true,
      auditSecretRotated: true,
      auditSecretRevoked: true,
      auditSecretReadAttempt: true,
      auditNeverStoresSecretValue: true,
    },
    accessPolicy: {
      allowedRoles: ["owner", "admin"],
      requireMfaInProduction: true,
      requireReasonForRotation: true,
      denyTechnicianAccess: true,
      denyOutsourcedAccess: true,
    },
    storagePolicy: {
      localDevelopmentUsesEnvOnly: true,
      productionUsesVaultOnly: true,
      databaseStoresReferenceOnly: true,
      queueStoresSecretReference: false,
      logsUseRedaction: true,
    },
    blockedActions: [
      "commit_secret_to_repository",
      "store_secret_in_notification_queue",
      "return_secret_value_from_api",
      "show_secret_value_in_web_console",
      "rotate_secret_without_audit_reason",
    ],
    nextActions: [
      "Criar tela de cadastro que aceite segredo apenas uma vez.",
      "Persistir somente referencia segura ao cofre no banco real.",
      "Adicionar redacao automatica de logs antes de ativar providers.",
      "Exigir aprovacao owner/admin para rotacao e revogacao.",
    ],
  };
}

export async function getProviderObservabilityGate(tenantId: string) {
  const providers = [
    {
      key: "email",
      label: "E-mail transacional",
      healthStatus: "blocked_until_provider_configured",
      realTrafficAllowed: false,
      monitoredSignals: ["delivery_rate", "bounce_rate", "provider_latency_ms", "daily_cost_brl"],
      automaticKillSwitch: {
        enabled: true,
        triggers: ["bounce_rate_above_5_percent", "daily_budget_above_90_percent", "webhook_inactive_15_minutes"],
      },
    },
    {
      key: "whatsapp",
      label: "WhatsApp Business",
      healthStatus: "blocked_until_opt_in_and_templates",
      realTrafficAllowed: false,
      monitoredSignals: ["conversation_cost_brl", "template_rejection_rate", "delivery_status_lag", "opt_out_rate"],
      automaticKillSwitch: {
        enabled: true,
        triggers: ["template_rejection_above_2_percent", "opt_out_spike", "webhook_signature_failure"],
      },
    },
    {
      key: "maps",
      label: "Google Maps Platform",
      healthStatus: "blocked_until_cost_limits",
      realTrafficAllowed: false,
      monitoredSignals: ["geocode_cache_hit_rate", "route_api_calls", "daily_cost_brl", "quota_remaining"],
      automaticKillSwitch: {
        enabled: true,
        triggers: ["quota_below_15_percent", "daily_budget_above_80_percent", "cache_hit_rate_below_40_percent"],
      },
    },
    {
      key: "openai",
      label: "OpenAI",
      healthStatus: "blocked_until_privacy_budget",
      realTrafficAllowed: false,
      monitoredSignals: ["token_usage", "monthly_cost_brl", "redaction_failures", "fallback_rate"],
      automaticKillSwitch: {
        enabled: true,
        triggers: ["redaction_failure", "monthly_budget_above_85_percent", "unsafe_prompt_detected"],
      },
    },
  ];

  const dashboards = [
    { key: "provider_health", label: "Saude por provedor", owner: "operations", requiredBeforeGoLive: true },
    { key: "cost_guard", label: "Custo por tenant e por canal", owner: "finance", requiredBeforeGoLive: true },
    { key: "webhook_monitor", label: "Monitor de webhooks", owner: "engineering", requiredBeforeGoLive: true },
    { key: "manual_fallback", label: "Fila manual de contingencia", owner: "support", requiredBeforeGoLive: true },
    { key: "audit_trace", label: "Trilha de auditoria de callbacks", owner: "admin", requiredBeforeGoLive: true },
  ];

  return {
    generatedAt: new Date().toISOString(),
    tenantId,
    status: "provider_observability_gate_blocked",
    projectPercentAfterBlock: 94,
    productionTrafficAllowed: false,
    summary: {
      providers: providers.length,
      dashboards: dashboards.length,
      killSwitchRequired: true,
      webhookMonitoringRequired: true,
      costMonitoringRequired: true,
      readyForRealTraffic: false,
    },
    providers,
    dashboards,
    thresholds: {
      maxDailyProviderCostWithoutOwnerReviewBrl: 100,
      maxWebhookLagMinutes: 15,
      maxRetryAttemptsBeforeManualFallback: 5,
      minGeocodeCacheHitRatePercent: 40,
      maxAiRedactionFailuresAllowed: 0,
    },
    incidentPolicy: {
      openIncidentOnKillSwitch: true,
      notifyOwnerAndAdmin: true,
      freezeAutomaticRetries: true,
      preservePayloadHash: true,
      requirePostIncidentReview: true,
    },
    fallbackPolicy: {
      emailFallback: "manual_send_from_queue_snapshot",
      whatsappFallback: "manual_contact_with_opt_in_check",
      mapsFallback: "manual_route_review",
      aiFallback: "manual_text_review",
    },
    blockedActions: [
      "enable_provider_without_health_dashboard",
      "enable_provider_without_cost_guard",
      "enable_provider_without_webhook_monitoring",
      "continue_provider_after_kill_switch_trigger",
      "retry_failed_provider_without_manual_review",
    ],
    nextActions: [
      "Criar indicadores persistentes de saude por provedor.",
      "Adicionar alerta de custo por tenant antes do primeiro envio real.",
      "Auditar todos os callbacks de webhook com assinatura validada.",
      "Preparar fallback manual para cada canal externo.",
    ],
  };
}

export async function getProviderGoLiveDecisionBoard(tenantId: string) {
  const decisionItems = [
    {
      key: "persistent_queue",
      label: "Fila persistente de comunicacao",
      status: "blocked",
      businessImpact: "Evita duplicidade, perda de mensagem e envio sem tenant.",
      requiredEvidence: ["idempotencia", "retentativa", "payload hash", "fallback manual"],
    },
    {
      key: "provider_activation",
      label: "Plano de ativacao de provedores",
      status: "blocked",
      businessImpact: "Impede ativar custo externo sem aceite e governanca.",
      requiredEvidence: ["orcamento aprovado", "LGPD revisada", "templates homologados", "rollback"],
    },
    {
      key: "credential_vault",
      label: "Cofre de credenciais",
      status: "blocked",
      businessImpact: "Protege chaves de e-mail, WhatsApp, mapas e IA.",
      requiredEvidence: ["cofre gerenciado", "mascaramento", "rotacao", "auditoria sem segredo"],
    },
    {
      key: "observability",
      label: "Observabilidade e kill switch",
      status: "blocked",
      businessImpact: "Permite desligar provider antes de custo, falha ou privacidade sairem do controle.",
      requiredEvidence: ["dashboard", "alerta de custo", "monitor de webhook", "incidente automatico"],
    },
    {
      key: "tenant_budget",
      label: "Orcamento por tenant",
      status: "blocked",
      businessImpact: "Garante previsibilidade financeira no whitelabel.",
      requiredEvidence: ["limite mensal", "alertas", "responsavel financeiro", "bloqueio por estouro"],
    },
    {
      key: "legal_acceptance",
      label: "Aceite legal e operacional",
      status: "blocked",
      businessImpact: "Formaliza responsabilidades de comunicacao, IA, rastreamento e dados.",
      requiredEvidence: ["termo LGPD", "politica WhatsApp", "uso de IA", "autorizacao de rastreamento"],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    tenantId,
    status: "provider_go_live_decision_blocked",
    projectPercentAfterBlock: 95,
    goLiveAllowed: false,
    executiveDecision: {
      decision: "do_not_release_real_provider_traffic",
      reason: "Integracoes externas ainda dependem de fila persistente, cofre real, observabilidade, custo aprovado e aceite legal.",
      recommendedMode: "dry_run_with_manual_fallback",
      nextDecisionWindow: "apos smoke test com banco real e evidencias de homologacao",
    },
    summary: {
      totalItems: decisionItems.length,
      blockedItems: decisionItems.filter((item) => item.status === "blocked").length,
      readyItems: decisionItems.filter((item) => item.status === "ready").length,
      requiresOwnerApproval: true,
      requiresAdminApproval: true,
      requiresTechnicalApproval: true,
    },
    decisionItems,
    approvalsRequired: [
      { role: "owner", name: "Aprovacao comercial e custo", required: true },
      { role: "admin", name: "Aprovacao LGPD e operacao", required: true },
      { role: "engineering", name: "Aprovacao tecnica de fila, cofre e webhooks", required: true },
      { role: "support", name: "Aprovacao de fallback manual", required: true },
    ],
    releaseStages: [
      { stage: "stage_1", label: "Dry-run interno", realTrafficAllowed: false, exitCriteria: "todos os eventos auditados" },
      { stage: "stage_2", label: "Homologacao controlada", realTrafficAllowed: false, exitCriteria: "webhooks e custos simulados aprovados" },
      { stage: "stage_3", label: "Piloto com tenant ICEMAX", realTrafficAllowed: false, exitCriteria: "owner aprova custo e LGPD" },
      { stage: "stage_4", label: "Trafego real limitado", realTrafficAllowed: false, exitCriteria: "kill switch e alertas ativos" },
    ],
    blockedActions: [
      "release_provider_go_live_without_owner_approval",
      "release_provider_go_live_without_vault",
      "release_provider_go_live_without_observability",
      "release_provider_go_live_without_tenant_budget",
      "release_provider_go_live_without_rollback",
    ],
    nextActions: [
      "Conectar esta decisao ao board de go-live whitelabel.",
      "Criar evidencias de homologacao por provider.",
      "Adicionar aceite formal antes de trafego real.",
      "Manter operacao em dry-run ate banco real e cofre estarem prontos.",
    ],
  };
}

export async function getProviderHomologationEvidencePack(tenantId: string) {
  const scenarios = [
    {
      key: "email_final_report",
      provider: "email",
      label: "Relatorio final e garantia por e-mail",
      status: "pending_evidence",
      realTrafficAllowed: false,
      requiredEvidence: ["template renderizado", "fila persistente", "bounce simulado", "auditoria sem segredo"],
      passCriteria: ["destinatario validado", "idempotencia aplicada", "fallback manual disponivel"],
    },
    {
      key: "whatsapp_schedule_eta",
      provider: "whatsapp",
      label: "Agendamento e ETA por WhatsApp",
      status: "pending_evidence",
      realTrafficAllowed: false,
      requiredEvidence: ["opt-in registrado", "template aprovado", "webhook assinado", "opt-out respeitado"],
      passCriteria: ["sem envio fora da janela", "bloqueio sem consentimento", "callback auditado"],
    },
    {
      key: "maps_route_dispatch",
      provider: "maps",
      label: "Rota e despacho por mapas",
      status: "pending_evidence",
      realTrafficAllowed: false,
      requiredEvidence: ["cache ativo", "limite de custo", "quota simulada", "fallback de rota manual"],
      passCriteria: ["cache hit minimo respeitado", "custo bloqueado no limite", "sem chamada sem tenant"],
    },
    {
      key: "openai_text_review",
      provider: "openai",
      label: "Revisao de texto e diagnostico assistido",
      status: "pending_evidence",
      realTrafficAllowed: false,
      requiredEvidence: ["mascaramento de dados", "limite de tokens", "prompt versionado", "fallback manual"],
      passCriteria: ["zero falha de redacao", "auditoria sem conteudo sensivel", "bloqueio por budget"],
    },
  ];

  const evidenceArtifacts = [
    { key: "request_sample", label: "Amostra de requisicao sem segredo", required: true },
    { key: "response_sample", label: "Amostra de resposta sem dado sensivel", required: true },
    { key: "audit_event", label: "Evento de auditoria com payload hash", required: true },
    { key: "cost_snapshot", label: "Snapshot de custo por tenant", required: true },
    { key: "rollback_proof", label: "Prova de rollback/fallback manual", required: true },
    { key: "lgpd_acceptance", label: "Aceite LGPD e consentimento aplicavel", required: true },
  ];

  return {
    generatedAt: new Date().toISOString(),
    tenantId,
    status: "provider_homologation_evidence_pending",
    projectPercentAfterBlock: 96,
    realProviderTrafficAllowed: false,
    summary: {
      scenarios: scenarios.length,
      pendingScenarios: scenarios.filter((item) => item.status === "pending_evidence").length,
      requiredArtifacts: evidenceArtifacts.length,
      readyForCustomerPilot: false,
      readyForProduction: false,
    },
    scenarios,
    evidenceArtifacts,
    approvalFlow: [
      { step: "technical_review", owner: "engineering", required: true },
      { step: "lgpd_review", owner: "admin", required: true },
      { step: "cost_review", owner: "owner", required: true },
      { step: "support_fallback_review", owner: "support", required: true },
    ],
    securityRules: {
      storeSecretsInEvidence: false,
      storeRawCustomerSensitiveData: false,
      requirePayloadHash: true,
      requireSignedWebhookSamples: true,
      requireTenantScopedEvidence: true,
    },
    blockedActions: [
      "approve_provider_without_evidence_pack",
      "attach_secret_to_evidence",
      "approve_whatsapp_without_opt_in_sample",
      "approve_openai_without_redaction_sample",
      "approve_maps_without_cost_snapshot",
    ],
    nextActions: [
      "Gerar evidencias dry-run por provider.",
      "Anexar snapshots de custo e auditoria sem segredo.",
      "Validar fallback manual antes de piloto.",
      "Levar pacote para o board de decisao go-live.",
    ],
  };
}
