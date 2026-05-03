import type { FastifyInstance } from "fastify";
import { previewContractVisits } from "@icemax/shared";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import {
  getMockContract,
  getPrismaContract,
  listMockContracts,
  listMockDueContracts,
  listPrismaContracts,
  listPrismaDueContracts,
} from "../repositories/contracts-repository";

export async function registerContractRoutes(app: FastifyInstance) {
  app.get("/contracts", async (request) => {
    const context = getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaContracts(context.tenantId);
    }

    return listMockContracts();
  });

  app.get("/contracts/due", async (request) => {
    const context = getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaDueContracts(context.tenantId);
    }

    return listMockDueContracts();
  });

  app.get("/contracts/:id/visits/preview", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = getAuthContext(request);
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
}
