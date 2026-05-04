import type { FastifyInstance } from "fastify";
import { getEndOfDaySnapshot, getModuleCatalog, getPlatformDiagnostics, getPlatformReadiness, getPreReleaseGate, getRoleMatrix } from "../services/platform-service";

export async function registerPlatformRoutes(app: FastifyInstance) {
  app.get("/platform/readiness", async () => getPlatformReadiness());
  app.get("/platform/modules", async () => getModuleCatalog());
  app.get("/platform/roles", async () => getRoleMatrix());
  app.get("/platform/diagnostics", async () => getPlatformDiagnostics());
  app.get("/platform/pre-release-gate", async () => getPreReleaseGate());
  app.get("/platform/end-of-day-snapshot", async () => getEndOfDaySnapshot());
}
