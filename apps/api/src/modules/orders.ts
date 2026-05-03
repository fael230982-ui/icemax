import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import { getMockOrder, getPrismaOrder, listMockOrders, listPrismaOrders } from "../repositories/orders-repository";

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
}
