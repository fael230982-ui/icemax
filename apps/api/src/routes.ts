import type { FastifyInstance } from "fastify";
import { previewContractVisits } from "@icemax/shared";
import {
  aiRequests,
  checklistTemplates,
  dashboardMetrics,
  floorPlans,
  manuals,
  notifications,
  qrLabels,
  quotes,
  serviceContracts,
  serviceOrders,
  stock,
  tenant,
} from "./mock-data";

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

  app.get("/contracts/:id/visits/preview", async (request, reply) => {
    const { id } = request.params as { id: string };
    const contract = serviceContracts.find((item) => item.id === id);

    if (!contract) {
      return reply.code(404).send({ message: "Contrato nao encontrado." });
    }

    return {
      contractId: contract.id,
      recurrenceMonths: contract.recurrenceMonths,
      visits: previewContractVisits({
        startDate: contract.nextVisit,
        recurrenceMonths: contract.recurrenceMonths as 3 | 4 | 6,
        occurrences: 6,
      }),
    };
  });

  app.get("/floor-plans", async () => ({
    data: floorPlans,
    total: floorPlans.length,
  }));

  app.get("/qr-labels", async () => ({
    data: qrLabels,
    total: qrLabels.length,
  }));

  app.get("/quotes", async () => ({
    data: quotes,
    total: quotes.length,
  }));

  app.get("/checklists", async () => ({
    data: checklistTemplates,
    total: checklistTemplates.length,
  }));

  app.get("/stock", async () => ({
    data: stock,
    total: stock.length,
    alerts: stock.filter((item) => item.quantity <= item.minimum),
  }));

  app.get("/manuals", async () => ({
    data: manuals,
    total: manuals.length,
  }));

  app.get("/ai/requests", async () => ({
    data: aiRequests,
    total: aiRequests.length,
  }));

  app.get("/notifications", async () => ({
    data: notifications,
    total: notifications.length,
  }));
}
