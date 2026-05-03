import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import { createMockOrder, createPrismaOrder, getMockOrder, getPrismaOrder, listMockOrders, listPrismaOrders } from "../repositories/orders-repository";
import { createServiceOrderSchema, parseBody } from "../schemas";

export async function registerOrderRoutes(app: FastifyInstance) {
  app.get("/service-orders", async (request) => {
    const context = getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaOrders(context.tenantId);
    }

    return listMockOrders();
  });

  app.get("/service-orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const context = getAuthContext(request);
    const order = isPrismaEnabled()
      ? await getPrismaOrder(context.tenantId, id)
      : await getMockOrder(id);

    if (!order) {
      return reply.code(404).send({ message: "Ordem de servico nao encontrada." });
    }

    return order;
  });

  app.post("/service-orders", async (request, reply) => {
    const context = getAuthContext(request);
    const input = parseBody(createServiceOrderSchema, request.body);
    const order = isPrismaEnabled()
      ? await createPrismaOrder(context.tenantId, context.userId, input)
      : await createMockOrder(context.tenantId, context.userId, input);

    return reply.code(201).send(order);
  });
}
