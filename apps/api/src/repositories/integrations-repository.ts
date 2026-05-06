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
