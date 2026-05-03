import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import { createMockEquipment, createPrismaEquipment, listMockEquipment, listPrismaEquipment } from "../repositories/equipment-repository";
import { createEquipmentSchema, parseBody } from "../schemas";

export async function registerEquipmentRoutes(app: FastifyInstance) {
  app.get("/equipment", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaEquipment(context.tenantId);
    }

    return listMockEquipment();
  });

  app.post("/equipment", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createEquipmentSchema, request.body);
    const equipment = isPrismaEnabled()
      ? await createPrismaEquipment(context.tenantId, input)
      : await createMockEquipment(context.tenantId, input);

    return reply.code(201).send(equipment);
  });
}
