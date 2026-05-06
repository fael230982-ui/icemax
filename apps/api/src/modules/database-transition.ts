import type { FastifyInstance } from "fastify";
import {
  getDatabaseCutoverPlan,
  getDatabaseIncrementalMigrationMatrix,
  getDatabaseRollbackDrill,
  getDatabaseSchemaSummary,
  getDataReadinessBoard,
  getEnvironmentChecklist,
  getPrismaSmokeTest,
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
  app.get("/database/rollback-drill", async () => getDatabaseRollbackDrill());
  app.get("/database/incremental-migration-matrix", async () => getDatabaseIncrementalMigrationMatrix());
  app.get("/database/prisma-smoke-test", async () => getPrismaSmokeTest());
}
