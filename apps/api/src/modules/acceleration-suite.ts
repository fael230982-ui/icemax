import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { listAccelerationLots, runAccelerationLot, runAllAccelerationLots } from "../services/acceleration-suite-service";
import { recordAuditEvent } from "../services/audit-service";

export async function registerAccelerationSuiteRoutes(app: FastifyInstance) {
  app.get("/acceleration/lots", async () => listAccelerationLots());

  app.post("/acceleration/lots/:key/run", async (request, reply) => {
    const { key } = request.params as { key: string };
    const context = await getAuthContext(request);
    const result = runAccelerationLot(key);

    if (!result) {
      return reply.code(404).send({ message: "Lote de aceleracao nao encontrado." });
    }

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "acceleration_lot.executed",
      entity: "acceleration_lot",
      entityId: key,
      metadata: { lot: result.lot, domain: result.domain },
    });

    return reply.code(201).send(result);
  });

  app.post("/acceleration/lots/run-all", async (request, reply) => {
    const context = await getAuthContext(request);
    const result = runAllAccelerationLots();

    await recordAuditEvent({
      tenantId: context.tenantId,
      userId: context.userId,
      action: "acceleration_lots.executed_all",
      entity: "acceleration_lot",
      entityId: "all",
      metadata: {
        connectedLots: result.connectedLots,
        firstLot: result.firstLot,
        lastLot: result.lastLot,
      },
    });

    return reply.code(201).send(result);
  });
}
