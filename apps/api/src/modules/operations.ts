import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import {
  listMockChecklists,
  listMockQuotes,
  listMockStock,
  listPrismaChecklists,
  listPrismaQuotes,
  listPrismaStock,
} from "../repositories/operations-repository";

export async function registerOperationRoutes(app: FastifyInstance) {
  app.get("/quotes", async (request) => {
    const context = getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaQuotes(context.tenantId);
    }

    return listMockQuotes();
  });

  app.get("/checklists", async (request) => {
    const context = getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaChecklists(context.tenantId);
    }

    return listMockChecklists();
  });

  app.get("/stock", async (request) => {
    const context = getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaStock(context.tenantId);
    }

    return listMockStock();
  });
}
