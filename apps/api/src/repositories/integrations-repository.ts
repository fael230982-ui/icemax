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
