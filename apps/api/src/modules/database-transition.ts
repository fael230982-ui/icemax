import type { FastifyInstance } from "fastify";
import {
  getDatabaseCutoverPlan,
  getDatabaseSchemaSummary,
  getDataReadinessBoard,
  getEnvironmentChecklist,
  getSeedPlan,
  getTenantIsolationGate,
} from "../services/database-transition-service";

export async function registerDatabaseTransitionRoutes(app: FastifyInstance) {
  app.get("/database/cutover-plan", async () => getDatabaseCutoverPlan());
  app.get("/database/schema-summary", async () => getDatabaseSchemaSummary());
  app.get("/database/seed-plan", async () => getSeedPlan());
  app.get("/database/environment-checklist", async () => getEnvironmentChecklist());
  app.get("/database/data-readiness-board", async () => getDataReadinessBoard());
  app.get("/database/tenant-isolation-gate", async () => getTenantIsolationGate());
}
