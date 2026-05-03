import type { FastifyInstance } from "fastify";
import { previewContractVisits } from "@icemax/shared";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import {
  createMockContract,
  createMockOrderFromContractVisit,
  createPrismaContract,
  createPrismaOrderFromContractVisit,
  generateMockContractVisits,
  generatePrismaContractVisits,
  getMockContractMaintenanceCalendar,
  getMockContract,
  getPrismaContractMaintenanceCalendar,
  getPrismaContract,
  listMockContracts,
  listMockDueContracts,
  listPrismaContracts,
  listPrismaDueContracts,
} from "../repositories/contracts-repository";
import { createContractSchema, createOrderFromContractVisitSchema, generateContractVisitsSchema, parseBody } from "../schemas";

export async function registerContractRoutes(app: FastifyInstance) {
  app.get("/contracts", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaContracts(context.tenantId);
    }

    return listMockContracts();
  });

  app.get("/contracts/due", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaDueContracts(context.tenantId);
    }

    return listMockDueContracts();
  });

  app.get("/contracts/maintenance-calendar", async (request) => {
    const context = await getAuthContext(request);
    const query = request.query as { occurrences?: string; fromDate?: string };
    const occurrences = query.occurrences ? Number(query.occurrences) : undefined;
    const params = {
      occurrences: Number.isFinite(occurrences) ? Math.min(Math.max(Number(occurrences), 1), 24) : undefined,
      fromDate: query.fromDate,
    };

    if (isPrismaEnabled()) {
      return getPrismaContractMaintenanceCalendar(context.tenantId, params);
    }

    return getMockContractMaintenanceCalendar(params);
  });

  app.get("/contracts/:id/visits/preview", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const contract = isPrismaEnabled()
      ? await getPrismaContract(context.tenantId, id)
      : await getMockContract(id);

    if (!contract) {
      return reply.code(404).send({ message: "Contrato nao encontrado." });
    }

    return {
      contractId: contract.id,
      recurrenceMonths: contract.recurrenceMonths,
      visits: previewContractVisits({
        startDate: "nextVisit" in contract ? contract.nextVisit : contract.startDate.toISOString().slice(0, 10),
        recurrenceMonths: contract.recurrenceMonths as 3 | 4 | 6,
        occurrences: 6,
      }),
    };
  });

  app.post("/contracts", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createContractSchema, request.body);
    const contract = isPrismaEnabled()
      ? await createPrismaContract(context.tenantId, input)
      : await createMockContract(context.tenantId, input);

    return reply.code(201).send(contract);
  });

  app.post("/contracts/:id/visits/generate", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(generateContractVisitsSchema, request.body);
    const visits = isPrismaEnabled()
      ? await generatePrismaContractVisits(context.tenantId, id, input)
      : await generateMockContractVisits(context.tenantId, id, input);

    return reply.code(201).send(visits);
  });

  app.post("/contract-visits/:id/service-order", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = await getAuthContext(request);
    const input = parseBody(createOrderFromContractVisitSchema, request.body);
    const order = isPrismaEnabled()
      ? await createPrismaOrderFromContractVisit(context.tenantId, id, context.userId, input)
      : await createMockOrderFromContractVisit(context.tenantId, id, context.userId, input);

    return reply.code(201).send(order);
  });
}
