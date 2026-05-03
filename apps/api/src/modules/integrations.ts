import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import { aiRequests } from "../mock-data";
import {
  createMockNotificationTemplate,
  createPrismaNotificationTemplate,
  listMockIntegrations,
  listMockNotifications,
  listMockWhatsappTemplates,
  listPrismaIntegrations,
  listPrismaNotificationTemplates,
  listPrismaNotifications,
  upsertMockIntegration,
  upsertPrismaIntegration,
} from "../repositories/integrations-repository";
import { createNotificationTemplateSchema, parseBody, updateIntegrationStatusSchema } from "../schemas";

export async function registerIntegrationRoutes(app: FastifyInstance) {
  app.get("/ai/requests", async () => ({
    data: aiRequests,
    total: aiRequests.length,
  }));

  app.get("/notifications", async (request) => {
    const context = getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaNotifications(context.tenantId);
    }

    return listMockNotifications();
  });

  app.get("/integrations", async (request) => {
    const context = getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaIntegrations(context.tenantId);
    }

    return listMockIntegrations();
  });

  app.put("/integrations/:provider", async (request) => {
    const context = getAuthContext(request);
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
    const context = getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaNotificationTemplates(context.tenantId);
    }

    return listMockWhatsappTemplates();
  });

  app.post("/notification-templates", async (request, reply) => {
    const context = getAuthContext(request);
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
