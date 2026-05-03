import type { FastifyInstance } from "fastify";
import { serviceOrders } from "../mock-data";

export async function registerOrderRoutes(app: FastifyInstance) {
  app.get("/service-orders", async () => ({
    data: serviceOrders,
    total: serviceOrders.length,
  }));

  app.get("/service-orders/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const order = serviceOrders.find((item) => item.id === id);

    if (!order) {
      return reply.code(404).send({ message: "Ordem de servico nao encontrada." });
    }

    return order;
  });
}
