import type { FastifyInstance } from "fastify";
import { checklistTemplates, quotes, stock } from "../mock-data";

export async function registerOperationRoutes(app: FastifyInstance) {
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
}
