import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { config, isPrismaEnabled } from "../config";
import { getMockDashboard, getPrismaDashboard } from "../repositories/dashboard-repository";

export async function registerDashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return getPrismaDashboard(context.tenantId);
    }

    return getMockDashboard();
  });
}
