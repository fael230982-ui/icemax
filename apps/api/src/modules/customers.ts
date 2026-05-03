import type { FastifyInstance } from "fastify";
import { getAuthContext } from "../auth";
import { isPrismaEnabled } from "../config";
import { listMockCustomers, listPrismaCustomers } from "../repositories/customers-repository";

export async function registerCustomerRoutes(app: FastifyInstance) {
  app.get("/customers", async (request) => {
    const context = getAuthContext(request);

    if (isPrismaEnabled()) {
      return listPrismaCustomers(context.tenantId);
    }

    return listMockCustomers();
  });
}
