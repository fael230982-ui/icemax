import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import { listMockEquipment, listPrismaEquipment } from "../repositories/equipment-repository";

export async function registerEquipmentRoutes(app: FastifyInstance) {
  app.get("/equipment", async (request) => {
    const context = getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaEquipment(context.tenantId);
    }

    return listMockEquipment();
  });
}
