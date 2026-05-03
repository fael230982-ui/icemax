import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import { createMockCustomer, createPrismaCustomer, listMockCustomers, listPrismaCustomers } from "../repositories/customers-repository";
import { createCustomerSchema, parseBody } from "../schemas";

export async function registerCustomerRoutes(app: FastifyInstance) {
  app.get("/customers", async (request) => {
    const context = await getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaCustomers(context.tenantId);
    }

    return listMockCustomers();
  });

  app.post("/customers", async (request, reply) => {
    const context = await getAuthContext(request);
    const input = parseBody(createCustomerSchema, request.body);
    const customer = isPrismaEnabled()
      ? await createPrismaCustomer(context.tenantId, input)
      : await createMockCustomer(context.tenantId, input);

    return reply.code(201).send(customer);
  });
}
