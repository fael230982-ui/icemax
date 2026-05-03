import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import {
  createMockPart,
  createMockStockLocation,
  createMockStockMovement,
  createPrismaPart,
  createPrismaStockLocation,
  createPrismaStockMovement,
  listMockChecklists,
  listMockQuotes,
  listMockStock,
  listMockStockLocations,
  listPrismaChecklists,
  listPrismaQuotes,
  listPrismaStock,
  listPrismaStockLocations,
} from "../repositories/operations-repository";
import { createPartSchema, createStockLocationSchema, createStockMovementSchema, parseBody } from "../schemas";

export async function registerOperationRoutes(app: FastifyInstance) {
  app.get("/quotes", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaQuotes(context.tenantId);
    }

    return listMockQuotes();
  });

  app.get("/checklists", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaChecklists(context.tenantId);
    }

    return listMockChecklists();
  });

  app.get("/stock", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaStock(context.tenantId);
    }

    return listMockStock();
  });

  app.post("/parts", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createPartSchema, request.body);
    const part = isPrismaEnabled()
      ? await createPrismaPart(context.tenantId, input)
      : await createMockPart(context.tenantId, input);

    return reply.code(201).send(part);
  });

  app.get("/stock-locations", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaStockLocations(context.tenantId);
    }

    return listMockStockLocations();
  });

  app.post("/stock-locations", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createStockLocationSchema, request.body);
    const location = isPrismaEnabled()
      ? await createPrismaStockLocation(context.tenantId, input)
      : await createMockStockLocation(context.tenantId, input);

    return reply.code(201).send(location);
  });

  app.post("/stock-movements", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createStockMovementSchema, request.body);
    const movement = isPrismaEnabled()
      ? await createPrismaStockMovement(context.tenantId, context.userId, input)
      : await createMockStockMovement(context.tenantId, context.userId, input);

    return reply.code(201).send(movement);
  });
}
