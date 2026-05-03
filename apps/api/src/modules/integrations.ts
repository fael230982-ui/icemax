import type { FastifyInstance } from "fastify";
import { aiRequests, integrations, notifications, whatsappTemplates } from "../mock-data";

export async function registerIntegrationRoutes(app: FastifyInstance) {
  app.get("/ai/requests", async () => ({
    data: aiRequests,
    total: aiRequests.length,
  }));

  app.get("/notifications", async () => ({
    data: notifications,
    total: notifications.length,
  }));

  app.get("/integrations", async () => ({
    data: integrations,
    total: integrations.length,
  }));

  app.get("/whatsapp/templates", async () => ({
    data: whatsappTemplates,
    total: whatsappTemplates.length,
  }));

  app.post("/webhooks/whatsapp", async (request) => ({
    received: true,
    provider: "whatsapp",
    payload: request.body,
  }));
}
