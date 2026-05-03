import type { FastifyInstance } from "fastify";
import { getAuthContext } from "./auth";
import { tenant } from "./mock-data";
import { registerAssetRoutes } from "./modules/assets";
import { registerContractRoutes } from "./modules/contracts";
import { registerCustomerRoutes } from "./modules/customers";
import { registerDashboardRoutes } from "./modules/dashboard";
import { registerEquipmentRoutes } from "./modules/equipment";
import { registerIntegrationRoutes } from "./modules/integrations";
import { registerOperationRoutes } from "./modules/operations";
import { registerOrderRoutes } from "./modules/orders";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/tenant/current", async () => tenant);
  app.get("/auth/context", async (request) => getAuthContext(request));

  await registerDashboardRoutes(app);
  await registerCustomerRoutes(app);
  await registerEquipmentRoutes(app);
  await registerOrderRoutes(app);
  await registerContractRoutes(app);
  await registerAssetRoutes(app);
  await registerOperationRoutes(app);
  await registerIntegrationRoutes(app);
}
