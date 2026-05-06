import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import { aiRequests } from "../mock-data";
import {
  createMockNotificationTemplate,
  getCommunicationProviderActivationPlan,
  createPrismaNotificationTemplate,
  getCommunicationPersistentQueueReadiness,
  getProviderCredentialVaultPolicy,
  listMockIntegrations,
  listMockNotifications,
  listMockWhatsappTemplates,
  listPrismaIntegrations,
  listPrismaNotificationTemplates,
  listPrismaNotifications,
  sendMockNotification,
  sendPrismaNotification,
  upsertMockIntegration,
  upsertPrismaIntegration,
} from "../repositories/integrations-repository";
import { createNotificationTemplateSchema, parseBody, sendNotificationSchema, updateIntegrationStatusSchema } from "../schemas";

export async function registerIntegrationRoutes(app: FastifyInstance) {
  app.get("/ai/requests", async () => ({
    data: aiRequests,
    total: aiRequests.length,
  }));

  app.get("/notifications", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaNotifications(context.tenantId);
    }

    return listMockNotifications();
  });

  app.post("/notifications/send", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(sendNotificationSchema, request.body);
    const notification = isPrismaEnabled()
      ? await sendPrismaNotification(context.tenantId, input)
      : await sendMockNotification(context.tenantId, input);

    return reply.code(202).send(notification);
  });

  app.get("/communications/persistent-queue-readiness", async (request) => {
    const context = await getAuthContext(request);

    return getCommunicationPersistentQueueReadiness(context.tenantId);
  });

  app.get("/communications/provider-activation-plan", async (request) => {
    const context = await getAuthContext(request);

    return getCommunicationProviderActivationPlan(context.tenantId);
  });

  app.get("/integrations/provider-credential-vault-policy", async (request) => {
    const context = await getAuthContext(request);

    return getProviderCredentialVaultPolicy(context.tenantId);
  });

  app.get("/integrations", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaIntegrations(context.tenantId);
    }

    return listMockIntegrations();
  });

  app.put("/integrations/:provider", async (request) => {
    const context = await getAuthContext(request);
    const { provider } = request.params as { provider: string };
    const input = parseBody(updateIntegrationStatusSchema, {
      ...(request.body as object),
      provider,
    });

    return isPrismaEnabled()
      ? upsertPrismaIntegration(context.tenantId, input)
      : upsertMockIntegration(context.tenantId, input);
  });

  app.get("/notification-templates", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaNotificationTemplates(context.tenantId);
    }

    return listMockWhatsappTemplates();
  });

  app.post("/notification-templates", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createNotificationTemplateSchema, request.body);
    const template = isPrismaEnabled()
      ? await createPrismaNotificationTemplate(context.tenantId, input)
      : await createMockNotificationTemplate(context.tenantId, input);

    return reply.code(201).send(template);
  });

  app.get("/whatsapp/templates", async () => listMockWhatsappTemplates());

  app.post("/webhooks/whatsapp", async (request) => ({
    received: true,
    provider: "whatsapp",
    payload: request.body,
  }));
}
