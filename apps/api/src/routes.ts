import type { FastifyInstance } from "fastify";
import { dashboardMetrics, floorPlans, qrLabels, serviceContracts, serviceOrders, tenant } from "./mock-data";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/tenant/current", async () => tenant);

  app.get("/dashboard", async () => ({
    tenant,
    metrics: dashboardMetrics,
    urgentOrders: serviceOrders.filter((order) => order.priority === "emergency"),
    upcomingContractVisits: serviceContracts.filter((contract) => contract.status !== "scheduled"),
  }));

  app.get("/service-orders", async () => ({
    data: serviceOrders,
    total: serviceOrders.length,
  }));

  app.get("/service-orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const order = serviceOrders.find((item) => item.id === id);

    if (!order) {
      return reply.code(404).send({ message: "Ordem de servico nao encontrada." });
    }

    return order;
  });

  app.get("/contracts", async () => ({
    data: serviceContracts,
    total: serviceContracts.length,
  }));

  app.get("/contracts/due", async () => ({
    data: serviceContracts.filter((contract) => contract.status === "upcoming" || contract.status === "generate_order"),
  }));

  app.get("/floor-plans", async () => ({
    data: floorPlans,
    total: floorPlans.length,
  }));

  app.get("/qr-labels", async () => ({
    data: qrLabels,
    total: qrLabels.length,
  }));
}
