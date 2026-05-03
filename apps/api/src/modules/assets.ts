import type { FastifyInstance } from "fastify";
import { floorPlans, manuals, qrLabels } from "../mock-data";

export async function registerAssetRoutes(app: FastifyInstance) {
  app.get("/floor-plans", async () => ({
    data: floorPlans,
    total: floorPlans.length,
  }));

  app.get("/qr-labels", async () => ({
    data: qrLabels,
    total: qrLabels.length,
  }));

  app.get("/manuals", async () => ({
    data: manuals,
    total: manuals.length,
  }));
}
