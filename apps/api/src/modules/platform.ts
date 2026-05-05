import type { FastifyInstance } from "fastify";
import {
  getEndOfDaySnapshot,
  getModuleCatalog,
  getPlatformDiagnostics,
  getPlatformReadiness,
  getMobileOfflineEscalationBoard,
  getPreReleaseGate,
  getProductionReadinessPlan,
  getRoleMatrix,
  reviewMobileOfflineEscalation,
} from "../services/platform-service";

export async function registerPlatformRoutes(app: FastifyInstance) {
  app.get("/platform/readiness", async () => getPlatformReadiness());
  app.get("/platform/modules", async () => getModuleCatalog());
  app.get("/platform/roles", async () => getRoleMatrix());
  app.get("/platform/diagnostics", async () => getPlatformDiagnostics());
  app.get("/platform/mobile-offline-escalations", async () => getMobileOfflineEscalationBoard());
  app.post<{ Params: { recordId: string }; Body: unknown }>("/platform/mobile-offline-escalations/:recordId/review", async (request, reply) => {
    return reply.code(201).send(reviewMobileOfflineEscalation(request.params.recordId, request.body));
  });
  app.get("/platform/pre-release-gate", async () => getPreReleaseGate());
  app.get("/platform/production-readiness", async () => getProductionReadinessPlan());
  app.get("/platform/end-of-day-snapshot", async () => getEndOfDaySnapshot());
}
