import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { recordAuditEvent } from "../services/audit-service";
import {
  getDemoDataSnapshot,
  getObservabilitySummary,
  listApiContracts,
  listHomologationScenarios,
  runHomologationScenario,
} from "../services/homologation-service";

export async function registerHomologationRoutes(app: FastifyInstance) {
  app.get("/api-contract/routes", async () => listApiContracts());
  app.get("/homologation/scenarios", async () => listHomologationScenarios());
  app.get("/observability/summary", async () => getObservabilitySummary());
  app.get("/demo-data/snapshot", async () => getDemoDataSnapshot());

  app.post("/homologation/scenarios/:key/run", async (request, reply) => {
    const { key } = request.params as { key: string };
    const context = await getAuthContext(request);
    const result = runHomologationScenario(key);

    if (!result) {
      return reply.code(404).send({ message: "Cenario de homologacao nao encontrado." });
    }

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "homologation_scenario.executed",
      entity: "homologation_scenario",
      entityId: key,
      metadata: { status: result.status, steps: result.steps.length },
    });

    return reply.code(201).send(result);
  });
}
