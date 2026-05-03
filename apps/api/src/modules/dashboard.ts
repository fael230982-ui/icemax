import type { FastifyInstance } from "fastify";
import { dashboardMetrics, serviceContracts, serviceOrders, tenant } from "../mock-data";

export async function registerDashboardRoutes(app: FastifyInstance) {
  app.get("/dashboard", async () => ({
    tenant,
    metrics: dashboardMetrics,
    urgentOrders: serviceOrders.filter((order) => order.priority === "emergency"),
    upcomingContractVisits: serviceContracts.filter((contract) => contract.status !== "scheduled"),
  }));
}
