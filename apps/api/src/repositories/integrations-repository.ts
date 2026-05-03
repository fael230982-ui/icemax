import { getPrisma } from "../database";
import { integrations, notifications, whatsappTemplates } from "../mock-data";
import type { CreateNotificationTemplateInput, UpdateIntegrationStatusInput } from "../schemas";
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
