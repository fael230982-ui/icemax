import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import {
  createMockPart,
  createMockQuoteApprovalPackage,
  createMockQuoteCommunicationPackage,
  createMockQuoteCommunicationQueue,
  createMockPublicQuoteApprovalPackage,
  createMockStockLocation,
  createMockStockMovement,
  createPrismaPart,
  createPrismaQuoteApprovalPackage,
  createPrismaQuoteCommunicationPackage,
  createPrismaQuoteCommunicationQueue,
  createPrismaPublicQuoteApprovalPackage,
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
  updateMockQuoteDecision,
  updateMockPublicQuoteDecision,
  updatePrismaQuoteDecision,
  updatePrismaPublicQuoteDecision,
} from "../repositories/operations-repository";
import {
  createPartSchema,
  createStockLocationSchema,
  createStockMovementSchema,
  parseBody,
  publicQuoteDecisionSchema,
  updateQuoteDecisionSchema,
} from "../schemas";

export async function registerOperationRoutes(app: FastifyInstance) {
  app.get("/quotes", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaQuotes(context.tenantId);
    }

    return listMockQuotes();
  });

  app.patch("/quotes/:id/decision", async (request) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(updateQuoteDecisionSchema, request.body);

    return isPrismaEnabled()
      ? updatePrismaQuoteDecision(context.tenantId, id, input)
      : updateMockQuoteDecision(context.tenantId, id, input);
  });

  app.get("/quotes/:id/approval-package", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const approvalPackage = isPrismaEnabled()
      ? await createPrismaQuoteApprovalPackage(context.tenantId, id)
      : await createMockQuoteApprovalPackage(context.tenantId, id);

    if (!approvalPackage) {
      return reply.code(404).send({ message: "Orcamento nao encontrado para pacote de aprovacao." });
    }

    return approvalPackage;
  });

  app.get("/quotes/:id/communication-package", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const communicationPackage = isPrismaEnabled()
      ? await createPrismaQuoteCommunicationPackage(context.tenantId, id)
      : await createMockQuoteCommunicationPackage(context.tenantId, id);

    if (!communicationPackage) {
      return reply.code(404).send({ message: "Orcamento nao encontrado para pacote de comunicacao." });
    }

    return communicationPackage;
  });

  app.post("/quotes/:id/communication-queue", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const queue = isPrismaEnabled()
      ? await createPrismaQuoteCommunicationQueue(context.tenantId, id)
      : await createMockQuoteCommunicationQueue(context.tenantId, id);

    if (!queue) {
      return reply.code(404).send({ message: "Orcamento nao encontrado para fila de comunicacao." });
    }

    return reply.code(201).send(queue);
  });

  app.get("/public/quotes/:token", async (request, reply) => {
    const { token } = request.params as { token: string };
    const context = await getAuthContext(request);
    const approvalPackage = isPrismaEnabled()
      ? await createPrismaPublicQuoteApprovalPackage(context.tenantId, token)
      : await createMockPublicQuoteApprovalPackage(context.tenantId, token);

    if (!approvalPackage) {
      return reply.code(404).send({ message: "Link publico de orcamento invalido ou expirado." });
    }

    return approvalPackage;
  });

  app.patch("/public/quotes/:token/decision", async (request, reply) => {
    const { token } = request.params as { token: string };
    const context = await getAuthContext(request);
    const input = parseBody(publicQuoteDecisionSchema, request.body);

    if (input.decision === "approved" && !input.acceptedTerms) {
      return reply.code(400).send({ message: "Aceite dos termos e obrigatorio para aprovar o orcamento." });
    }

    const decision = isPrismaEnabled()
      ? await updatePrismaPublicQuoteDecision(context.tenantId, token, input)
      : await updateMockPublicQuoteDecision(context.tenantId, token, input);

    if (!decision) {
      return reply.code(404).send({ message: "Link publico de orcamento invalido ou expirado." });
    }

    return decision;
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
