import type { FastifyInstance } from "fastify";
import { previewContractVisits } from "@icemax/shared";
import { serviceContracts } from "../mock-data";

export async function registerContractRoutes(app: FastifyInstance) {
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
}
