import type { FastifyInstance } from "fastify";
import { getAuthContext, requireRole } from "../auth";
import { listAuditEvents } from "../services/audit-service";

export async function registerAuditRoutes(app: FastifyInstance) {
  app.get("/audit-log", { preHandler: requireRole(["owner", "admin"]) }, async (request) => {
    const context = await getAuthContext(request);
    return listAuditEvents(context.tenantId);
  });
}
