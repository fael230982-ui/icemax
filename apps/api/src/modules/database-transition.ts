import type { FastifyInstance } from "fastify";
import {
  getDatabaseCutoverPlan,
  getDatabaseSchemaSummary,
  getEnvironmentChecklist,
  getSeedPlan,
} from "../services/database-transition-service";

export async function registerDatabaseTransitionRoutes(app: FastifyInstance) {
  app.get("/database/cutover-plan", async () => getDatabaseCutoverPlan());
  app.get("/database/schema-summary", async () => getDatabaseSchemaSummary());
  app.get("/database/seed-plan", async () => getSeedPlan());
  app.get("/database/environment-checklist", async () => getEnvironmentChecklist());
}
